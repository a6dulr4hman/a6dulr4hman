import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset URLs relative so the site works on any path
// (GitHub Pages sub-path, Netlify, Cloudflare, local preview).
export default defineConfig({
  base: './',
  plugins: [react()],
});
