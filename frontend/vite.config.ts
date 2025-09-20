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
        manualChunks(id) {
          // React and React-DOM together
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
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
