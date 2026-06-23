import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    imagetools({
      defaultDirectives: new URLSearchParams({
        format: 'avif;webp;png',
        as: 'picture',
      })
    })
  ],
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
  },
});
