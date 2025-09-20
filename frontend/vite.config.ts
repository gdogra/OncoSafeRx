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
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'maps';
          }
          if (id.includes('node_modules/@sentry')) {
            return 'sentry';
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/crypto-js')) {
            return 'utils';
          }
          
          // Split large page components
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (['Patients', 'Research', 'DrugDatabase', 'AIRecommendations', 'Regimens'].includes(pageName)) {
              return `page-${pageName.toLowerCase()}`;
            }
          }
          
          // Split components by feature
          if (id.includes('/components/EHR/')) return 'ehr';
          if (id.includes('/components/Genomics/')) return 'genomics';
          if (id.includes('/components/Interactions/')) return 'interactions';
          if (id.includes('/components/AI/')) return 'ai';
          
          // Everything else in vendor
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
