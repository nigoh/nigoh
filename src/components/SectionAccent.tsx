import { useEffect, useRef, useState, type ReactElement } from 'react';
// 型のみ import（実体は遅延 import するので three は初期バンドルに載らない）。
// Hero `ProunCanvas` と同チャンクなので追加ダウンロードは発生しない。
import type * as THREE_NS from 'three';

// 設計: specs/components/section-3d.spec.md
// 各セクションの隅に置く「小さく控えめな 3D アクセント（脇役）」。
// Hero showpiece（ProunCanvas）と格を分ける: 1〜3 個・1 隅の小矩形・低不透明度・更に緩慢。

const RED = 0xd62828;
const BLACK = 0x1a1a1a;
const CREAM = 0xf5f0eb;

// パレットの 16進文字列（フォールバック SVG 用）。色は constructivist のみ。
const RED_HEX = '#D62828';
const BLACK_HEX = '#1A1A1A';
const CREAM_HEX = '#F5F0EB';

export type Section =
  | 'about'
  | 'skills'
  | 'ai'
  | 'career'
  | 'portfolio'
  | 'contact';

interface Props {
  section: Section;
}

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

// 度→ラジアン
const d = (deg: number) => (deg * Math.PI) / 180;

interface ObjSpec {
  id: string;
  geom: (THREE: typeof THREE_NS) => THREE_NS.BufferGeometry;
  color: number;
  opacity: number;
  pos: [number, number, number];
  rot: [number, number, number]; // ラジアン
  spin: [number, number, number]; // rad/秒（脇役なので 0.01〜0.035）
  bob: number; // y 揺れ振幅（デスクトップのみ・≤0.1）
  edge?: number; // 稜線色（暗背景で黒面を見せる / 中空枠）
  edgeOnly?: boolean; // true: 面を描かず稜線（中空枠）のみ
  mobileDrop?: boolean; // モバイルで間引く
}

// 配置隅（ホスト矩形をセクション内のどの隅に置くか）
type Corner =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'right-center';

interface SectionConfig {
  corner: Corner;
  dark: boolean; // 暗背景か（cream 稜線方針 / 明背景は black/red 実面）
  frustum: number; // 直交カメラの frustum（小シーンの世界スケール）
  opacityDesktop: number; // §4 host opacity
  opacityMobile: number;
  specs: ObjSpec[];
  fallback: () => ReactElement; // 静止 SVG（主モチーフ）
}

// ───────────────────────────────────────────────────────────────────
// §2 セクション別オブジェクト表（データ駆動）
// ───────────────────────────────────────────────────────────────────

