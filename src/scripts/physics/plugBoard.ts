// 差すと見えるケーブル（specs/physics-2026.spec.md C・specs/shell-2026.spec.md「流れ」）。
// 面のコンセント（anchor）から出たひも（ベルレ積分・点 18 個）の先のプラグを、行き先（targets）のコンセントに差す。
// 行き先を選ぶ（select）とプラグが飛んで差さる。プラグはつまんで抜け、コンセントの近くで離すと差さる。
// どこにも差さずに離したときは、ぶら下がる（dangle）か、もとの行き先に戻る（return）。
import { register, poke, motion } from './loop';
import { G } from './gravity';
import { useColors, colors } from './colors';

interface Pt {
  x: number;
  y: number;
  px: number;
  py: number;
}
interface XY {
  x: number;
  y: number;
}

export interface PlugBoardOptions {
  /** 位置の基準（canvas・handle・anchor・targets を中に持つ、position が付いた要素） */
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  handle: HTMLElement;
  anchor: HTMLElement;
  /** 行き先。中の `.plug-sock` がコンセント（無ければ行き先そのもの） */
  targets: HTMLElement[];
  initial: number | null;
  /** いま動かしてよいか（例：PC の幅のときだけ）。省略すると常に動かす */
  enabled?: () => boolean;
  /** どこにも差さずに離したとき。dangle＝ぶら下がる（既定） / return＝もとの行き先へ戻る */
  drop?: 'dangle' | 'return';
  onSeat?(i: number): void;
  onUnplug?(): void;
  onDangle?(): void;
}

export interface PlugBoard {
  /** プラグを i へ飛ばして差す */
  select(i: number): void;
  /** いま差さっている行き先（飛んでいる間・抜いている間は null） */
  current(): number | null;
  /** 測り直して、ひもを作り直す（見えるようになった・幅が変わった） */
  refresh(): void;
}

const N = 18;
/** プラグの背（ひもの端）は、コンセントの中心から右へこれだけ */
const PLUG_OFF = 24;

