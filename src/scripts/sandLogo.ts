// A 砂のロゴ（specs/physics-2026.spec.md）。ヒーローの受け皿に「nigoh」を砂粒で描く。
// 粒は固まっていて、なぞるとほどけて落ちる。押したままで砂が出る。はっきり傾けると全体がほどける。
import { Sand } from './physics/sand';
import { register, poke, motion } from './physics/loop';
import { G, autoGyro, enableGyro, gyroSupport } from './physics/gravity';
import { useColors, grain, SAND } from './physics/colors';
import { logoSvg, LOGO_ASPECT } from '../components/logoShape';

export function initSandLogo(): void {
  const root = document.querySelector<HTMLElement>('[data-sand-logo]');
  const tray = root?.querySelector<HTMLElement>('.sand-tray');
  const cv = tray?.querySelector('canvas');
  const ctx = cv?.getContext('2d', { willReadFrequently: false });
  if (!root || !tray || !cv || !ctx) return;

  const reformBtn = root.querySelector<HTMLButtonElement>('[data-reform]');
  const gyroBtn = root.querySelector<HTMLButtonElement>('[data-gyro]');
  const hint = root.querySelector<HTMLElement>('[data-hint]');

  let sand: Sand | null = null;
  let img: ImageData | null = null;
  let cols = 0;
  let rows = 0;
  /** 砂 1 粒の大きさ（CSS px）。スマホ 2・PC 3 */
  let cell = 3;
  let glued = true;
  let pressing: [number, number] | null = null;
  let quiet = 0;

  // 下絵（色は見分けにだけ使う。描く色は --c-* から）
  const art = new Image();
  art.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logoSvg('#167d6b', '#f2724b'));

  const draw = (): void => {
    if (sand && img) sand.draw(ctx, img);
  };

  function stamp(s: Sand): void {
    const oc = document.createElement('canvas');
    oc.width = cols;
    oc.height = rows;
    const o = oc.getContext('2d');
    if (!o) return;
    let lw = cols * 0.82;
    let lh = lw / LOGO_ASPECT;
    if (lh > rows * 0.62) {
      lh = rows * 0.62;
      lw = lh * LOGO_ASPECT;
    }
    o.drawImage(art, (cols - lw) / 2, rows * 0.07, lw, lh);
    const px = o.getImageData(0, 0, cols, rows).data;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (px[i + 3] < 110) continue;
        s.add(x, y, grain(px[i] > 150 ? SAND.coral : SAND.teal), true);
      }
    }
    glued = true;
  }

  function floor(s: Sand): void {
    for (let y = rows - Math.round(12 / cell); y < rows; y++) {
      for (let x = 0; x < cols; x++) if (Math.random() < 0.55) s.add(x, y, grain(SAND.sand));
    }
    for (let k = 0; k < 24; k++) s.step(0, 1);
  }

  function build(): void {
    if (!cv || !tray) return;
    const W = tray.clientWidth;
    const H = tray.clientHeight;
    cell = window.matchMedia('(min-width: 640px)').matches ? 3 : 2;
    cols = Math.max(40, Math.floor(W / cell));
    rows = Math.max(30, Math.floor(H / cell));
    cv.width = cols;
    cv.height = rows;
    const s = new Sand(cols, rows);
    sand = s;
    img = ctx!.createImageData(cols, rows);
    stamp(s);
    floor(s);
    tray.classList.add('is-sand');
    draw();
  }

  const local = (e: PointerEvent): [number, number] => {
    const r = cv.getBoundingClientRect();
    return [Math.floor(((e.clientX - r.left) / r.width) * cols), Math.floor(((e.clientY - r.top) / r.height) * rows)];
  };
  cv.addEventListener('pointermove', (e) => {
    if (!sand) return;
    const p = local(e);
    sand.loosen(p[0], p[1], Math.round(10 / cell));
    if (pressing) pressing = p;
    poke();
  });
  cv.addEventListener('pointerdown', (e) => {
    if (!sand) return;
    pressing = local(e);
    sand.loosen(pressing[0], pressing[1], Math.round(12 / cell));
    poke();
  });
  (['pointerup', 'pointerleave', 'pointercancel'] as const).forEach((t) =>
    cv.addEventListener(t, () => {
      pressing = null;
    })
  );

  reformBtn?.addEventListener('click', () => {
    if (!sand) return;
    sand.clear();
    stamp(sand);
    floor(sand);
    draw();
    poke();
  });

  // ジャイロ：iPhone はボタンから許可を取る。Android は動きを減らす設定でなければ最初から
  const support = gyroSupport();
  autoGyro();
  if (gyroBtn && (support === 'permission' || (support === 'auto' && motion.reduce))) {
    gyroBtn.hidden = false;
    gyroBtn.addEventListener('click', async () => {
      const ok = await enableGyro();
      gyroBtn.hidden = ok;
      if (ok) reformBtn?.focus();
      if (hint) hint.textContent = ok ? '傾けると砂が流れます' : '傾きを読めませんでした。なぞる・押すで遊べます';
    });
  }
  if (hint && support === 'auto' && !motion.reduce) hint.textContent = '傾けると砂が流れます・なぞると崩れる';
  if (reformBtn) reformBtn.hidden = false;
  if (hint) hint.hidden = false;

  art.decode().then(build, build);
  let lastW = tray.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(tray.clientWidth - lastW) > 24) {
      lastW = tray.clientWidth;
      build();
    }
  }).observe(tray);
  useColors(draw);

  register({
    el: tray,
    tick() {
      if (!sand) return;
      if (glued && (Math.abs(G.x) > 0.4 || G.y < 0.35)) {
        sand.stuck.fill(0);
        glued = false;
      }
      if (pressing) {
        for (let k = 0; k < Math.round(45 / (cell * cell)); k++) {
          const base = Math.random() < 0.5 ? SAND.teal : Math.random() < 0.5 ? SAND.coral : SAND.sand;
          const spread = Math.round(7 / cell);
          const off = (): number => ((Math.random() * (spread * 2 + 1)) | 0) - spread;
          sand.add(pressing[0] + off(), pressing[1] + off(), grain(base));
        }
      }
      const m = sand.step(G.x, G.y) + sand.step(G.x, G.y);
      quiet = m ? 0 : quiet + 1;
      if (m || pressing || quiet < 2) draw();
    },
  });
}
