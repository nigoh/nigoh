// 傾きのつまみ（PC）。つまみの位置＝重力の向き。ジャイロで変わったときも追いかける。
import { G, setGravity, onGravity } from './physics/gravity';

export function initTiltPad(): void {
  const root = document.querySelector<HTMLElement>('[data-tilt]');
  const pad = root?.querySelector<HTMLElement>('[data-tilt-pad]');
  const knob = root?.querySelector<HTMLButtonElement>('[data-tilt-knob]');
  const dirText = root?.querySelector<HTMLElement>('[data-tilt-dir]');
  if (!root || !pad || !knob) return;
  root.hidden = false;

  const place = (): void => {
    const r = pad.clientWidth / 2 - 16;
    knob.style.transform = `translate(${G.x * r}px, ${G.y * r}px)`;
    const m = Math.hypot(G.x, G.y);
    const a = (Math.atan2(G.y, G.x) * 180) / Math.PI;
    const dir = m < 0.1 ? '無重力' : a > 45 && a < 135 ? '下向き' : a >= -45 && a <= 45 ? '右向き' : a < -45 && a > -135 ? '上向き' : '左向き';
    if (dirText && dirText.textContent !== dir) dirText.textContent = dir;
  };

  let dragging = false;
  const fromPointer = (e: PointerEvent): void => {
    const r = pad.getBoundingClientRect();
    const R = r.width / 2 - 16;
    setGravity((e.clientX - r.left - r.width / 2) / R, (e.clientY - r.top - r.height / 2) / R);
  };
  pad.addEventListener('pointerdown', (e) => {
    dragging = true;
    pad.setPointerCapture(e.pointerId);
    fromPointer(e);
  });
  pad.addEventListener('pointermove', (e) => {
    if (dragging) fromPointer(e);
  });
  const stop = (): void => {
    dragging = false;
  };
  pad.addEventListener('pointerup', stop);
  pad.addEventListener('pointercancel', stop);
  pad.addEventListener('lostpointercapture', stop);
  pad.addEventListener('dblclick', () => setGravity(0, 1));
  knob.addEventListener('keydown', (e) => {
    const s = 0.15;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [G.x - s, G.y],
      ArrowRight: [G.x + s, G.y],
      ArrowUp: [G.x, G.y - s],
      ArrowDown: [G.x, G.y + s],
      Home: [0, 1],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setGravity(m[0], m[1]);
  });

  onGravity(place);
  place();
}
