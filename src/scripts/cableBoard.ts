// 経歴のケーブルボード（specs/physics-2026.spec.md C・specs/shell-2026.spec.md 05）。
// モニターから出たひもの先のプラグを、仕事の札のコンセントに差すと、その仕事をモニターに出す。
// どこにも差さずに離すとぶら下がり、モニターは案内の文になる。ひもの動きは physics/plugBoard.ts。
import { createPlugBoard } from './physics/plugBoard';

export function initCableBoard(): void {
  const board = document.querySelector<HTMLElement>('[data-board]');
  const canvas = board?.querySelector<HTMLCanvasElement>('.board-rope');
  const handle = board?.querySelector<HTMLElement>('[data-plug-handle]');
  const anchor = board?.querySelector<HTMLElement>('.board-anchor');
  if (!board || !canvas || !handle || !anchor) return;
  const buttons = Array.from(board.querySelectorAll<HTMLButtonElement>('.job-btn'));
  const details = Array.from(board.querySelectorAll<HTMLElement>('[data-detail]'));
  const title = board.querySelector<HTMLElement>('[data-monitor-title]');
  const empty = board.querySelector<HTMLElement>('[data-empty]');
  const status = board.querySelector<HTMLElement>('[data-board-status]');
  if (!buttons.length) return;
  board.classList.add('is-live');

  const show = (i: number | null): void => {
    buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    details.forEach((d, k) => d.classList.toggle('is-on', k === i));
    if (empty) empty.hidden = i !== null;
    if (title) title.textContent = i === null ? '—' : (buttons[i].dataset.period ?? '');
  };
  const say = (text: string): void => {
    if (status) status.textContent = text;
  };

  // 640px 未満は年表（CareerTimeline）を出すので、ひもは動かさない
  const wide = window.matchMedia('(min-width: 640px)');
  show(0);
  const plug = createPlugBoard({
    root: board,
    canvas,
    handle,
    anchor,
    targets: buttons,
    initial: 0,
    enabled: () => wide.matches,
    drop: 'dangle',
    onSeat(i) {
      show(i);
      say(`${buttons[i].dataset.period ?? ''} ${buttons[i].dataset.label ?? ''} を表示しています`);
    },
    onUnplug() {
      show(null);
      say('プラグを抜きました');
    },
    onDangle() {
      say('プラグはどこにも差さっていません');
    },
  });
  if (!plug) return;
  buttons.forEach((b, i) => b.addEventListener('click', () => plug.select(i)));
  wide.addEventListener('change', () => plug.refresh());
}
