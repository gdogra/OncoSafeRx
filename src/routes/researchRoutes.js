import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/studies', asyncHandler(async (req, res) => {
  const { patientId, phases, categories, maxDistance, compensationRequired } = req.query;
  
  try {
    const mockStudies = [
      {
        id: 'NCT12345678',
        title: 'Phase III Trial of Novel Immunotherapy in Advanced Breast Cancer',
        phase: 'Phase III',
        category: 'Treatment',
        status: 'Recruiting',
        sponsor: 'National Cancer Institute',
        location: 'Multiple Sites',
        distance: 15,
        estimatedEnrollment: 300,
        currentEnrollment: 187,
        description: 'A randomized, controlled trial evaluating the efficacy of a novel immunotherapy agent compared to standard of care in patients with advanced breast cancer.',
        eligibility: {
          criteria: [
            'Age 18-75 years',
            'Confirmed diagnosis of advanced breast cancer',
            'ECOG performance status 0-1',
            'Adequate organ function'
          ],
          exclusions: [
            'Prior immunotherapy',
            'Active autoimmune disease',
            'Pregnancy or breastfeeding'
          ]
        },
        compensation: false,
        contactInfo: {
          name: 'Dr. Sarah Johnson',
          phone: '(555) 123-4567',
          email: 'sarah.johnson@cancer.org'
        }
      },
      {
        id: 'NCT87654321',
        title: 'Phase II Study of Targeted Therapy in BRAF-Mutated Melanoma',
        phase: 'Phase II',
        category: 'Treatment',
        status: 'Recruiting',
        sponsor: 'BioPharma Research',
        location: 'Regional Cancer Center',
        distance: 25,
        estimatedEnrollment: 150,
        currentEnrollment: 89,
        description: 'An open-label study investigating a novel BRAF inhibitor in patients with BRAF-mutated melanoma.',
        eligibility: {
          criteria: [
            'Age 18+ years',
            'BRAF V600E/K mutation confirmed',
            'Measurable disease per RECIST',
            'Life expectancy >3 months'
          ],
          exclusions: [
            'Prior BRAF inhibitor therapy',
            'Active brain metastases',
            'Significant cardiac disease'
          ]
        },
        compensation: true,
        contactInfo: {
          name: 'Dr. Michael Chen',
          phone: '(555) 987-6543',
          email: 'michael.chen@research.org'
        }
      }
    ];

    let filteredStudies = mockStudies;

    if (phases) {
      const phaseArray = phases.split(',');
      filteredStudies = filteredStudies.filter(study => 
        phaseArray.includes(study.phase)
      );
    }

    if (categories) {
      const categoryArray = categories.split(',');
      filteredStudies = filteredStudies.filter(study => 
        categoryArray.includes(study.category)
      );
    }

    if (maxDistance) {
      filteredStudies = filteredStudies.filter(study => 
        study.distance <= parseInt(maxDistance)
      );
    }

    if (compensationRequired === 'true') {
      filteredStudies = filteredStudies.filter(study => study.compensation);
    }

    res.json({
      success: true,
      studies: filteredStudies,
      totalCount: filteredStudies.length,
      filters: {
        phases: phases?.split(',') || [],
        categories: categories?.split(',') || [],
        maxDistance: maxDistance ? parseInt(maxDistance) : null,
        compensationRequired: compensationRequired === 'true'
      }
    });
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch studies' });
  }
}));

router.get('/matches/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const mockMatches = [
      {
        id: 'NCT12345678',
        title: 'Phase III Trial of Novel Immunotherapy in Advanced Breast Cancer',
        matchScore: 95,
        matchReasons: [
          'Cancer type matches exactly',
          'Age within eligible range',
          'Performance status compatible',
          'Geographic proximity'
        ],
        phase: 'Phase III',
        status: 'Recruiting',
        estimatedDuration: '18 months',
        nextSteps: [
          'Schedule screening appointment',
          'Complete eligibility assessment',
          'Review informed consent'
        ]
      },
      {
        id: 'NCT87654321',
        title: 'Phase II Study of Targeted Therapy in BRAF-Mutated Melanoma',
        matchScore: 88,
        matchReasons: [
          'Biomarker profile matches',
          'Prior treatment history compatible',
          'Location accessible'
        ],
        phase: 'Phase II',
        status: 'Recruiting',
        estimatedDuration: '12 months',
        nextSteps: [
          'Confirm BRAF mutation status',
          'Schedule consultation',
          'Review study protocol'
        ]
      }
    ];

    res.json({
      success: true,
      patientId,
      matches: mockMatches,
      totalMatches: mockMatches.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
}));

