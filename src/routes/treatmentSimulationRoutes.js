import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/scenarios', asyncHandler(async (req, res) => {
  const { patientId } = req.query;
  
  try {
    const mockScenarios = [
      {
        id: 'scenario-1',
        name: 'Standard Chemotherapy Protocol',
        description: 'Conventional multi-drug chemotherapy regimen based on current guidelines',
        drugs: [
          { name: 'Doxorubicin', dose: '60 mg/m²', frequency: 'Every 21 days' },
          { name: 'Cyclophosphamide', dose: '600 mg/m²', frequency: 'Every 21 days' }
        ],
        duration: '4-6 cycles (12-18 weeks)',
        expectedOutcomes: {
          responseRate: '65%',
          progressionFreesSurvival: '8.2 months',
          overallSurvival: '24.1 months'
        },
        sideEffects: [
          { effect: 'Nausea/Vomiting', severity: 'Moderate', probability: '80%' },
          { effect: 'Hair Loss', severity: 'High', probability: '95%' },
          { effect: 'Fatigue', severity: 'Moderate', probability: '70%' },
          { effect: 'Neutropenia', severity: 'High', probability: '60%' }
        ],
        cost: '$15,000 - $25,000',
        qualityOfLifeImpact: 'Moderate decrease during treatment, gradual recovery'
      },
      {
        id: 'scenario-2',
        name: 'Immunotherapy Combination',
        description: 'Novel immunotherapy approach with checkpoint inhibitor combination',
        drugs: [
          { name: 'Pembrolizumab', dose: '200 mg', frequency: 'Every 21 days' },
          { name: 'Carboplatin', dose: 'AUC 5', frequency: 'Every 21 days' }
        ],
        duration: '6-8 cycles (18-24 weeks)',
        expectedOutcomes: {
          responseRate: '72%',
          progressionFreesSurvival: '12.1 months',
          overallSurvival: '31.8 months'
        },
        sideEffects: [
          { effect: 'Immune-related rash', severity: 'Mild', probability: '35%' },
          { effect: 'Fatigue', severity: 'Mild', probability: '45%' },
          { effect: 'Diarrhea', severity: 'Mild', probability: '25%' },
          { effect: 'Pneumonitis', severity: 'Moderate', probability: '5%' }
        ],
        cost: '$45,000 - $65,000',
        qualityOfLifeImpact: 'Mild decrease, better tolerance than chemotherapy'
      },
      {
        id: 'scenario-3',
        name: 'Targeted Therapy',
        description: 'Precision medicine approach targeting specific molecular markers',
        drugs: [
          { name: 'Trastuzumab', dose: '8 mg/kg loading, 6 mg/kg maintenance', frequency: 'Every 21 days' },
          { name: 'Pertuzumab', dose: '840 mg loading, 420 mg maintenance', frequency: 'Every 21 days' }
        ],
        duration: '12 months',
        expectedOutcomes: {
          responseRate: '85%',
          progressionFreesSurvival: '18.7 months',
          overallSurvival: '42.3 months'
        },
        sideEffects: [
          { effect: 'Diarrhea', severity: 'Mild', probability: '60%' },
          { effect: 'Infusion reactions', severity: 'Mild', probability: '30%' },
          { effect: 'Cardiac dysfunction', severity: 'Moderate', probability: '8%' },
          { effect: 'Neuropathy', severity: 'Mild', probability: '40%' }
        ],
        cost: '$80,000 - $120,000',
        qualityOfLifeImpact: 'Minimal decrease, good functional status maintenance'
      }
    ];

    res.json({
      success: true,
      patientId,
      scenarios: mockScenarios,
      totalScenarios: mockScenarios.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching simulation scenarios:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch simulation scenarios' });
  }
}));

