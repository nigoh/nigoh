// 段の中の切り替え（スキルの分野・作品の種類）— specs/shell-2026.spec.md。
// [data-switch] の中の [data-switch-btn] と [data-switch-panel] を、並び順で対にする。
// 選んだ面だけ .is-on。JS 無しではチップを出さず、面をぜんぶ並べる（CSS）。
export function initSwitchers(): void {
  document.querySelectorAll<HTMLElement>('[data-switch]').forEach((root) => {
    const btns = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-switch-btn]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-switch-panel]'));
    if (!btns.length || btns.length !== panels.length) return;
    const show = (i: number): void => {
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      panels.forEach((p, k) => p.classList.toggle('is-on', k === i));
    };
    btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  });
}
