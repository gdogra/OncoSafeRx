/**
 * Advanced Redis Caching Service
 * Provides high-performance caching for drug data, interactions, and analytics
 */

import Redis from 'ioredis';
import NodeCache from 'node-cache';

class CacheService {
  constructor() {
    // Redis configuration
    this.redis = null;
    this.isRedisAvailable = false;
    
    // Fallback in-memory cache
    this.memoryCache = new NodeCache({
      stdTTL: 600, // 10 minutes default
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false
    });

    // Cache configuration
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      },
      ttl: {
        drugs: 3600,        // 1 hour for drug data
        interactions: 1800, // 30 minutes for interactions
        analytics: 300,     // 5 minutes for analytics
        search: 600,        // 10 minutes for search results
        user: 1800,         // 30 minutes for user data
        session: 7200       // 2 hours for session data
      },
      prefixes: {
        drug: 'drug:',
        interaction: 'int:',
        search: 'search:',
        user: 'user:',
        session: 'sess:',
        analytics: 'analytics:',
        ml: 'ml:'
      }
    };

    // Performance metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      avgResponseTime: 0
    };

    this.initializeRedis();
  }

  /**
   * Initialize Redis connection with fallback
   */
  async initializeRedis() {
    try {
      this.redis = new Redis(this.config.redis);

      this.redis.on('connect', () => {
        console.log('✅ Redis cache connected successfully');
        this.isRedisAvailable = true;
      });

      this.redis.on('error', (error) => {
        console.warn('⚠️ Redis connection error, falling back to memory cache:', error.message);
        this.isRedisAvailable = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed, using memory cache');
        this.isRedisAvailable = false;
      });

      // Test connection
      await this.redis.ping();
      this.isRedisAvailable = true;
      
    } catch (error) {
      console.warn('⚠️ Redis not available, using memory cache only:', error.message);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Generic get method with fallback
   */
  async get(key, usePrefix = true) {
    const startTime = Date.now();
    
    try {
      let value = null;
      
      if (this.isRedisAvailable && this.redis) {
        const redisKey = usePrefix ? this.addPrefix(key) : key;
        value = await this.redis.get(redisKey);
        
        if (value) {
          value = JSON.parse(value);
        }
      }
      
      // Fallback to memory cache
      if (!value) {
        value = this.memoryCache.get(key);
      }

      this.updateMetrics('hit', startTime, value !== null);
      return value;
      
    } catch (error) {
      this.updateMetrics('error', startTime, false);
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Generic set method with fallback
   */
  async set(key, value, ttl = null, usePrefix = true) {
    const startTime = Date.now();
    
    try {
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || this.config.ttl.drugs;
      
      // Set in Redis if available
      if (this.isRedisAvailable && this.redis) {
        const redisKey = usePrefix ? this.addPrefix(key) : key;
        if (ttl) {
          await this.redis.setex(redisKey, cacheTTL, serializedValue);
        } else {
          await this.redis.set(redisKey, serializedValue);
        }
      }
      
      // Also set in memory cache as backup
      this.memoryCache.set(key, value, cacheTTL);
      
      this.updateMetrics('set', startTime, true);
      return true;
      
    } catch (error) {
      this.updateMetrics('error', startTime, false);
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete from cache
   */
  async del(key, usePrefix = true) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const redisKey = usePrefix ? this.addPrefix(key) : key;
        await this.redis.del(redisKey);
      }
      
      this.memoryCache.del(key);
      return true;
      
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Cache drug information
   */
  async cacheDrug(rxcui, drugData) {
    const key = `${this.config.prefixes.drug}${rxcui}`;
    return await this.set(key, drugData, this.config.ttl.drugs, false);
  }

  /**
   * Get cached drug information
   */
  async getCachedDrug(rxcui) {
    const key = `${this.config.prefixes.drug}${rxcui}`;
    return await this.get(key, false);
  }

  /**
   * Cache drug interaction results
   */
  async cacheInteraction(drugPair, interactionData) {
    const sortedPair = Array.isArray(drugPair) ? drugPair.sort() : [drugPair];
    const key = `${this.config.prefixes.interaction}${sortedPair.join(':')}`;
    return await this.set(key, interactionData, this.config.ttl.interactions, false);
  }

  /**
   * Get cached interaction results
   */
  async getCachedInteraction(drugPair) {
    const sortedPair = Array.isArray(drugPair) ? drugPair.sort() : [drugPair];
    const key = `${this.config.prefixes.interaction}${sortedPair.join(':')}`;
    return await this.get(key, false);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(query, results, searchType = 'general') {
    const normalizedQuery = query.toLowerCase().trim();
    const key = `${this.config.prefixes.search}${searchType}:${this.hashString(normalizedQuery)}`;
    return await this.set(key, {
      query: normalizedQuery,
      results,
      timestamp: new Date().toISOString(),
      type: searchType
    }, this.config.ttl.search, false);
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(query, searchType = 'general') {
    const normalizedQuery = query.toLowerCase().trim();
    const key = `${this.config.prefixes.search}${searchType}:${this.hashString(normalizedQuery)}`;
    return await this.get(key, false);
  }

  /**
   * Cache user session data
   */
  async cacheUserSession(userId, sessionData) {
    const key = `${this.config.prefixes.session}${userId}`;
    return await this.set(key, {
      ...sessionData,
      lastActivity: new Date().toISOString()
    }, this.config.ttl.session, false);
  }

  /**
   * Get cached user session
   */
  async getCachedUserSession(userId) {
    const key = `${this.config.prefixes.session}${userId}`;
    return await this.get(key, false);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(metricKey, data) {
    const key = `${this.config.prefixes.analytics}${metricKey}`;
    return await this.set(key, {
      data,
      timestamp: new Date().toISOString(),
      ttl: this.config.ttl.analytics
    }, this.config.ttl.analytics, false);
  }

  /**
   * Get cached analytics data
   */
  async getCachedAnalytics(metricKey) {
    const key = `${this.config.prefixes.analytics}${metricKey}`;
    const cached = await this.get(key, false);
    
    if (cached && cached.timestamp) {
      const age = Date.now() - new Date(cached.timestamp).getTime();
      if (age > this.config.ttl.analytics * 1000) {
        await this.del(key, false);
        return null;
      }
    }
    
    return cached ? cached.data : null;
  }

  /**
   * Cache ML model predictions
   */
  async cacheMLPrediction(inputHash, prediction, modelVersion = 'v1') {
    const key = `${this.config.prefixes.ml}${modelVersion}:${inputHash}`;
    return await this.set(key, {
      prediction,
      modelVersion,
      timestamp: new Date().toISOString()
    }, this.config.ttl.interactions, false);
  }

  /**
   * Get cached ML prediction
   */
  async getCachedMLPrediction(inputHash, modelVersion = 'v1') {
    const key = `${this.config.prefixes.ml}${modelVersion}:${inputHash}`;
    return await this.get(key, false);
  }

  /**
   * Bulk cache operations for performance
   */
  async mset(keyValuePairs) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const pipeline = this.redis.pipeline();
        
        for (const [key, value, ttl] of keyValuePairs) {
          const serializedValue = JSON.stringify(value);
          const redisKey = this.addPrefix(key);
          
          if (ttl) {
            pipeline.setex(redisKey, ttl, serializedValue);
          } else {
            pipeline.set(redisKey, serializedValue);
          }
        }
        
        await pipeline.exec();
      }
      
      // Also set in memory cache
      for (const [key, value, ttl] of keyValuePairs) {
        this.memoryCache.set(key, value, ttl || this.config.ttl.drugs);
      }
      
      return true;
      
    } catch (error) {
      console.error('Bulk cache set error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget(keys) {
    try {
      const results = {};
      
      if (this.isRedisAvailable && this.redis && keys.length > 0) {
        const redisKeys = keys.map(key => this.addPrefix(key));
        const values = await this.redis.mget(...redisKeys);
        
        for (let i = 0; i < keys.length; i++) {
          if (values[i]) {
            results[keys[i]] = JSON.parse(values[i]);
          }
        }
      }
      
      // Fill missing values from memory cache
      for (const key of keys) {
        if (!results[key]) {
          const memValue = this.memoryCache.get(key);
          if (memValue) {
            results[key] = memValue;
          }
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Bulk cache get error:', error);
      return {};
    }
  }

  /**
   * Pattern-based cache invalidation
   */
  async invalidatePattern(pattern) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      // Clear relevant memory cache entries
      const memKeys = this.memoryCache.keys();
      const matchingKeys = memKeys.filter(key => 
        this.matchesPattern(key, pattern.replace(/^[^:]+:/, ''))
      );
      
      for (const key of matchingKeys) {
        this.memoryCache.del(key);
      }
      
      return true;
      
    } catch (error) {
      console.error('Pattern invalidation error:', error);
      return false;
    }
  }

  /**
   * Cache warming for frequently accessed data
   */
  async warmCache(dataLoader) {
    try {
      console.log('🔥 Starting cache warming...');
      
      const commonDrugs = [
        '1191',   // aspirin
        '11289',  // warfarin  
        '7052',   // morphine
        '6135',   // ketoconazole
        '36567'   // simvastatin
      ];
      
      // Warm drug data cache
      for (const rxcui of commonDrugs) {
        try {
          const drugData = await dataLoader.loadDrug(rxcui);
          if (drugData) {
            await this.cacheDrug(rxcui, drugData);
          }
        } catch (error) {
          console.warn(`Failed to warm cache for drug ${rxcui}:`, error.message);
        }
      }
      
      // Warm common interaction pairs
      const commonPairs = [
        ['aspirin', 'warfarin'],
        ['warfarin', 'amiodarone'],
        ['simvastatin', 'ketoconazole']
      ];
      
      for (const pair of commonPairs) {
        try {
          const interactionData = await dataLoader.loadInteraction(pair);
          if (interactionData) {
            await this.cacheInteraction(pair, interactionData);
          }
        } catch (error) {
          console.warn(`Failed to warm cache for interaction ${pair.join('+')}`);
        }
      }
      
      console.log('✅ Cache warming completed');
      
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  /**
   * Health check and diagnostics
   */
  async healthCheck() {
    const health = {
      redis: {
        available: false,
        latency: null,
        memory: null
      },
      memory: {
        keys: this.memoryCache.getStats().keys,
        hits: this.memoryCache.getStats().hits,
        misses: this.memoryCache.getStats().misses
      },
      metrics: { ...this.metrics }
    };

    if (this.isRedisAvailable && this.redis) {
      try {
        const start = Date.now();
        await this.redis.ping();
        health.redis.latency = Date.now() - start;
        health.redis.available = true;
        
        const info = await this.redis.info('memory');
        const memMatch = info.match(/used_memory:(\d+)/);
        if (memMatch) {
          health.redis.memory = parseInt(memMatch[1]);
        }
        
      } catch (error) {
        health.redis.error = error.message;
      }
    }

    return health;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      ...this.metrics,
      memoryCache: this.memoryCache.getStats(),
      redis: {
        available: this.isRedisAvailable,
        connected: this.redis?.status === 'ready'
      }
    };
  }

  /**
   * Helper methods
   */
  addPrefix(key) {
    return `osrx:${key}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  matchesPattern(key, pattern) {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`).test(key);
  }

  updateMetrics(operation, startTime, success) {
    const responseTime = Date.now() - startTime;
    
    if (operation === 'hit') {
      if (success) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }
    } else if (operation === 'set') {
      this.metrics.sets++;
    } else if (operation === 'error') {
      this.metrics.errors++;
    }

    // Update average response time
    if (this.metrics.avgResponseTime === 0) {
      this.metrics.avgResponseTime = responseTime;
    } else {
      this.metrics.avgResponseTime = (this.metrics.avgResponseTime + responseTime) / 2;
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryCache.close();
    console.log('🔌 Cache service shutdown complete');
  }
}

export default new CacheService();