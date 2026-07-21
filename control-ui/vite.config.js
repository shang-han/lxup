import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    target: 'es2022',
  },
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          lit: ['lit'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
