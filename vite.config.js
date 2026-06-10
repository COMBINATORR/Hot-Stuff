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
    port: 5173,
    open: true,
  },
});
