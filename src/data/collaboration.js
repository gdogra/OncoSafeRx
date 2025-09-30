// Collaboration data for teams, tumor boards, and clinical pathways

export const TEAMS = [
  {
    id: 'team-001',
    name: 'Lung Cancer Multidisciplinary Team',
    description: 'Specialized team for lung cancer patient care and research',
    specialty: 'Lung Cancer',
    members: [
      {
        id: 'member-001',
        name: 'Dr. Sarah Chen',
        role: 'Medical Oncologist',
        specialization: 'Lung Cancer',
        email: 'sarah.chen@hospital.org',
        phone: '555-0101',
        isLead: true
      },
      {
        id: 'member-002',
        name: 'Dr. Michael Rodriguez',
        role: 'Radiation Oncologist',
        specialization: 'Thoracic Radiation',
        email: 'michael.rodriguez@hospital.org',
        phone: '555-0102',
        isLead: false
      },
      {
        id: 'member-003',
        name: 'Dr. Emily Watson',
        role: 'Thoracic Surgeon',
        specialization: 'Lung Surgery',
        email: 'emily.watson@hospital.org',
        phone: '555-0103',
        isLead: false
      },
      {
        id: 'member-004',
        name: 'Dr. James Thompson',
        role: 'Pathologist',
        specialization: 'Molecular Pathology',
        email: 'james.thompson@hospital.org',
        phone: '555-0104',
        isLead: false
      }
    ],
    protocols: ['NCCN Lung Cancer Guidelines', 'ASCO Lung Cancer Guidelines'],
    createdDate: '2024-01-15T00:00:00Z',
    isActive: true
  },
  {
    id: 'team-002',
    name: 'Breast Cancer Care Team',
    description: 'Comprehensive breast cancer treatment and support team',
    specialty: 'Breast Cancer',
    members: [
      {
        id: 'member-005',
        name: 'Dr. Lisa Anderson',
        role: 'Medical Oncologist',
        specialization: 'Breast Cancer',
        email: 'lisa.anderson@hospital.org',
        phone: '555-0201',
        isLead: true
      },
      {
        id: 'member-006',
        name: 'Dr. Robert Kim',
        role: 'Surgical Oncologist',
        specialization: 'Breast Surgery',
        email: 'robert.kim@hospital.org',
        phone: '555-0202',
        isLead: false
      },
      {
        id: 'member-007',
        name: 'Dr. Maria Garcia',
        role: 'Radiation Oncologist',
        specialization: 'Breast Radiation',
        email: 'maria.garcia@hospital.org',
        phone: '555-0203',
        isLead: false
      }
    ],
    protocols: ['NCCN Breast Cancer Guidelines', 'St. Gallen Consensus'],
    createdDate: '2024-02-01T00:00:00Z',
    isActive: true
  }
];

export const TUMOR_BOARDS = [
  {
    id: 'board-001',
    name: 'Thoracic Oncology Tumor Board',
    description: 'Weekly multidisciplinary review of complex thoracic cancer cases',
    teamId: 'team-001',
    schedule: {
      dayOfWeek: 'Wednesday',
      time: '07:00',
      duration: 60,
      location: 'Conference Room A',
      virtualLink: 'https://hospital.zoom.us/j/123456789'
    },
    nextMeeting: '2024-12-04T07:00:00Z',
    cases: [
      {
        id: 'case-001',
        patientId: 'patient-001',
        title: 'Stage IIIA NSCLC - Treatment Planning',
        presenter: 'Dr. Sarah Chen',
        status: 'scheduled',
        dateScheduled: '2024-12-04T07:00:00Z',
        summary: '65-year-old male with stage IIIA NSCLC, EGFR wild-type, discussing concurrent chemoradiation vs surgery',
        questions: [
          'Optimal sequencing of therapy',
          'Role of immunotherapy maintenance',
          'Surgical candidacy assessment'
        ]
      }
    ],
    guidelines: ['NCCN Guidelines', 'ESMO Guidelines'],
    isActive: true
  },
  {
    id: 'board-002',
    name: 'Breast Cancer Tumor Board',
    description: 'Bi-weekly multidisciplinary breast cancer case discussions',
    teamId: 'team-002',
    schedule: {
      dayOfWeek: 'Friday',
      time: '12:00',
      duration: 90,
      location: 'Conference Room B',
      virtualLink: 'https://hospital.zoom.us/j/987654321'
    },
    nextMeeting: '2024-12-06T12:00:00Z',
    cases: [
      {
        id: 'case-002',
        patientId: 'patient-002',
        title: 'Triple Negative Breast Cancer - Neoadjuvant Strategy',
        presenter: 'Dr. Lisa Anderson',
        status: 'scheduled',
        dateScheduled: '2024-12-06T12:00:00Z',
        summary: '42-year-old female with locally advanced TNBC, discussing neoadjuvant options',
        questions: [
          'Optimal neoadjuvant regimen',
          'Role of immunotherapy',
          'Surgical timing and approach'
        ]
      }
    ],
    guidelines: ['NCCN Guidelines', 'ASCO Guidelines'],
    isActive: true
  }
];

