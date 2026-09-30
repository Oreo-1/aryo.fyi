import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    // three.js is ~600kB minified; it's lazy-loaded so this is fine
    chunkSizeWarningLimit: 700,
  },
});