const CONFIGS: Record<Section, SectionConfig> = {
  // ABOUT（明背景・右下隅・黒板＋赤小板＋黒棒）
  about: {
    corner: 'bottom-right',
    dark: false,
    frustum: 6,
    opacityDesktop: 0.3,
    opacityMobile: 0.21,
    specs: [
      {
        id: 'a1-slab',
        geom: (T) => new T.BoxGeometry(1.6, 0.1, 1.6),
        color: BLACK,
        opacity: 1,
        pos: [0.2, -0.3, 0],
        rot: [d(28), d(22), d(-14)],
        spin: [0.012, 0.02, 0],
        bob: 0.08,
      },
      {
        id: 'a2-dot',
        geom: (T) => new T.BoxGeometry(0.7, 0.1, 0.7),
        color: RED,
        opacity: 1,
        pos: [0.9, 0.4, 0.4],
        rot: [d(18), d(34), d(10)],
        spin: [0.022, 0.022, 0],
        bob: 0.1,
        // モバイルでも残す: 明背景で確実に読める solid red の点（薄い黒スラブ a1 だけだと
        // 小サイズ・エッジオンで実機ではほぼ見えないため、視認できる塊を 1 つ保証する）。
      },
      {
        id: 'a3-bar',
        geom: (T) => new T.BoxGeometry(2.4, 0.09, 0.09),
        color: BLACK,
        opacity: 1,
        pos: [0, 0.1, -0.4],
        rot: [d(0), d(16), d(-40)],
        spin: [0, 0.016, 0.01],
        bob: 0.06,
        mobileDrop: true,
      },
    ],
    fallback: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <polygon points="14,86 18,84 86,40 82,42" fill={BLACK_HEX} />
        <polygon points="30,58 66,48 74,68 38,78" fill={BLACK_HEX} />
        <polygon points="58,42 76,37 80,49 62,54" fill={RED_HEX} />
      </svg>
    ),
  },

  // SKILLS（暗背景・右上隅・黒板(cream稜線)＋赤円環＋cream棒）
  skills: {
    corner: 'top-right',
    dark: true,
    frustum: 6,
    opacityDesktop: 0.34,
    opacityMobile: 0.24,
    specs: [
      {
        id: 's1-slab',
        geom: (T) => new T.BoxGeometry(1.5, 0.1, 1.5),
        color: BLACK,
        opacity: 1,
        pos: [0.3, 0.4, 0],
        rot: [d(32), d(20), d(-18)],
        spin: [0.014, 0.018, 0],
        bob: 0.08,
        edge: CREAM,
        // モバイルは黒スラブ（cream 稜線のみ）が暗背景で極薄なので落とし、代わりに
        // 視認できる赤円環（s2）を残す。
        mobileDrop: true,
      },
      {
        id: 's2-ring',
        geom: (T) => new T.TorusGeometry(1.0, 0.05, 10, 36),
        color: RED,
        opacity: 1,
        pos: [-0.2, -0.6, 0.3],
        rot: [d(64), d(12), d(0)],
        spin: [0.026, 0, 0.024],
        bob: 0.1,
        // モバイルで残す主役（赤円環は暗背景でも視認できる）。
      },
      {
        id: 's3-bar',
        geom: (T) => new T.BoxGeometry(2.6, 0.07, 0.07),
        color: CREAM,
        opacity: 0.5,
        pos: [0.1, 0.1, -0.4],
        rot: [d(0), d(18), d(-46)],
        spin: [0, 0.015, 0.01],
        bob: 0.06,
        mobileDrop: true,
      },
    ],
    fallback: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <polygon points="20,18 24,16 88,52 84,54" fill={CREAM_HEX} opacity="0.5" />
        <polygon
          points="26,30 62,20 70,40 34,50"
          fill={BLACK_HEX}
          stroke={CREAM_HEX}
          strokeWidth="1.2"
        />
        <ellipse
          cx="60"
          cy="64"
          rx="16"
          ry="8"
          fill="none"
          stroke={RED_HEX}
          strokeWidth="2.4"
          transform="rotate(-14 60 64)"
        />
      </svg>
    ),
  },

  // AI（明背景・右上隅・向き合う 2 楔＋黒棒）
  ai: {
    corner: 'top-right',
    dark: false,
    frustum: 6,
    opacityDesktop: 0.34,
    opacityMobile: 0.24,
    specs: [
      {
        id: 'ai1-wedge',
        geom: (T) => new T.CylinderGeometry(0.9, 0.9, 0.34, 3),
        color: RED,
        opacity: 1,
        pos: [0.6, 0.5, 0],
        rot: [d(90), d(8), d(30)],
        spin: [0, 0.03, 0],
        bob: 0.08,
      },
      {
        id: 'ai2-wedge',
        geom: (T) => new T.CylinderGeometry(0.7, 0.7, 0.3, 3),
        color: RED,
        opacity: 1,
        pos: [-0.6, -0.5, 0.2],
        rot: [d(90), d(8), d(-150)],
        spin: [0, -0.03, 0],
        bob: 0.08,
      },
      {
        id: 'ai3-bar',
        geom: (T) => new T.BoxGeometry(1.8, 0.08, 0.08),
        color: BLACK,
        opacity: 1,
        pos: [0, 0, -0.3],
        rot: [d(0), d(12), d(-28)],
        spin: [0, 0.012, 0.008],
        bob: 0.06,
        mobileDrop: true,
      },
    ],
    fallback: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <polygon points="26,64 30,62 76,40 72,42" fill={BLACK_HEX} />
        <polygon points="70,26 88,34 66,44" fill={RED_HEX} />
        <polygon points="40,68 22,60 44,50" fill={RED_HEX} />
      </svg>
    ),
  },

  // CAREER（暗背景・右中段・縦の赤棒＋ダイヤ＋黒板）
  career: {
    corner: 'right-center',
    dark: true,
    frustum: 7,
    opacityDesktop: 0.28,
    opacityMobile: 0.2,
    specs: [
      {
        id: 'c1-pillar',
        geom: (T) => new T.BoxGeometry(0.1, 3.4, 0.1),
        color: RED,
        opacity: 1,
        pos: [0.1, 0, 0],
        rot: [d(0), d(18), d(6)],
        spin: [0, 0.014, 0],
        bob: 0.06,
      },
      {
        id: 'c2-diamond',
        geom: (T) => new T.BoxGeometry(0.5, 0.1, 0.5),
        color: RED,
        opacity: 1,
        pos: [0.1, 1.0, 0.3],
        rot: [d(0), d(0), d(45)],
        spin: [0, 0, 0.012],
        bob: 0.06,
        mobileDrop: true,
      },
      {
        id: 'c3-slab',
        geom: (T) => new T.BoxGeometry(1.2, 0.1, 1.2),
        color: BLACK,
        opacity: 1,
        pos: [-0.5, -0.4, -0.4],
        rot: [d(30), d(24), d(-12)],
        spin: [0.012, 0.016, 0],
        bob: 0.06,
        edge: CREAM,
        mobileDrop: true,
      },
    ],
    fallback: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <polygon
          points="44,40 66,34 72,50 50,56"
          fill={BLACK_HEX}
          stroke={CREAM_HEX}
          strokeWidth="1.2"
        />
        <polygon points="34,8 40,6 44,92 38,94" fill={RED_HEX} />
        <polygon points="38,24 44,28 40,34 34,30" fill={RED_HEX} />
      </svg>
    ),
  },

  // PORTFOLIO（明背景・左下隅・中空枠 2 つ＋赤点）
  portfolio: {
    corner: 'bottom-left',
    dark: false,
    frustum: 6,
    opacityDesktop: 0.3,
    opacityMobile: 0.21,
    specs: [
      {
        id: 'p1-frame',
        geom: (T) => new T.BoxGeometry(1.6, 1.6, 0.08),
        color: BLACK,
        opacity: 1,
        pos: [-0.2, -0.2, 0],
        rot: [d(26), d(20), d(-10)],
        spin: [0.012, 0.018, 0],
        bob: 0.08,
        edge: BLACK,
        edgeOnly: true,
      },
      {
        id: 'p2-dot',
        geom: (T) => new T.BoxGeometry(0.6, 0.1, 0.6),
        color: RED,
        opacity: 1,
        pos: [-0.2, -0.2, 0.2],
        rot: [d(18), d(30), d(8)],
        spin: [0.02, 0.02, 0],
        bob: 0.1,
        // モバイルでも残す: 明背景の黒中空枠（p1）は線が極薄なので、枠内に solid red の
        // 点を残して視認性を担保する。
      },
      {
        id: 'p3-frame',
        geom: (T) => new T.BoxGeometry(0.9, 0.9, 0.06),
        color: BLACK,
        opacity: 1,
        pos: [0.7, 0.6, -0.2],
        rot: [d(30), d(14), d(-22)],
        spin: [0.014, 0.01, 0],
        bob: 0.06,
        edge: BLACK,
        edgeOnly: true,
        mobileDrop: true,
      },
    ],
    fallback: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <polygon
          points="22,58 58,46 66,66 30,78"
          fill="none"
          stroke={BLACK_HEX}
          strokeWidth="3"
        />
        <polygon points="38,60 50,56 54,64 42,68" fill={RED_HEX} />
        <polygon
          points="58,36 78,30 84,44 64,50"
          fill="none"
          stroke={BLACK_HEX}
          strokeWidth="2.2"
        />
      </svg>
    ),
  },

  // CONTACT（暗背景・左上隅・赤円環 1 つ＋寄り添う小板。最も静か）
  contact: {
    corner: 'top-left',
    dark: true,
    frustum: 6,
    opacityDesktop: 0.18,
    opacityMobile: 0.13,
    specs: [
      {
        id: 'ct1-ring',
        geom: (T) => new T.TorusGeometry(1.1, 0.05, 12, 40),
        color: RED,
        opacity: 1,
        pos: [0, 0, 0],
        rot: [d(60), d(10), d(0)],
        spin: [0.018, 0, 0.014],
        bob: 0.08,
      },
      {
        id: 'ct2-dot',
        geom: (T) => new T.BoxGeometry(0.5, 0.1, 0.5),
        color: RED,
        opacity: 1,
        pos: [1.0, 0.2, 0.2],
        rot: [d(20), d(30), d(12)],
        spin: [0.016, 0.016, 0],
        bob: 0.06,
        mobileDrop: true,
      },
    ],
    fallback: () => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <ellipse
          cx="50"
          cy="50"
          rx="34"
          ry="17"
          fill="none"
          stroke={RED_HEX}
          strokeWidth="2.6"
          transform="rotate(-18 50 50)"
        />
        <polygon points="74,40 84,36 88,44 78,48" fill={RED_HEX} />
      </svg>
    ),
  },
};