export function createPlugBoard(o: PlugBoardOptions): PlugBoard | null {
  const { root, canvas: cv, handle, anchor: anchorEl, targets } = o;
  const ctx = cv.getContext('2d');
  if (!ctx || !targets.length) return null;
  const enabled = o.enabled ?? ((): boolean => true);
  const drop = o.drop ?? 'dangle';

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0;
  let H = 0;
  let anchor: XY = { x: 0, y: 0 };
  let sockets: XY[] = [];
  let plugged: number | null = o.initial;
  /** つまむ前に差さっていた行き先（return のときに戻る先） */
  let home: number | null = o.initial;
  let seg = 10;
  let segTarget = 10;
  let pts: Pt[] = [];
  let drag: XY | null = null;
  let fly: { from: XY; to: number; t0: number; dur: number } | null = null;
  const rings: { x: number; y: number; t: number }[] = [];
  const t0 = performance.now();

  function measure(): void {
    const br = root.getBoundingClientRect();
    W = br.width;
    H = br.height;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    const ar = anchorEl.getBoundingClientRect();
    anchor = { x: ar.left - br.left + ar.width / 2, y: ar.top - br.top + ar.height / 2 };
    sockets = targets.map((t) => {
      const s = (t.querySelector('.plug-sock') ?? t).getBoundingClientRect();
      return { x: s.left - br.left + s.width / 2, y: s.top - br.top + s.height / 2 };
    });
  }
  const pinOf = (i: number): XY => ({ x: sockets[i].x + PLUG_OFF, y: sockets[i].y });
  const lengthFor = (p: XY): number => Math.hypot(p.x - anchor.x, p.y - anchor.y) * 1.15 + 28;
  /** どのコンセントにも届く長さ（つまんでいる間はここまで伸ばし、それより遠くへは引けない） */
  const reach = (): number => Math.max(...sockets.map((_, i) => lengthFor(pinOf(i))));

  function resetRope(): void {
    const end = plugged !== null ? pinOf(plugged) : { x: anchor.x, y: anchor.y + 80 };
    seg = segTarget = lengthFor(end) / N;
    pts = [];
    for (let k = 0; k <= N; k++) {
      const f = k / N;
      const x = anchor.x + (end.x - anchor.x) * f;
      const y = anchor.y + (end.y - anchor.y) * f + Math.sin(f * Math.PI) * 24;
      pts.push({ x, y, px: x, py: y });
    }
  }

  function seat(i: number): void {
    plugged = i;
    home = i;
    segTarget = lengthFor(pinOf(i)) / N;
    rings.push({ x: sockets[i].x, y: sockets[i].y, t: performance.now() });
    o.onSeat?.(i);
  }

  function pin(): XY | null {
    if (drag) return drag;
    if (fly) {
      const k = fly.dur ? Math.min(1, (performance.now() - fly.t0) / fly.dur) : 1;
      const e = 1 - (1 - k) ** 3;
      const to = pinOf(fly.to);
      return { x: fly.from.x + (to.x - fly.from.x) * e, y: fly.from.y + (to.y - fly.from.y) * e };
    }
    return plugged !== null ? pinOf(plugged) : null;
  }

  function simulate(): void {
    if (fly && (!fly.dur || performance.now() - fly.t0 >= fly.dur)) {
      const to = fly.to;
      fly = null;
      seat(to);
    }
    seg += (segTarget - seg) * 0.12;
    const gx = G.x * 0.35;
    const gy = G.y * 0.35;
    for (let i = 1; i <= N; i++) {
      const q = pts[i];
      const vx = (q.x - q.px) * 0.985;
      const vy = (q.y - q.py) * 0.985;
      q.px = q.x;
      q.py = q.y;
      q.x += vx + gx;
      q.y += vy + gy;
    }
    const end = pin();
    for (let it = 0; it < 12; it++) {
      pts[0].x = anchor.x;
      pts[0].y = anchor.y;
      if (end) {
        pts[N].x = end.x;
        pts[N].y = end.y;
      }
      for (let s = 0; s < N; s++) {
        const a = pts[s];
        const b = pts[s + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d <= seg) continue; // ひもは縮むが伸びない
        const fa = s === 0 ? 0 : 1;
        const fb = s + 1 === N && end ? 0 : 1;
        const tot = fa + fb || 1;
        const k = (d - seg) / d;
        a.x += (dx * k * fa) / tot;
        a.y += (dy * k * fa) / tot;
        b.x -= (dx * k * fb) / tot;
        b.y -= (dy * k * fb) / tot;
      }
      for (let m = 1; m <= N; m++) {
        const z = pts[m];
        z.x = Math.min(W - 4, Math.max(4, z.x));
        z.y = Math.min(H - 4, Math.max(4, z.y));
      }
    }
    if (end) {
      pts[N].x = end.x;
      pts[N].y = end.y;
    }
  }

  function rr(x: number, y: number, w: number, h: number, r: number): void {
    ctx!.beginPath();
    ctx!.moveTo(x + r, y);
    ctx!.arcTo(x + w, y, x + w, y + h, r);
    ctx!.arcTo(x + w, y + h, x, y + h, r);
    ctx!.arcTo(x, y + h, x, y, r);
    ctx!.arcTo(x, y, x + w, y, r);
    ctx!.closePath();
  }

  function draw(): void {
    if (!pts.length) return;
    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    // ひも
    c.strokeStyle = colors.teal;
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < N; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    c.lineTo(pts[N].x, pts[N].y);
    c.stroke();
    const seated = plugged !== null && !drag && !fly;
    // 差さっているひもには砂粒（データ）が流れる
    if (seated && !motion.reduce) {
      const now = (performance.now() - t0) / 1600;
      c.fillStyle = colors['logo-coral'];
      for (let g = 0; g < 3; g++) {
        const f = (now + g / 3) % 1;
        const idx = f * N;
        const i0 = Math.floor(idx);
        const ff = idx - i0;
        const a = pts[i0];
        const b = pts[Math.min(N, i0 + 1)];
        c.beginPath();
        c.arc(a.x + (b.x - a.x) * ff, a.y + (b.y - a.y) * ff, 2.6, 0, Math.PI * 2);
        c.fill();
      }
    }
    // プラグ（差さっているときは左向きで、刃はコンセントの中に隠れる）
    const e = pts[N];
    const f = pts[N - 2];
    const ang = seated ? Math.PI : Math.atan2(e.y - f.y, e.x - f.x);
    c.save();
    c.translate(e.x, e.y);
    c.rotate(ang);
    c.fillStyle = colors.coral;
    if (!seated) {
      rr(18, -7, 10, 3, 1.2);
      c.fill();
      rr(18, 4, 10, 3, 1.2);
      c.fill();
    }
    rr(0, -10, 18, 20, 5);
    c.fill();
    c.restore();
    handle.style.transform = `translate(${e.x + Math.cos(ang) * 9}px, ${e.y + Math.sin(ang) * 9}px)`;
    // 差した瞬間に輪が一度広がる
    const now = performance.now();
    for (let i = rings.length - 1; i >= 0; i--) {
      const k = (now - rings[i].t) / 600;
      if (k >= 1 || motion.reduce) {
        rings.splice(i, 1);
        continue;
      }
      c.strokeStyle = colors.teal;
      c.globalAlpha = 0.7 * (1 - k);
      c.lineWidth = 2;
      c.beginPath();
      c.arc(rings[i].x, rings[i].y, 12 + k * 14, 0, Math.PI * 2);
      c.stroke();
      c.globalAlpha = 1;
    }
  }

  const settle = (): void => {
    for (let k = 0; k < 160; k++) simulate();
    draw();
  };

  function select(i: number): void {
    if (i < 0 || i >= targets.length) return;
    if (!enabled()) {
      // ひもを出していない幅（スマホ）：差さっている先だけ覚えておく
      fly = null;
      drag = null;
      plugged = i;
      home = i;
      return;
    }
    if (drag) {
      // つまんでいる間（戻るボタンなどで段が変わった）：飛ばさず、離したときに戻る先だけ変える
      home = i;
      return;
    }
    if (plugged === i && !fly) return;
    if (fly && fly.to === i) return;
    const from = pin() ?? { x: pts[N].x, y: pts[N].y };
    plugged = null;
    segTarget = lengthFor(pinOf(i)) / N;
    fly = { from, to: i, t0: performance.now(), dur: motion.reduce ? 0 : 380 };
    poke();
    if (motion.reduce) settle();
  }

  // つまんで抜く・離して差す
  const local = (e: PointerEvent): XY => {
    const r = root.getBoundingClientRect();
    let x = Math.min(W - 4, Math.max(4, e.clientX - r.left));
    let y = Math.min(H - 4, Math.max(4, e.clientY - r.top));
    // ひもの長さより遠くへは引けない
    const max = reach() * 0.97;
    const d = Math.hypot(x - anchor.x, y - anchor.y);
    if (d > max) {
      x = anchor.x + ((x - anchor.x) * max) / d;
      y = anchor.y + ((y - anchor.y) * max) / d;
    }
    return { x, y };
  };
  handle.addEventListener('pointerdown', (e) => {
    if (!enabled()) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    if (plugged !== null) home = plugged;
    else if (fly) home = fly.to;
    drag = local(e);
    fly = null;
    plugged = null;
    segTarget = reach() / N;
    handle.classList.add('is-grabbing');
    o.onUnplug?.();
    poke();
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag) return;
    drag = local(e);
    poke();
  });
  const release = (): void => {
    if (!drag) return;
    const at = drag;
    let best: number | null = null;
    let bd = 44;
    sockets.forEach((_, i) => {
      const p = pinOf(i);
      const d = Math.hypot(p.x - at.x, p.y - at.y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    handle.classList.remove('is-grabbing');
    if (best !== null) {
      drag = null;
      fly = null;
      seat(best);
    } else if (drop === 'return' && home !== null) {
      // もとの行き先へ、いまの位置から飛んで戻る
      plugged = null;
      segTarget = lengthFor(pinOf(home)) / N;
      fly = { from: at, to: home, t0: performance.now(), dur: motion.reduce ? 0 : 380 };
      drag = null;
    } else {
      drag = null;
      o.onDangle?.();
    }
    if (motion.reduce) settle();
    poke();
  };
  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);

  function refresh(): void {
    if (!enabled()) return;
    measure();
    resetRope();
    settle();
  }

  measure();
  resetRope();
  useColors(draw);
  if (enabled()) settle();
  let lastW = W;
  let lastH = H;
  new ResizeObserver(() => {
    if (!enabled()) return;
    const r = root.getBoundingClientRect();
    const widthChanged = Math.abs(r.width - lastW) >= 2;
    if (!widthChanged && Math.abs(r.height - lastH) < 2) return;
    lastW = r.width;
    lastH = r.height;
    measure();
    // 幅が変わったとき（向き・窓の大きさ）だけ作り直す。高さだけ（詳細の切り替え）なら揺れを残す
    if (widthChanged) {
      resetRope();
      settle();
    } else draw();
  }).observe(root);

  register({
    el: root,
    tick() {
      if (!enabled()) return;
      simulate();
      draw();
    },
  });

  return { select, current: () => plugged, refresh };
}
