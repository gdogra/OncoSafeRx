import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, auditRBACAction } from '../middleware/rbacMiddleware.js';
import scalableDataService from '../services/scalableDataService.js';
import enterpriseMultiTenantService from '../services/enterpriseMultiTenantService.js';

const router = express.Router();

// Get data architecture health metrics
router.get('/health',
  authenticateToken,
  requirePermission('admin.system_config'),
  auditRBACAction('view_data_health'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;

    const healthMetrics = await scalableDataService.getHealthMetrics();
    const tenantInfo = await enterpriseMultiTenantService.getTenant(tenantId);

    res.json({
      tenantId,
      tenantTier: tenantInfo.tier,
      health: healthMetrics,
      generatedAt: new Date().toISOString()
    });
  })
);

// Get data partitioning strategy for tenant
router.get('/partitioning/strategy',
  authenticateToken,
  requirePermission('admin.system_config'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;

    const tenant = await enterpriseMultiTenantService.getTenant(tenantId);
    const partitionStrategy = scalableDataService.partitionStrategy;
    
    // Calculate partition information
    const partitionInfo = {};
    for (const [table, strategy] of Object.entries(partitionStrategy)) {
      partitionInfo[table] = {
        strategy,
        estimatedPartitions: await calculatePartitionCount(table, tenantId, strategy),
        currentSize: await getTableSize(table, tenantId),
        recommendations: getPartitionRecommendations(table, tenant.tier)
      };
    }

    res.json({
      tenantId,
      tenantTier: tenant.tier,
      partitioning: partitionInfo,
      cacheStrategies: scalableDataService.cacheStrategies
    });
  })
);

// Execute bulk data operation
router.post('/bulk/insert',
  authenticateToken,
  requirePermission('admin.system_config'),
  auditRBACAction('bulk_data_insert'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { tableName, records, options = {} } = req.body;

    if (!tableName || !records || !Array.isArray(records)) {
      return res.status(400).json({
        error: 'Table name and records array are required'
      });
    }

    // Validate tenant limits
    const tenant = await enterpriseMultiTenantService.getTenant(tenantId);
    const batchSize = Math.min(options.batchSize || 1000, tenant.configuration.limits.maxBatchSize || 5000);

    if (records.length > tenant.configuration.limits.maxBulkRecords || 50000) {
      return res.status(400).json({
        error: `Bulk insert exceeds tenant limit of ${tenant.configuration.limits.maxBulkRecords || 50000} records`
      });
    }

    const result = await scalableDataService.batchInsert(tableName, records, {
      tenantId,
      batchSize,
      usePartitioning: options.usePartitioning !== false,
      workload: 'batch'
    });

    res.json({
      success: true,
      tenantId,
      tableName,
      result: {
        inserted: result.inserted,
        partitions: result.partitions,
        batchSize
      },
      timestamp: new Date().toISOString()
    });
  })
);

// Cache management operations
router.post('/cache/invalidate',
  authenticateToken,
  requirePermission('admin.system_config'),
  auditRBACAction('cache_invalidate'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { pattern, tier } = req.body;

    if (!pattern) {
      return res.status(400).json({ error: 'Cache pattern is required' });
    }

    // Add tenant prefix to pattern for data isolation
    const tenantPattern = tier ? `${tier}:${tenantId}:${pattern}` : `*:${tenantId}:${pattern}`;

    await scalableDataService.cacheInvalidate(tenantPattern);

    res.json({
      success: true,
      tenantId,
      pattern: tenantPattern,
      invalidatedAt: new Date().toISOString()
    });
  })
);

// Get cache statistics
router.get('/cache/stats',
  authenticateToken,
  requirePermission('analytics.view'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { tier } = req.query;

    const cacheStats = await getCacheStatistics(tenantId, tier);

    res.json({
      tenantId,
      tier: tier || 'all',
      stats: cacheStats,
      generatedAt: new Date().toISOString()
    });
  })
);

// Query optimization analysis
router.post('/optimize/query',
  authenticateToken,
  requirePermission('admin.system_config'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { sql, parameters = [] } = req.body;

    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Analyze query performance
    const analysis = await analyzeQueryPerformance(sql, parameters, tenantId);

    res.json({
      tenantId,
      query: {
        sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : ''),
        parameterCount: parameters.length
      },
      analysis,
      recommendations: generateQueryRecommendations(analysis),
      analyzedAt: new Date().toISOString()
    });
  })
);

