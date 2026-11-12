// D 道具箱（specs/physics-2026.spec.md）。matter.js は箱が近づいてから読み込む（別のチャンク）。
// 札は 1 枚ずつ注ぐ。傾き（G）で滑り、つまんで投げられ、「揺らす」で跳ね上がる。
// 動きを減らす設定では、積み上がった形を先に計算して止めておく。
import type MatterNS from 'matter-js';
import { register, poke, motion } from './physics/loop';
import { G } from './physics/gravity';
import { useColors, colors } from './physics/colors';

/** kind 0: そのほか / 1: 設定ファイル（mono・枠）/ 2: AI の道具（ティール） */
const TAGS: [string, 0 | 1 | 2][] = [
  ['Claude Code', 2],
  ['サブエージェント', 2],
  ['フック', 0],
  ['GitHub Copilot', 2],
  ['SWE Agent', 2],
  ['OpenAI Codex', 2],
  ['MCP', 2],
  ['AGENTS.md', 1],
  ['CLAUDE.md', 1],
  ['.instructions.md', 1],
  ['.kiro', 1],
  ['specs/**', 1],
  ['Playwright', 0],
  ['Serena', 0],
  ['受入条件', 0],
  ['Issue → PR', 0],
];

interface TagBody extends MatterNS.Body {
  plugin: { w: number; h: number; label: string; kind: 0 | 1 | 2 };
}

export function initToolBox(): void {
  const box = document.querySelector<HTMLElement>('[data-toolbox]');
  const cv = box?.querySelector('canvas');
  const ctx = cv?.getContext('2d');
  if (!box || !cv || !ctx) return;
  box.classList.add('is-live');
  const shake = box.querySelector<HTMLButtonElement>('[data-shake]');
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  let M: typeof MatterNS | null = null;
  let engine: MatterNS.Engine | null = null;
  let walls: MatterNS.Body[] = [];
  const bodies: TagBody[] = [];
  const queue: TagBody[] = [];
  let grab: MatterNS.Constraint | null = null;
  let W = 0;
  let H = 0;
  let frame = 0;

  const fontOf = (kind: number): string => (kind === 1 ? `600 14px ${colors.mono}` : `700 15px ${colors.sans}`);

  function size(): void {
    W = box!.clientWidth;
    H = box!.clientHeight;
    cv!.width = Math.round(W * dpr);
    cv!.height = Math.round(H * dpr);
    if (!M || !engine) return;
    walls.forEach((w) => M!.Composite.remove(engine!.world, w));
    const T = 80;
    walls = [
      M.Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }),
      M.Bodies.rectangle(W / 2, -T / 2, W * 3, T, { isStatic: true }),
      M.Bodies.rectangle(-T / 2, H / 2, T, H * 3, { isStatic: true }),
      M.Bodies.rectangle(W + T / 2, H / 2, T, H * 3, { isStatic: true }),
    ];
    M.Composite.add(engine.world, walls);
    bodies.forEach((b) => {
      if (b.position.x > W - 10 || b.position.y > H - 10) M!.Body.setPosition(b, { x: Math.min(W - 40, b.position.x), y: Math.min(H - 30, b.position.y) });
    });
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
    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    bodies.forEach((b) => {
      const p = b.plugin;
      c.save();
      c.translate(b.position.x, b.position.y);
      c.rotate(b.angle);
      rr(-p.w / 2, -p.h / 2, p.w, p.h, 9);
      c.fillStyle = p.kind === 2 ? colors['teal-tint'] : p.kind === 1 ? colors.panel : colors.bg;
      c.fill();
      c.lineWidth = p.kind === 1 ? 1.5 : 1;
      c.strokeStyle = p.kind === 1 ? colors.edge : colors.line;
      c.stroke();
      c.font = fontOf(p.kind);
      c.fillStyle = p.kind === 2 ? colors['teal-ink'] : colors.fg;
      c.fillText(p.label, 0, 1);
      c.restore();
    });
  }

  async function start(): Promise<void> {
    const mod = await import('matter-js');
    M = mod.default;
    engine = M.Engine.create();
    size();
    const m = M;
    TAGS.forEach(([label, kind]) => {
      ctx!.font = fontOf(kind);
      const w = Math.ceil(ctx!.measureText(label).width) + 26;
      const h = 34;
      const b = m.Bodies.rectangle(w / 2 + 12 + Math.random() * Math.max(1, W - w - 24), 30, w, h, {
        chamfer: { radius: 9 },
        restitution: 0.25,
        friction: 0.35,
        frictionAir: 0.012,
        density: 0.002,
      }) as TagBody;
      b.plugin = { w, h, label, kind };
      queue.push(b);
    });
    if (motion.reduce) {
      // 積み上がった形を先に計算しておく
      while (queue.length) {
        const b = queue.shift()!;
        bodies.push(b);
        m.Composite.add(engine.world, b);
        for (let k = 0; k < 14; k++) m.Engine.update(engine, 1000 / 60);
      }
      for (let k = 0; k < 200; k++) m.Engine.update(engine, 1000 / 60);
    }
    draw();
    poke();
  }

  const local = (e: PointerEvent): { x: number; y: number } => {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  cv.addEventListener('pointerdown', (e) => {
    if (!M || !engine) return;
    const q = local(e);
    const hit = M.Query.point(bodies, q)[0];
    if (!hit) return;
    e.preventDefault();
    grab = M.Constraint.create({
      pointA: q,
      bodyB: hit,
      pointB: M.Vector.rotate(M.Vector.sub(q, hit.position), -hit.angle),
      stiffness: 0.12,
      damping: 0.1,
      length: 0,
    });
    M.Composite.add(engine.world, grab);
    cv.setPointerCapture(e.pointerId);
    poke();
  });
  cv.addEventListener('pointermove', (e) => {
    if (!grab) return;
    const q = local(e);
    grab.pointA.x = q.x;
    grab.pointA.y = q.y;
    poke();
  });
  const drop = (): void => {
    if (grab && M && engine) M.Composite.remove(engine.world, grab);
    grab = null;
  };
  cv.addEventListener('pointerup', drop);
  cv.addEventListener('pointercancel', drop);

  shake?.addEventListener('click', () => {
    if (!M) return;
    const m = M;
    bodies.forEach((b) => {
      m.Body.setVelocity(b, { x: (Math.random() - 0.5) * 14, y: -6 - Math.random() * 10 });
      m.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.3);
    });
    poke();
  });

  size();
  useColors(draw);
  let lastW = W;
  new ResizeObserver(() => {
    if (Math.abs(box.clientWidth - lastW) < 2) return;
    lastW = box.clientWidth;
    size();
    draw();
  }).observe(box);

  register({
    el: box,
    enter() {
      start().catch(() => {
        box.classList.remove('is-live');
      });
    },
    tick() {
      if (!M || !engine) return;
      frame++;
      if (queue.length && frame % 7 === 0) {
        const b = queue.shift()!;
        bodies.push(b);
        M.Composite.add(engine.world, b);
      }
      engine.gravity.x = G.x;
      engine.gravity.y = G.y;
      M.Engine.update(engine, 1000 / 60);
      draw();
    },
  });
}
