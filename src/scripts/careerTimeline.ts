// 経歴の年表（スマホ）— 押した仕事をその場で開く。開くのはいつも 1 つ（プラグの印が移る）。
export function initCareerTimeline(): void {
  document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((root) => {
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-tl-row]'));
    rows.forEach((row) => {
      row.querySelector('button')?.addEventListener('click', () => {
        rows.forEach((r) => {
          const on = r === row;
          r.classList.toggle('is-on', on);
          r.querySelector('button')?.setAttribute('aria-expanded', String(on));
        });
      });
    });
  });
}