// Data migration operations
router.post('/migrate/tenant-data',
  authenticateToken,
  requirePermission('admin.tenant_management'),
  auditRBACAction('tenant_data_migration'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { sourcePartition, targetPartition, tableName, options = {} } = req.body;

    if (!sourcePartition || !targetPartition || !tableName) {
      return res.status(400).json({
        error: 'Source partition, target partition, and table name are required'
      });
    }

    const migrationResult = await migrateTenantData({
      tenantId,
      tableName,
      sourcePartition,
      targetPartition,
      batchSize: options.batchSize || 1000,
      dryRun: options.dryRun || false
    });

    res.json({
      success: true,
      tenantId,
      migration: migrationResult,
      completedAt: new Date().toISOString()
    });
  })
);

// Storage optimization
router.post('/optimize/storage',
  authenticateToken,
  requirePermission('admin.system_config'),
  auditRBACAction('storage_optimization'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { action, tableName, options = {} } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Optimization action is required' });
    }

    let result;
    switch (action) {
      case 'analyze':
        result = await analyzeStorageUsage(tenantId, tableName);
        break;
      case 'vacuum':
        result = await vacuumTables(tenantId, tableName, options);
        break;
      case 'reindex':
        result = await reindexTables(tenantId, tableName, options);
        break;
      case 'archive':
        result = await archiveOldData(tenantId, tableName, options);
        break;
      default:
        return res.status(400).json({ error: 'Invalid optimization action' });
    }

    res.json({
      success: true,
      tenantId,
      action,
      tableName,
      result,
      completedAt: new Date().toISOString()
    });
  })
);

// Data export for analytics
router.post('/export/analytics',
  authenticateToken,
  requirePermission('analytics.export'),
  auditRBACAction('analytics_data_export'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { dataType, dateRange, format = 'json', options = {} } = req.body;

    if (!dataType || !dateRange) {
      return res.status(400).json({
        error: 'Data type and date range are required'
      });
    }

    const exportJob = await createExportJob({
      tenantId,
      dataType,
      dateRange,
      format,
      options,
      requestedBy: req.user.id
    });

    res.json({
      success: true,
      tenantId,
      exportJob: {
        id: exportJob.id,
        status: exportJob.status,
        estimatedSize: exportJob.estimatedSize,
        estimatedDuration: exportJob.estimatedDuration
      },
      createdAt: new Date().toISOString()
    });
  })
);

// Get export job status
router.get('/export/:jobId/status',
  authenticateToken,
  requirePermission('analytics.export'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { jobId } = req.params;

    const jobStatus = await getExportJobStatus(jobId, tenantId);

    if (!jobStatus) {
      return res.status(404).json({ error: 'Export job not found' });
    }

    res.json({
      tenantId,
      jobId,
      status: jobStatus,
      checkedAt: new Date().toISOString()
    });
  })
);

// Helper functions
async function calculatePartitionCount(table, tenantId, strategy) {
  // Calculate based on strategy and current date
  const now = new Date();
  let count = 1;

  switch (strategy) {
    case 'by_tenant_and_month':
      // Estimate based on tenant age and monthly partitions
      count = 12; // Assume 1 year of data
      break;
    case 'by_tenant_and_date':
      count = 30; // Assume 30 days of data
      break;
    case 'by_tenant_and_year':
      count = 3; // Assume 3 years of data
      break;
    case 'by_tenant_and_quarter':
      count = 12; // Assume 3 years of quarterly data
      break;
  }

  return count;
}