export const CLINICAL_PATHWAYS = [
  {
    id: 'pathway-001',
    name: 'Early Stage NSCLC Treatment Pathway',
    description: 'Standardized care pathway for stages I-II non-small cell lung cancer',
    cancerType: 'Lung Cancer',
    stage: 'Early Stage (I-II)',
    version: '2024.1',
    lastUpdated: '2024-11-15T00:00:00Z',
    steps: [
      {
        id: 'step-001',
        order: 1,
        title: 'Initial Staging and Assessment',
        description: 'Complete staging workup and multidisciplinary evaluation',
        timeframe: '1-2 weeks',
        requirements: [
          'CT chest/abdomen/pelvis with contrast',
          'PET-CT if indicated',
          'Pulmonary function tests',
          'Cardiac evaluation if surgery planned',
          'Molecular testing if adenocarcinoma'
        ],
        responsible: 'Medical Oncologist'
      },
      {
        id: 'step-002',
        order: 2,
        title: 'Multidisciplinary Team Discussion',
        description: 'Tumor board review of case and treatment recommendations',
        timeframe: '1 week',
        requirements: [
          'Complete staging information',
          'Pathology review',
          'Patient performance status assessment'
        ],
        responsible: 'Tumor Board'
      },
      {
        id: 'step-003',
        order: 3,
        title: 'Primary Treatment',
        description: 'Surgical resection or stereotactic radiation based on candidacy',
        timeframe: '2-4 weeks',
        requirements: [
          'Surgical clearance if applicable',
          'Anesthesia evaluation',
          'Patient education and consent'
        ],
        responsible: 'Thoracic Surgeon or Radiation Oncologist'
      },
      {
        id: 'step-004',
        order: 4,
        title: 'Adjuvant Therapy Consideration',
        description: 'Evaluate need for adjuvant chemotherapy or targeted therapy',
        timeframe: '4-8 weeks post-surgery',
        requirements: [
          'Final pathology review',
          'Molecular testing results',
          'Patient recovery assessment'
        ],
        responsible: 'Medical Oncologist'
      }
    ],
    outcomes: {
      primaryEndpoints: ['Overall Survival', 'Disease-Free Survival'],
      qualityMetrics: ['Time to Treatment', 'Guideline Adherence', 'Patient Satisfaction']
    },
    isActive: true
  },
  {
    id: 'pathway-002',
    name: 'HER2+ Breast Cancer Treatment Pathway',
    description: 'Evidence-based pathway for HER2-positive breast cancer management',
    cancerType: 'Breast Cancer',
    stage: 'All Stages',
    version: '2024.2',
    lastUpdated: '2024-10-20T00:00:00Z',
    steps: [
      {
        id: 'step-005',
        order: 1,
        title: 'Diagnosis and Staging',
        description: 'Confirm HER2 status and complete staging workup',
        timeframe: '1-2 weeks',
        requirements: [
          'Core needle biopsy with HER2 testing',
          'Imaging studies (mammography, ultrasound, MRI)',
          'Systemic staging if indicated'
        ],
        responsible: 'Medical Oncologist'
      },
      {
        id: 'step-006',
        order: 2,
        title: 'Multidisciplinary Planning',
        description: 'Tumor board review and treatment sequencing',
        timeframe: '1 week',
        requirements: [
          'Complete staging',
          'HER2 confirmation',
          'Patient preference discussion'
        ],
        responsible: 'Breast Cancer Team'
      },
      {
        id: 'step-007',
        order: 3,
        title: 'Neoadjuvant vs Adjuvant Decision',
        description: 'Determine optimal timing of systemic therapy',
        timeframe: '1 week',
        requirements: [
          'Tumor size and stage assessment',
          'Patient candidacy evaluation',
          'Surgical consultation'
        ],
        responsible: 'Medical Oncologist'
      }
    ],
    outcomes: {
      primaryEndpoints: ['Pathological Complete Response', 'Disease-Free Survival'],
      qualityMetrics: ['HER2 Testing Accuracy', 'Treatment Adherence', 'Cardiotoxicity Monitoring']
    },
    isActive: true
  }
];

export default { TEAMS, TUMOR_BOARDS, CLINICAL_PATHWAYS };