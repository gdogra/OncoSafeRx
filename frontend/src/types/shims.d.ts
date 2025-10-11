declare module 'react-leaflet';
declare module 'leaflet';
declare module 'leaflet/dist/leaflet.css';
declare module 'leaflet/dist/images/marker-icon-2x.png';
declare module 'leaflet/dist/images/marker-icon.png';
declare module 'leaflet/dist/images/marker-shadow.png';
declare module '@/components/ui/*';
declare module 'uuid';

// Global variables used in analytics
declare var gtag: any;

// Vite import meta env
interface ImportMetaEnv {
  [key: string]: any;
}
interface ImportMeta {
  env: ImportMetaEnv;
}
