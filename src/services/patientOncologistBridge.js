/**
 * Patient-Oncologist Integration Bridge
 * Connects patient experience features with oncologist clinical workflows
 * OncoSafeRx - Generated 2024-11-08
 */

import supabaseService from '../config/supabase.js';
import patientFeaturesService from './patientFeaturesService.js';
import oncologistFeaturesService from './oncologistFeaturesService.js';

class PatientOncologistBridge {
  constructor() {
    if (!supabaseService || !supabaseService.enabled) {
      console.warn('⚠️ Supabase service not available, using demo mode');
      this.supabase = null;
    } else {
      this.supabase = supabaseService.supabase;
    }
  }

  // =============================================
  // BIDIRECTIONAL DATA SYNC
  // =============================================

  /**
   * Sync patient medication adherence data to oncologist view
   */
  async syncMedicationAdherence(patientId, oncologistId) {
    try {
      // Get patient medication schedules and adherence
      const schedules = await patientFeaturesService.getMedicationSchedules(patientId);
      const adherenceStats = await patientFeaturesService.getAdherenceStats(patientId, '30 days');
      
      // Update oncologist patient record with adherence data
      await oncologistFeaturesService.updatePatientStatus(oncologistId, patientId, {
        medication_adherence_rate: adherenceStats.overall_rate,
        last_adherence_update: new Date().toISOString()
      });

      // Create treatment response entry if significant changes
      if (adherenceStats.overall_rate < 0.8) {
        await this.createAdherenceAlert(patientId, oncologistId, adherenceStats);
      }

      return {
        success: true,
        adherence_rate: adherenceStats.overall_rate,
        schedules_count: schedules.length
      };
    } catch (error) {
      console.error('Error syncing medication adherence:', error);
      throw error;
    }
  }

  /**
   * Sync patient symptoms to oncologist clinical notes
   */
  async syncSymptomData(patientId, oncologistId) {
    try {
      // Get recent patient symptoms
      const symptoms = await patientFeaturesService.getSymptomHistory(patientId, '7 days');
      
      if (symptoms.length === 0) return { success: true, symptoms_count: 0 };

      // Generate clinical summary for oncologist
      const symptomSummary = this.generateSymptomSummary(symptoms);
      
      // Create clinical note draft
      const noteData = {
        patient_id: patientId,
        oncologist_id: oncologistId,
        visit_date: new Date().toISOString().split('T')[0],
        note_type: 'symptom_review',
        chief_complaint: symptomSummary.primary_complaint,
        assessment: symptomSummary.clinical_assessment,
        ai_suggestions: {
          symptom_trends: symptomSummary.trends,
          recommended_interventions: symptomSummary.interventions,
          severity_alerts: symptomSummary.alerts
        },
        is_finalized: false
      };

      // Don't create duplicate notes for the same day
      const existingNote = await this.checkExistingSymptomNote(patientId, oncologistId);
      if (!existingNote) {
        await oncologistFeaturesService.createClinicalNote(noteData);
      }

      return {
        success: true,
        symptoms_count: symptoms.length,
        high_severity_count: symptoms.filter(s => s.severity >= 7).length
      };
    } catch (error) {
      console.error('Error syncing symptom data:', error);
      throw error;
    }
  }

  /**
   * Update patient treatment timeline from oncologist protocols
   */
  async syncTreatmentPlan(patientId, oncologistId, protocolId) {
    try {
      // Get oncologist protocol details
      const protocols = await oncologistFeaturesService.getClinicalProtocols(oncologistId, { id: protocolId });
      if (!protocols.length) throw new Error('Protocol not found');
      
      const protocol = protocols[0];
      
      // Create treatment milestones for patient
      const milestones = this.generateTreatmentMilestones(protocol);
      
      for (const milestone of milestones) {
        await patientFeaturesService.createTreatmentMilestone(patientId, {
          ...milestone,
          created_by: oncologistId
        });
      }

      // Update patient status
      await oncologistFeaturesService.updatePatientStatus(oncologistId, patientId, {
        treatment_status: 'active',
        current_protocol: protocolId,
        protocol_start_date: new Date().toISOString()
      });

      return {
        success: true,
        protocol_name: protocol.protocol_name,
        milestones_created: milestones.length
      };
    } catch (error) {
      console.error('Error syncing treatment plan:', error);
      throw error;
    }
  }

