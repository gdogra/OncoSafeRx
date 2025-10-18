import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, auditRBACAction } from '../middleware/rbacMiddleware.js';
import advancedWorkflowService from '../services/advancedWorkflowService.js';

const router = express.Router();

// Get workflow templates
router.get('/templates',
  authenticateToken,
  requirePermission('clinical.workflow_view'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const filters = {
      category: req.query.category,
      specialty: req.query.specialty,
      difficulty: req.query.difficulty,
      mobileOptimized: req.query.mobileOptimized === 'true',
      search: req.query.search
    };

    const templates = await advancedWorkflowService.getWorkflowTemplates(tenantId, filters);

    res.json({
      success: true,
      tenantId,
      templates,
      total: templates.length,
      filters
    });
  })
);

// Create new workflow template
router.post('/templates',
  authenticateToken,
  requirePermission('clinical.workflow_create'),
  auditRBACAction('create_workflow_template'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const templateData = {
      ...req.body,
      tenantId
    };

    const template = await advancedWorkflowService.createWorkflowTemplate(
      templateData,
      req.user.id
    );

    res.status(201).json({
      success: true,
      template,
      message: 'Workflow template created successfully'
    });
  })
);

// Get specific workflow template
router.get('/templates/:templateId',
  authenticateToken,
  requirePermission('clinical.workflow_view'),
  asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const { tenantId } = req;

    const template = advancedWorkflowService.workflowTemplates.get(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Workflow template not found' });
    }

    // Check access permissions
    if (template.metadata.tenantId !== tenantId && !template.metadata.isPublic) {
      return res.status(403).json({ error: 'Access denied to this template' });
    }

    res.json({
      success: true,
      template
    });
  })
);

// Start new workflow instance
router.post('/instances',
  authenticateToken,
  requirePermission('clinical.workflow_execute'),
  auditRBACAction('start_workflow'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { templateId, patientId, patientName, assignedTo, priority, context, deviceType } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    const instanceData = {
      tenantId,
      patientId,
      patientName,
      assignedTo,
      priority,
      context,
      deviceType: deviceType || 'desktop'
    };

    const instance = await advancedWorkflowService.startWorkflowInstance(
      templateId,
      instanceData,
      req.user.id
    );

    res.status(201).json({
      success: true,
      instance: {
        id: instance.id,
        templateName: instance.templateName,
        patientName: instance.patientName,
        status: instance.status,
        currentStepIndex: instance.currentStepIndex,
        progress: instance.progress,
        startedAt: instance.startedAt,
        estimatedCompletionTime: instance.estimatedCompletionTime
      },
      message: 'Workflow started successfully'
    });
  })
);

// Get active workflow instances
router.get('/instances',
  authenticateToken,
  requirePermission('clinical.workflow_view'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { userId, status, patientId } = req.query;

    const instances = await advancedWorkflowService.getActiveWorkflowInstances(
      tenantId,
      userId || null
    );

    // Apply additional filters
    let filteredInstances = instances;

    if (status) {
      filteredInstances = filteredInstances.filter(i => i.status === status);
    }

    if (patientId) {
      filteredInstances = filteredInstances.filter(i => i.patientId === patientId);
    }

    res.json({
      success: true,
      tenantId,
      instances: filteredInstances,
      total: filteredInstances.length
    });
  })
);

// Get specific workflow instance
router.get('/instances/:instanceId',
  authenticateToken,
  requirePermission('clinical.workflow_view'),
  asyncHandler(async (req, res) => {
    const { instanceId } = req.params;
    const { tenantId } = req;

    const instance = advancedWorkflowService.workflowInstances.get(instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }

    if (instance.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied to this workflow instance' });
    }

    // Get template for current step information
    const template = advancedWorkflowService.workflowTemplates.get(instance.templateId);
    const currentStep = template?.steps[instance.currentStepIndex];

    const enrichedInstance = {
      ...instance,
      template: template ? {
        name: template.name,
        category: template.category,
        steps: template.steps
      } : null,
      currentStep: currentStep ? {
        title: currentStep.title,
        description: currentStep.description,
        type: currentStep.type,
        estimatedTime: currentStep.estimatedTime,
        checklist: currentStep.checklist,
        requiredData: currentStep.requiredData
      } : null,
      timeElapsed: advancedWorkflowService.calculateTimeElapsed(instance.startedAt),
      isOverdue: advancedWorkflowService.isWorkflowOverdue(instance)
    };

    res.json({
      success: true,
      instance: enrichedInstance
    });
  })
);

