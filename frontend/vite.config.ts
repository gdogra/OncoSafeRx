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
  build: {
    chunkSizeWarningLimit: 600, // Stricter warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Put React and React-DOM in same chunk to avoid context issues
          react: ['react', 'react-dom'],
          vendor: ['axios', 'crypto-js'],
          icons: ['lucide-react'],
          router: ['react-router-dom'],
          maps: ['leaflet', 'react-leaflet'],
          sentry: ['@sentry/react']
        },
      },
    },
    // Enable tree shaking
    treeshake: true,
    // Minify for production
    minify: 'esbuild',
    // Source maps for debugging but not inline
    sourcemap: false,
  },
  // Enable compression
  esbuild: {
    drop: ['console', 'debugger'], // Remove console.log in production
  },
});
