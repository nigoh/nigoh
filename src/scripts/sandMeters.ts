// B 砂のメーター（specs/physics-2026.spec.md）。
// 管ごとに小さな砂のマス（12×44）。ブロックが画面に入ると口から注ぎ、粒の数＝レベル×マスの数でたまる。
// 動きを減らす設定では注がず、最初からたまった形で出す。
import { Sand } from './physics/sand';
import { register, motion } from './physics/loop';
import { G } from './physics/gravity';
import { useColors, grain, SAND } from './physics/colors';

const W = 12;
const H = 44;

interface Tube {
  sand: Sand;
  ctx: CanvasRenderingContext2D;
  img: ImageData;
  target: number;
}

const tealish = (): number => grain(Math.random() < 0.2 ? SAND.ink : SAND.teal);

export function initSandMeters(): void {
  document.querySelectorAll<HTMLElement>('[data-sand-meters]').forEach((group) => {
    const tubes: Tube[] = [];
    group.querySelectorAll<HTMLElement>('.glass').forEach((glass) => {
      const cv = glass.querySelector('canvas');
      const ctx = cv?.getContext('2d');
      if (!cv || !ctx) return;
      cv.width = W;
      cv.height = H;
      const level = Number(glass.dataset.level ?? 0);
      const t: Tube = { sand: new Sand(W, H), ctx, img: ctx.createImageData(W, H), target: Math.round((level / 100) * W * H) };
      glass.classList.add('is-sand');
      tubes.push(t);
    });
    if (!tubes.length) return;

    const drawAll = (): void => tubes.forEach((t) => t.sand.draw(t.ctx, t.img));
    const fill = (t: Tube): void => {
      for (let n = 0, y = H - 1; y >= 0 && n < t.target; y--) {
        for (let x = 0; x < W && n < t.target; x++, n++) t.sand.add(x, y, tealish());
      }
    };
    useColors(drawAll);
    if (motion.reduce) {
      tubes.forEach(fill);
      drawAll();
    }

    register({
      el: group,
      tick() {
        tubes.forEach((t) => {
          const s = t.sand;
          // 管の口（重力の反対側）の真ん中から注ぐ
          const mouth = G.y >= 0 ? 0 : H - 1;
          for (let k = 0; k < 3 && s.count < t.target; k++) s.add(W / 2 - 1 + ((Math.random() * 3) | 0), mouth, tealish());
          const m = s.step(G.x, G.y) + s.step(G.x, G.y);
          if (m || s.count < t.target) s.draw(t.ctx, t.img);
        });
      },
    });
  });
}