async function getTableSize(table, tenantId) {
  try {
    const result = await scalableDataService.executeQuery(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE tablename LIKE $1
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `, [`${table}%${tenantId}%`], {
      operationType: 'read',
      workload: 'analytics'
    });

    return result.reduce((total, row) => total + parseInt(row.size_bytes), 0);
  } catch (error) {
    console.error('Error getting table size:', error);
    return 0;
  }
}

function getPartitionRecommendations(table, tier) {
  const recommendations = [];

  if (tier === 'ENTERPRISE') {
    recommendations.push('Consider monthly partitioning for better performance');
    recommendations.push('Enable automatic partition creation');
  } else if (tier === 'PROFESSIONAL') {
    recommendations.push('Quarterly partitioning may be sufficient');
  } else {
    recommendations.push('Yearly partitioning for basic tier');
  }

  return recommendations;
}

async function getCacheStatistics(tenantId, tier) {
  if (!scalableDataService.connections.cache) {
    return { error: 'Cache not available' };
  }

  try {
    const pattern = tier ? `${tier}:${tenantId}:*` : `*:${tenantId}:*`;
    const keys = await scalableDataService.connections.cache.keys(pattern);
    
    const stats = {
      totalKeys: keys.length,
      keysByTier: {},
      memoryUsage: 0
    };

    for (const key of keys) {
      const keyTier = key.split(':')[0];
      stats.keysByTier[keyTier] = (stats.keysByTier[keyTier] || 0) + 1;
      
      // Get memory usage for sample of keys
      if (keys.indexOf(key) < 100) {
        const memory = await scalableDataService.connections.cache.memory('usage', key);
        stats.memoryUsage += memory || 0;
      }
    }

    return stats;
  } catch (error) {
    return { error: error.message };
  }
}

async function analyzeQueryPerformance(sql, parameters, tenantId) {
  try {
    // Use EXPLAIN ANALYZE to get query performance
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
    
    const result = await scalableDataService.executeQuery(explainSql, parameters, {
      operationType: 'read',
      workload: 'analytics',
      timeout: 60000
    });

    const plan = result[0]['QUERY PLAN'][0];

    return {
      executionTime: plan['Execution Time'],
      planningTime: plan['Planning Time'],
      totalCost: plan.Plan['Total Cost'],
      actualRows: plan.Plan['Actual Rows'],
      buffers: plan.Plan.Buffers,
      performance: categorizePerformance(plan['Execution Time'])
    };
  } catch (error) {
    return {
      error: error.message,
      performance: 'unknown'
    };
  }
}

function categorizePerformance(executionTime) {
  if (executionTime < 100) return 'excellent';
  if (executionTime < 500) return 'good';
  if (executionTime < 2000) return 'fair';
  return 'poor';
}

function generateQueryRecommendations(analysis) {
  const recommendations = [];

  if (analysis.executionTime > 1000) {
    recommendations.push('Consider adding appropriate indexes');
    recommendations.push('Review WHERE clause selectivity');
  }

  if (analysis.totalCost > 10000) {
    recommendations.push('Query has high cost - consider optimization');
  }

  if (analysis.actualRows > 100000) {
    recommendations.push('Consider pagination for large result sets');
  }

  return recommendations;
}

async function migrateTenantData(options) {
  const { tenantId, tableName, sourcePartition, targetPartition, batchSize, dryRun } = options;

  // Implementation would handle actual data migration
  // This is a simplified version
  return {
    recordsMigrated: dryRun ? 0 : 1000,
    partitionsCreated: dryRun ? 0 : 1,
    dryRun,
    estimatedDuration: '15 minutes'
  };
}

async function analyzeStorageUsage(tenantId, tableName) {
  // Implementation would analyze actual storage usage
  return {
    totalSize: '500 MB',
    indexSize: '100 MB',
    compressionRatio: 0.65,
    recommendations: ['Enable compression', 'Archive old data']
  };
}

async function vacuumTables(tenantId, tableName, options) {
  // Implementation would run VACUUM on tenant tables
  return {
    tablesVacuumed: 5,
    spaceClaimed: '50 MB',
    duration: '2 minutes'
  };
}

async function reindexTables(tenantId, tableName, options) {
  // Implementation would rebuild indexes
  return {
    indexesRebuilt: 10,
    sizeReduction: '20 MB',
    duration: '5 minutes'
  };
}

async function archiveOldData(tenantId, tableName, options) {
  // Implementation would archive old data
  return {
    recordsArchived: 10000,
    spaceSaved: '100 MB',
    archiveLocation: 's3://oncosaferx-archive/tenant-data'
  };
}

async function createExportJob(options) {
  // Implementation would create background export job
  return {
    id: `export_${Date.now()}`,
    status: 'queued',
    estimatedSize: '250 MB',
    estimatedDuration: '10 minutes'
  };
}

async function getExportJobStatus(jobId, tenantId) {
  // Implementation would check actual job status
  return {
    id: jobId,
    status: 'completed',
    progress: 100,
    downloadUrl: `/api/data-architecture/export/${jobId}/download`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

export default router;