import crypto from 'crypto';

class EnterpriseMultiTenantService {
  constructor() {
    this.tenants = new Map();
    this.userTenantCache = new Map();
    this.tenantConfigurations = new Map();
    
    // Enterprise tenant tiers
    this.tenantTiers = {
      ENTERPRISE: {
        name: 'Enterprise',
        maxUsers: 10000,
        maxPatients: 1000000,
        features: ['all'],
        analyticsRetention: '7_years',
        supportLevel: 'premium',
        customBranding: true,
        apiRateLimit: 10000,
        storageQuotaGB: 1000
      },
      PROFESSIONAL: {
        name: 'Professional',
        maxUsers: 1000,
        maxPatients: 100000,
        features: ['clinical_decision_support', 'drug_interactions', 'analytics'],
        analyticsRetention: '3_years',
        supportLevel: 'standard',
        customBranding: true,
        apiRateLimit: 5000,
        storageQuotaGB: 100
      },
      BASIC: {
        name: 'Basic',
        maxUsers: 100,
        maxPatients: 10000,
        features: ['clinical_decision_support', 'drug_interactions'],
        analyticsRetention: '1_year',
        supportLevel: 'community',
        customBranding: false,
        apiRateLimit: 1000,
        storageQuotaGB: 10
      }
    };

    // Health system types
    this.healthSystemTypes = {
      ACADEMIC_MEDICAL_CENTER: 'Academic Medical Center',
      INTEGRATED_DELIVERY_NETWORK: 'Integrated Delivery Network',
      COMMUNITY_HOSPITAL: 'Community Hospital',
      SPECIALTY_CLINIC: 'Specialty Clinic',
      CANCER_CENTER: 'Cancer Center',
      GOVERNMENT_FACILITY: 'Government Healthcare Facility'
    };

    this.initializeDefaultTenants();
  }

  /**
   * Create new enterprise tenant
   */
  async createTenant(tenantData) {
    try {
      const tenantId = this.generateTenantId(tenantData.name);
      const tenant = {
        id: tenantId,
        name: tenantData.name,
        displayName: tenantData.displayName || tenantData.name,
        type: tenantData.type || this.healthSystemTypes.COMMUNITY_HOSPITAL,
        tier: tenantData.tier || 'BASIC',
        
        // Organization details
        organization: {
          legalName: tenantData.organization?.legalName || tenantData.name,
          taxId: tenantData.organization?.taxId,
          npn: tenantData.organization?.npn, // National Provider Identifier
          address: tenantData.organization?.address,
          contactInfo: tenantData.organization?.contactInfo,
          website: tenantData.organization?.website
        },

        // Technical configuration
        configuration: {
          subdomain: tenantData.subdomain || tenantId,
          customDomain: tenantData.customDomain,
          timezone: tenantData.timezone || 'UTC',
          locale: tenantData.locale || 'en-US',
          branding: this.createDefaultBranding(tenantData),
          features: this.getTierFeatures(tenantData.tier),
          limits: this.getTierLimits(tenantData.tier)
        },

        // Security settings
        security: {
          ssoEnabled: tenantData.ssoEnabled || false,
          mfaRequired: tenantData.mfaRequired || false,
          sessionTimeout: tenantData.sessionTimeout || 3600,
          passwordPolicy: this.getDefaultPasswordPolicy(),
          ipWhitelist: tenantData.ipWhitelist || [],
          dataEncryption: true,
          auditLogRetention: this.getTierAuditRetention(tenantData.tier)
        },

        // Clinical configuration
        clinical: {
          specialties: tenantData.specialties || ['oncology'],
          drugFormulary: tenantData.drugFormulary || 'standard',
          clinicalGuidelines: tenantData.clinicalGuidelines || ['nccn', 'asco'],
          alertThresholds: this.getDefaultAlertThresholds(),
          workflowSettings: this.getDefaultWorkflowSettings()
        },

        // Integration settings
        integrations: {
          ehrSystems: tenantData.ehrSystems || [],
          labSystems: tenantData.labSystems || [],
          pharmacySystems: tenantData.pharmacySystems || [],
          billingIntegration: tenantData.billingIntegration || false,
          fhirEndpoints: tenantData.fhirEndpoints || []
        },

        // Metadata
        metadata: {
          created: new Date().toISOString(),
          createdBy: tenantData.createdBy,
          lastModified: new Date().toISOString(),
          status: 'active',
          version: '1.0.0'
        },

        // Usage tracking
        usage: {
          users: 0,
          patients: 0,
          apiCalls: 0,
          storageUsedGB: 0,
          lastActivity: null
        },

        // Database configuration
        database: {
          schema: `tenant_${tenantId}`,
          connectionPool: this.calculateConnectionPool(tenantData.tier),
          backupRetention: this.getTierBackupRetention(tenantData.tier),
          replicationSettings: this.getTierReplication(tenantData.tier)
        }
      };

      // Store tenant
      this.tenants.set(tenantId, tenant);
      this.tenantConfigurations.set(tenantId, tenant.configuration);

      // Initialize tenant database schema
      await this.initializeTenantDatabase(tenantId);

      // Create default admin user
      if (tenantData.adminUser) {
        await this.createTenantAdmin(tenantId, tenantData.adminUser);
      }

      // Initialize analytics tracking
      await this.initializeTenantAnalytics(tenantId);

      return {
        tenantId,
        tenant,
        accessUrl: this.generateAccessUrl(tenant),
        setupInstructions: this.generateSetupInstructions(tenant)
      };

    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error(`Failed to create tenant: ${error.message}`);
    }
  }