// 配置隅 → ホスト div の Tailwind 配置クラス。
// デスクトップ 22〜34vmin / モバイル 18〜24vmin の小矩形。inset-0 で全面に広げない。
// 本文の縦積みに被らないよう、モバイルでは更に画面端へ寄せる。
const CORNER_CLASS: Record<Corner, string> = {
  'top-left': 'top-2 left-2 sm:top-6 sm:left-6 w-[20vmin] h-[20vmin] sm:w-[26vmin] sm:h-[26vmin]',
  'top-right': 'top-2 right-2 sm:top-6 sm:right-6 w-[20vmin] h-[20vmin] sm:w-[28vmin] sm:h-[28vmin]',
  'bottom-left': 'bottom-2 left-2 sm:bottom-6 sm:left-6 w-[20vmin] h-[20vmin] sm:w-[28vmin] sm:h-[28vmin]',
  'bottom-right': 'bottom-2 right-2 sm:bottom-6 sm:right-6 w-[20vmin] h-[20vmin] sm:w-[28vmin] sm:h-[28vmin]',
  'right-center':
    'top-1/2 -translate-y-1/2 right-2 sm:right-6 w-[18vmin] h-[34vmin] sm:w-[22vmin] sm:h-[40vmin]',
};

export default function SectionAccent({ section }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);
  const config = CONFIGS[section];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (prefersReducedMotion() || !supportsWebGL()) {
      setFallback(true);
      return;
    }

    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    const run = async () => {
      if (host.getBoundingClientRect().width < 40) return;
      const THREE = await import('three');
      if (disposed) return;

      const rect = host.getBoundingClientRect();
      let width = Math.max(1, Math.round(rect.width));
      let height = Math.max(1, Math.round(rect.height));
      const isMobile = window.innerWidth < 768;

      const FRUSTUM = config.frustum;
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
      const camera = makeCamera(width, height);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      // DPR 上限: モバイル 1.5 / デスクトップ 2（ProunCanvas と同値）。
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
      );
      renderer.setSize(width, height);
      host.appendChild(renderer.domElement);

      // 脇役の小構成。モバイルは scale 0.6・存在感を更に落とす。
      const group = new THREE.Group();
      group.scale.setScalar(isMobile ? 0.6 : 1);
      scene.add(group);

      // host opacity（§4）。モバイルは下限 0.18（これ未満だと小サイズの塊が実機で
      // ほぼ視認できず「モバイルにも 3D を」の要望を満たせないため）。
      host.style.opacity = String(
        isMobile
          ? Math.max(0.18, config.opacityMobile)
          : config.opacityDesktop
      );

      const geoms: THREE_NS.BufferGeometry[] = [];
      const mats: THREE_NS.Material[] = [];
      const meshes: Array<{
        obj: THREE_NS.Object3D;
        spec: ObjSpec;
        baseY: number;
      }> = [];

      for (const spec of config.specs) {
        if (isMobile && spec.mobileDrop) continue;
        const geom = spec.geom(THREE);
        geoms.push(geom);

        let obj: THREE_NS.Object3D;
        if (spec.edgeOnly) {
          // 中空枠: 面を描かず稜線（LineSegments）のみ。
          const eg = new THREE.EdgesGeometry(geom);
          const em = new THREE.LineBasicMaterial({
            color: spec.edge ?? spec.color,
            transparent: spec.opacity < 1,
            opacity: spec.opacity,
          });
          obj = new THREE.LineSegments(eg, em);
          geoms.push(eg);
          mats.push(em);
        } else {
          const mat = new THREE.MeshBasicMaterial({
            color: spec.color,
            transparent: spec.opacity < 1,
            opacity: spec.opacity,
          });
          const mesh = new THREE.Mesh(geom, mat);
          mats.push(mat);
          // 稜線（暗背景で黒面を cream で見せる / シャープエッジの定義）。
          if (spec.edge !== undefined) {
            const eg = new THREE.EdgesGeometry(geom);
            const em = new THREE.LineBasicMaterial({
              color: spec.edge,
              transparent: true,
              opacity: 0.9,
            });
            mesh.add(new THREE.LineSegments(eg, em));
            geoms.push(eg);
            mats.push(em);
          }
          obj = mesh;
        }

        obj.position.set(...spec.pos);
        obj.rotation.set(...spec.rot);
        group.add(obj);
        meshes.push({ obj, spec, baseY: spec.pos[1] });
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

      // 緩慢ドリフト（spin ≤ 0.035）。bob はデスクトップのみ。スクロール連動なし。
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
        for (const { obj, spec, baseY } of meshes) {
          obj.rotation.x += spec.spin[0] * dt;
          obj.rotation.y += spec.spin[1] * dt;
          obj.rotation.z += spec.spin[2] * dt;
          if (!isMobile && spec.bob) {
            obj.position.y =
              baseY + Math.sin(elapsed * 0.4 + baseY * 1.7) * spec.bob;
          }
        }
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      // 各 instance が自分の可視判定で独立に start/stop する（複数同時可視に対応）。
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
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement);
        }
      };
    };

    void run();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [section, config]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      // 1 隅の小矩形。本文（z-10）より下層・pointer-events なし。inset-0 で全面化しない。
      className={`absolute z-0 overflow-hidden ${CORNER_CLASS[config.corner]}`}
      style={{
        opacity: config.opacityDesktop,
        pointerEvents: 'none',
      }}
    >
      {fallback && config.fallback()}
    </div>
  );
}
