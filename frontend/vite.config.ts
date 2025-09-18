import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite config with CRA-style env shim
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': JSON.stringify({
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
      REACT_APP_VERSION: process.env.REACT_APP_VERSION || '',
    }),
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          maps: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
