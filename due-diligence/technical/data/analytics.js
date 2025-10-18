// Analytics and metrics data

export const USAGE_METRICS = {
  daily: [
    { date: '2024-11-24', users: 45, searches: 127, interactions: 89, reports: 23 },
    { date: '2024-11-25', users: 52, searches: 143, interactions: 95, reports: 28 },
    { date: '2024-11-26', users: 48, searches: 134, interactions: 87, reports: 25 },
    { date: '2024-11-27', users: 58, searches: 156, interactions: 102, reports: 31 },
    { date: '2024-11-28', users: 61, searches: 167, interactions: 108, reports: 34 },
    { date: '2024-11-29', users: 55, searches: 149, interactions: 97, reports: 29 }
  ],
  summary: {
    totalUsers: 1247,
    totalSearches: 8934,
    totalInteractionChecks: 5672,
    totalReports: 1456,
    avgResponseTime: 245, // milliseconds
    uptime: 99.8
  }
};

export const DRUG_ANALYTICS = {
  mostSearched: [
    { drug: 'Carboplatin', count: 234, trend: 'up' },
    { drug: 'Pembrolizumab', count: 198, trend: 'up' },
    { drug: 'Paclitaxel', count: 187, trend: 'stable' },
    { drug: 'Doxorubicin', count: 156, trend: 'down' },
    { drug: 'Cisplatin', count: 143, trend: 'stable' }
  ],
  interactionAlerts: [
    { combination: 'Warfarin + Fluorouracil', frequency: 45, severity: 'major' },
    { combination: 'Phenytoin + Dexamethasone', frequency: 32, severity: 'moderate' },
    { combination: 'Digoxin + Furosemide', frequency: 28, severity: 'moderate' },
    { combination: 'Metformin + Contrast', frequency: 23, severity: 'major' }
  ]
};

export const CLINICAL_OUTCOMES = {
  protocolAdherence: {
    overall: 87.3,
    bySpecialty: [
      { specialty: 'Medical Oncology', adherence: 89.5 },
      { specialty: 'Radiation Oncology', adherence: 85.2 },
      { specialty: 'Surgical Oncology', adherence: 86.8 },
      { specialty: 'Hematology', adherence: 91.2 }
    ]
  },
  safetyMetrics: {
    adverseEvents: {
      total: 234,
      serious: 23,
      drugRelated: 156,
      preventable: 45
    },
    timeToTreatment: {
      average: 12.3, // days
      target: 14.0,
      compliance: 84.7
    }
  }
};

export const QUALITY_METRICS = {
  systemPerformance: {
    apiResponseTime: 245,
    searchAccuracy: 94.6,
    userSatisfaction: 4.3, // out of 5
    errorRate: 0.8
  },
  clinicalImpact: {
    dosingsAdjusted: 1456,
    interactionsAvoided: 234,
    guidelineCompliance: 87.3,
    timeSaved: 23.4 // hours per week
  }
};

export const ROI_METRICS = {
  costSavings: {
    totalAnnual: 2450000, // dollars
    perPatient: 1850,
    categories: {
      adverseEventPrevention: 1200000,
      reducedLengthOfStay: 750000,
      improvedEfficiency: 500000
    }
  },
  efficiency: {
    timePerDecision: 3.2, // minutes
    decisionsPerDay: 45,
    pharmacistConsults: 234,
    physicianOverrides: 23
  }
};

export default {
  USAGE_METRICS,
  DRUG_ANALYTICS,
  CLINICAL_OUTCOMES,
  QUALITY_METRICS,
  ROI_METRICS
};