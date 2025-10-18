import NodeCache from 'node-cache';

// In-memory cache for MVP (replace with Redis/DB in production)
export const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
  checkperiod: 600 
});

// Future: Database configuration for Phase 2
export const dbConfig = {
  // MongoDB/PostgreSQL configuration will go here
  // when we move beyond MVP caching
};