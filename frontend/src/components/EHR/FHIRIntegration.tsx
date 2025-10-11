import React, { useState, useEffect, useCallback } from 'react';
import { Database, Zap, Shield, CheckCircle, AlertTriangle, Clock, Download, Upload, Settings, RefreshCw as Refresh, Activity, FileText, Users, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface FHIRResource {
  resourceType: string;
  id: string;
  status: 'active' | 'inactive' | 'entered-in-error' | 'draft';
  lastUpdated: string;
  source: string;
  data: any;
}

interface Patient extends FHIRResource {
  resourceType: 'Patient';
  name: Array<{
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  telecom: Array<{
    system: 'phone' | 'email' | 'fax';
    value: string;
    use: 'home' | 'work' | 'mobile';
  }>;
  address: Array<{
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  identifier: Array<{
    system: string;
    value: string;
    type: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
}

interface Observation extends FHIRResource {
  resourceType: 'Observation';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  effectiveDateTime: string;
  performer: Array<{
    reference: string;
    display: string;
  }>;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

interface MedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  authoredOn: string;
  requester: {
    reference: string;
    display: string;
  };
  dosageInstruction: Array<{
    text: string;
    timing: {
      repeat: {
        frequency: number;
        period: number;
        periodUnit: string;
      };
    };
    route: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate: Array<{
      doseQuantity: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
    }>;
  }>;
}

interface Condition extends FHIRResource {
  resourceType: 'Condition';
  clinicalStatus: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  verificationStatus: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  severity?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  onsetDateTime?: string;
  recordedDate: string;
  recorder: {
    reference: string;
    display: string;
  };
}

interface FHIRConnection {
  id: string;
  name: string;
  baseUrl: string;
  version: '4.0.1' | '3.0.2' | '1.8.0';
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastSync: string;
  authentication: {
    type: 'OAuth2' | 'Basic' | 'Bearer' | 'SMART';
    status: 'authenticated' | 'expired' | 'invalid';
    scopes: string[];
  };
  capabilities: {
    resources: string[];
    searchParams: string[];
    operations: string[];
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    averageResponseTime: number;
    lastError?: string;
  };
}

interface ClinicalDecisionSupport {
  id: string;
  title: string;
  description: string;
  category: 'drug-interaction' | 'allergy-alert' | 'contraindication' | 'dosing-guidance' | 'monitoring' | 'duplicate-therapy';
  severity: 'info' | 'warning' | 'critical';
  trigger: {
    resourceType: string;
    conditions: any[];
  };
  recommendation: {
    action: string;
    description: string;
    evidence: string;
  };
  isActive: boolean;
}

interface DataMapping {
  id: string;
  sourceSystem: string;
  targetFHIRResource: string;
  mappingRules: Array<{
    sourceField: string;
    targetField: string;
    transformation?: string;
    validation?: string;
  }>;
  status: 'active' | 'inactive' | 'testing';
  lastUsed: string;
  successRate: number;
}

const FHIRIntegration: React.FC = () => {
  const [connections, setConnections] = useState<FHIRConnection[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [medications, setMedications] = useState<MedicationRequest[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [cdsRules, setCdsRules] = useState<ClinicalDecisionSupport[]>([]);
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);

  const generateSampleData = useCallback(() => {
    // Generate FHIR connections
    const sampleConnections: FHIRConnection[] = [
      {
        id: 'epic-prod',
        name: 'Epic Production',
        baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth',
        version: '4.0.1',
        status: 'connected',
        lastSync: '2 minutes ago',
        authentication: {
          type: 'SMART',
          status: 'authenticated',
          scopes: ['patient/Patient.read', 'patient/Observation.read', 'patient/MedicationRequest.read', 'patient/Condition.read']
        },
        capabilities: {
          resources: ['Patient', 'Observation', 'MedicationRequest', 'Condition', 'Procedure', 'DiagnosticReport'],
          searchParams: ['_id', 'identifier', 'name', 'birthdate', 'gender', 'address'],
          operations: ['read', 'search', 'create', 'update']
        },
        metrics: {
          totalRequests: 15247,
          successfulRequests: 14982,
          averageResponseTime: 245,
          lastError: undefined
        }
      },
      {
        id: 'cerner-prod',
        name: 'Cerner PowerChart',
        baseUrl: 'https://fhir-open.cerner.com/r4',
        version: '4.0.1',
        status: 'connected',
        lastSync: '5 minutes ago',
        authentication: {
          type: 'OAuth2',
          status: 'authenticated',
          scopes: ['patient/Patient.read', 'patient/Observation.read', 'patient/MedicationRequest.read']
        },
        capabilities: {
          resources: ['Patient', 'Observation', 'MedicationRequest', 'Condition', 'AllergyIntolerance'],
          searchParams: ['_id', 'identifier', 'name', 'birthdate'],
          operations: ['read', 'search']
        },
        metrics: {
          totalRequests: 8934,
          successfulRequests: 8756,
          averageResponseTime: 312,
          lastError: undefined
        }
      },
      {
        id: 'allscripts-test',
        name: 'Allscripts Test',
        baseUrl: 'https://fhir.allscripts.com/test',
        version: '4.0.1',
        status: 'connecting',
        lastSync: '1 hour ago',
        authentication: {
          type: 'Basic',
          status: 'authenticated',
          scopes: ['patient/Patient.read']
        },
        capabilities: {
          resources: ['Patient', 'Observation'],
          searchParams: ['_id', 'identifier'],
          operations: ['read', 'search']
        },
        metrics: {
          totalRequests: 234,
          successfulRequests: 201,
          averageResponseTime: 567,
          lastError: 'Timeout on last request'
        }
      }
    ];

    // Generate sample patients
    const samplePatients: Patient[] = [
      {
        resourceType: 'Patient',
        id: 'patient-001',
        status: 'active',
        lastUpdated: '2024-01-15T10:30:00Z',
        source: 'Epic Production',
        name: [
          {
            family: 'Johnson',
            given: ['Sarah', 'Elizabeth']
          }
        ],
        gender: 'female',
        birthDate: '1957-03-15',
        telecom: [
          {
            system: 'phone',
            value: '555-123-4567',
            use: 'home'
          },
          {
            system: 'email',
            value: 'sarah.johnson@email.com',
            use: 'home'
          }
        ],
        address: [
          {
            line: ['123 Main Street', 'Apt 4B'],
            city: 'Boston',
            state: 'MA',
            postalCode: '02101',
            country: 'US'
          }
        ],
        identifier: [
          {
            system: 'http://hospital.example.org/patients',
            value: 'MRN-12345',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number'
                }
              ]
            }
          }
        ],
        data: {}
      },
      {
        resourceType: 'Patient',
        id: 'patient-002',
        status: 'active',
        lastUpdated: '2024-01-14T14:22:00Z',
        source: 'Cerner PowerChart',
        name: [
          {
            family: 'Williams',
            given: ['Robert', 'James']
          }
        ],
        gender: 'male',
        birthDate: '1962-11-08',
        telecom: [
          {
            system: 'phone',
            value: '555-987-6543',
            use: 'mobile'
          }
        ],
        address: [
          {
            line: ['456 Oak Avenue'],
            city: 'Cambridge',
            state: 'MA',
            postalCode: '02138',
            country: 'US'
          }
        ],
        identifier: [
          {
            system: 'http://hospital.example.org/patients',
            value: 'MRN-67890',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number'
                }
              ]
            }
          }
        ],
        data: {}
      }
    ];

    // Generate sample observations
    const sampleObservations: Observation[] = [
      {
        resourceType: 'Observation',
        id: 'obs-001',
        status: 'final',
        lastUpdated: '2024-01-15T09:15:00Z',
        source: 'Epic Production',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure panel with all children optional'
            }
          ]
        },
        subject: {
          reference: 'Patient/patient-001'
        },
        valueQuantity: {
          value: 140,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        },
        effectiveDateTime: '2024-01-15T09:00:00Z',
        performer: [
          {
            reference: 'Practitioner/dr-smith',
            display: 'Dr. Smith'
          }
        ],
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'H',
                display: 'High'
              }
            ]
          }
        ],
        data: {}
      },
      {
        resourceType: 'Observation',
        id: 'obs-002',
        status: 'final',
        lastUpdated: '2024-01-15T08:30:00Z',
        source: 'Epic Production',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '718-7',
              display: 'Hemoglobin [Mass/volume] in Blood'
            }
          ]
        },
        subject: {
          reference: 'Patient/patient-001'
        },
        valueQuantity: {
          value: 9.2,
          unit: 'g/dL',
          system: 'http://unitsofmeasure.org',
          code: 'g/dL'
        },
        effectiveDateTime: '2024-01-15T08:00:00Z',
        performer: [
          {
            reference: 'Organization/lab-central',
            display: 'Central Laboratory'
          }
        ],
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: 'L',
                display: 'Low'
              }
            ]
          }
        ],
        data: {}
      }
    ];

    // Generate sample medications
    const sampleMedications: MedicationRequest[] = [
      {
        resourceType: 'MedicationRequest',
        id: 'med-001',
        status: 'active',
        lastUpdated: '2024-01-15T11:00:00Z',
        source: 'Epic Production',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1049502',
              display: 'Pembrolizumab 25 MG/ML Injectable Solution'
            }
          ]
        },
        subject: {
          reference: 'Patient/patient-001'
        },
        authoredOn: '2024-01-15T11:00:00Z',
        requester: {
          reference: 'Practitioner/dr-oncologist',
          display: 'Dr. Oncologist'
        },
        dosageInstruction: [
          {
            text: '200 mg IV every 3 weeks',
            timing: {
              repeat: {
                frequency: 1,
                period: 3,
                periodUnit: 'wk'
              }
            },
            route: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '47625008',
                  display: 'Intravenous route'
                }
              ]
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 200,
                  unit: 'mg',
                  system: 'http://unitsofmeasure.org',
                  code: 'mg'
                }
              }
            ]
          }
        ],
        data: {}
      }
    ];

    // Generate sample conditions
    const sampleConditions: Condition[] = [
      {
        resourceType: 'Condition',
        id: 'cond-001',
        status: 'active',
        lastUpdated: '2024-01-10T14:30:00Z',
        source: 'Epic Production',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: 'confirmed',
              display: 'Confirmed'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
                display: 'Encounter Diagnosis'
              }
            ]
          }
        ],
        severity: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '24484000',
              display: 'Severe'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '254637007',
              display: 'Non-small cell lung cancer'
            }
          ]
        },
        subject: {
          reference: 'Patient/patient-001'
        },
        onsetDateTime: '2023-11-15T00:00:00Z',
        recordedDate: '2023-11-16T10:30:00Z',
        recorder: {
          reference: 'Practitioner/dr-oncologist',
          display: 'Dr. Oncologist'
        },
        data: {}
      }
    ];

    // Generate CDS rules
    const sampleCdsRules: ClinicalDecisionSupport[] = [
      {
        id: 'cds-001',
        title: 'Pembrolizumab Cardiac Monitoring',
        description: 'Monitor cardiac function when prescribing pembrolizumab',
        category: 'monitoring',
        severity: 'warning',
        trigger: {
          resourceType: 'MedicationRequest',
          conditions: [
            {
              field: 'medicationCodeableConcept.coding.code',
              operator: 'equals',
              value: '1049502'
            }
          ]
        },
        recommendation: {
          action: 'Order baseline echocardiogram',
          description: 'Baseline cardiac function assessment recommended before starting pembrolizumab',
          evidence: 'FDA prescribing information and clinical trials data'
        },
        isActive: true
      },
      {
        id: 'cds-002',
        title: 'Drug-Drug Interaction Alert',
        description: 'Potential interaction between warfarin and pembrolizumab',
        category: 'drug-interaction',
        severity: 'critical',
        trigger: {
          resourceType: 'MedicationRequest',
          conditions: [
            {
              field: 'medicationCodeableConcept.coding.display',
              operator: 'contains',
              value: 'warfarin'
            }
          ]
        },
        recommendation: {
          action: 'Monitor INR closely',
          description: 'Increased bleeding risk with immunotherapy and anticoagulation',
          evidence: 'Clinical pharmacology studies'
        },
        isActive: true
      }
    ];

    // Generate data mappings
    const sampleMappings: DataMapping[] = [
      {
        id: 'map-001',
        sourceSystem: 'Epic',
        targetFHIRResource: 'Patient',
        mappingRules: [
          {
            sourceField: 'PAT_MRN_ID',
            targetField: 'identifier.value',
            transformation: 'direct',
            validation: 'required'
          },
          {
            sourceField: 'PAT_LAST_NAME',
            targetField: 'name.family',
            transformation: 'direct',
            validation: 'required'
          },
          {
            sourceField: 'PAT_FIRST_NAME',
            targetField: 'name.given[0]',
            transformation: 'direct',
            validation: 'required'
          },
          {
            sourceField: 'BIRTH_DATE',
            targetField: 'birthDate',
            transformation: 'date_format',
            validation: 'date'
          }
        ],
        status: 'active',
        lastUsed: '2024-01-15T10:30:00Z',
        successRate: 98.5
      },
      {
        id: 'map-002',
        sourceSystem: 'Cerner',
        targetFHIRResource: 'Observation',
        mappingRules: [
          {
            sourceField: 'ORDER_RESULT_VALUE',
            targetField: 'valueQuantity.value',
            transformation: 'numeric',
            validation: 'number'
          },
          {
            sourceField: 'ORDER_RESULT_UNITS',
            targetField: 'valueQuantity.unit',
            transformation: 'direct',
            validation: 'optional'
          },
          {
            sourceField: 'RESULT_DATE',
            targetField: 'effectiveDateTime',
            transformation: 'datetime_format',
            validation: 'datetime'
          }
        ],
        status: 'active',
        lastUsed: '2024-01-15T09:15:00Z',
        successRate: 95.2
      }
    ];

    setConnections(sampleConnections);
    setPatients(samplePatients);
    setObservations(sampleObservations);
    setMedications(sampleMedications);
    setConditions(sampleConditions);
    setCdsRules(sampleCdsRules);
    setDataMappings(sampleMappings);
    setSelectedConnection(sampleConnections[0].id);
    setSelectedPatient(samplePatients[0].id);
  }, []);

  const syncData = useCallback(async () => {
    setSyncStatus('syncing');
    setSyncProgress(0);

    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Simulate sync time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    clearInterval(progressInterval);
    setSyncProgress(100);
    setSyncStatus('success');

    // Reset status after 2 seconds
    setTimeout(() => {
      setSyncStatus('idle');
      setSyncProgress(0);
    }, 2000);
  }, []);

  useEffect(() => {
    generateSampleData();
  }, [generateSampleData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'warning': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'info': return 'text-blue-700 bg-blue-100 border-blue-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const selectedConnectionData = connections.find(c => c.id === selectedConnection);
  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Prepare chart data
  const connectionMetrics = connections.map(conn => ({
    name: conn.name.split(' ')[0],
    requests: conn.metrics.totalRequests,
    success: conn.metrics.successfulRequests,
    responseTime: conn.metrics.averageResponseTime
  }));

  const resourceDistribution = [
    { name: 'Patients', value: patients.length, color: '#3B82F6' },
    { name: 'Observations', value: observations.length, color: '#10B981' },
    { name: 'Medications', value: medications.length, color: '#F59E0B' },
    { name: 'Conditions', value: conditions.length, color: '#EF4444' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">EHR Integration Framework</h1>
            <p className="text-blue-100">
              FHIR-compliant integration with comprehensive clinical decision support and real-time data synchronization
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{connections.filter(c => c.status === 'connected').length}</div>
            <div className="text-sm text-blue-100">Active Connections</div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">FHIR Connections</h3>
          <div className="flex gap-2">
            <button
              onClick={syncData}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <Refresh className="h-4 w-4" />
                  Sync All
                </>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <Settings className="h-4 w-4" />
              Configure
            </button>
          </div>
        </div>

        {syncStatus === 'syncing' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Synchronization Progress</span>
              <span>{syncProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <div key={connection.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{connection.name}</h4>
                  <p className="text-sm text-gray-600">FHIR {connection.version}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
                  {connection.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Authentication:</span>
                  <span className="font-medium">{connection.authentication.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resources:</span>
                  <span className="font-medium">{connection.capabilities.resources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">
                    {((connection.metrics.successfulRequests / connection.metrics.totalRequests) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{connection.metrics.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium text-green-600">{connection.lastSync}</span>
                </div>
              </div>

              {connection.metrics.lastError && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {connection.metrics.lastError}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Performance */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={connectionMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="success" fill="#10B981" name="Successful Requests" />
              <Bar dataKey="responseTime" fill="#3B82F6" name="Response Time (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">FHIR Resource Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resourceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {resourceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clinical Decision Support */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Decision Support Rules</h3>
        <div className="space-y-3">
          {cdsRules.map((rule) => (
            <div key={rule.id} className={`p-4 border rounded-lg ${getSeverityColor(rule.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{rule.title}</h4>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded capitalize">
                      {rule.category.replace('-', ' ')}
                    </span>
                    {rule.severity === 'critical' && <AlertTriangle className="h-4 w-4" />}
                    {rule.severity === 'warning' && <Clock className="h-4 w-4" />}
                    {rule.severity === 'info' && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <p className="text-sm mb-2">{rule.description}</p>
                  <div className="text-sm">
                    <strong>Recommendation:</strong> {rule.recommendation.action}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    Evidence: {rule.recommendation.evidence}
                  </div>
                </div>
                <div className="ml-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={(e) => {
                        setCdsRules(rules => rules.map(r => 
                          r.id === rule.id ? { ...r, isActive: e.target.checked } : r
                        ));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Data View */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Patient Clinical Data</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {connections.map(conn => (
                <option key={conn.id} value={conn.id}>{conn.name}</option>
              ))}
            </select>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name[0].family}, {patient.name[0].given[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPatientData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Demographics */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Demographics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {selectedPatientData.name[0].family}, {selectedPatientData.name[0].given[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">{selectedPatientData.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DOB:</span>
                  <span className="font-medium">{selectedPatientData.birthDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MRN:</span>
                  <span className="font-medium">{selectedPatientData.identifier[0].value}</span>
                </div>
              </div>
            </div>

            {/* Recent Observations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Labs</h4>
              <div className="space-y-2">
                {observations
                  .filter(obs => obs.subject.reference === `Patient/${selectedPatient}`)
                  .map(obs => (
                    <div key={obs.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">
                        {obs.code.coding[0].display.split('[')[0].trim()}
                      </div>
                      <div className="flex justify-between">
                        <span>
                          {obs.valueQuantity?.value} {obs.valueQuantity?.unit}
                        </span>
                        <span className={`text-xs px-1 rounded ${
                          obs.interpretation?.[0]?.coding[0]?.code === 'H' ? 'bg-red-100 text-red-800' :
                          obs.interpretation?.[0]?.coding[0]?.code === 'L' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {obs.interpretation?.[0]?.coding[0]?.display || 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Active Medications */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Active Medications</h4>
              <div className="space-y-2">
                {medications
                  .filter(med => med.subject.reference === `Patient/${selectedPatient}`)
                  .map(med => (
                    <div key={med.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">
                        {med.medicationCodeableConcept.coding[0].display.split(' ')[0]}
                      </div>
                      <div className="text-xs text-gray-600">
                        {med.dosageInstruction[0].text}
                      </div>
                      <div className="text-xs text-gray-500">
                        Prescribed: {new Date(med.authoredOn).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Active Conditions</h4>
              <div className="space-y-2">
                {conditions
                  .filter(cond => cond.subject.reference === `Patient/${selectedPatient}`)
                  .map(cond => (
                    <div key={cond.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">
                        {cond.code.coding[0].display}
                      </div>
                      <div className="text-xs text-gray-600">
                        Severity: {cond.severity?.coding[0].display}
                      </div>
                      <div className="text-xs text-gray-500">
                        Onset: {cond.onsetDateTime ? new Date(cond.onsetDateTime).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Mapping */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Mapping Configuration</h3>
        <div className="space-y-4">
          {dataMappings.map((mapping) => (
            <div key={mapping.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {mapping.sourceSystem} → {mapping.targetFHIRResource}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Success Rate: {mapping.successRate}%</span>
                    <span>Last Used: {new Date(mapping.lastUsed).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      mapping.status === 'active' ? 'bg-green-100 text-green-800' :
                      mapping.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mapping.status}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Edit Mapping
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {mapping.mappingRules.slice(0, 4).map((rule, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-sm">
                    <div className="font-medium text-blue-600">{rule.sourceField}</div>
                    <div className="text-gray-600">↓</div>
                    <div className="font-medium">{rule.targetField}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {rule.transformation} | {rule.validation}
                    </div>
                  </div>
                ))}
              </div>
              
              {mapping.mappingRules.length > 4 && (
                <div className="mt-2 text-sm text-gray-600">
                  +{mapping.mappingRules.length - 4} more mapping rules
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FHIRIntegration;
