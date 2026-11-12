// 物理のループ（specs/physics-2026.spec.md「共通」）。
// 1 本の requestAnimationFrame で、見えている物理だけを動かす。10 秒さわらなければ休み、タブが隠れたら止める。
// 動きを減らす設定では自動で動かさず、さわった直後（90 フレーム）だけ動かす。

export interface Sim {
  /** 見えているかを見張る要素 */
  el: Element;
  /** 1 フレーム分すすめて描く */
  tick(): void;
  /** はじめて画面の近くに来たとき */
  enter?(): void;
}

export const motion = {
  reduce: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const sims: Sim[] = [];
const visible = new Set<Sim>();
const entered = new WeakSet<Sim>();
let idle = 0;
let touched = 9999;
let running = false;
let io: IntersectionObserver | null = null;

/** さわった・傾けた。休んでいたら起こす */
export function poke(): void {
  idle = 0;
  touched = 0;
}

function frame(): void {
  idle++;
  touched++;
  const run = !document.hidden && (motion.reduce ? touched < 90 : idle < 600);
  if (run) visible.forEach((s) => s.tick());
  requestAnimationFrame(frame);
}

export function register(sim: Sim): void {
  sims.push(sim);
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const s = sims.find((x) => x.el === e.target);
          if (!s) return;
          if (e.isIntersecting) {
            visible.add(s);
            if (!entered.has(s)) {
              entered.add(s);
              s.enter?.();
            }
            if (!motion.reduce) idle = 0;
          } else {
            visible.delete(s);
          }
        });
      },
      { rootMargin: '120px 0px' }
    );
  }
  io.observe(sim.el);
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}
