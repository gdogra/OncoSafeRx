import { Pool } from 'pg';
import Redis from 'ioredis';
import { MongoClient } from 'mongodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

class ScalableDataService {
  constructor() {
    this.initialized = false;
    this.connections = {
      primary: null,
      readonly: [],
      cache: null,
      documentStore: null,
      objectStore: null
    };
    
    // Data partitioning strategy
    this.partitionStrategy = {
      patients: 'by_tenant_and_month',
      interactions: 'by_tenant_and_date',
      analytics: 'by_tenant_and_year',
      audit_logs: 'by_tenant_and_quarter'
    };

    // Caching layers
    this.cacheStrategies = {
      drug_interactions: { ttl: 3600, tier: 'hot' },
      patient_data: { ttl: 1800, tier: 'warm' },
      analytics_reports: { ttl: 7200, tier: 'cold' },
      reference_data: { ttl: 86400, tier: 'static' }
    };

    // Connection pools for different workloads
    this.pools = new Map();
    
    this.initializeConnections();
  }

  /**
   * Initialize all database connections and caching layers
   */
  async initializeConnections() {
    try {
      // Check if we're in a Supabase-only environment (production)
      const hasSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
      const hasPostgres = process.env.DB_HOST || process.env.DATABASE_URL;
      
      if (hasSupabase && !hasPostgres) {
        console.log('🔄 ScalableDataService: Running in Supabase-only mode, skipping direct PostgreSQL connections');
        this.initialized = true;
        return;
      }
      
      // Primary PostgreSQL connection (write operations)
      this.connections.primary = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'oncosaferx',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Read-only replicas for query distribution
      const readReplicas = (process.env.DB_READ_REPLICAS || '').split(',').filter(Boolean);
      this.connections.readonly = readReplicas.map(host => new Pool({
        host: host.trim(),
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'oncosaferx',
        user: process.env.DB_READ_USER || process.env.DB_USER || 'postgres',
        password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
        max: 30,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }));

      // Redis for caching and session management (optional)
      if (process.env.REDIS_HOST || process.env.NODE_ENV === 'development') {
        try {
          this.connections.cache = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            db: 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true
          });
        } catch (error) {
          console.warn('Redis connection failed, continuing without cache:', error.message);
          this.connections.cache = null;
        }
      } else {
        console.log('Redis not configured, continuing without cache');
        this.connections.cache = null;
      }

      // MongoDB for document storage (analytics, logs) - optional
      if (process.env.MONGODB_URI) {
        try {
          this.connections.documentStore = new MongoClient(process.env.MONGODB_URI, {
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
          });
          await this.connections.documentStore.connect();
          console.log('MongoDB connected successfully');
        } catch (error) {
          console.warn('MongoDB connection failed, continuing without document store:', error.message);
          this.connections.documentStore = null;
        }
      } else {
        console.log('MongoDB not configured, continuing without document store');
        this.connections.documentStore = null;
      }

