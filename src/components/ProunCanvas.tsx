import { useEffect, useRef, useState } from 'react';
// 型のみ import（実体は遅延 import するので three は初期バンドルに載らない）
import type * as THREE_NS from 'three';

// 設計: specs/components/proun-3d.spec.md
// El Lissitzky / Proun を 3D（軸測投影）で。Hero 背面の showpiece 装飾。

const RED = 0xd62828;
const BLACK = 0x1a1a1a;
const CREAM = 0xf5f0eb;

// レイヤー不透明度は高めに保つ（下げると cream が黒地に溶けて灰色化する）。
// 後退は各マテリアルの opacity と「本文カラム背後を空ける」配置で担保する。
const LAYER_OPACITY = 0.95;
const FRUSTUM = 11;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

interface ObjSpec {
  id: string;
  geom: () => THREE_NS.BufferGeometry;
  color: number;
  opacity: number;
  pos: [number, number, number];
  rot: [number, number, number]; // ラジアン
  spin: [number, number, number]; // rad/秒（緩慢ドリフト）
  bob: number; // y 揺れ振幅（単位）
  edge?: number; // 稜線の色（暗背景で黒い面を見せる / 平面に定義を与える）
  mobileDrop?: boolean; // 幅<480 で間引く
}

// 度→ラジアン
const d = (deg: number) => (deg * Math.PI) / 180;

function buildSpecs(THREE: typeof THREE_NS): ObjSpec[] {
  return [
    // A: 薄いスラブ（cream 面）— 平面と空間の緊張の核。傾けて「机の天板」読みを避ける
    {
      id: 'A-slab',
      geom: () => new THREE.BoxGeometry(2.7, 0.09, 1.7),
      color: CREAM,
      opacity: 0.9,
      pos: [1.3, 1.0, 0.2],
      rot: [d(40), d(20), d(-24)],
      spin: [0.006, 0.026, 0.006],
      bob: 0.12,
      edge: 0x3d3a37,
    },
    // B: 赤い楔（三角柱）— 「赤い楔で白を撃て」。構図の主役の動勢
    {
      id: 'B-wedge',
      geom: () => new THREE.CylinderGeometry(1.05, 1.05, 0.4, 3),
      color: RED,
      opacity: 1,
      pos: [0.1, 1.5, 0.7],
      rot: [d(90), d(6), d(36)],
      spin: [0.0, 0.05, 0.0],
      bob: 0.14,
    },
    // C: 細長い棒（cream）— 構図を貫く一本の急な対角の力線
    {
      id: 'C-bar',
      geom: () => new THREE.BoxGeometry(5.4, 0.14, 0.14),
      color: CREAM,
      opacity: 0.62,
      pos: [0.7, 0.8, -0.3],
      rot: [d(8), d(18), d(-48)],
      spin: [0.0, 0.022, 0.01],
      bob: 0.1,
    },
    // D: 黒い正方板（赤の対）— A とは別角度で独立して浮遊（"画面"読みを避ける）。cream 稜線で見せる
    {
      id: 'D-square',
      geom: () => new THREE.BoxGeometry(1.5, 0.1, 1.5),
      color: BLACK,
      opacity: 1,
      pos: [3.3, 2.3, -0.5],
      rot: [d(34), d(22), d(-16)],
      spin: [0.016, 0.02, 0.0],
      bob: 0.14,
      edge: CREAM,
    },
    // E: 薄い円盤（red 輪郭）— 運動。中央やや下に浮く
    {
      id: 'E-ring',
      geom: () => new THREE.TorusGeometry(1.0, 0.05, 10, 36),
      color: RED,
      opacity: 1,
      pos: [2.5, 0.1, 1.1],
      rot: [d(66), d(12), d(0)],
      spin: [0.028, 0.0, 0.03],
      bob: 0.12,
    },
    // F: 小さな赤い実心正方板（左下のリズムの点景・楔と呼応）
    {
      id: 'F-dot',
      geom: () => new THREE.BoxGeometry(0.66, 0.1, 0.66),
      color: RED,
      opacity: 1,
      pos: [-1.5, -1.4, 0.8],
      rot: [d(22), d(35), d(12)],
      spin: [0.04, 0.04, 0.0],
      bob: 0.1,
      mobileDrop: true,
    },
    // G: 赤い極細の対角線（右下の運動の点景・楔と呼応）。縦の"柱"読みを避け斜めに
    {
      id: 'G-line',
      geom: () => new THREE.BoxGeometry(2.6, 0.07, 0.07),
      color: RED,
      opacity: 0.9,
      pos: [3.0, -0.9, 0.2],
      rot: [d(0), d(20), d(-58)],
      spin: [0.0, 0.018, 0.012],
      bob: 0.08,
      mobileDrop: true,
    },
  ];
}