router.get('/participation-history/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const mockHistory = [
      {
        studyId: 'NCT11111111',
        title: 'Phase I Study of Novel Checkpoint Inhibitor',
        status: 'Completed',
        enrollmentDate: '2023-01-15',
        completionDate: '2023-12-20',
        outcomes: [
          'Successfully completed all treatment cycles',
          'Minimal side effects reported',
          'Stable disease achieved'
        ],
        followUpRequired: false
      },
      {
        studyId: 'NCT22222222',
        title: 'Biomarker Discovery Study in Solid Tumors',
        status: 'Active',
        enrollmentDate: '2024-03-10',
        completionDate: null,
        outcomes: [
          'Tissue samples collected',
          'Baseline assessments complete'
        ],
        followUpRequired: true,
        nextAppointment: '2024-12-15'
      }
    ];

    res.json({
      success: true,
      patientId,
      participationHistory: mockHistory,
      totalStudies: mockHistory.length,
      activeStudies: mockHistory.filter(h => h.status === 'Active').length,
      completedStudies: mockHistory.filter(h => h.status === 'Completed').length
    });
  } catch (error) {
    console.error('Error fetching participation history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch participation history' });
  }
}));

router.get('/preferences/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const mockPreferences = {
      patientId,
      preferences: {
        studyTypes: ['Treatment', 'Prevention'],
        phases: ['Phase II', 'Phase III'],
        maxTravelDistance: 50,
        compensationRequired: false,
        communicationMethod: 'email',
        availabilityWindows: [
          { day: 'monday', timeSlots: ['morning', 'afternoon'] },
          { day: 'wednesday', timeSlots: ['afternoon'] },
          { day: 'friday', timeSlots: ['morning'] }
        ],
        specialConsiderations: [
          'Prefer studies with minimal side effects',
          'Need flexible scheduling due to work',
          'Interested in immunotherapy trials'
        ]
      },
      notifications: {
        newStudies: true,
        studyUpdates: true,
        reminders: true,
        frequency: 'weekly'
      },
      lastUpdated: '2024-10-15T10:30:00Z'
    };

    res.json({
      success: true,
      ...mockPreferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
}));

router.get('/recommendations/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { limit = 5 } = req.query;
  
  try {
    const mockRecommendations = [
      {
        studyId: 'NCT33333333',
        title: 'Precision Medicine Initiative for Advanced Cancers',
        recommendationScore: 98,
        reasons: [
          'Perfect match for cancer type and stage',
          'Genomic profile aligns with study requirements',
          'Location within preferred travel distance',
          'Study timeline matches patient availability'
        ],
        urgency: 'high',
        enrollmentDeadline: '2024-12-31',
        estimatedBenefit: 'High potential for improved outcomes based on biomarker profile'
      },
      {
        studyId: 'NCT44444444',
        title: 'Quality of Life Assessment in Cancer Survivors',
        recommendationScore: 85,
        reasons: [
          'Matches survivorship status',
          'Minimal time commitment required',
          'Contributes to important research'
        ],
        urgency: 'medium',
        enrollmentDeadline: '2025-03-15',
        estimatedBenefit: 'Opportunity to help future patients while receiving additional care coordination'
      }
    ];

    const limitedRecommendations = mockRecommendations.slice(0, parseInt(limit));

    res.json({
      success: true,
      patientId,
      recommendations: limitedRecommendations,
      totalAvailable: mockRecommendations.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
}));

export default router;