      // S3 for object storage (large reports, exports) - optional
      if (process.env.AWS_ACCESS_KEY_ID) {
        try {
          this.connections.objectStore = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
          });
          console.log('AWS S3 client initialized successfully');
        } catch (error) {
          console.warn('AWS S3 initialization failed, continuing without object store:', error.message);
          this.connections.objectStore = null;
        }
      } else {
        console.log('AWS credentials not configured, continuing without object store');
        this.connections.objectStore = null;
      }

      // Initialize specialized connection pools
      await this.initializeSpecializedPools();

      this.initialized = true;
      console.log('Scalable data service initialized successfully');

    } catch (error) {
      console.error('Failed to initialize data connections:', error);
      throw error;
    }
  }

  /**
   * Initialize specialized connection pools for different workloads
   */
  async initializeSpecializedPools() {
    // Analytics workload pool (longer timeouts, larger connections)
    this.pools.set('analytics', new Pool({
      host: process.env.DB_ANALYTICS_HOST || process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'oncosaferx',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }));

    // Real-time workload pool (fast connections, smaller pool)
    this.pools.set('realtime', new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'oncosaferx',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 15,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 1000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }));

    // Batch processing pool (very long timeouts)
    this.pools.set('batch', new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'oncosaferx',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 5,
      idleTimeoutMillis: 300000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }));
  }

  /**
   * Get appropriate database connection based on operation type
   */
  getConnection(operationType = 'read', workload = 'default') {
    if (!this.initialized) {
      throw new Error('Data service not initialized');
    }

    // Use specialized pools if specified
    if (workload !== 'default' && this.pools.has(workload)) {
      return this.pools.get(workload);
    }

    // Route based on operation type
    if (operationType === 'write') {
      return this.connections.primary;
    }

    // Load balance read operations across replicas
    if (this.connections.readonly.length > 0) {
      const index = Math.floor(Math.random() * this.connections.readonly.length);
      return this.connections.readonly[index];
    }

    // Fallback to primary
    return this.connections.primary;
  }

  /**
   * Execute query with automatic connection routing and caching
   */
  async executeQuery(sql, params = [], options = {}) {
    // If we're in Supabase-only mode, return empty result
    if (!this.connections.primary) {
      console.log('🔄 ScalableDataService: No direct PostgreSQL connection available, skipping query');
      return { rows: [], rowCount: 0 };
    }

    const {
      operationType = 'read',
      workload = 'default',
      cacheable = false,
      cacheKey = null,
      cacheTtl = 300,
      timeout = 30000
    } = options;

    try {
      // Check cache for read operations
      if (operationType === 'read' && cacheable && cacheKey && this.connections.cache) {
        const cached = await this.connections.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Get appropriate connection
      const connection = this.getConnection(operationType, workload);
      
      // Execute query with timeout
      const client = await connection.connect();
      try {
        const result = await Promise.race([
          client.query(sql, params),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), timeout)
          )
        ]);

        // Cache result if applicable
        if (operationType === 'read' && cacheable && cacheKey && this.connections.cache) {
          await this.connections.cache.setex(cacheKey, cacheTtl, JSON.stringify(result.rows));
        }

        return result.rows;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  /**
   * Batch insert with automatic partitioning
   */
  async batchInsert(tableName, records, options = {}) {
    const {
      tenantId,
      batchSize = 1000,
      usePartitioning = true,
      workload = 'batch'
    } = options;

    if (!records || records.length === 0) {
      return { inserted: 0, partitions: [] };
    }

    const partitions = [];
    let totalInserted = 0;

    try {
      // Group records by partition if enabled
      const recordGroups = usePartitioning 
        ? this.groupRecordsByPartition(tableName, records, tenantId)
        : { [tableName]: records };

      for (const [partitionTable, partitionRecords] of Object.entries(recordGroups)) {
        // Process in batches
        for (let i = 0; i < partitionRecords.length; i += batchSize) {
          const batch = partitionRecords.slice(i, i + batchSize);
          
          if (batch.length === 0) continue;

          const columns = Object.keys(batch[0]);
          const values = batch.map(record => 
            columns.map(col => record[col])
          );

          const placeholders = batch.map((_, rowIndex) => 
            `(${columns.map((_, colIndex) => 
              `$${rowIndex * columns.length + colIndex + 1}`
            ).join(', ')})`
          ).join(', ');

          const sql = `
            INSERT INTO ${partitionTable} (${columns.join(', ')})
            VALUES ${placeholders}
            ON CONFLICT DO NOTHING
          `;

          const flatValues = values.flat();
          
          await this.executeQuery(sql, flatValues, {
            operationType: 'write',
            workload,
            timeout: 60000
          });

          totalInserted += batch.length;
          
          if (!partitions.includes(partitionTable)) {
            partitions.push(partitionTable);
          }
        }
      }

      return { inserted: totalInserted, partitions };

    } catch (error) {
      console.error('Batch insert error:', error);
      throw error;
    }
  }

  /**
   * Group records by partition based on strategy
   */
  groupRecordsByPartition(tableName, records, tenantId) {
    const strategy = this.partitionStrategy[tableName];
    if (!strategy || !tenantId) {
      return { [tableName]: records };
    }

    const groups = {};

    records.forEach(record => {
      let partitionSuffix = '';
      
      switch (strategy) {
        case 'by_tenant_and_month':
          const month = this.getPartitionMonth(record.created_at || new Date());
          partitionSuffix = `_${tenantId}_${month}`;
          break;
          
        case 'by_tenant_and_date':
          const date = this.getPartitionDate(record.created_at || new Date());
          partitionSuffix = `_${tenantId}_${date}`;
          break;
          
        case 'by_tenant_and_year':
          const year = this.getPartitionYear(record.created_at || new Date());
          partitionSuffix = `_${tenantId}_${year}`;
          break;
          
        case 'by_tenant_and_quarter':
          const quarter = this.getPartitionQuarter(record.created_at || new Date());
          partitionSuffix = `_${tenantId}_${quarter}`;
          break;
          
        default:
          partitionSuffix = `_${tenantId}`;
      }

      const partitionTable = `${tableName}${partitionSuffix}`;
      
      if (!groups[partitionTable]) {
        groups[partitionTable] = [];
      }
      
      groups[partitionTable].push(record);
    });

    return groups;
  }

  /**
   * Multi-tier caching operations
   */
  async cacheGet(key, tier = 'hot') {
    if (!this.connections.cache) return null;

    try {
      const tieredKey = `${tier}:${key}`;
      const cached = await this.connections.cache.get(tieredKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async cacheSet(key, value, tier = 'hot', ttl = null) {
    if (!this.connections.cache) return false;

    try {
      const tieredKey = `${tier}:${key}`;
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await this.connections.cache.setex(tieredKey, ttl, serialized);
      } else {
        const strategy = this.cacheStrategies[key.split(':')[0]];
        const defaultTtl = strategy?.ttl || 3600;
        await this.connections.cache.setex(tieredKey, defaultTtl, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async cacheInvalidate(pattern) {
    if (!this.connections.cache) return;

    try {
      const keys = await this.connections.cache.keys(pattern);
      if (keys.length > 0) {
        await this.connections.cache.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Document store operations (MongoDB)
   */
  async storeDocument(collection, document, options = {}) {
    if (!this.connections.documentStore) {
      throw new Error('Document store not available');
    }

    try {
      const db = this.connections.documentStore.db(process.env.MONGODB_DB || 'oncosaferx');
      const coll = db.collection(collection);
      
      const result = await coll.insertOne({
        ...document,
        createdAt: new Date(),
        ...options.metadata
      });

      return result.insertedId;
    } catch (error) {
      console.error('Document store error:', error);
      throw error;
    }
  }

  async queryDocuments(collection, query = {}, options = {}) {
    if (!this.connections.documentStore) {
      return [];
    }

    try {
      const db = this.connections.documentStore.db(process.env.MONGODB_DB || 'oncosaferx');
      const coll = db.collection(collection);
      
      let cursor = coll.find(query);
      
      if (options.sort) cursor = cursor.sort(options.sort);
      if (options.limit) cursor = cursor.limit(options.limit);
      if (options.skip) cursor = cursor.skip(options.skip);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Document query error:', error);
      return [];
    }
  }

  /**
   * Object store operations (S3)
   */
  async storeObject(key, data, options = {}) {
    if (!this.connections.objectStore) {
      throw new Error('Object store not available');
    }

    try {
      const bucket = process.env.AWS_S3_BUCKET || 'oncosaferx-data';
      
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: typeof data === 'string' ? data : JSON.stringify(data),
        ContentType: options.contentType || 'application/json',
        Metadata: options.metadata || {}
      });

      await this.connections.objectStore.send(command);
      return `s3://${bucket}/${key}`;
    } catch (error) {
      console.error('Object store error:', error);
      throw error;
    }
  }

  async getObject(key) {
    if (!this.connections.objectStore) {
      throw new Error('Object store not available');
    }

    try {
      const bucket = process.env.AWS_S3_BUCKET || 'oncosaferx-data';
      
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const response = await this.connections.objectStore.send(command);
      const data = await response.Body.transformToString();
      
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('Object get error:', error);
      throw error;
    }
  }

  /**
   * Health monitoring and metrics
   */
  async getHealthMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      database: {
        primary: await this.getPoolHealth(this.connections.primary),
        readonly: await Promise.all(
          this.connections.readonly.map(pool => this.getPoolHealth(pool))
        ),
        specialized: {}
      },
      cache: await this.getCacheHealth(),
      documentStore: await this.getDocumentStoreHealth(),
      objectStore: await this.getObjectStoreHealth()
    };

    // Get specialized pool metrics
    for (const [name, pool] of this.pools) {
      metrics.database.specialized[name] = await this.getPoolHealth(pool);
    }

    return metrics;
  }

  async getPoolHealth(pool) {
    if (!pool) return { status: 'unavailable' };

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1');
      client.release();
      
      return {
        status: 'healthy',
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async getCacheHealth() {
    if (!this.connections.cache) return { status: 'unavailable' };

    try {
      await this.connections.cache.ping();
      const info = await this.connections.cache.info('memory');
      
      return {
        status: 'healthy',
        memory: this.parseRedisInfo(info)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async getDocumentStoreHealth() {
    if (!this.connections.documentStore) return { status: 'unavailable' };

    try {
      await this.connections.documentStore.db().admin().ping();
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async getObjectStoreHealth() {
    if (!this.connections.objectStore) return { status: 'unavailable' };

    try {
      // Simple health check - list buckets with timeout
      const healthKey = `health-check-${Date.now()}`;
      await this.storeObject(healthKey, { test: true });
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Utility functions
   */
  getPartitionMonth(date) {
    const d = new Date(date);
    return `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  getPartitionDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}_${String(d.getDate()).padStart(2, '0')}`;
  }

  getPartitionYear(date) {
    return new Date(date).getFullYear().toString();
  }

  getPartitionQuarter(date) {
    const d = new Date(date);
    const quarter = Math.ceil((d.getMonth() + 1) / 3);
    return `${d.getFullYear()}_Q${quarter}`;
  }

  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const parsed = {};
    
    lines.forEach(line => {
      if (line && line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    });
    
    return parsed;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      if (this.connections.primary) {
        await this.connections.primary.end();
      }
      
      for (const pool of this.connections.readonly) {
        await pool.end();
      }
      
      for (const [name, pool] of this.pools) {
        await pool.end();
      }
      
      if (this.connections.cache) {
        this.connections.cache.disconnect();
      }
      
      if (this.connections.documentStore) {
        await this.connections.documentStore.close();
      }
      
      console.log('Scalable data service shutdown complete');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
}

export default new ScalableDataService();