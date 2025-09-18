import React from 'react';
import Modal from '../UI/Modal';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Pill,
  Activity,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface Protocol {
  name: string;
  cancerType: string;
  stage: string;
  drugs: string[];
  duration: string;
  responseRate: string;
  source: string;
  indication: string;
}

interface ProtocolDetailModalProps {
  protocol: Protocol | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProtocolDetailModal: React.FC<ProtocolDetailModalProps> = ({
  protocol,
  isOpen,
  onClose,
}) => {
  if (!protocol) return null;

  // Generate realistic protocol details based on the protocol data
  const getProtocolDetails = (protocol: Protocol) => {
    const isFOLFOX = protocol.name === 'FOLFOX';
    const isFOLFIRI = protocol.name === 'FOLFIRI';
    const isACT = protocol.name === 'AC-T';

    return {
      dosing: isFOLFOX ? [
        'Day 1: Oxaliplatin 85 mg/m² IV over 2 hours',
        'Day 1: Leucovorin 400 mg/m² IV over 2 hours (concurrent with oxaliplatin)',
        'Day 1: 5-FU 400 mg/m² IV bolus, then 2400 mg/m² continuous infusion over 46 hours',
        'Repeat cycle every 14 days for 12 cycles (24 weeks)'
      ] : isFOLFIRI ? [
        'Day 1: Irinotecan 180 mg/m² IV over 90 minutes',
        'Day 1: Leucovorin 400 mg/m² IV over 2 hours',
        'Day 1: 5-FU 400 mg/m² IV bolus, then 2400 mg/m² continuous infusion over 46 hours',
        'Repeat cycle every 14 days for 12 cycles (24 weeks)'
      ] : [
        'AC Phase: Doxorubicin 60 mg/m² + Cyclophosphamide 600 mg/m² IV every 21 days × 4 cycles',
        'T Phase: Paclitaxel 175 mg/m² IV over 3 hours every 21 days × 4 cycles',
        'Total duration: 16 weeks (4 cycles AC + 4 cycles T)'
      ],
      
      premedications: isFOLFOX ? [
        'Ondansetron 8 mg IV or equivalent antiemetic',
        'Dexamethasone 12 mg IV (for oxaliplatin)',
        'Consider cold cap therapy for neuropathy prevention'
      ] : isFOLFIRI ? [
        'Ondansetron 8 mg IV',
        'Atropine 0.25-1 mg IV/SC (if cholinergic symptoms with irinotecan)',
        'Loperamide for delayed diarrhea management'
      ] : [
        'Ondansetron 8 mg IV',
        'Dexamethasone 20 mg IV',
        'Diphenhydramine 50 mg IV',
        'Ranitidine 50 mg IV'
      ],
      
      monitoring: [
        'CBC with differential before each cycle',
        'Comprehensive metabolic panel',
        'Liver function tests',
        'Performance status assessment',
        ...(isFOLFOX ? ['Neurologic examination for peripheral neuropathy'] : []),
        ...(isFOLFIRI ? ['UGT1A1 genotyping recommended'] : []),
        ...(isACT ? ['ECHO or MUGA before treatment and every 3 months', 'Monitor for cardiac toxicity'] : [])
      ],
      
      adverseEvents: isFOLFOX ? [
        'Peripheral neuropathy (70-80% incidence)',
        'Neutropenia (Grade 3-4: 40%)',
        'Diarrhea (Grade 3-4: 10-15%)',
        'Nausea/vomiting',
        'Fatigue',
        'Thrombocytopenia'
      ] : isFOLFIRI ? [
        'Diarrhea (Grade 3-4: 20-30%)',
        'Neutropenia (Grade 3-4: 25%)',
        'Nausea/vomiting',
        'Alopecia',
        'Fatigue',
        'Cholinergic syndrome (acute)'
      ] : [
        'Alopecia (>90%)',
        'Nausea/vomiting',
        'Neutropenia (Grade 3-4: 60%)',
        'Cardiomyopathy (doxorubicin)',
        'Peripheral neuropathy (paclitaxel)',
        'Fatigue'
      ],
      
      contraindications: [
        'Severe hepatic impairment',
        'Active infection',
        'Pregnancy',
        ...(isFOLFOX ? ['Severe peripheral neuropathy'] : []),
        ...(isFOLFIRI ? ['UGT1A1*28 homozygous (consider dose reduction)'] : []),
        ...(isACT ? ['LVEF <50%', 'Prior anthracycline exposure >300 mg/m²'] : [])
      ],
      
      efficacy: {
        responseRate: protocol.responseRate,
        medianPFS: isFOLFOX ? '9.4 months' : isFOLFIRI ? '7.3 months' : '2.9 years',
        medianOS: isFOLFOX ? '19.8 months' : isFOLFIRI ? '16.2 months' : 'Not reached',
        evidenceLevel: 'Level A (High-quality evidence)',
        studyBasis: isFOLFOX ? 'MOSAIC, FOLFOX4 studies' : isFOLFIRI ? 'FOLFIRI vs IFL studies' : 'NSABP B-28, CALGB 9344'
      }
    };
  };

  const details = getProtocolDetails(protocol);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${protocol.name} Protocol - ${protocol.cancerType}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Protocol Overview */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Protocol Overview
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Indication:</span> {protocol.indication}
            </div>
            <div>
              <span className="font-medium">Stage:</span> {protocol.stage}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {protocol.duration}
            </div>
            <div>
              <span className="font-medium">Source:</span> {protocol.source} Guidelines
            </div>
          </div>
        </div>

        {/* Efficacy Data */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Efficacy Data
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-700 font-medium">Response Rate</div>
              <div className="text-lg font-bold text-green-900">{details.efficacy.responseRate}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-700 font-medium">Median PFS</div>
              <div className="text-lg font-bold text-blue-900">{details.efficacy.medianPFS}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-sm text-purple-700 font-medium">Median OS</div>
              <div className="text-lg font-bold text-purple-900">{details.efficacy.medianOS}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="text-sm text-yellow-700 font-medium">Evidence Level</div>
              <div className="text-sm font-bold text-yellow-900">{details.efficacy.evidenceLevel}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Study Basis:</span> {details.efficacy.studyBasis}
          </p>
        </div>

        {/* Dosing Schedule */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Pill className="w-5 h-5 mr-2 text-blue-600" />
            Dosing Schedule
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {details.dosing.map((dose, index) => (
                <li key={index} className="flex items-start">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{dose}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Premedications */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Premedications
          </h3>
          <ul className="space-y-2">
            {details.premedications.map((med, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{med}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Monitoring Requirements */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Monitoring Requirements
          </h3>
          <ul className="space-y-2">
            {details.monitoring.map((req, index) => (
              <li key={index} className="flex items-start">
                <Activity className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Adverse Events */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Common Adverse Events
          </h3>
          <div className="grid md:grid-cols-2 gap-2">
            {details.adverseEvents.map((event, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contraindications */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <XCircle className="w-5 h-5 mr-2 text-red-600" />
            Contraindications
          </h3>
          <ul className="space-y-2">
            {details.contraindications.map((contra, index) => (
              <li key={index} className="flex items-start">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{contra}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Drugs in Protocol */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Protocol Medications
          </h3>
          <div className="flex flex-wrap gap-2">
            {protocol.drugs.map((drug, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                <Pill className="w-3 h-3 mr-1" />
                {drug}
              </span>
            ))}
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Important Clinical Notes
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Always verify patient eligibility criteria before initiating treatment</li>
            <li>• Monitor for dose-limiting toxicities and adjust doses accordingly</li>
            <li>• Consider supportive care measures throughout treatment</li>
            <li>• Consult institutional guidelines for specific modifications</li>
            <li>• This protocol summary is for reference only - always verify with current guidelines</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ProtocolDetailModal;