export default function ProunCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // モバイルは装飾を出さない（hidden md:block）。reduced-motion/WebGL 非対応のみ静的 SVG。
    if (host.getBoundingClientRect().width < 80) return;
    if (prefersReducedMotion() || !supportsWebGL()) {
      setFallback(true);
      return;
    }

    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    const run = async () => {
      // 非表示（モバイル＝hidden md:block で width 0）では起動しない。three も読み込まない。
      if (host.getBoundingClientRect().width < 80) return;
      const THREE = await import('three');
      if (disposed) return;

      const rect = host.getBoundingClientRect();
      let width = Math.max(1, Math.round(rect.width));
      let height = Math.max(1, Math.round(rect.height));
      const isMobile = width < 480;

      const scene = new THREE.Scene();

      const makeCamera = (w: number, h: number) => {
        const aspect = w / h;
        const cam = new THREE.OrthographicCamera(
          (-FRUSTUM * aspect) / 2,
          (FRUSTUM * aspect) / 2,
          FRUSTUM / 2,
          -FRUSTUM / 2,
          0.1,
          100
        );
        cam.position.set(8, 6, 8);
        cam.lookAt(0, 0, 0);
        return cam;
      };
      let camera = makeCamera(width, height);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      host.appendChild(renderer.domElement);

      // El Lissitzky の Proun は平面的なポスター色（強い陰影なし）。MeshBasicMaterial で
      // 各面を正しい単色にする（Lambert だと陰面が灰色化し cream が濁る）。ライト不要。
      // 軸測（消失点なし）＋オーバーラップ＋傾きで立体を読ませる。

      // Proun を中央右へ寄せ、本文カラム背後（左上）を空ける。
      // scale を下げて大きな負空間（Proun の主役＝余白）を確保。
      const group = new THREE.Group();
      group.position.set(1.1, 0.6, 0);
      group.scale.setScalar(0.84);
      scene.add(group);

      const geoms: THREE_NS.BufferGeometry[] = [];
      const mats: THREE_NS.Material[] = [];
      const meshes: Array<{ mesh: THREE_NS.Mesh; spec: ObjSpec; baseY: number }> = [];

      for (const spec of buildSpecs(THREE)) {
        if (isMobile && spec.mobileDrop) continue;
        const geom = spec.geom();
        const mat = new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: spec.opacity < 1,
          opacity: spec.opacity,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(...spec.pos);
        mesh.rotation.set(...spec.rot);
        group.add(mesh);
        geoms.push(geom);
        mats.push(mat);
        // 稜線（黒い面を暗背景で見せる / シャープエッジの定義）
        if (spec.edge !== undefined) {
          const eg = new THREE.EdgesGeometry(geom);
          const em = new THREE.LineBasicMaterial({
            color: spec.edge,
            transparent: true,
            opacity: spec.opacity * 0.9,
          });
          mesh.add(new THREE.LineSegments(eg, em));
          geoms.push(eg);
          mats.push(em);
        }
        meshes.push({ mesh, spec, baseY: spec.pos[1] });
      }

      const resize = () => {
        const r = host.getBoundingClientRect();
        width = Math.max(1, Math.round(r.width));
        height = Math.max(1, Math.round(r.height));
        const aspect = width / height;
        camera.left = (-FRUSTUM * aspect) / 2;
        camera.right = (FRUSTUM * aspect) / 2;
        camera.top = FRUSTUM / 2;
        camera.bottom = -FRUSTUM / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // 緩慢ドリフト（重力の曖昧さ）。スクロール連動なし。
      let last = 0;
      let elapsed = 0;
      let running = true;
      const tick = (t: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        if (!running) return;
        const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
        last = t;
        elapsed += dt;
        for (const { mesh, spec, baseY } of meshes) {
          mesh.rotation.x += spec.spin[0] * dt;
          mesh.rotation.y += spec.spin[1] * dt;
          mesh.rotation.z += spec.spin[2] * dt;
          if (spec.bob) {
            mesh.position.y =
              baseY + Math.sin(elapsed * 0.4 + baseY * 1.7) * spec.bob;
          }
        }
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      // 可視外・タブ非アクティブで rAF を実質停止（描画スキップ）
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) running = e.isIntersecting;
          if (running) last = 0;
        },
        { threshold: 0 }
      );
      io.observe(host);
      const onVis = () => {
        running = document.visibilityState === 'visible';
        if (running) last = 0;
      };
      document.addEventListener('visibilitychange', onVis);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        for (const g of geoms) g.dispose();
        for (const m of mats) m.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      };
    };

    void run();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      // モバイルでは装飾を非表示（本文の可読性最優先 / three も読まない）。md 以上で showpiece。
      className="absolute inset-0 overflow-hidden hidden md:block"
      style={{ opacity: LAYER_OPACITY, pointerEvents: 'none' }}
    >
      {fallback && <ProunFallback />}
    </div>
  );
}

