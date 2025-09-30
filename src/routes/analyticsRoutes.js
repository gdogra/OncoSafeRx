import express from 'express';
import { USAGE_METRICS, DRUG_ANALYTICS, CLINICAL_OUTCOMES, QUALITY_METRICS, ROI_METRICS } from '../data/analytics.js';

const router = express.Router();

// Usage metrics
router.get('/usage', (req, res) => {
  const { period } = req.query;
  
  let data = USAGE_METRICS;
  
  if (period === 'daily') {
    data = { daily: USAGE_METRICS.daily };
  } else if (period === 'summary') {
    data = { summary: USAGE_METRICS.summary };
  }
  
  res.json(data);
});

// Drug analytics
router.get('/drugs', (req, res) => {
  res.json(DRUG_ANALYTICS);
});

// Clinical outcomes
router.get('/clinical', (req, res) => {
  res.json(CLINICAL_OUTCOMES);
});

// Quality metrics
router.get('/quality', (req, res) => {
  res.json(QUALITY_METRICS);
});

// ROI metrics
router.get('/roi', (req, res) => {
  res.json(ROI_METRICS);
});

// Dashboard summary
router.get('/dashboard', (req, res) => {
  const summary = {
    usage: USAGE_METRICS.summary,
    topDrugs: DRUG_ANALYTICS.mostSearched.slice(0, 5),
    adherence: CLINICAL_OUTCOMES.protocolAdherence.overall,
    satisfaction: QUALITY_METRICS.systemPerformance.userSatisfaction,
    costSavings: ROI_METRICS.costSavings.totalAnnual,
    recentAlerts: DRUG_ANALYTICS.interactionAlerts.slice(0, 3)
  };
  
  res.json(summary);
});

export default router;