  // =============================================
  // COMMUNICATION BRIDGE
  // =============================================

  /**
   * Bridge patient care team messages to oncologist
   */
  async bridgePatientMessages(patientId, oncologistId) {
    try {
      // Get recent patient messages
      const messages = await patientFeaturesService.getMessages(patientId, patientId);
      
      // Filter urgent or concerning messages
      const urgentMessages = messages.filter(msg => 
        msg.priority === 'urgent' || 
        msg.message_content.toLowerCase().includes('pain') ||
        msg.message_content.toLowerCase().includes('severe') ||
        msg.message_content.toLowerCase().includes('emergency')
      );

      if (urgentMessages.length > 0) {
        // Create consultation alert for oncologist
        for (const message of urgentMessages) {
          await this.createUrgentMessageAlert(patientId, oncologistId, message);
        }
      }

      return {
        success: true,
        total_messages: messages.length,
        urgent_messages: urgentMessages.length
      };
    } catch (error) {
      console.error('Error bridging patient messages:', error);
      throw error;
    }
  }

  /**
   * Share oncologist decisions with patient care team
   */
  async shareOncologistDecisions(patientId, oncologistId, decisions) {
    try {
      // Create care team message about oncologist decisions
      const messageData = {
        sender_id: oncologistId,
        recipient_id: 'care_team',
        patient_id: patientId,
        message_content: this.formatDecisionsForCareTeam(decisions),
        message_type: 'clinical_update',
        priority: decisions.urgency || 'normal'
      };

      await patientFeaturesService.sendMessage(
        oncologistId, 
        'care_team', 
        patientId, 
        messageData
      );

      // Update patient treatment timeline if new milestones
      if (decisions.new_milestones) {
        for (const milestone of decisions.new_milestones) {
          await patientFeaturesService.createTreatmentMilestone(patientId, {
            ...milestone,
            created_by: oncologistId
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error sharing oncologist decisions:', error);
      throw error;
    }
  }

  // =============================================
  // ANALYTICS INTEGRATION
  // =============================================

  /**
   * Generate combined patient-oncologist insights
   */
  async generateCombinedInsights(patientId, oncologistId) {
    try {
      // Get patient insights
      const patientInsights = await patientFeaturesService.generatePatientInsights(patientId);
      
      // Get treatment analytics
      const treatmentAnalytics = await oncologistFeaturesService.getTreatmentAnalytics(oncologistId);
      
      // Combine and analyze
      const combinedInsights = {
        patient_perspective: {
          adherence_trend: patientInsights.adherence_trend,
          symptom_patterns: patientInsights.symptom_patterns,
          quality_of_life: patientInsights.wellness_score
        },
        clinical_perspective: {
          treatment_response: treatmentAnalytics.response_rates,
          toxicity_profile: treatmentAnalytics.toxicity_distribution,
          overall_trend: treatmentAnalytics.improvement_trend
        },
        integrated_recommendations: this.generateIntegratedRecommendations(
          patientInsights, 
          treatmentAnalytics
        ),
        risk_factors: this.identifyRiskFactors(patientInsights, treatmentAnalytics),
        next_actions: this.suggestNextActions(patientInsights, treatmentAnalytics)
      };

      return combinedInsights;
    } catch (error) {
      console.error('Error generating combined insights:', error);
      throw error;
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  generateSymptomSummary(symptoms) {
    const severityLevels = symptoms.map(s => s.severity);
    const avgSeverity = severityLevels.reduce((a, b) => a + b, 0) / severityLevels.length;
    const highSeveritySymptoms = symptoms.filter(s => s.severity >= 7);
    
    return {
      primary_complaint: highSeveritySymptoms.length > 0 
        ? `Patient reports ${highSeveritySymptoms[0].symptom_name} (severity ${highSeveritySymptoms[0].severity}/10)`
        : `Patient reports multiple symptoms with average severity ${avgSeverity.toFixed(1)}/10`,
      
      clinical_assessment: `${symptoms.length} symptoms reported over past 7 days. ` +
        `Average severity: ${avgSeverity.toFixed(1)}/10. ` +
        (highSeveritySymptoms.length > 0 
          ? `${highSeveritySymptoms.length} high-severity symptoms require attention.`
          : 'No high-severity symptoms reported.'),
      
      trends: this.analyzeSymptomTrends(symptoms),
      interventions: this.suggestSymptomInterventions(symptoms),
      alerts: highSeveritySymptoms.map(s => ({
        symptom: s.symptom_name,
        severity: s.severity,
        recommendation: 'Consider immediate clinical evaluation'
      }))
    };
  }

  analyzeSymptomTrends(symptoms) {
    // Simple trend analysis - in production, this would be more sophisticated
    const symptomGroups = {};
    symptoms.forEach(symptom => {
      if (!symptomGroups[symptom.symptom_name]) {
        symptomGroups[symptom.symptom_name] = [];
      }
      symptomGroups[symptom.symptom_name].push(symptom);
    });

    const trends = [];
    for (const [symptomName, symptomList] of Object.entries(symptomGroups)) {
      if (symptomList.length > 1) {
        const recent = symptomList[0].severity;
        const earlier = symptomList[symptomList.length - 1].severity;
        const trend = recent > earlier ? 'worsening' : recent < earlier ? 'improving' : 'stable';
        trends.push({ symptom: symptomName, trend, change: recent - earlier });
      }
    }

    return trends;
  }

  suggestSymptomInterventions(symptoms) {
    const interventions = [];
    
    symptoms.forEach(symptom => {
      if (symptom.severity >= 7) {
        interventions.push({
          symptom: symptom.symptom_name,
          intervention: this.getSymptomIntervention(symptom.symptom_name, symptom.severity)
        });
      }
    });

    return interventions;
  }

  getSymptomIntervention(symptomName, severity) {
    const interventions = {
      'nausea': severity >= 8 ? 'Consider anti-emetic adjustment' : 'Recommend dietary modifications',
      'fatigue': severity >= 8 ? 'Evaluate for dose reduction' : 'Recommend activity modifications',
      'pain': severity >= 7 ? 'Pain management consultation' : 'Analgesic optimization',
      'diarrhea': severity >= 7 ? 'Consider loperamide and hydration' : 'Dietary modifications'
    };
    
    return interventions[symptomName.toLowerCase()] || 'Clinical evaluation recommended';
  }

  generateTreatmentMilestones(protocol) {
    const milestones = [];
    const startDate = new Date();
    
    // Create milestones based on protocol
    if (protocol.drugs && Array.isArray(protocol.drugs)) {
      protocol.drugs.forEach((drug, index) => {
        const milestoneDate = new Date(startDate);
        milestoneDate.setDate(milestoneDate.getDate() + (index * 21)); // 3-week cycles
        
        milestones.push({
          milestone_name: `${drug.drug_name} - Cycle ${index + 1}`,
          milestone_type: 'treatment_cycle',
          scheduled_date: milestoneDate.toISOString().split('T')[0],
          status: 'scheduled',
          notes: `${drug.dosage} ${drug.schedule || ''}`
        });
      });
    }

    // Add assessment milestones
    const assessmentDate = new Date(startDate);
    assessmentDate.setDate(assessmentDate.getDate() + 63); // 9 weeks
    
    milestones.push({
      milestone_name: 'Response Assessment',
      milestone_type: 'assessment',
      scheduled_date: assessmentDate.toISOString().split('T')[0],
      status: 'scheduled',
      notes: 'Imaging and clinical response evaluation'
    });

    return milestones;
  }

  async createAdherenceAlert(patientId, oncologistId, adherenceStats) {
    try {
      const alertData = {
        patient_id: patientId,
        oncologist_id: oncologistId,
        alert_type: 'medication_adherence',
        severity: adherenceStats.overall_rate < 0.6 ? 'high' : 'medium',
        message: `Patient medication adherence below target: ${Math.round(adherenceStats.overall_rate * 100)}%`,
        recommended_action: 'Schedule adherence counseling session',
        created_at: new Date().toISOString()
      };

      // This would typically be stored in a clinical_alerts table
      console.log('Adherence alert created:', alertData);
      return alertData;
    } catch (error) {
      console.error('Error creating adherence alert:', error);
      throw error;
    }
  }

  async createUrgentMessageAlert(patientId, oncologistId, message) {
    try {
      const consultationData = {
        patient_id: patientId,
        requesting_physician_id: 'system',
        consulting_specialist_id: oncologistId,
        specialty_requested: 'oncology',
        urgency: 'urgent',
        clinical_question: `Urgent patient message: ${message.message_content}`,
        consultation_type: 'urgent_review',
        status: 'pending'
      };

      await oncologistFeaturesService.submitConsultationRequest(consultationData);
      return consultationData;
    } catch (error) {
      console.error('Error creating urgent message alert:', error);
      throw error;
    }
  }

  async checkExistingSymptomNote(patientId, oncologistId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await this.supabase
        .from('clinical_notes')
        .select('id')
        .eq('patient_id', patientId)
        .eq('oncologist_id', oncologistId)
        .eq('visit_date', today)
        .eq('note_type', 'symptom_review')
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking existing symptom note:', error);
      return false;
    }
  }

  formatDecisionsForCareTeam(decisions) {
    let message = `Clinical Update from Oncology:\n\n`;
    
    if (decisions.treatment_changes) {
      message += `Treatment Changes:\n${decisions.treatment_changes}\n\n`;
    }
    
    if (decisions.monitoring_requirements) {
      message += `Monitoring Requirements:\n${decisions.monitoring_requirements}\n\n`;
    }
    
    if (decisions.patient_instructions) {
      message += `Patient Instructions:\n${decisions.patient_instructions}\n\n`;
    }
    
    if (decisions.next_appointment) {
      message += `Next Appointment: ${decisions.next_appointment}\n`;
    }

    return message;
  }

  generateIntegratedRecommendations(patientInsights, treatmentAnalytics) {
    const recommendations = [];
    
    // Adherence-based recommendations
    if (patientInsights.adherence_trend === 'declining') {
      recommendations.push({
        category: 'adherence',
        priority: 'high',
        recommendation: 'Implement enhanced adherence support program',
        rationale: 'Patient-reported adherence declining, may impact treatment efficacy'
      });
    }
    
    // Symptom-based recommendations  
    if (patientInsights.symptom_burden === 'high') {
      recommendations.push({
        category: 'symptom_management',
        priority: 'high',
        recommendation: 'Consider supportive care consultation',
        rationale: 'High symptom burden may affect quality of life and adherence'
      });
    }

    // Treatment response recommendations
    if (treatmentAnalytics.response_trend === 'declining') {
      recommendations.push({
        category: 'treatment_modification',
        priority: 'high',
        recommendation: 'Evaluate treatment modification options',
        rationale: 'Treatment response trending downward'
      });
    }

    return recommendations;
  }

  identifyRiskFactors(patientInsights, treatmentAnalytics) {
    const riskFactors = [];
    
    if (patientInsights.adherence_rate < 0.8) {
      riskFactors.push({
        factor: 'medication_adherence',
        risk_level: 'high',
        description: 'Sub-optimal medication adherence'
      });
    }
    
    if (treatmentAnalytics.toxicity_rate > 0.3) {
      riskFactors.push({
        factor: 'treatment_toxicity',
        risk_level: 'medium',
        description: 'Higher than expected toxicity rate'
      });
    }

    return riskFactors;
  }

  suggestNextActions(patientInsights, treatmentAnalytics) {
    const actions = [];
    
    actions.push({
      action: 'schedule_followup',
      timeframe: 'within_2_weeks',
      rationale: 'Regular monitoring recommended'
    });
    
    if (patientInsights.wellness_score < 60) {
      actions.push({
        action: 'wellness_intervention',
        timeframe: 'immediate',
        rationale: 'Low wellness score requires attention'
      });
    }

    return actions;
  }

  // =============================================
  // REAL-TIME SYNC METHODS
  // =============================================

  /**
   * Sync all patient data for an oncologist's review
   */
  async performComprehensiveSync(patientId, oncologistId) {
    try {
      const syncResults = await Promise.allSettled([
        this.syncMedicationAdherence(patientId, oncologistId),
        this.syncSymptomData(patientId, oncologistId),
        this.bridgePatientMessages(patientId, oncologistId)
      ]);

      const results = {
        medication_sync: syncResults[0].status === 'fulfilled' ? syncResults[0].value : { error: syncResults[0].reason.message },
        symptom_sync: syncResults[1].status === 'fulfilled' ? syncResults[1].value : { error: syncResults[1].reason.message },
        message_bridge: syncResults[2].status === 'fulfilled' ? syncResults[2].value : { error: syncResults[2].reason.message },
        sync_timestamp: new Date().toISOString()
      };

      return results;
    } catch (error) {
      console.error('Error performing comprehensive sync:', error);
      throw error;
    }
  }
}

export default new PatientOncologistBridge();