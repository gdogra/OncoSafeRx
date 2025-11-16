/**
 * Researcher Features Service
 * Comprehensive clinical research and biomarker discovery platform
 * OncoSafeRx - Generated 2024-11-08
 */

import supabaseService from '../config/supabase.js';

class ResearcherFeaturesService {
  constructor() {
    if (!supabaseService || !supabaseService.enabled) {
      console.warn('⚠️ Supabase service not available, using demo mode');
      this.supabase = null;
    } else {
      this.supabase = supabaseService.supabase;
    }
  }

  // =============================================
  // 1. CLINICAL TRIAL MANAGEMENT
  // =============================================

  async createClinicalTrial(principalInvestigatorId, trialData) {
    try {
      const { data, error } = await this.supabase
        .from('clinical_trials')
        .insert({
          principal_investigator_id: principalInvestigatorId,
          trial_identifier: await this.generateTrialIdentifier(),
          ...trialData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating clinical trial:', error);
      throw error;
    }
  }

  async getClinicalTrials(principalInvestigatorId, filters = {}) {
    try {
      let query = this.supabase
        .from('clinical_trials')
        .select('*')
        .eq('principal_investigator_id', principalInvestigatorId);

      if (filters.study_status) {
        query = query.eq('study_status', filters.study_status);
      }
      if (filters.cancer_type) {
        query = query.eq('cancer_type', filters.cancer_type);
      }
      if (filters.study_phase) {
        query = query.eq('study_phase', filters.study_phase);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching clinical trials:', error);
      throw error;
    }
  }

  async enrollPatientInTrial(trialId, patientData) {
    try {
      // Check enrollment capacity
      const { data: trial } = await this.supabase
        .from('clinical_trials')
        .select('target_enrollment, current_enrollment')
        .eq('id', trialId)
        .single();

      if (trial && trial.current_enrollment >= trial.target_enrollment) {
        throw new Error('Trial has reached target enrollment');
      }

      // Create enrollment record
      const { data, error } = await this.supabase
        .from('trial_enrollments')
        .insert({
          trial_id: trialId,
          study_id: await this.generateStudyId(trialId),
          screening_number: await this.generateScreeningNumber(trialId),
          ...patientData
        })
        .select()
        .single();

      if (error) throw error;

      // Update trial enrollment count
      await this.supabase
        .from('clinical_trials')
        .update({ 
          current_enrollment: (trial.current_enrollment || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', trialId);

      return data;
    } catch (error) {
      console.error('Error enrolling patient in trial:', error);
      throw error;
    }
  }

  async updateTrialEnrollment(enrollmentId, updateData) {
    try {
      const { data, error } = await this.supabase
        .from('trial_enrollments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating trial enrollment:', error);
      throw error;
    }
  }

  async getTrialEnrollments(trialId, filters = {}) {
    try {
      let query = this.supabase
        .from('trial_enrollments')
        .select('*')
        .eq('trial_id', trialId);

      if (filters.enrollment_status) {
        query = query.eq('enrollment_status', filters.enrollment_status);
      }
      if (filters.treatment_arm) {
        query = query.eq('treatment_arm', filters.treatment_arm);
      }

      const { data, error } = await query.order('enrollment_date', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching trial enrollments:', error);
      throw error;
    }
  }

  async generateTrialAnalytics(trialId) {
    try {
      const [enrollmentsResult, trialResult] = await Promise.all([
        this.supabase
          .from('trial_enrollments')
          .select('*')
          .eq('trial_id', trialId),
        this.supabase
          .from('clinical_trials')
          .select('*')
          .eq('id', trialId)
          .single()
      ]);

      const enrollments = enrollmentsResult.data || [];
      const trial = trialResult.data;

      const analytics = {
        enrollment_summary: {
          target_enrollment: trial.target_enrollment,
          current_enrollment: enrollments.length,
          enrollment_rate: this.calculateEnrollmentRate(enrollments, trial.enrollment_start_date),
          projected_completion: this.calculateProjectedCompletion(enrollments, trial.target_enrollment)
        },
        
        demographics: this.analyzePatientDemographics(enrollments),
        
        treatment_arms: this.analyzeTreatmentArms(enrollments),
        
        retention: {
          active_patients: enrollments.filter(e => e.enrollment_status === 'enrolled').length,
          completed_patients: enrollments.filter(e => e.enrollment_status === 'completed').length,
          discontinued_patients: enrollments.filter(e => e.enrollment_status === 'discontinued').length,
          dropout_rate: this.calculateDropoutRate(enrollments)
        },
        
        safety: this.analyzeSafetyData(enrollments),
        
        efficacy: this.analyzeEfficacyData(enrollments),
        
        protocol_deviations: this.analyzeProtocolDeviations(enrollments),
        
        site_performance: this.analyzeSitePerformance(enrollments),
        
        data_completeness: this.analyzeDataCompleteness(enrollments)
      };

      return analytics;
    } catch (error) {
      console.error('Error generating trial analytics:', error);
      throw error;
    }
  }

  // =============================================
  // 2. BIOMARKER DISCOVERY & ANALYSIS
  // =============================================

  async createBiomarkerStudy(principalInvestigatorId, studyData) {
    try {
      const { data, error } = await this.supabase
        .from('biomarker_studies')
        .insert({
          principal_investigator_id: principalInvestigatorId,
          ...studyData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating biomarker study:', error);
      throw error;
    }
  }

  async addBiomarkerSample(studyId, sampleData) {
    try {
      const sampleId = await this.generateSampleId(studyId);
      
      const { data, error } = await this.supabase
        .from('biomarker_samples')
        .insert({
          study_id: studyId,
          sample_id: sampleId,
          ...sampleData
        })
        .select()
        .single();

      if (error) throw error;

      // Update study sample count
      await this.updateStudySampleCount(studyId);

      return data;
    } catch (error) {
      console.error('Error adding biomarker sample:', error);
      throw error;
    }
  }

  async updateSampleAnalysis(sampleId, analysisData) {
    try {
      const { data, error } = await this.supabase
        .from('biomarker_samples')
        .update({
          ...analysisData,
          analysis_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('sample_id', sampleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating sample analysis:', error);
      throw error;
    }
  }

  async performBiomarkerDiscovery(studyId, analysisParameters) {
    try {
      // Get all analyzed samples for the study
      const { data: samples } = await this.supabase
        .from('biomarker_samples')
        .select('*')
        .eq('study_id', studyId)
        .eq('analysis_status', 'completed');

      if (!samples || samples.length < 10) {
        throw new Error('Insufficient samples for biomarker discovery analysis');
      }

      // Perform statistical analysis
      const discoveryResults = {
        total_samples_analyzed: samples.length,
        significant_biomarkers: await this.identifySignificantBiomarkers(samples, analysisParameters),
        pathway_analysis: await this.performPathwayAnalysis(samples),
        survival_analysis: await this.performSurvivalAnalysis(samples),
        predictive_models: await this.buildPredictiveModels(samples),
        validation_recommendations: this.generateValidationRecommendations(samples),
        clinical_relevance: await this.assessClinicalRelevance(samples)
      };

      return discoveryResults;
    } catch (error) {
      console.error('Error performing biomarker discovery:', error);
      throw error;
    }
  }

  async identifySignificantBiomarkers(samples, parameters) {
    // Simplified biomarker significance analysis
    const biomarkers = [];
    const threshold = parameters.significance_threshold || 0.05;

    // Mock analysis - in production, this would use real statistical methods
    const mockBiomarkers = [
      { name: 'TP53', p_value: 0.001, fold_change: 2.5, sample_frequency: 0.75 },
      { name: 'KRAS', p_value: 0.023, fold_change: -1.8, sample_frequency: 0.45 },
      { name: 'EGFR', p_value: 0.008, fold_change: 3.2, sample_frequency: 0.60 }
    ];

    return mockBiomarkers.filter(b => b.p_value < threshold);
  }

  // =============================================
  // 3. REAL-WORLD EVIDENCE STUDIES
  // =============================================

  async createRWEStudy(principalInvestigatorId, studyData) {
    try {
      const { data, error } = await this.supabase
        .from('rwe_studies')
        .insert({
          principal_investigator_id: principalInvestigatorId,
          study_status: 'protocol_development',
          ...studyData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating RWE study:', error);
      throw error;
    }
  }

  async addRWEDataPoint(studyId, patientData) {
    try {
      const { data, error } = await this.supabase
        .from('rwe_data_points')
        .insert({
          study_id: studyId,
          patient_identifier: this.generateAnonymizedId(),
          data_extraction_date: new Date().toISOString().split('T')[0],
          ...patientData
        })
        .select()
        .single();

      if (error) throw error;

      // Update study sample size
      await this.updateRWEStudySampleSize(studyId);

      return data;
    } catch (error) {
      console.error('Error adding RWE data point:', error);
      throw error;
    }
  }

  async analyzeRWEData(studyId) {
    try {
      const { data: dataPoints } = await this.supabase
        .from('rwe_data_points')
        .select('*')
        .eq('study_id', studyId);

      if (!dataPoints || dataPoints.length === 0) {
        throw new Error('No data points available for analysis');
      }

      const analysis = {
        sample_characteristics: this.analyzeRWESampleCharacteristics(dataPoints),
        treatment_patterns: this.analyzeRWETreatmentPatterns(dataPoints),
        outcomes_analysis: this.analyzeRWEOutcomes(dataPoints),
        survival_analysis: this.performRWESurvivalAnalysis(dataPoints),
        healthcare_utilization: this.analyzeHealthcareUtilization(dataPoints),
        cost_analysis: this.analyzeCostData(dataPoints),
        quality_of_life: this.analyzeQualityOfLife(dataPoints),
        comparative_effectiveness: this.performComparativeEffectivenessAnalysis(dataPoints),
        subgroup_analysis: this.performSubgroupAnalysis(dataPoints),
        data_quality_metrics: this.assessRWEDataQuality(dataPoints)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing RWE data:', error);
      throw error;
    }
  }

  // =============================================
  // 4. RESEARCH COLLABORATION
  // =============================================

  async createResearchCollaboration(leadInvestigatorId, collaborationData) {
    try {
      const { data, error } = await this.supabase
        .from('research_collaborations')
        .insert({
          lead_investigator_id: leadInvestigatorId,
          established_date: new Date().toISOString().split('T')[0],
          ...collaborationData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating research collaboration:', error);
      throw error;
    }
  }

  async addCollaborationProject(collaborationId, projectData) {
    try {
      const { data, error } = await this.supabase
        .from('collaboration_projects')
        .insert({
          collaboration_id: collaborationId,
          start_date: new Date().toISOString().split('T')[0],
          ...projectData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding collaboration project:', error);
      throw error;
    }
  }

  async getCollaborationAnalytics(collaborationId) {
    try {
      const [collaborationResult, projectsResult] = await Promise.all([
        this.supabase
          .from('research_collaborations')
          .select('*')
          .eq('id', collaborationId)
          .single(),
        this.supabase
          .from('collaboration_projects')
          .select('*')
          .eq('collaboration_id', collaborationId)
      ]);

      const collaboration = collaborationResult.data;
      const projects = projectsResult.data || [];

      return {
        collaboration_overview: collaboration,
        project_portfolio: {
          total_projects: projects.length,
          active_projects: projects.filter(p => p.project_status === 'active').length,
          completed_projects: projects.filter(p => p.project_status === 'completed').length,
          total_budget: projects.reduce((sum, p) => sum + (p.budget_allocation || 0), 0)
        },
        site_participation: this.analyzeSiteParticipation(collaboration, projects),
        productivity_metrics: this.calculateCollaborationProductivity(projects),
        impact_assessment: this.assessCollaborationImpact(collaboration, projects)
      };
    } catch (error) {
      console.error('Error generating collaboration analytics:', error);
      throw error;
    }
  }

  // =============================================
  // 5. REGULATORY COMPLIANCE
  // =============================================

  async createRegulatorySubmission(submissionData) {
    try {
      const { data, error } = await this.supabase
        .from('regulatory_submissions')
        .insert({
          submission_date: new Date().toISOString().split('T')[0],
          ...submissionData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating regulatory submission:', error);
      throw error;
    }
  }

  async reportAdverseEvent(eventData) {
    try {
      const { data, error } = await this.supabase
        .from('adverse_event_reports')
        .insert({
          onset_date: eventData.onset_date || new Date().toISOString().split('T')[0],
          regulatory_reporting_required: this.assessRegulatoryReportingRequirement(eventData),
          ...eventData
        })
        .select()
        .single();
      
      if (error) throw error;

      // Check if regulatory reporting is required
      if (data.regulatory_reporting_required) {
        await this.initiateRegulatoryReporting(data);
      }

      return data;
    } catch (error) {
      console.error('Error reporting adverse event:', error);
      throw error;
    }
  }

  async generateComplianceReport(studyId, studyType) {
    try {
      const [submissionsResult, adverseEventsResult] = await Promise.all([
        this.supabase
          .from('regulatory_submissions')
          .select('*')
          .eq('study_id', studyId)
          .eq('study_type', studyType),
        this.supabase
          .from('adverse_event_reports')
          .select('*')
          .eq('study_id', studyId)
          .eq('study_type', studyType)
      ]);

      const submissions = submissionsResult.data || [];
      const adverseEvents = adverseEventsResult.data || [];

      return {
        regulatory_status: {
          total_submissions: submissions.length,
          approved_submissions: submissions.filter(s => s.submission_status === 'approved').length,
          pending_submissions: submissions.filter(s => s.submission_status === 'under_review').length,
          expired_approvals: submissions.filter(s => 
            s.expiration_date && new Date(s.expiration_date) < new Date()
          ).length
        },
        safety_overview: {
          total_adverse_events: adverseEvents.length,
          serious_adverse_events: adverseEvents.filter(e => e.seriousness === 'serious').length,
          regulatory_reports_submitted: adverseEvents.filter(e => 
            e.regulatory_reports_submitted && Object.keys(e.regulatory_reports_submitted).length > 0
          ).length,
          pending_reports: adverseEvents.filter(e => 
            e.regulatory_reporting_required && !e.regulatory_reports_submitted
          ).length
        },
        compliance_score: this.calculateComplianceScore(submissions, adverseEvents),
        upcoming_deadlines: this.getUpcomingComplianceDeadlines(submissions),
        recommendations: this.generateComplianceRecommendations(submissions, adverseEvents)
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  // =============================================
  // 6. LITERATURE & KNOWLEDGE MANAGEMENT
  // =============================================

  async addLiteratureReference(userId, referenceData) {
    try {
      const { data, error } = await this.supabase
        .from('research_literature')
        .insert({
          added_by_user_id: userId,
          relevance_score: await this.calculateRelevanceScore(referenceData),
          ...referenceData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding literature reference:', error);
      throw error;
    }
  }

  async searchLiterature(searchParams) {
    try {
      let query = this.supabase.from('research_literature').select('*');

      if (searchParams.keywords) {
        query = query.textSearch('title,abstract', searchParams.keywords.join(' '));
      }
      if (searchParams.cancer_types) {
        query = query.overlaps('cancer_types', searchParams.cancer_types);
      }
      if (searchParams.research_topics) {
        query = query.overlaps('research_topics', searchParams.research_topics);
      }
      if (searchParams.publication_date_from) {
        query = query.gte('publication_date', searchParams.publication_date_from);
      }
      if (searchParams.publication_date_to) {
        query = query.lte('publication_date', searchParams.publication_date_to);
      }

      const { data, error } = await query
        .order('relevance_score', { ascending: false })
        .limit(searchParams.limit || 50);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching literature:', error);
      throw error;
    }
  }

  async createSystematicReview(leadReviewerId, reviewData) {
    try {
      const { data, error } = await this.supabase
        .from('systematic_reviews')
        .insert({
          lead_reviewer_id: leadReviewerId,
          review_status: 'protocol',
          ...reviewData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating systematic review:', error);
      throw error;
    }
  }

  // =============================================
  // 7. GRANT & FUNDING MANAGEMENT
  // =============================================

  async createResearchGrant(principalInvestigatorId, grantData) {
    try {
      const { data, error } = await this.supabase
        .from('research_grants')
        .insert({
          principal_investigator_id: principalInvestigatorId,
          ...grantData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating research grant:', error);
      throw error;
    }
  }

  async addResearchPublication(correspondingAuthorId, publicationData) {
    try {
      const { data, error } = await this.supabase
        .from('research_publications')
        .insert({
          corresponding_author_id: correspondingAuthorId,
          ...publicationData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding research publication:', error);
      throw error;
    }
  }

  async generateFundingAnalytics(researcherId) {
    try {
      const [grantsResult, publicationsResult] = await Promise.all([
        this.supabase
          .from('research_grants')
          .select('*')
          .or(`principal_investigator_id.eq.${researcherId},co_investigators.cs.{${researcherId}}`),
        this.supabase
          .from('research_publications')
          .select('*')
          .eq('corresponding_author_id', researcherId)
      ]);

      const grants = grantsResult.data || [];
      const publications = publicationsResult.data || [];

      return {
        funding_overview: {
          total_grants: grants.length,
          active_grants: grants.filter(g => g.grant_status === 'funded').length,
          total_funding: grants.reduce((sum, g) => sum + (g.total_budget || 0), 0),
          funding_success_rate: this.calculateFundingSuccessRate(grants)
        },
        publication_metrics: {
          total_publications: publications.length,
          recent_publications: publications.filter(p => 
            new Date(p.publication_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          ).length,
          high_impact_publications: publications.filter(p => 
            p.journal_impact_factor && p.journal_impact_factor > 10
          ).length,
          total_citations: publications.reduce((sum, p) => 
            sum + (p.citation_metrics?.total_citations || 0), 0)
          },
        productivity_trends: this.analyzeProductivityTrends(grants, publications),
        impact_metrics: this.calculateResearchImpactMetrics(publications),
        collaboration_network: this.analyzeCollaborationNetwork(grants, publications)
      };
    } catch (error) {
      console.error('Error generating funding analytics:', error);
      throw error;
    }
  }

  // =============================================
  // 8. RESEARCH DASHBOARD
  // =============================================

  async getResearcherDashboard(researcherId) {
    try {
      const [
        activeTrials,
        biomarkerStudies,
        rweStudies,
        recentPublications,
        activeGrants,
        collaborations,
        complianceStatus,
        researchMetrics
      ] = await Promise.allSettled([
        this.getClinicalTrials(researcherId, { study_status: 'recruiting' }),
        this.getBiomarkerStudies(researcherId, { study_status: 'active' }),
        this.getRWEStudies(researcherId, { study_status: 'active' }),
        this.getRecentPublications(researcherId),
        this.getActiveGrants(researcherId),
        this.getResearchCollaborations(researcherId),
        this.getComplianceStatus(researcherId),
        this.getResearchMetrics(researcherId)
      ]);

      return {
        active_studies: {
          clinical_trials: activeTrials.status === 'fulfilled' ? activeTrials.value : [],
          biomarker_studies: biomarkerStudies.status === 'fulfilled' ? biomarkerStudies.value : [],
          rwe_studies: rweStudies.status === 'fulfilled' ? rweStudies.value : []
        },
        
        recent_activity: {
          publications: recentPublications.status === 'fulfilled' ? recentPublications.value : [],
          grants: activeGrants.status === 'fulfilled' ? activeGrants.value : [],
          collaborations: collaborations.status === 'fulfilled' ? collaborations.value : []
        },
        
        compliance_overview: complianceStatus.status === 'fulfilled' ? complianceStatus.value : {},
        
        performance_metrics: researchMetrics.status === 'fulfilled' ? researchMetrics.value : {},
        
        alerts: await this.getResearchAlerts(researcherId),
        
        recommendations: await this.generateResearchRecommendations(researcherId)
      };
    } catch (error) {
      console.error('Error generating researcher dashboard:', error);
      throw error;
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  async generateTrialIdentifier() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6);
    return `OSR-${timestamp}-${random}`.toUpperCase();
  }

  async generateStudyId(trialId) {
    const { data: enrollments } = await this.supabase
      .from('trial_enrollments')
      .select('study_id')
      .eq('trial_id', trialId);
    
    const count = (enrollments?.length || 0) + 1;
    return `S${count.toString().padStart(4, '0')}`;
  }

  async generateScreeningNumber(trialId) {
    const { data: enrollments } = await this.supabase
      .from('trial_enrollments')
      .select('screening_number')
      .eq('trial_id', trialId);
    
    const count = (enrollments?.length || 0) + 1;
    return `SCR${count.toString().padStart(4, '0')}`;
  }

  async generateSampleId(studyId) {
    const { data: samples } = await this.supabase
      .from('biomarker_samples')
      .select('sample_id')
      .eq('study_id', studyId);
    
    const count = (samples?.length || 0) + 1;
    return `BIO${studyId.slice(-4)}${count.toString().padStart(4, '0')}`;
  }

  generateAnonymizedId() {
    return 'ANON-' + Math.random().toString(36).substring(2, 12).toUpperCase();
  }

  calculateEnrollmentRate(enrollments, startDate) {
    if (!startDate || enrollments.length === 0) return 0;
    
    const monthsSinceStart = (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30);
    return monthsSinceStart > 0 ? enrollments.length / monthsSinceStart : 0;
  }

  calculateProjectedCompletion(enrollments, targetEnrollment) {
    if (enrollments.length === 0) return null;
    
    const rate = this.calculateEnrollmentRate(enrollments);
    if (rate <= 0) return null;
    
    const remainingPatients = targetEnrollment - enrollments.length;
    const monthsToCompletion = remainingPatients / rate;
    
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsToCompletion);
    
    return completionDate.toISOString().split('T')[0];
  }

  analyzePatientDemographics(enrollments) {
    const demographics = {
      total_enrolled: enrollments.length,
      gender_distribution: {},
      age_distribution: {},
      ethnicity_distribution: {}
    };

    enrollments.forEach(enrollment => {
      const baseline = enrollment.baseline_characteristics || {};
      
      // Gender analysis
      if (baseline.gender) {
        demographics.gender_distribution[baseline.gender] = 
          (demographics.gender_distribution[baseline.gender] || 0) + 1;
      }
      
      // Age analysis
      if (baseline.age) {
        const ageGroup = this.getAgeGroup(baseline.age);
        demographics.age_distribution[ageGroup] = 
          (demographics.age_distribution[ageGroup] || 0) + 1;
      }
    });

    return demographics;
  }

  getAgeGroup(age) {
    if (age < 30) return '18-29';
    if (age < 50) return '30-49';
    if (age < 65) return '50-64';
    if (age < 75) return '65-74';
    return '75+';
  }

  analyzeTreatmentArms(enrollments) {
    const arms = {};
    
    enrollments.forEach(enrollment => {
      if (enrollment.treatment_arm) {
        arms[enrollment.treatment_arm] = (arms[enrollment.treatment_arm] || 0) + 1;
      }
    });
    
    return arms;
  }

  calculateDropoutRate(enrollments) {
    if (enrollments.length === 0) return 0;
    
    const discontinued = enrollments.filter(e => e.enrollment_status === 'discontinued').length;
    return (discontinued / enrollments.length) * 100;
  }

  analyzeSafetyData(enrollments) {
    let totalAEs = 0;
    let seriousAEs = 0;
    
    enrollments.forEach(enrollment => {
      const aes = enrollment.adverse_events || [];
      totalAEs += aes.length;
      seriousAEs += aes.filter(ae => ae.serious === true).length;
    });
    
    return {
      total_adverse_events: totalAEs,
      serious_adverse_events: seriousAEs,
      ae_rate_per_patient: enrollments.length > 0 ? totalAEs / enrollments.length : 0
    };
  }

  analyzeEfficacyData(enrollments) {
    const responses = {};
    
    enrollments.forEach(enrollment => {
      const primaryEndpoint = enrollment.primary_endpoint_data;
      if (primaryEndpoint && primaryEndpoint.response) {
        responses[primaryEndpoint.response] = (responses[primaryEndpoint.response] || 0) + 1;
      }
    });
    
    return responses;
  }

  analyzeProtocolDeviations(enrollments) {
    let totalDeviations = 0;
    const deviationTypes = {};
    
    enrollments.forEach(enrollment => {
      const deviations = enrollment.protocol_deviations || [];
      totalDeviations += deviations.length;
      
      deviations.forEach(deviation => {
        if (deviation.type) {
          deviationTypes[deviation.type] = (deviationTypes[deviation.type] || 0) + 1;
        }
      });
    });
    
    return {
      total_deviations: totalDeviations,
      deviation_types: deviationTypes,
      deviation_rate: enrollments.length > 0 ? totalDeviations / enrollments.length : 0
    };
  }

  analyzeSitePerformance(enrollments) {
    // Mock site performance analysis
    return {
      total_sites: 5,
      top_enrolling_site: 'Site A',
      enrollment_by_site: {
        'Site A': 45,
        'Site B': 32,
        'Site C': 28,
        'Site D': 21,
        'Site E': 15
      }
    };
  }

  analyzeDataCompleteness(enrollments) {
    if (enrollments.length === 0) return 0;
    
    let totalCompleteness = 0;
    
    enrollments.forEach(enrollment => {
      const requiredFields = ['baseline_characteristics', 'primary_endpoint_data'];
      const completedFields = requiredFields.filter(field => 
        enrollment[field] && Object.keys(enrollment[field]).length > 0
      );
      
      totalCompleteness += completedFields.length / requiredFields.length;
    });
    
    return (totalCompleteness / enrollments.length) * 100;
  }

  async updateStudySampleCount(studyId) {
    const { data: samples } = await this.supabase
      .from('biomarker_samples')
      .select('id')
      .eq('study_id', studyId);
    
    await this.supabase
      .from('biomarker_studies')
      .update({ samples_analyzed: samples?.length || 0 })
      .eq('id', studyId);
  }

  async performPathwayAnalysis(samples) {
    // Mock pathway analysis
    return {
      enriched_pathways: [
        { pathway: 'p53 signaling', p_value: 0.001, gene_count: 15 },
        { pathway: 'Cell cycle', p_value: 0.005, gene_count: 23 },
        { pathway: 'Apoptosis', p_value: 0.012, gene_count: 18 }
      ]
    };
  }

  async performSurvivalAnalysis(samples) {
    // Mock survival analysis
    return {
      median_survival_days: 456,
      hazard_ratio: 0.68,
      confidence_interval: [0.45, 1.02],
      p_value: 0.045
    };
  }

  async buildPredictiveModels(samples) {
    // Mock predictive modeling
    return {
      model_type: 'Random Forest',
      accuracy: 0.78,
      sensitivity: 0.82,
      specificity: 0.74,
      auc: 0.83,
      feature_importance: [
        { feature: 'TP53_mutation', importance: 0.25 },
        { feature: 'Age', importance: 0.18 },
        { feature: 'Stage', importance: 0.15 }
      ]
    };
  }

  generateValidationRecommendations(samples) {
    return [
      'Validate findings in independent cohort of 200+ patients',
      'Perform prospective validation study',
      'Consider multi-institutional validation',
      'Develop clinical-grade assay for biomarker detection'
    ];
  }

  async assessClinicalRelevance(samples) {
    return {
      clinical_utility: 'High - could guide treatment selection',
      implementation_feasibility: 'Medium - requires specialized testing',
      cost_effectiveness: 'Likely cost-effective given improved outcomes',
      regulatory_pathway: 'Companion diagnostic development recommended'
    };
  }

  calculateRelevanceScore(referenceData) {
    // Simple relevance scoring algorithm
    let score = 50; // base score
    
    if (referenceData.impact_factor > 10) score += 20;
    else if (referenceData.impact_factor > 5) score += 10;
    
    if (referenceData.study_design === 'randomized_controlled_trial') score += 15;
    else if (referenceData.study_design === 'cohort') score += 10;
    
    if (referenceData.sample_size > 1000) score += 10;
    else if (referenceData.sample_size > 100) score += 5;
    
    return Math.min(100, score);
  }

  assessRegulatoryReportingRequirement(eventData) {
    return eventData.seriousness === 'serious' && 
           eventData.relationship_to_treatment !== 'unrelated' &&
           eventData.expectedness === 'unexpected';
  }

  async initiateRegulatoryReporting(adverseEvent) {
    // Mock regulatory reporting initiation
    console.log('Initiating regulatory reporting for serious adverse event:', adverseEvent.id);
    
    const reportData = {
      fda_medwatch: {
        initiated: true,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days
      }
    };
    
    await this.supabase
      .from('adverse_event_reports')
      .update({ regulatory_reports_submitted: reportData })
      .eq('id', adverseEvent.id);
  }

  calculateComplianceScore(submissions, adverseEvents) {
    let score = 100;
    
    // Deduct points for expired approvals
    const expiredApprovals = submissions.filter(s => 
      s.expiration_date && new Date(s.expiration_date) < new Date()
    ).length;
    score -= expiredApprovals * 10;
    
    // Deduct points for late adverse event reports
    const lateReports = adverseEvents.filter(ae => 
      ae.regulatory_reporting_required && !ae.regulatory_reports_submitted
    ).length;
    score -= lateReports * 15;
    
    return Math.max(0, score);
  }

  getUpcomingComplianceDeadlines(submissions) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return submissions.filter(s => 
      s.expiration_date && 
      new Date(s.expiration_date) > now &&
      new Date(s.expiration_date) <= thirtyDaysFromNow
    ).map(s => ({
      submission_type: s.submission_type,
      expiration_date: s.expiration_date,
      days_remaining: Math.ceil((new Date(s.expiration_date) - now) / (24 * 60 * 60 * 1000))
    }));
  }

  generateComplianceRecommendations(submissions, adverseEvents) {
    const recommendations = [];
    
    const expiredApprovals = submissions.filter(s => 
      s.expiration_date && new Date(s.expiration_date) < new Date()
    );
    
    if (expiredApprovals.length > 0) {
      recommendations.push('Renew expired regulatory approvals immediately');
    }
    
    const pendingAEReports = adverseEvents.filter(ae => 
      ae.regulatory_reporting_required && !ae.regulatory_reports_submitted
    );
    
    if (pendingAEReports.length > 0) {
      recommendations.push('Submit overdue adverse event reports to regulatory authorities');
    }
    
    return recommendations;
  }

  async getResearchAlerts(researcherId) {
    // Mock research alerts
    return [
      {
        type: 'compliance',
        severity: 'high',
        message: 'IRB approval expires in 14 days',
        action_required: 'Submit renewal application'
      },
      {
        type: 'enrollment',
        severity: 'medium', 
        message: 'Trial enrollment below target by 15%',
        action_required: 'Review recruitment strategy'
      }
    ];
  }

  async generateResearchRecommendations(researcherId) {
    // Mock research recommendations
    return [
      {
        category: 'funding',
        recommendation: 'Apply for R01 grant renewal 6 months before expiration',
        priority: 'high'
      },
      {
        category: 'collaboration',
        recommendation: 'Consider international collaboration for larger patient cohort',
        priority: 'medium'
      }
    ];
  }
}

export default new ResearcherFeaturesService();