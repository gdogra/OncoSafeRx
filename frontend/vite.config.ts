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
    hmr: {
      port: 24678,
    },
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
    minify: 'esbuild',
  },
});
