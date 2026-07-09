/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        constructivist: {
          red: '#D62828',
          black: '#1A1A1A',
          cream: '#F5F0EB',
          gray: '#8B8680',
          darkgray: '#3D3A37',
        },
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
