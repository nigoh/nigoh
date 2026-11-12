// 段の切り替え（specs/shell-2026.spec.md）。
// 段の一覧はタブ。段のリンク・前へ/次へ・矢印キー・プラグのどれで切り替えても、アドレスの #id を履歴に足す
// （戻るボタンで前の段へ戻れる）。ブラウザの #id への移動は使わず pushState で足す（#id への移動はフォーカスを外すため）。
// PC ではプラグ（physics/plugBoard.ts）がいまの段のコンセントへ飛んで差さる。
import { createPlugBoard } from './physics/plugBoard';
import type { PlugBoard } from './physics/plugBoard';

export function initStages(): void {
  const rail = document.querySelector<HTMLElement>('[data-stage-rail]');
  const list = rail?.querySelector<HTMLElement>('[data-stage-list]');
  if (!rail || !list) return;
  const tabs = Array.from(list.querySelectorAll<HTMLAnchorElement>('[data-stage]'));
  const ids = tabs.map((t) => t.dataset.stage ?? '');
  const panes = ids.map((id) => document.getElementById(id));
  if (!tabs.length || panes.some((p) => !p)) return;

  const numOf = (i: number): string => tabs[i].querySelector('.stage-n')?.textContent ?? '';
  const nameOf = (i: number): string => tabs[i].querySelector('.font-bold')?.textContent ?? '';
  const counts = Array.from(document.querySelectorAll<HTMLElement>('[data-stage-count]'));
  const prev = document.querySelector<HTMLAnchorElement>('[data-stage-prev]');
  const next = document.querySelector<HTMLAnchorElement>('[data-stage-next]');
  const wide = window.matchMedia('(min-width: 1024px)');

  let current = Math.max(
    0,
    panes.findIndex((p) => p?.classList.contains('is-active'))
  );

  // タブとして扱う
  list.setAttribute('role', 'tablist');
  const orient = (): void => list.setAttribute('aria-orientation', wide.matches ? 'vertical' : 'horizontal');
  orient();
  tabs.forEach((t, i) => {
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-controls', ids[i]);
  });
  panes.forEach((p, i) => {
    p?.setAttribute('role', 'tabpanel');
    p?.setAttribute('aria-labelledby', tabs[i].id);
  });

  // PC：出力の面から出たケーブルのプラグ。どこにも差さずに離したら、もとの段へ戻る
  const canvas = rail.querySelector<HTMLCanvasElement>('.stage-rope');
  const handle = rail.querySelector<HTMLElement>('[data-plug-handle]');
  const anchor = rail.querySelector<HTMLElement>('.stage-anchor');
  let plug: PlugBoard | null = null;
  if (canvas && handle && anchor) {
    plug = createPlugBoard({
      root: rail,
      canvas,
      handle,
      anchor,
      targets: tabs,
      initial: current,
      enabled: () => wide.matches,
      drop: 'return',
      onSeat(i) {
        go(i);
      },
    });
  }

  function setLink(a: HTMLAnchorElement | null, i: number, text: (name: string) => string): void {
    if (!a) return;
    const ok = i >= 0 && i < ids.length;
    a.hidden = !ok;
    if (!ok) return;
    a.href = `#${ids[i]}`;
    const label = a.querySelector('[data-label]');
    if (label) label.textContent = text(nameOf(i));
  }

  function render(i: number, initial = false): void {
    current = i;
    panes.forEach((p, k) => p?.classList.toggle('is-active', k === i));
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    counts.forEach((c) => (c.textContent = numOf(i)));
    setLink(prev, i - 1, (name) => name);
    setLink(next, i + 1, (name) => `次は ${name}`);
    plug?.select(i);
    if (!wide.matches) {
      // 下の帯：いまの段のチップを真ん中へ
      const t = tabs[i];
      list!.scrollTo({ left: t.offsetLeft - (list!.clientWidth - t.offsetWidth) / 2, behavior: 'instant' });
    }
    if (!initial) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /** 段を切り替えて、履歴に足す */
  function go(i: number): void {
    if (i < 0 || i >= ids.length || i === current) return;
    history.pushState(null, '', `#${ids[i]}`);
    render(i);
  }

  // 戻る・進む、ほかの #id のリンク（ロゴなど）
  const fromHash = (): number => ids.indexOf(location.hash.slice(1));
  window.addEventListener('hashchange', () => {
    const i = fromHash();
    if (i >= 0 && i !== current) render(i);
  });

  /** ふつうのクリックだけ受ける（別のタブで開く操作はブラウザに任せる） */
  const plain = (e: MouseEvent): boolean => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

  tabs.forEach((t, i) =>
    t.addEventListener('click', (e) => {
      if (!plain(e)) return;
      e.preventDefault();
      go(i);
    })
  );

  // 前へ/次へ：切り替えたあと、出力の見出しへフォーカスを移す
  [prev, next].forEach((a) =>
    a?.addEventListener('click', (e) => {
      if (!plain(e)) return;
      e.preventDefault();
      const i = ids.indexOf(a.hash.slice(1));
      if (i < 0) return;
      go(i);
      document.getElementById(`${ids[i]}-title`)?.focus({ preventScroll: true });
    })
  );

  // 矢印キー・Home・End で段を移る（選んだ段にすぐ切り替える）。Space でも押せる
  list.addEventListener('keydown', (e) => {
    const at = tabs.indexOf(document.activeElement as HTMLAnchorElement);
    if (at < 0) return;
    let to = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = (at + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = (at - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = tabs.length - 1;
    else if (e.key === ' ') to = at;
    if (to < 0) return;
    e.preventDefault();
    go(to);
    tabs[to].focus();
  });

  wide.addEventListener('change', () => {
    orient();
    plug?.select(current);
    plug?.refresh();
  });

  const start = fromHash();
  render(start >= 0 ? start : current, true);
}
