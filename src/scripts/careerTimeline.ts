// 経歴の年表（スマホ）— 押した仕事をその場で開く。開くのはいつも 1 つ（プラグの印が移る）。
export function initCareerTimeline(): void {
  document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((root) => {
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-tl-row]'));
    const open = (target: HTMLElement | undefined): void => {
      rows.forEach((r) => {
        const on = r === target;
        r.classList.toggle('is-on', on);
        r.querySelector('button')?.setAttribute('aria-expanded', String(on));
      });
    };
    // JS 無しでは全部開いている（aria-expanded も true）。JS があるときは、最初に開いている 1 つに合わせる
    open(rows.find((r) => r.classList.contains('is-on')) ?? rows[0]);
    rows.forEach((row) => row.querySelector('button')?.addEventListener('click', () => open(row)));
  });
}
