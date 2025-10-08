import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClinicalDecisionSupport from '../components/AI/ClinicalDecisionSupport';
import Modal from '../components/UI/Modal';
import PatientSelector from '../components/Patient/PatientSelector';
import { usePatient } from '../context/PatientContext';

const ClinicalDecisionSupportPage: React.FC = () => {
  const { state, actions } = usePatient();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentPatient, hydrated, recentPatients } = state as any;
  const [showPicker, setShowPicker] = React.useState(false);
  
  // Mock patient profile for demonstration when no patient is selected
  const DISABLE_SAMPLE_PATIENTS = String((import.meta as any)?.env?.VITE_DISABLE_SAMPLE_PATIENTS || '').toLowerCase() === 'true';
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

  // Map app PatientProfile -> CDS component profile shape
  const mapToCdsProfile = (p: any) => {
    if (!p) return null;
    const dob = p.demographics?.dateOfBirth;
    const calcAge = (() => {
      try {
        if (!dob) return undefined;
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
      } catch { return undefined; }
    })();
    const recentLab = (name: string) => {
      try {
        const labs = Array.isArray(p.labValues) ? p.labValues : [];
        const key = name.toLowerCase();
        const hit = labs
          .filter((l: any) => String(l?.labType || '').toLowerCase().includes(key))
          .sort((a: any, b: any) => new Date(b?.timestamp || 0).getTime() - new Date(a?.timestamp || 0).getTime())[0];
        return hit ? Number(hit.value) : undefined;
      } catch { return undefined; }
    };
    const condsArr = Array.isArray(p.conditions) ? p.conditions : [];
    const primaryCond = condsArr[0] || {};
    const diagnosisPrimary = primaryCond?.name || primaryCond?.condition || 'Unknown';
    const diagnosisStage = primaryCond?.stage || undefined;
    const diagnosisHistology = primaryCond?.histology || undefined;

    // Derive quality of life from ECOG if available
    const ecog = (() => {
      try {
        const vitals = Array.isArray(p.vitals) ? p.vitals : [];
        return vitals[0]?.performanceStatus;
      } catch { return undefined; }
    })();
    const derivedQoL = (() => {
      if (typeof ecog !== 'number') return undefined;
      if (ecog <= 1) return 85;
      if (ecog === 2) return 60;
      return 40;
    })();

    // Build biomarkers map from genetics entries (geneSymbol -> phenotype/alleles)
    const biomarkers: Record<string, string> = {};
    try {
      const gens = Array.isArray(p.genetics) ? p.genetics : [];
      gens.forEach((g: any) => {
        const key = g?.geneSymbol || g?.gene || '';
        if (!key) return;
        const value = g?.phenotype || (Array.isArray(g?.alleles) ? g.alleles.join('/') : '') || 'present';
        biomarkers[key] = String(value);
      });
    } catch {}
    return {
      demographics: {
        age: calcAge || 60,
        gender: (p.demographics?.sex as any) || 'other',
        weight: p.demographics?.weightKg || 70,
        height: p.demographics?.heightCm || 170,
        ethnicity: p.demographics?.race || undefined,
      },
      diagnosis: {
        primary: diagnosisPrimary,
        stage: diagnosisStage,
        histology: diagnosisHistology,
        biomarkers,
        prognosis: undefined,
      },
      medicalHistory: {
        comorbidities: (Array.isArray(p.conditions) ? p.conditions.map((c: any) => c.name || c.condition).filter(Boolean) : []),
        previousTreatments: (Array.isArray(p.treatmentHistory) ? p.treatmentHistory.map((t: any) => t.regimen || t.treatmentType).filter(Boolean) : []),
        allergies: (Array.isArray(p.allergies) ? p.allergies.map((a: any) => a.allergen || a.name || '').filter(Boolean) : []),
        familyHistory: [],
      },
      labValues: {
        creatinine: recentLab('creatinine'),
        bilirubin: recentLab('bilirubin'),
        ast: recentLab('ast'),
        alt: recentLab('alt'),
        plateletCount: recentLab('platelet'),
        neutrophilCount: recentLab('anc') || recentLab('neutrophil'),
        hemoglobin: recentLab('hemoglobin'),
      },
      genetics: {
        tested: Array.isArray(p.genetics) ? p.genetics.length > 0 : false,
        variants: {},
        phenotypes: {},
      },
      preferences: {
        qualityOfLife: derivedQoL,
        treatmentGoals: [],
        contraindications: [],
      },
    };
  };

  // Use selected patient data if available, otherwise fall back to mock data
  const mapped = currentPatient ? mapToCdsProfile(currentPatient) : null;
  const patientProfile = mapped || (DISABLE_SAMPLE_PATIENTS ? null : mockPatientProfile);
  const patientName = currentPatient
    ? `${currentPatient.demographics?.firstName || ''} ${currentPatient.demographics?.lastName || ''}`.trim() || 'Selected Patient'
    : (DISABLE_SAMPLE_PATIENTS ? 'No patient selected' : 'Demo Patient (Sarah Johnson)');

  // Show a minimal loader until patient state hydrates
  if (!hydrated) {
    return (
      <div className="p-6 text-center text-gray-500">Loading patient context…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Clinical Decision Support</h1>
        {currentPatient && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-lg font-semibold text-blue-900">
              Current Patient: <span className="text-blue-700">{patientName}</span>
            </p>
            {currentPatient.mrn && (
              <p className="text-sm text-blue-600">MRN: {currentPatient.mrn}</p>
            )}
          </div>
        )}
        {!currentPatient && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {DISABLE_SAMPLE_PATIENTS
                ? 'No patient selected. Select a patient from the Patients page to see personalized recommendations.'
                : <>No patient selected - showing demo recommendations for: <span className="font-semibold">{patientName}</span></>}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Select a patient from the Patients page to see personalized recommendations
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setShowPicker(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Select Patient
              </button>
              <button
                onClick={() => {
                  try {
                    const path = location.pathname + (location.search || '');
                    localStorage.setItem('osrx_return_path', path);
                  } catch {}
                  navigate('/patients');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Open Patients Page
              </button>
            </div>
          </div>
        )}
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Intelligent treatment recommendations based on patient profile, genomics, biomarkers, and evidence-based medicine to optimize clinical outcomes.
        </p>
      </div>
      
      {patientProfile && (
        <ClinicalDecisionSupport
          patientProfile={patientProfile}
          currentMedications={currentPatient ? (currentPatient.medications || []).map((m: any) => m?.drug?.name || m?.drugName || m?.name || '').filter(Boolean) : currentMedications}
          proposedTreatment={proposedTreatment}
          onRecommendationAccept={handleRecommendationAccept}
        />
      )}

      {/* Inline Patient Picker Modal */}
      <Modal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        title="Select Patient"
        size="xl"
      >
        {/* Embed full PatientSelector for rich search/create/select inside the modal */}
        <PatientSelector mode="modal" compact onSelect={() => setShowPicker(false)} />
      </Modal>
    </div>
  );
};

export default ClinicalDecisionSupportPage;
