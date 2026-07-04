import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { remarkMermaidSvg } from './src/lib/remark-mermaid-svg.mjs';

export default defineConfig({
  site: 'http://localhost:4321',
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx(), sitemap(), svelte()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMermaidSvg],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