// Complete workflow step
router.post('/instances/:instanceId/steps/:stepIndex/complete',
  authenticateToken,
  requirePermission('clinical.workflow_execute'),
  auditRBACAction('complete_workflow_step'),
  asyncHandler(async (req, res) => {
    const { instanceId, stepIndex } = req.params;
    const { tenantId } = req;
    const completionData = req.body;

    const instance = advancedWorkflowService.workflowInstances.get(instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }

    if (instance.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied to this workflow instance' });
    }

    const stepIndexInt = parseInt(stepIndex);
    if (stepIndexInt !== instance.currentStepIndex) {
      return res.status(400).json({ 
        error: 'Can only complete the current active step' 
      });
    }

    const updatedInstance = await advancedWorkflowService.advanceWorkflowStep(
      instanceId,
      stepIndexInt,
      completionData,
      req.user.id
    );

    res.json({
      success: true,
      instance: {
        id: updatedInstance.id,
        status: updatedInstance.status,
        currentStepIndex: updatedInstance.currentStepIndex,
        progress: updatedInstance.progress,
        completedAt: updatedInstance.completedAt
      },
      message: updatedInstance.status === 'completed' 
        ? 'Workflow completed successfully' 
        : 'Step completed successfully'
    });
  })
);

// Add note to workflow instance
router.post('/instances/:instanceId/notes',
  authenticateToken,
  requirePermission('clinical.workflow_execute'),
  auditRBACAction('add_workflow_note'),
  asyncHandler(async (req, res) => {
    const { instanceId } = req.params;
    const { content, type = 'comment', stepIndex } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const instance = advancedWorkflowService.workflowInstances.get(instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }

    const note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stepIndex: stepIndex || instance.currentStepIndex,
      content: content.trim(),
      author: req.user.id,
      timestamp: new Date().toISOString(),
      type
    };

    instance.notes.push(note);
    instance.lastModified = new Date().toISOString();

    // Persist the updated instance
    await advancedWorkflowService.persistWorkflowInstance(instance);

    res.status(201).json({
      success: true,
      note,
      message: 'Note added successfully'
    });
  })
);

// Pause workflow instance
router.post('/instances/:instanceId/pause',
  authenticateToken,
  requirePermission('clinical.workflow_execute'),
  auditRBACAction('pause_workflow'),
  asyncHandler(async (req, res) => {
    const { instanceId } = req.params;
    const { reason } = req.body;

    const instance = advancedWorkflowService.workflowInstances.get(instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }

    if (instance.status !== 'active') {
      return res.status(400).json({ 
        error: `Cannot pause workflow with status: ${instance.status}` 
      });
    }

    instance.status = 'paused';
    instance.pausedAt = new Date().toISOString();
    instance.pausedBy = req.user.id;
    instance.pauseReason = reason;

    // Add note about pause
    instance.notes.push({
      id: `note_${Date.now()}`,
      content: `Workflow paused: ${reason || 'No reason provided'}`,
      author: req.user.id,
      timestamp: new Date().toISOString(),
      type: 'system'
    });

    await advancedWorkflowService.persistWorkflowInstance(instance);

    res.json({
      success: true,
      message: 'Workflow paused successfully'
    });
  })
);

// Resume workflow instance
router.post('/instances/:instanceId/resume',
  authenticateToken,
  requirePermission('clinical.workflow_execute'),
  auditRBACAction('resume_workflow'),
  asyncHandler(async (req, res) => {
    const { instanceId } = req.params;

    const instance = advancedWorkflowService.workflowInstances.get(instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Workflow instance not found' });
    }

    if (instance.status !== 'paused') {
      return res.status(400).json({ 
        error: `Cannot resume workflow with status: ${instance.status}` 
      });
    }

    instance.status = 'active';
    instance.resumedAt = new Date().toISOString();
    instance.resumedBy = req.user.id;

    // Add note about resume
    instance.notes.push({
      id: `note_${Date.now()}`,
      content: 'Workflow resumed',
      author: req.user.id,
      timestamp: new Date().toISOString(),
      type: 'system'
    });

    await advancedWorkflowService.persistWorkflowInstance(instance);

    res.json({
      success: true,
      message: 'Workflow resumed successfully'
    });
  })
);

// Get workflow analytics
router.get('/analytics',
  authenticateToken,
  requirePermission('analytics.view'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { timeframe = '30d' } = req.query;

    const analytics = await advancedWorkflowService.getWorkflowAnalytics(tenantId, timeframe);

    res.json({
      success: true,
      tenantId,
      timeframe,
      analytics,
      generatedAt: new Date().toISOString()
    });
  })
);

