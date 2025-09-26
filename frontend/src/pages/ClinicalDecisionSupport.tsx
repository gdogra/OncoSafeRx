import React from 'react';
import ClinicalDecisionSupport from '../components/AI/ClinicalDecisionSupport';

const ClinicalDecisionSupportPage: React.FC = () => {
  // Mock patient profile for demonstration
  const mockPatientProfile = {
    demographics: {
      age: 62,
      gender: 'female' as const,
      weight: 68,
      height: 165,
      ethnicity: 'Caucasian'
    },
    diagnosis: {
      primary: 'Invasive ductal carcinoma, breast',
      stage: 'IIIA',
      histology: 'Invasive ductal carcinoma',
      biomarkers: {
        'ER': 'positive',
        'PR': 'positive', 
        'HER2': 'positive',
        'Ki-67': '25%'
      },
      prognosis: 'good' as const
    },
    medicalHistory: {
      comorbidities: ['Type 2 diabetes', 'Hypertension', 'Osteoporosis'],
      previousTreatments: ['Metformin', 'Lisinopril', 'Alendronate'],
      allergies: ['Penicillin', 'Sulfa drugs'],
      familyHistory: ['Breast cancer (mother)', 'Ovarian cancer (sister)']
    },
    labValues: {
      creatinine: 1.1,
      bilirubin: 0.8,
      ast: 28,
      alt: 32,
      plateletCount: 180000,
      neutrophilCount: 4200,
      hemoglobin: 12.5
    },
    genetics: {
      tested: true,
      variants: {
        'BRCA1': 'wildtype',
        'BRCA2': 'wildtype',
        'CYP2D6': '*1/*2',
        'CYP2C19': '*1/*17'
      },
      phenotypes: {
        'CYP2D6': 'Intermediate metabolizer',
        'CYP2C19': 'Rapid metabolizer'
      }
    },
    preferences: {
      qualityOfLife: 85,
      treatmentGoals: ['Cure', 'Maintain quality of life', 'Minimal side effects'],
      contraindications: ['Pregnancy', 'Severe cardiac dysfunction']
    }
  };

  const currentMedications = [
    'Metformin 1000mg BID',
    'Lisinopril 10mg daily',
    'Alendronate 70mg weekly'
  ];

  const proposedTreatment = 'Trastuzumab + Pertuzumab + Docetaxel + Carboplatin (TCHP regimen)';

  const handleRecommendationAccept = (recommendation: any) => {
    console.log('Accepted recommendation:', recommendation);
    
    // Show user feedback
    alert(`✅ Recommendation "${recommendation.title}" has been accepted and will be integrated into the treatment plan.`);
    
    // In a real app, this would integrate with EHR or treatment planning system
    // For now, we'll simulate the integration
    setTimeout(() => {
      console.log('Recommendation integrated into EHR system:', {
        recommendationId: recommendation.id,
        patientId: 'mock-patient-123',
        timestamp: new Date().toISOString(),
        status: 'accepted'
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Clinical Decision Support</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Intelligent treatment recommendations based on patient profile, genomics, biomarkers, and evidence-based medicine to optimize clinical outcomes.
        </p>
      </div>
      
      <ClinicalDecisionSupport
        patientProfile={mockPatientProfile}
        currentMedications={currentMedications}
        proposedTreatment={proposedTreatment}
        onRecommendationAccept={handleRecommendationAccept}
      />
    </div>
  );
};

export default ClinicalDecisionSupportPage;