router.get('/body-systems', asyncHandler(async (req, res) => {
  const { patientId } = req.query;
  
  try {
    const mockBodySystems = {
      patientId,
      systems: [
        {
          system: 'Cardiovascular',
          baseline: {
            ejectionFraction: '60%',
            bloodPressure: '120/80 mmHg',
            heartRate: '72 bpm'
          },
          risks: [
            {
              drug: 'Doxorubicin',
              riskLevel: 'High',
              specificRisks: ['Cardiomyopathy', 'Heart failure'],
              monitoring: 'ECHO every 3 months'
            },
            {
              drug: 'Trastuzumab',
              riskLevel: 'Moderate',
              specificRisks: ['Decreased ejection fraction'],
              monitoring: 'ECHO every 3 months'
            }
          ],
          protectiveStrategies: [
            'ACE inhibitor prophylaxis',
            'Regular cardiac monitoring',
            'Dose modification protocols'
          ]
        },
        {
          system: 'Hematologic',
          baseline: {
            hemoglobin: '12.5 g/dL',
            whiteBloodCells: '6,800/μL',
            platelets: '280,000/μL'
          },
          risks: [
            {
              drug: 'Cyclophosphamide',
              riskLevel: 'High',
              specificRisks: ['Neutropenia', 'Thrombocytopenia'],
              monitoring: 'CBC weekly during treatment'
            }
          ],
          protectiveStrategies: [
            'Growth factor support (G-CSF)',
            'Dose delays for severe cytopenias',
            'Infection prevention measures'
          ]
        },
        {
          system: 'Gastrointestinal',
          baseline: {
            liverFunction: 'Normal',
            renalFunction: 'Normal (eGFR: 85)',
            nutritionalStatus: 'Good'
          },
          risks: [
            {
              drug: 'Pembrolizumab',
              riskLevel: 'Low',
              specificRisks: ['Immune-mediated colitis'],
              monitoring: 'Clinical assessment each cycle'
            }
          ],
          protectiveStrategies: [
            'Adequate hydration',
            'Anti-emetic prophylaxis',
            'Nutritional counseling'
          ]
        },
        {
          system: 'Neurological',
          baseline: {
            cognitiveFunction: 'Normal',
            neuropathy: 'None',
            performance: 'ECOG 0'
          },
          risks: [
            {
              drug: 'Carboplatin',
              riskLevel: 'Moderate',
              specificRisks: ['Peripheral neuropathy', 'Ototoxicity'],
              monitoring: 'Neurological exam each cycle'
            }
          ],
          protectiveStrategies: [
            'Dose modification for neuropathy',
            'Audiometry monitoring',
            'Neuroprotective agents consideration'
          ]
        }
      ],
      overallRiskAssessment: 'Moderate - Multiple systems at risk requiring close monitoring',
      recommendations: [
        'Implement comprehensive monitoring protocol',
        'Consider prophylactic interventions',
        'Plan for potential dose modifications',
        'Establish multidisciplinary care team'
      ]
    };

    res.json({
      success: true,
      ...mockBodySystems,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching body systems analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch body systems analysis' });
  }
}));

router.get('/predictions', asyncHandler(async (req, res) => {
  const { patientId } = req.query;
  
  try {
    const mockPredictions = {
      patientId,
      models: [
        {
          modelName: 'Response Prediction Model',
          version: '2.1.3',
          description: 'ML model predicting treatment response based on patient characteristics',
          predictions: {
            standardChemotherapy: {
              responseRate: 68,
              confidenceInterval: '58-78%',
              factors: [
                { factor: 'Age', weight: 0.15, impact: 'Positive' },
                { factor: 'Performance Status', weight: 0.25, impact: 'Positive' },
                { factor: 'Tumor Grade', weight: 0.20, impact: 'Negative' },
                { factor: 'Prior Treatments', weight: 0.18, impact: 'Negative' }
              ]
            },
            immunotherapy: {
              responseRate: 74,
              confidenceInterval: '65-83%',
              factors: [
                { factor: 'PD-L1 Expression', weight: 0.35, impact: 'Positive' },
                { factor: 'TMB Score', weight: 0.28, impact: 'Positive' },
                { factor: 'Immune Infiltration', weight: 0.22, impact: 'Positive' }
              ]
            },
            targetedTherapy: {
              responseRate: 87,
              confidenceInterval: '81-93%',
              factors: [
                { factor: 'Biomarker Status', weight: 0.45, impact: 'Positive' },
                { factor: 'Receptor Expression', weight: 0.30, impact: 'Positive' },
                { factor: 'Molecular Subtype', weight: 0.25, impact: 'Positive' }
              ]
            }
          }
        },
        {
          modelName: 'Toxicity Prediction Model',
          version: '1.8.2',
          description: 'Predictive model for treatment-related adverse events',
          predictions: {
            severeToxicity: {
              probability: 23,
              confidenceInterval: '18-28%',
              primaryRisks: ['Neutropenia', 'Cardiotoxicity', 'Neuropathy'],
              riskFactors: [
                { factor: 'Age >65', present: false, riskIncrease: 0 },
                { factor: 'Baseline Cardiac Function', present: true, riskIncrease: 15 },
                { factor: 'Prior Chemotherapy', present: true, riskIncrease: 12 }
              ]
            },
            hospitalizations: {
              probability: 15,
              confidenceInterval: '11-19%',
              averageLength: '3.2 days',
              commonCauses: ['Febrile neutropenia', 'Cardiac events', 'Severe fatigue']
            }
          }
        },
        {
          modelName: 'Survival Estimation Model',
          version: '3.0.1',
          description: 'Kaplan-Meier based survival prediction with confidence intervals',
          predictions: {
            overallSurvival: {
              median: '28.4 months',
              oneYear: '85%',
              twoYear: '68%',
              fiveYear: '42%'
            },
            progressionFreeSurvival: {
              median: '12.8 months',
              sixMonths: '78%',
              oneYear: '54%',
              twoYears: '28%'
            },
            qualityAdjustedLifeYears: {
              estimated: '2.7 QALYs',
              range: '2.1-3.3 QALYs'
            }
          }
        }
      ],
      modelAccuracy: {
        responseModel: '78% accuracy on validation cohort',
        toxicityModel: '82% accuracy on validation cohort',
        survivalModel: 'C-index: 0.74'
      },
      limitations: [
        'Models trained on historical data, may not reflect newest treatments',
        'Individual variation may exceed model predictions',
        'Comorbidities may affect predictions significantly',
        'Models require validation in diverse populations'
      ],
      recommendations: [
        'Use predictions as guidance, not definitive outcomes',
        'Consider patient preferences alongside model outputs',
        'Regular reassessment as treatment progresses',
        'Integrate with clinical judgment and expertise'
      ]
    };

    res.json({
      success: true,
      ...mockPredictions,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching predictive models:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch predictive models' });
  }
}));

export default router;