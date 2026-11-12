// 物理の色（specs/physics-2026.spec.md「共通」）。値は --c-*（tailwind.config.mjs の plug）から読むだけ。
// 明るい/暗いが切り替わったら読み直し、登録した描き直しを呼ぶ。

export const colors: Record<string, string> = {};

/** 砂の色。粒の値 v = base*3 + shade + 1（base: 0 teal / 1 logo-coral / 2 edge / 3 teal-ink、shade: 0〜2） */
export const grainPalette = new Uint8Array(13 * 4);
export const SAND = { teal: 0, coral: 1, sand: 2, ink: 3 } as const;
export const grain = (base: number, shade = (Math.random() * 3) | 0): number => base * 3 + shade + 1;

const KEYS = ['bg', 'canvas', 'panel', 'col', 'line', 'edge', 'fg', 'muted', 'coral', 'teal', 'teal-tint', 'teal-ink', 'logo-coral'];
const listeners = new Set<() => void>();
let watching = false;

const tok = (n: string): string => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readColors(): void {
  KEYS.forEach((k) => (colors[k] = tok(`--c-${k}`)));
  colors.mono = '"JetBrains Mono", ui-monospace, monospace';
  colors.sans = '"Zen Kaku Gothic New", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif';
  const bases = [rgb(colors.teal), rgb(colors['logo-coral']), rgb(colors.edge), rgb(colors['teal-ink'])];
  const ground = rgb(colors.col);
  bases.forEach((b, bi) => {
    for (let s = 0; s < 3; s++) {
      const t = s * 0.14;
      const i = (bi * 3 + s + 1) * 4;
      grainPalette[i] = Math.round(b[0] + (ground[0] - b[0]) * t);
      grainPalette[i + 1] = Math.round(b[1] + (ground[1] - b[1]) * t);
      grainPalette[i + 2] = Math.round(b[2] + (ground[2] - b[2]) * t);
      grainPalette[i + 3] = 255;
    }
  });
}

/** 色を使う物理が呼ぶ。描き直しの関数を登録し、色を読んでおく */
export function useColors(redraw: () => void): void {
  listeners.add(redraw);
  if (watching) return;
  watching = true;
  readColors();
  const refresh = (): void => {
    readColors();
    listeners.forEach((f) => f());
  };
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refresh);
  document.fonts?.ready.then(refresh);
}
