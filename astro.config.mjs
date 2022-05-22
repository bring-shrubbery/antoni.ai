import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import turbolinks from '@astrojs/turbolinks';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [svelte(), tailwind(), turbolinks(), sitemap()],
});
