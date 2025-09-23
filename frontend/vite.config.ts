import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optimized Vite config for performance
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': JSON.stringify({
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
      REACT_APP_VERSION: process.env.REACT_APP_VERSION || '',
    }),
  },
  server: {
    port: 5174,
    hmr: {
      overlay: false, // Disable error overlay for WebSocket issues
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
    minify: 'esbuild',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
