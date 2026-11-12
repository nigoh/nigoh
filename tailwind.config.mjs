/** @type {import('tailwindcss').Config} */

// ═══ プラグ パレット（唯一の出典）═══
// pipe-in の「プラグ」（nigoh/pipe-in の docs/design/README.md・D0030・D0094）と同じ値。
// 色は役の名前で呼び、明るい画面と暗い画面で同じ名前に別の値を当てる（specs/plug-2026.spec.md）。
// canvas（作業台の地）・ok-ink・logo-* はサイト用に足したもの。
const plug = {
  light: {
    bg: '#f6f6f4',
    canvas: '#eceae6',
    panel: '#ffffff',
    col: '#ecebe7',
    line: '#e4ded8',
    edge: '#8f857e',
    fg: '#23201e',
    muted: '#6b625c',
    coral: '#c2471f',
    'coral-tint': '#fde6dd',
    'coral-ink': '#a83a17',
    'on-coral': '#ffffff',
    teal: '#167d6b',
    'teal-tint': '#dcefe9',
    'teal-ink': '#0f5a4d',
    ok: '#2e7d32',
    'ok-tint': '#e3f0e3',
    'ok-ink': '#256b29',
    'logo-teal': '#167d6b',
    'logo-coral': '#f2724b',
  },
  dark: {
    bg: '#161514',
    canvas: '#100f0e',
    panel: '#211f1d',
    col: '#1d1b19',
    line: '#36322f',
    edge: '#8a8079',
    fg: '#f2ece6',
    muted: '#ada39b',
    coral: '#ff8a65',
    'coral-tint': '#4a2316',
    'coral-ink': '#ffb59c',
    'on-coral': '#1c120e',
    teal: '#5fc4ab',
    'teal-tint': '#15392f',
    'teal-ink': '#8fe0c6',
    ok: '#81c784',
    'ok-tint': '#1d3320',
    'ok-ink': '#a5d6a7',
    'logo-teal': '#5fc4ab',
    'logo-coral': '#ff8a65',
  },
};

// Tailwind のクラスは `ui-*`（例: bg-ui-panel / text-ui-muted）。値は global.css の --c-* を指すので、
// 明るい/暗いの切り替えは CSS 変数だけで済む。
const ui = Object.fromEntries(Object.keys(plug.light).map((k) => [k, `var(--c-${k})`]));

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        plug,
        ui,
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', '"Hiragino Sans"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        // やわらかの角（D0094）: 札 6・ボタン 8・カード 14・面 20
        tag: '6px',
        btn: '8px',
        card: '14px',
        panel: '20px',
      },
      boxShadow: {
        soft: 'var(--c-shadow)',
        lift: 'var(--c-lift)',
      },
    },
  },
  plugins: [],
};
