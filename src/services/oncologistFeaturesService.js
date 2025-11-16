/**
 * Oncologist Features Service
 * Comprehensive clinical workflow and decision support platform
 * OncoSafeRx - Generated 2024-11-08
 */

import supabaseService from '../config/supabase.js';

class OncologistFeaturesService {
  constructor() {
    if (!supabaseService || !supabaseService.enabled) {
      console.warn('⚠️ Supabase service not available, using demo mode');
      this.supabase = null;
    } else {
      this.supabase = supabaseService.supabase;
    }
  }

  // =============================================
  // 1. CLINICAL DECISION SUPPORT
  // =============================================

  async createClinicalProtocol(oncologistId, protocolData) {
    try {
      if (!this.supabase) {
        // Demo mode - return mock data
        return {
          id: 'demo_' + Date.now(),
          oncologist_id: oncologistId,
          ...protocolData,
          created_at: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('clinical_protocols')
        .insert({
          oncologist_id: oncologistId,
          ...protocolData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating clinical protocol:', error);
      throw error;
    }
  }

  async getClinicalProtocols(oncologistId, filters = {}) {
    try {
      let query = this.supabase
        .from('clinical_protocols')
        .select('*')
        .eq('oncologist_id', oncologistId)
        .eq('is_active', true);

      if (filters.cancer_type) {
        query = query.eq('cancer_type', filters.cancer_type);
      }
      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching clinical protocols:', error);
      throw error;
    }
  }

  async getClinicalDecisionSupport(patientData, treatmentContext) {
    try {
      // Get relevant protocols based on patient characteristics
      const { data: protocols, error: protocolError } = await this.supabase
        .from('clinical_protocols')
        .select('*')
        .eq('cancer_type', patientData.cancer_type)
        .eq('stage', patientData.stage)
        .eq('is_active', true)
        .order('evidence_level');

      if (protocolError) throw protocolError;

      // Get applicable decision rules and alerts
      const { data: rules, error: rulesError } = await this.supabase
        .from('clinical_decision_rules')
        .select('*')
        .eq('is_active', true);

      if (rulesError) throw rulesError;

      // Analyze patient against decision rules
      const triggeredAlerts = this.evaluateDecisionRules(rules, patientData, treatmentContext);
      
      return {
        recommended_protocols: protocols.slice(0, 3), // Top 3 recommendations
        clinical_alerts: triggeredAlerts,
        evidence_summary: this.generateEvidenceSummary(protocols),
        risk_assessment: this.calculateRiskScore(patientData)
      };
    } catch (error) {
      console.error('Error generating clinical decision support:', error);
      throw error;
    }
  }

  evaluateDecisionRules(rules, patientData, treatmentContext) {
    const triggeredAlerts = [];
    
    for (const rule of rules) {
      try {
        const conditions = rule.trigger_conditions;
        let isTriggered = false;

        // Evaluate various rule conditions
        if (conditions.age_range && patientData.age) {
          isTriggered = patientData.age >= conditions.age_range.min && 
                       patientData.age <= conditions.age_range.max;
        }
        
        if (conditions.contraindicated_drugs && treatmentContext.current_medications) {
          isTriggered = conditions.contraindicated_drugs.some(drug => 
            treatmentContext.current_medications.includes(drug)
          );
        }

        if (isTriggered) {
          triggeredAlerts.push({
            id: rule.id,
            severity: rule.severity,
            message: rule.alert_message,
            recommended_actions: rule.recommended_actions,
            rule_type: rule.condition_type
          });
        }
      } catch (error) {
        console.warn('Error evaluating decision rule:', rule.id, error);
      }
    }

    return triggeredAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  generateEvidenceSummary(protocols) {
    if (!protocols.length) return null;
    
    const evidenceLevels = protocols.reduce((acc, protocol) => {
      acc[protocol.evidence_level] = (acc[protocol.evidence_level] || 0) + 1;
      return acc;
    }, {});

    return {
      total_protocols: protocols.length,
      evidence_distribution: evidenceLevels,
      highest_evidence: protocols[0]?.evidence_level,
      average_success_rate: protocols.reduce((sum, p) => sum + (p.success_rate || 0), 0) / protocols.length
    };
  }

  calculateRiskScore(patientData) {
    let riskScore = 0;
    const riskFactors = [];

    // Age factor
    if (patientData.age > 70) {
      riskScore += 2;
      riskFactors.push('Advanced age');
    }

    // Performance status
    if (patientData.performance_status > 2) {
      riskScore += 3;
      riskFactors.push('Poor performance status');
    }

    // Comorbidities
    if (patientData.comorbidities && patientData.comorbidities.length > 2) {
      riskScore += 2;
      riskFactors.push('Multiple comorbidities');
    }

    // Stage
    if (patientData.stage && patientData.stage.includes('IV')) {
      riskScore += 3;
      riskFactors.push('Advanced stage disease');
    }

    const riskLevel = riskScore <= 2 ? 'low' : 
                     riskScore <= 5 ? 'medium' : 
                     riskScore <= 8 ? 'high' : 'critical';

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_factors: riskFactors,
      max_score: 10
    };
  }

  // =============================================
  // 2. PATIENT POPULATION MANAGEMENT
  // =============================================

  async getOncologistPatients(oncologistId, filters = {}) {
    try {
      let query = this.supabase
        .from('oncologist_patients')
        .select(`
          *,
          patient:patient_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq('oncologist_id', oncologistId);

      if (filters.treatment_status) {
        query = query.eq('treatment_status', filters.treatment_status);
      }
      if (filters.risk_level) {
        query = query.eq('risk_level', filters.risk_level);
      }

      const { data, error } = await query.order('next_appointment', { ascending: true });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching oncologist patients:', error);
      throw error;
    }
  }

  async assignPatientToOncologist(oncologistId, patientData) {
    try {
      const { data, error } = await this.supabase
        .from('oncologist_patients')
        .insert({
          oncologist_id: oncologistId,
          patient_id: patientData.patient_id,
          primary_diagnosis: patientData.primary_diagnosis,
          cancer_stage: patientData.cancer_stage,
          date_of_diagnosis: patientData.date_of_diagnosis,
          treatment_status: patientData.treatment_status || 'active',
          risk_level: patientData.risk_level || 'medium'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error assigning patient:', error);
      throw error;
    }
  }

  async updatePatientStatus(oncologistId, patientId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('oncologist_patients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('oncologist_id', oncologistId)
        .eq('patient_id', patientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient status:', error);
      throw error;
    }
  }

  async getPatientCaseloadSummary(oncologistId) {
    try {
      const { data: patients, error } = await this.supabase
        .from('oncologist_patients')
        .select('treatment_status, risk_level, cancer_stage')
        .eq('oncologist_id', oncologistId);

      if (error) throw error;

      const summary = {
        total_patients: patients.length,
        by_status: {},
        by_risk: {},
        by_stage: {},
        high_priority_count: 0
      };

      patients.forEach(patient => {
        summary.by_status[patient.treatment_status] = 
          (summary.by_status[patient.treatment_status] || 0) + 1;
        
        summary.by_risk[patient.risk_level] = 
          (summary.by_risk[patient.risk_level] || 0) + 1;
        
        if (patient.cancer_stage) {
          summary.by_stage[patient.cancer_stage] = 
            (summary.by_stage[patient.cancer_stage] || 0) + 1;
        }

        if (patient.risk_level === 'high' || patient.risk_level === 'critical') {
          summary.high_priority_count++;
        }
      });

      return summary;
    } catch (error) {
      console.error('Error generating caseload summary:', error);
      throw error;
    }
  }

  // =============================================
  // 3. TREATMENT RESPONSE TRACKING
  // =============================================

  async recordTreatmentResponse(responseData) {
    try {
      const { data, error } = await this.supabase
        .from('treatment_responses')
        .insert(responseData)
        .select()
        .single();

      if (error) throw error;

      // Update treatment efficacy metrics
      await this.updateEfficacyMetrics(responseData);

      return data;
    } catch (error) {
      console.error('Error recording treatment response:', error);
      throw error;
    }
  }

  async getTreatmentResponses(patientId, oncologistId) {
    try {
      const { data, error } = await this.supabase
        .from('treatment_responses')
        .select('*')
        .eq('patient_id', patientId)
        .eq('oncologist_id', oncologistId)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching treatment responses:', error);
      throw error;
    }
  }

  async updateEfficacyMetrics(responseData) {
    try {
      // This would typically run as a background job
      // For now, we'll just log the need for metric updates
      console.log('Treatment efficacy metrics update needed for:', responseData.protocol_id);
      
      // In a full implementation, this would:
      // 1. Aggregate response data by protocol
      // 2. Calculate response rates, survival metrics
      // 3. Update the treatment_efficacy_metrics table
    } catch (error) {
      console.error('Error updating efficacy metrics:', error);
    }
  }

  async getTreatmentAnalytics(oncologistId, timeframe = '6 months') {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - (timeframe === '6 months' ? 6 : 12));

      const { data: responses, error } = await this.supabase
        .from('treatment_responses')
        .select('*')
        .eq('oncologist_id', oncologistId)
        .gte('assessment_date', startDate.toISOString().split('T')[0]);

      if (error) throw error;

      const analytics = {
        total_assessments: responses.length,
        response_rates: {},
        avg_quality_of_life: 0,
        toxicity_distribution: {}
      };

      let qolSum = 0;
      let qolCount = 0;

      responses.forEach(response => {
        // Response rate calculation
        const responseType = response.overall_response;
        analytics.response_rates[responseType] = 
          (analytics.response_rates[responseType] || 0) + 1;

        // Quality of life
        if (response.quality_of_life_score) {
          qolSum += response.quality_of_life_score;
          qolCount++;
        }

        // Toxicity tracking
        if (response.toxicity_grade) {
          analytics.toxicity_distribution[response.toxicity_grade] = 
            (analytics.toxicity_distribution[response.toxicity_grade] || 0) + 1;
        }
      });

      analytics.avg_quality_of_life = qolCount > 0 ? qolSum / qolCount : 0;

      return analytics;
    } catch (error) {
      console.error('Error generating treatment analytics:', error);
      throw error;
    }
  }

  // =============================================
  // 4. CLINICAL DOCUMENTATION
  // =============================================

  async createClinicalNote(noteData) {
    try {
      const { data, error } = await this.supabase
        .from('clinical_notes')
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating clinical note:', error);
      throw error;
    }
  }

  async getClinicalNotes(patientId, oncologistId, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('clinical_notes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('oncologist_id', oncologistId)
        .order('visit_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching clinical notes:', error);
      throw error;
    }
  }

  async generateAINote(patientData, visitData, template) {
    try {
      // This would integrate with AI service for note generation
      const aiSuggestions = {
        chief_complaint: this.generateChiefComplaint(visitData),
        assessment: this.generateAssessment(patientData, visitData),
        plan: this.generateTreatmentPlan(patientData, visitData),
        billing_codes: this.suggestBillingCodes(visitData.note_type)
      };

      return aiSuggestions;
    } catch (error) {
      console.error('Error generating AI note:', error);
      throw error;
    }
  }

  generateChiefComplaint(visitData) {
    // Simple AI-like logic for demonstration
    if (visitData.symptoms) {
      return `Patient presents with ${visitData.symptoms.join(', ')}`;
    }
    return 'Follow-up visit for ongoing cancer treatment';
  }

  generateAssessment(patientData, visitData) {
    const assessment = [];
    
    if (patientData.primary_diagnosis) {
      assessment.push(`${patientData.primary_diagnosis}, ${patientData.cancer_stage || 'stage unknown'}`);
    }
    
    if (visitData.performance_status) {
      assessment.push(`ECOG PS ${visitData.performance_status}`);
    }
    
    if (visitData.treatment_response) {
      assessment.push(`Treatment response: ${visitData.treatment_response}`);
    }

    return assessment.join('. ') + '.';
  }

  generateTreatmentPlan(patientData, visitData) {
    const plans = [];
    
    plans.push('Continue current treatment regimen');
    
    if (visitData.next_imaging) {
      plans.push(`Next imaging: ${visitData.next_imaging}`);
    }
    
    plans.push('Return to clinic in 2-3 weeks');
    plans.push('Patient counseled on treatment side effects and when to call');

    return plans.join('. ') + '.';
  }

  suggestBillingCodes(noteType) {
    const codes = {
      'consultation': ['99243', '99244'],
      'follow_up': ['99213', '99214'],
      'procedure': ['96413', '96415'],
      'discharge': ['99238', '99239']
    };
    
    return codes[noteType] || ['99213'];
  }

  // =============================================
  // 5. TUMOR BOARD & MDT COORDINATION
  // =============================================

  async createTumorBoardCase(caseData) {
    try {
      const { data, error } = await this.supabase
        .from('tumor_board_cases')
        .insert(caseData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tumor board case:', error);
      throw error;
    }
  }

  async getTumorBoardCases(oncologistId, status = 'scheduled') {
    try {
      const { data, error } = await this.supabase
        .from('tumor_board_cases')
        .select('*')
        .or(`presenting_oncologist_id.eq.${oncologistId},attendees.cs.{${oncologistId}}`)
        .eq('status', status)
        .order('meeting_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tumor board cases:', error);
      throw error;
    }
  }

  async submitConsultationRequest(requestData) {
    try {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      throw error;
    }
  }

  // =============================================
  // 6. QUALITY METRICS & ANALYTICS
  // =============================================

  async getQualityMetrics(oncologistId, period = 'current_quarter') {
    try {
      const { data, error } = await this.supabase
        .from('quality_metrics')
        .select('*')
        .eq('oncologist_id', oncologistId)
        .order('measurement_period', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      throw error;
    }
  }

  async generatePracticeAnalytics(oncologistId) {
    try {
      // Get latest practice analytics
      const { data: analytics, error } = await this.supabase
        .from('practice_analytics')
        .select('*')
        .eq('oncologist_id', oncologistId)
        .order('measurement_date', { ascending: false })
        .limit(12); // Last 12 months

      if (error) throw error;

      // Calculate trends and insights
      const insights = {
        patient_volume_trend: this.calculateTrend(analytics, 'total_patients'),
        response_rate_trend: this.calculateTrend(analytics, 'treatment_response_rate'),
        satisfaction_trend: this.calculateTrend(analytics, 'patient_satisfaction_score'),
        efficiency_score: this.calculateEfficiencyScore(analytics[0] || {}),
        top_metrics: this.identifyTopMetrics(analytics)
      };

      return {
        current_metrics: analytics[0] || {},
        historical_data: analytics,
        insights,
        benchmark_comparison: await this.getBenchmarkComparison(oncologistId)
      };
    } catch (error) {
      console.error('Error generating practice analytics:', error);
      throw error;
    }
  }

  calculateTrend(data, metric) {
    if (data.length < 2) return 'insufficient_data';
    
    const recent = data[0][metric] || 0;
    const previous = data[1][metric] || 0;
    
    if (previous === 0) return 'no_baseline';
    
    const change = ((recent - previous) / previous) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  calculateEfficiencyScore(metrics) {
    // Simple efficiency calculation based on multiple factors
    let score = 0;
    let factors = 0;

    if (metrics.documentation_completion_rate) {
      score += metrics.documentation_completion_rate;
      factors++;
    }
    
    if (metrics.protocol_adherence_rate) {
      score += metrics.protocol_adherence_rate;
      factors++;
    }
    
    if (metrics.time_to_treatment_days) {
      // Lower is better, so invert
      score += Math.max(0, 100 - metrics.time_to_treatment_days);
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  identifyTopMetrics(analytics) {
    if (!analytics.length) return [];
    
    const latest = analytics[0];
    const topMetrics = [];

    if (latest.treatment_response_rate > 70) {
      topMetrics.push({
        metric: 'Treatment Response Rate',
        value: latest.treatment_response_rate,
        performance: 'excellent'
      });
    }

    if (latest.patient_satisfaction_score > 4.5) {
      topMetrics.push({
        metric: 'Patient Satisfaction',
        value: latest.patient_satisfaction_score,
        performance: 'excellent'
      });
    }

    return topMetrics;
  }

  async getBenchmarkComparison(oncologistId) {
    // In a real implementation, this would compare against peer benchmarks
    return {
      percentile_rank: 75,
      compared_to: 'specialty_peers',
      strong_areas: ['Patient Satisfaction', 'Protocol Adherence'],
      improvement_areas: ['Documentation Efficiency']
    };
  }

  // =============================================
  // 7. CLINICAL TRIAL INTEGRATION
  // =============================================

  async assessTrialEligibility(patientData, trialCriteria) {
    try {
      const assessment = {
        patient_id: patientData.patient_id,
        trial_id: trialCriteria.trial_id,
        eligibility_criteria: trialCriteria,
        patient_matches: {},
        eligibility_score: 0,
        major_exclusions: [],
        screening_required: []
      };

      // Evaluate inclusion criteria
      let matchedCriteria = 0;
      let totalCriteria = 0;

      if (trialCriteria.inclusion_criteria) {
        for (const criterion of trialCriteria.inclusion_criteria) {
          totalCriteria++;
          const matches = this.evaluateEligibilityCriterion(criterion, patientData);
          assessment.patient_matches[criterion.id] = matches;
          
          if (matches.status === 'met') {
            matchedCriteria++;
          } else if (matches.status === 'not_met' && criterion.required) {
            assessment.major_exclusions.push(criterion.description);
          } else if (matches.status === 'unknown') {
            assessment.screening_required.push(criterion.description);
          }
        }
      }

      assessment.eligibility_score = totalCriteria > 0 ? 
        (matchedCriteria / totalCriteria) * 100 : 0;

      // Determine recommendation
      if (assessment.major_exclusions.length > 0) {
        assessment.recommendation = 'not_eligible';
      } else if (assessment.eligibility_score >= 80) {
        assessment.recommendation = 'eligible';
      } else {
        assessment.recommendation = 'potentially_eligible';
      }

      // Save assessment
      const { data, error } = await this.supabase
        .from('trial_eligibility_assessments')
        .insert({
          ...assessment,
          assessment_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error assessing trial eligibility:', error);
      throw error;
    }
  }

  evaluateEligibilityCriterion(criterion, patientData) {
    try {
      switch (criterion.type) {
        case 'age':
          if (patientData.age !== undefined) {
            return {
              status: patientData.age >= criterion.min_age && 
                     patientData.age <= criterion.max_age ? 'met' : 'not_met',
              value: patientData.age
            };
          }
          return { status: 'unknown' };

        case 'diagnosis':
          if (patientData.primary_diagnosis) {
            return {
              status: criterion.accepted_diagnoses.includes(patientData.primary_diagnosis) ? 
                     'met' : 'not_met',
              value: patientData.primary_diagnosis
            };
          }
          return { status: 'unknown' };

        case 'stage':
          if (patientData.cancer_stage) {
            return {
              status: criterion.accepted_stages.includes(patientData.cancer_stage) ? 
                     'met' : 'not_met',
              value: patientData.cancer_stage
            };
          }
          return { status: 'unknown' };

        case 'performance_status':
          if (patientData.performance_status !== undefined) {
            return {
              status: patientData.performance_status <= criterion.max_ecog ? 
                     'met' : 'not_met',
              value: patientData.performance_status
            };
          }
          return { status: 'unknown' };

        case 'biomarker':
          if (patientData.biomarkers && patientData.biomarkers[criterion.biomarker_name]) {
            const patientValue = patientData.biomarkers[criterion.biomarker_name];
            return {
              status: patientValue === criterion.required_value ? 'met' : 'not_met',
              value: patientValue
            };
          }
          return { status: 'unknown' };

        default:
          return { status: 'unknown' };
      }
    } catch (error) {
      console.error('Error evaluating criterion:', criterion, error);
      return { status: 'unknown' };
    }
  }

  // =============================================
  // 8. DASHBOARD SUMMARY
  // =============================================

  async getOncologistDashboard(oncologistId) {
    try {
      const [
        caseload,
        upcomingAppointments,
        recentResponses,
        qualityMetrics,
        tumorBoardCases,
        pendingConsults
      ] = await Promise.all([
        this.getPatientCaseloadSummary(oncologistId),
        this.getUpcomingAppointments(oncologistId),
        this.getRecentTreatmentResponses(oncologistId),
        this.getQualityMetrics(oncologistId),
        this.getTumorBoardCases(oncologistId),
        this.getPendingConsultations(oncologistId)
      ]);

      return {
        caseload_summary: caseload,
        upcoming_appointments: upcomingAppointments,
        recent_responses: recentResponses,
        quality_metrics: qualityMetrics.slice(0, 5),
        tumor_board_cases: tumorBoardCases,
        pending_consults: pendingConsults,
        alerts: await this.getSystemAlerts(oncologistId),
        performance_summary: await this.getPerformanceSummary(oncologistId)
      };
    } catch (error) {
      console.error('Error generating oncologist dashboard:', error);
      throw error;
    }
  }

  async getUpcomingAppointments(oncologistId) {
    try {
      const { data, error } = await this.supabase
        .from('oncologist_patients')
        .select('patient_id, next_appointment, primary_diagnosis, treatment_status')
        .eq('oncologist_id', oncologistId)
        .not('next_appointment', 'is', null)
        .gte('next_appointment', new Date().toISOString())
        .order('next_appointment', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }

  async getRecentTreatmentResponses(oncologistId) {
    try {
      const { data, error } = await this.supabase
        .from('treatment_responses')
        .select('*')
        .eq('oncologist_id', oncologistId)
        .order('assessment_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recent responses:', error);
      throw error;
    }
  }

  async getPendingConsultations(oncologistId) {
    try {
      const { data, error } = await this.supabase
        .from('consultation_requests')
        .select('*')
        .or(`requesting_physician_id.eq.${oncologistId},consulting_specialist_id.eq.${oncologistId}`)
        .eq('status', 'pending')
        .order('requested_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pending consultations:', error);
      throw error;
    }
  }

  async getSystemAlerts(oncologistId) {
    const alerts = [];
    
    // Check for high-risk patients
    const { data: highRiskPatients } = await this.supabase
      .from('oncologist_patients')
      .select('patient_id, primary_diagnosis')
      .eq('oncologist_id', oncologistId)
      .eq('risk_level', 'critical');

    if (highRiskPatients && highRiskPatients.length > 0) {
      alerts.push({
        type: 'high_risk_patients',
        severity: 'high',
        message: `${highRiskPatients.length} patients require immediate attention`,
        count: highRiskPatients.length
      });
    }

    return alerts;
  }

  async getPerformanceSummary(oncologistId) {
    try {
      const { data: latestAnalytics } = await this.supabase
        .from('practice_analytics')
        .select('*')
        .eq('oncologist_id', oncologistId)
        .order('measurement_date', { ascending: false })
        .limit(1);

      if (latestAnalytics && latestAnalytics.length > 0) {
        const metrics = latestAnalytics[0];
        return {
          total_patients: metrics.total_patients,
          response_rate: metrics.treatment_response_rate,
          satisfaction_score: metrics.patient_satisfaction_score,
          efficiency_score: this.calculateEfficiencyScore(metrics)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      return null;
    }
  }
}

export default new OncologistFeaturesService();