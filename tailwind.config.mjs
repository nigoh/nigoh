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
    },
  },
  plugins: [],
};