/**
 * reduced-motion / WebGL 非対応時の静的 SVG 軸測 Proun。
 * 3D の初期姿勢（赤い楔が cream スラブへ対角に切り込む / 右上の黒板 / 対角の力線）を等角で再現。
 * 3D と同じく **中央右に収め**、本文（左の H1・説明）に被せない（slice で全面に拡大しない）。
 */
function ProunFallback() {
  return (
    <svg
      className="absolute top-1/2 right-[4%] -translate-y-1/2 w-[48%] sm:w-[44%] max-w-xl"
      viewBox="0 0 120 92"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
    >
      {/* C: 左下→右上の cream の力線 */}
      <polygon points="8,86 13,82 104,20 99,24" fill="#F5F0EB" opacity="0.4" />
      {/* A: cream スラブ（軸測の平行四辺形） */}
      <polygon points="30,44 78,31 87,55 39,68" fill="#F5F0EB" opacity="0.6" />
      {/* B: 赤い楔がスラブへ対角に切り込む（構図の核） */}
      <polygon points="13,41 41,54 12,62" fill="#D62828" opacity="0.92" />
      {/* D: 黒い正方板（右上）＋ cream 稜線 */}
      <polygon points="74,12 98,7 104,29 80,34" fill="#1A1A1A" stroke="#F5F0EB" strokeWidth="0.8" />
      {/* E: 赤い円環（運動） */}
      <ellipse cx="72" cy="52" rx="15" ry="7.5" fill="none" stroke="#D62828" strokeWidth="1.6" transform="rotate(-16 72 52)" opacity="0.9" />
      {/* F: 左下の赤い小板 */}
      <polygon points="20,71 30,67 33,77 23,81" fill="#D62828" opacity="0.9" />
      {/* G: 右下の赤い対角線 */}
      <polygon points="86,60 88,59 105,84 103,85" fill="#D62828" opacity="0.85" />
    </svg>
  );
}