// Optimize template for mobile
router.post('/templates/:templateId/mobile-optimize',
  authenticateToken,
  requirePermission('clinical.workflow_create'),
  auditRBACAction('optimize_workflow_mobile'),
  asyncHandler(async (req, res) => {
    const { templateId } = req.params;
    const { deviceType = 'phone' } = req.body;

    const optimization = await advancedWorkflowService.optimizeForMobile(
      templateId,
      deviceType
    );

    res.json({
      success: true,
      templateId,
      deviceType,
      optimization,
      message: `Template optimized for ${deviceType}`
    });
  })
);

// Get workflow performance metrics
router.get('/performance',
  authenticateToken,
  requirePermission('analytics.view'),
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { templateId, timeframe = '7d' } = req.query;

    const metrics = {
      templateUsage: await getTemplateUsageMetrics(tenantId, templateId, timeframe),
      stepPerformance: await getStepPerformanceMetrics(tenantId, templateId, timeframe),
      userPerformance: await getUserPerformanceMetrics(tenantId, timeframe),
      bottlenecks: await getWorkflowBottlenecks(tenantId, timeframe),
      mobileMetrics: await getMobilePerformanceMetrics(tenantId, timeframe)
    };

    res.json({
      success: true,
      tenantId,
      templateId,
      timeframe,
      metrics,
      generatedAt: new Date().toISOString()
    });
  })
);

// Bulk workflow operations
router.post('/bulk-operations',
  authenticateToken,
  requirePermission('clinical.workflow_execute'),
  auditRBACAction('bulk_workflow_operations'),
  asyncHandler(async (req, res) => {
    const { operation, instanceIds, data } = req.body;
    const { tenantId } = req;

    if (!operation || !instanceIds || !Array.isArray(instanceIds)) {
      return res.status(400).json({ 
        error: 'Operation and instance IDs array are required' 
      });
    }

    const results = [];

    for (const instanceId of instanceIds) {
      try {
        const instance = advancedWorkflowService.workflowInstances.get(instanceId);
        
        if (!instance || instance.tenantId !== tenantId) {
          results.push({ instanceId, success: false, error: 'Instance not found or access denied' });
          continue;
        }

        let result;
        switch (operation) {
          case 'pause':
            if (instance.status === 'active') {
              instance.status = 'paused';
              instance.pausedAt = new Date().toISOString();
              instance.pausedBy = req.user.id;
              result = { status: 'paused' };
            } else {
              throw new Error('Instance not active');
            }
            break;

          case 'resume':
            if (instance.status === 'paused') {
              instance.status = 'active';
              instance.resumedAt = new Date().toISOString();
              instance.resumedBy = req.user.id;
              result = { status: 'active' };
            } else {
              throw new Error('Instance not paused');
            }
            break;

          case 'reassign':
            if (data?.assignedTo) {
              instance.assignedTo = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo];
              result = { assignedTo: instance.assignedTo };
            } else {
              throw new Error('assignedTo is required for reassignment');
            }
            break;

          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }

        await advancedWorkflowService.persistWorkflowInstance(instance);
        results.push({ instanceId, success: true, result });

      } catch (error) {
        results.push({ instanceId, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      operation,
      results,
      summary: {
        total: instanceIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  })
);

// Helper functions for metrics
async function getTemplateUsageMetrics(tenantId, templateId, timeframe) {
  return {
    totalUsage: 150,
    successRate: 94.5,
    averageCompletionTime: 47,
    mostUsedSteps: ['step-001', 'step-002'],
    leastUsedSteps: ['step-007']
  };
}

async function getStepPerformanceMetrics(tenantId, templateId, timeframe) {
  return {
    averageStepTimes: {
      'step-001': 15,
      'step-002': 22,
      'step-003': 18
    },
    completionRates: {
      'step-001': 98.5,
      'step-002': 95.2,
      'step-003': 92.1
    },
    bottleneckSteps: ['step-002']
  };
}

async function getUserPerformanceMetrics(tenantId, timeframe) {
  return {
    topPerformers: [
      { userId: 'user-001', completedWorkflows: 25, averageTime: 42 },
      { userId: 'user-002', completedWorkflows: 22, averageTime: 45 }
    ],
    averageWorkflowsPerUser: 12.5,
    userAdoptionRate: 78
  };
}

async function getWorkflowBottlenecks(tenantId, timeframe) {
  return [
    { stepId: 'step-007', template: 'template-002', averageDelay: 15, frequency: 45 },
    { stepId: 'step-003', template: 'template-001', averageDelay: 12, frequency: 32 }
  ];
}

async function getMobilePerformanceMetrics(tenantId, timeframe) {
  return {
    mobileUsage: 67,
    deviceBreakdown: { phone: 45, tablet: 35, desktop: 20 },
    mobileCompletionRate: 91.2,
    averageMobileTime: 52,
    offlineUsage: 23
  };
}

export default router;