import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optimized Vite config for performance
const isProd = process.env.NODE_ENV === 'production';
const enableSourcemap = process.env.VITE_SOURCEMAPS === 'true' || (!isProd && true);

export default defineConfig({
  plugins: [react()],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  define: {
    'process.env': JSON.stringify({
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
      REACT_APP_VERSION: process.env.REACT_APP_VERSION || '',
    }),
  },
  server: {
    port: 5176,
    hmr: false, // Disable HMR completely to prevent auth interruption
    // hmr: {
    //   overlay: false, // Disable error overlay for WebSocket issues
    // },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Disable sourcemaps by default in production to avoid .map 404 noise
    sourcemap: enableSourcemap,
    minify: 'esbuild',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 800,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
