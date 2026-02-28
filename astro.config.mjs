import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://nigoh.github.io',
  base: '/nigoh/',
  integrations: [tailwind()],
});
