/** @type {import('tailwindcss').Config} */

// ═══ Bauhaus パレット（唯一の出典）═══
// デザイン言語をロシア構成主義 → バウハウス（幾何・原色・キネティック）へ刷新（specs/bauhaus-2026.spec.md）。
// 三原色 red / blue / yellow を核に、black / cream / gray で構成する。
// core 5 色（red/black/cream/gray/darkgray）の hex は不変 — a11y.spec のコントラスト契約を保つため。
// blue / yellow を新規追加（青は暗色＝cream 文字が乗る / 黄は明色＝black 文字が乗る）。
const bauhaus = {
  red: '#D62828',
  blue: '#1E4FA8',
  yellow: '#F1C12E',
  black: '#1A1A1A',
  cream: '#F5F0EB',
  gray: '#8B8680',
  darkgray: '#3D3A37',
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bauhaus,
        // 後方互換エイリアス — 既存の bg-constructivist-* クラス（index/コンポーネント多数）を壊さない。
        // 値は bauhaus と同一オブジェクトを共有する（blue/yellow も参照可能）。
        constructivist: bauhaus,
      },
      fontFamily: {
        sans: ['"Bebas Neue"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        body: ['Inter', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      // 流体タイポトークン（trends-2026-refresh.spec §6/§12。色の追加はなし）
      fontSize: {
        // Hero H1: 390px で 5.5rem 〜 1280px で 10rem
        'display-fluid': ['clamp(5.5rem, 3.5rem + 8vw, 10rem)', { lineHeight: '1' }],
        // セクション h2: 3rem 〜 3.75rem の連続化
        'heading-fluid': ['clamp(3rem, 2.25rem + 3vw, 3.75rem)', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
};