  /**
   * Get tenant by ID with caching
   */
  async getTenant(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    // Check cache first
    if (this.tenants.has(tenantId)) {
      return this.tenants.get(tenantId);
    }

    // In production, this would load from database
    throw new Error(`Tenant ${tenantId} not found`);
  }

  /**
   * Get tenant by domain/subdomain
   */
  async getTenantByDomain(domain) {
    for (const [tenantId, tenant] of this.tenants) {
      if (tenant.configuration.customDomain === domain || 
          tenant.configuration.subdomain === domain) {
        return tenant;
      }
    }
    throw new Error(`No tenant found for domain ${domain}`);
  }

  /**
   * Validate user access to tenant
   */
  async validateTenantAccess(userId, tenantId, requiredPermissions = []) {
    const tenant = await this.getTenant(tenantId);
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (tenant.metadata.status !== 'active') {
      throw new Error('Tenant is not active');
    }

    // Check user permissions (would integrate with user management system)
    const userPermissions = await this.getUserTenantPermissions(userId, tenantId);
    
    if (requiredPermissions.length > 0) {
      const hasPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission));
      
      if (!hasPermissions) {
        throw new Error('Insufficient permissions for this operation');
      }
    }

    return {
      allowed: true,
      tenant,
      userPermissions,
      limits: tenant.configuration.limits
    };
  }

  /**
   * Update tenant configuration
   */
  async updateTenantConfiguration(tenantId, updates, updatedBy) {
    const tenant = await this.getTenant(tenantId);
    
    // Validate updates
    this.validateConfigurationUpdates(updates, tenant);
    
    // Apply updates
    const updatedTenant = {
      ...tenant,
      ...updates,
      metadata: {
        ...tenant.metadata,
        lastModified: new Date().toISOString(),
        modifiedBy: updatedBy,
        version: this.incrementVersion(tenant.metadata.version)
      }
    };

    // Update caches
    this.tenants.set(tenantId, updatedTenant);
    this.tenantConfigurations.set(tenantId, updatedTenant.configuration);

    // Log configuration change
    await this.logConfigurationChange(tenantId, updates, updatedBy);

    return updatedTenant;
  }

  /**
   * Get tenant usage analytics
   */
  async getTenantUsageAnalytics(tenantId, timeframe = '30d') {
    const tenant = await this.getTenant(tenantId);
    
    return {
      tenant: {
        id: tenantId,
        name: tenant.name,
        tier: tenant.tier
      },
      usage: {
        ...tenant.usage,
        limits: tenant.configuration.limits,
        utilization: {
          users: (tenant.usage.users / tenant.configuration.limits.maxUsers * 100).toFixed(1),
          patients: (tenant.usage.patients / tenant.configuration.limits.maxPatients * 100).toFixed(1),
          storage: (tenant.usage.storageUsedGB / tenant.configuration.limits.storageQuotaGB * 100).toFixed(1)
        }
      },
      performance: await this.getTenantPerformanceMetrics(tenantId, timeframe),
      costs: await this.calculateTenantCosts(tenantId, timeframe),
      recommendations: this.generateOptimizationRecommendations(tenant)
    };
  }

  /**
   * Scale tenant resources
   */
  async scaleTenantResources(tenantId, scalingConfig) {
    const tenant = await this.getTenant(tenantId);
    
    const scalingPlan = {
      current: {
        tier: tenant.tier,
        limits: tenant.configuration.limits,
        connections: tenant.database.connectionPool
      },
      target: {
        tier: scalingConfig.targetTier || tenant.tier,
        limits: this.getTierLimits(scalingConfig.targetTier || tenant.tier),
        connections: this.calculateConnectionPool(scalingConfig.targetTier || tenant.tier)
      },
      estimated: {
        downtime: this.estimateScalingDowntime(tenant, scalingConfig),
        cost: await this.estimateScalingCost(tenant, scalingConfig),
        timeline: this.estimateScalingTimeline(tenant, scalingConfig)
      }
    };

    // Execute scaling if approved
    if (scalingConfig.execute) {
      await this.executeScaling(tenantId, scalingPlan);
    }

    return scalingPlan;
  }

  /**
   * Generate tenant health report
   */
  async generateTenantHealthReport(tenantId) {
    const tenant = await this.getTenant(tenantId);
    const usage = await this.getTenantUsageAnalytics(tenantId);
    
    const healthScore = this.calculateTenantHealthScore(tenant, usage);
    
    return {
      tenant: {
        id: tenantId,
        name: tenant.name,
        type: tenant.type,
        tier: tenant.tier
      },
      healthScore,
      status: this.getTenantHealthStatus(healthScore),
      metrics: {
        performance: usage.performance,
        utilization: usage.usage.utilization,
        errorRate: await this.getTenantErrorRate(tenantId),
        availability: await this.getTenantAvailability(tenantId)
      },
      alerts: await this.getTenantAlerts(tenantId),
      recommendations: this.generateHealthRecommendations(tenant, usage, healthScore),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Utility functions
   */
  generateTenantId(name) {
    const sanitized = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    const hash = crypto.createHash('md5')
      .update(name + Date.now())
      .digest('hex')
      .substring(0, 8);
    return `${sanitized}_${hash}`;
  }

  generateAccessUrl(tenant) {
    const baseUrl = process.env.BASE_URL || 'https://app.oncosaferx.com';
    
    if (tenant.configuration.customDomain) {
      return `https://${tenant.configuration.customDomain}`;
    }
    
    return `${baseUrl}/${tenant.configuration.subdomain}`;
  }

  getTierFeatures(tier) {
    return this.tenantTiers[tier]?.features || this.tenantTiers.BASIC.features;
  }

  getTierLimits(tier) {
    const tierConfig = this.tenantTiers[tier] || this.tenantTiers.BASIC;
    return {
      maxUsers: tierConfig.maxUsers,
      maxPatients: tierConfig.maxPatients,
      apiRateLimit: tierConfig.apiRateLimit,
      storageQuotaGB: tierConfig.storageQuotaGB
    };
  }

  createDefaultBranding(tenantData) {
    return {
      logo: tenantData.branding?.logo,
      primaryColor: tenantData.branding?.primaryColor || '#1e40af',
      secondaryColor: tenantData.branding?.secondaryColor || '#64748b',
      fontFamily: tenantData.branding?.fontFamily || 'Inter',
      customCSS: tenantData.branding?.customCSS,
      favicon: tenantData.branding?.favicon
    };
  }

  getDefaultPasswordPolicy() {
    return {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
      expirationDays: 90
    };
  }

  getDefaultAlertThresholds() {
    return {
      criticalInteraction: 'immediate',
      majorInteraction: '5_minutes',
      moderateInteraction: '15_minutes',
      systemPerformance: '1_minute',
      securityIncident: 'immediate'
    };
  }

  calculateConnectionPool(tier) {
    const poolSizes = {
      ENTERPRISE: { min: 10, max: 100 },
      PROFESSIONAL: { min: 5, max: 50 },
      BASIC: { min: 2, max: 10 }
    };
    return poolSizes[tier] || poolSizes.BASIC;
  }

  async initializeTenantDatabase(tenantId) {
    // In production, this would create tenant-specific database schema
    console.log(`Initializing database schema for tenant ${tenantId}`);
  }

  async initializeTenantAnalytics(tenantId) {
    // Initialize analytics tracking for tenant
    console.log(`Initializing analytics for tenant ${tenantId}`);
  }

  async createTenantAdmin(tenantId, adminUserData) {
    // Create initial admin user for tenant
    console.log(`Creating admin user for tenant ${tenantId}`);
  }

  initializeDefaultTenants() {
    // Create demo tenants for development
    console.log('Enterprise Multi-Tenant Service initialized');
  }

  calculateTenantHealthScore(tenant, usage) {
    let score = 100;
    
    // Deduct for high utilization
    if (usage.usage.utilization.users > 90) score -= 20;
    if (usage.usage.utilization.patients > 90) score -= 20;
    if (usage.usage.utilization.storage > 90) score -= 15;
    
    // Deduct for performance issues
    if (usage.performance?.averageResponseTime > 1000) score -= 10;
    
    return Math.max(score, 0);
  }

  getTenantHealthStatus(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  generateOptimizationRecommendations(tenant) {
    const recommendations = [];
    
    if (tenant.usage.users / tenant.configuration.limits.maxUsers > 0.8) {
      recommendations.push({
        type: 'capacity_planning',
        priority: 'high',
        message: 'Consider upgrading tier or optimizing user management',
        action: 'upgrade_tier'
      });
    }
    
    if (tenant.usage.storageUsedGB / tenant.configuration.limits.storageQuotaGB > 0.9) {
      recommendations.push({
        type: 'storage_optimization',
        priority: 'medium',
        message: 'Storage utilization is high, consider data archival',
        action: 'archive_old_data'
      });
    }
    
    return recommendations;
  }
}

export default new EnterpriseMultiTenantService();