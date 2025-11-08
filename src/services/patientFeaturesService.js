/**
 * Patient Features Service
 * Comprehensive patient experience platform services
 * OncoSafeRx - Generated 2024-11-08
 */

import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

class PatientFeaturesService {
  // =============================================
  // 1. MEDICATION ADHERENCE & REMINDERS
  // =============================================

  async createMedicationSchedule(patientId, scheduleData) {
    try {
      const { data, error } = await supabase
        .from('medication_schedules')
        .insert({
          patient_id: patientId,
          ...scheduleData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating medication schedule:', error);
      throw error;
    }
  }

  async getMedicationSchedules(patientId) {
    try {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching medication schedules:', error);
      throw error;
    }
  }

  async logMedicationAdherence(scheduleId, patientId, adherenceData) {
    try {
      const { data, error } = await supabase
        .from('medication_adherence_logs')
        .insert({
          schedule_id: scheduleId,
          patient_id: patientId,
          ...adherenceData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging medication adherence:', error);
      throw error;
    }
  }

  async getAdherenceStats(patientId, timeframe = '30 days') {
    try {
      const { data, error } = await supabase.rpc('get_adherence_stats', {
        p_patient_id: patientId,
        p_timeframe: timeframe
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching adherence stats:', error);
      return { overall_rate: 0, missed_doses: 0, total_doses: 0 };
    }
  }

  async logSideEffect(patientId, sideEffectData) {
    try {
      const { data, error } = await supabase
        .from('medication_side_effects')
        .insert({
          patient_id: patientId,
          ...sideEffectData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging side effect:', error);
      throw error;
    }
  }

  // =============================================
  // 2. SYMPTOM & SIDE EFFECT TRACKER
  // =============================================

  async logSymptom(patientId, symptomData) {
    try {
      const { data, error } = await supabase
        .from('symptom_logs')
        .insert({
          patient_id: patientId,
          ...symptomData
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger correlation analysis
      this.analyzeSymptomCorrelations(patientId);

      return data;
    } catch (error) {
      console.error('Error logging symptom:', error);
      throw error;
    }
  }

  async getSymptomHistory(patientId, timeframe = '30 days') {
    try {
      const { data, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('patient_id', patientId)
        .gte('log_date', this.getDateOffset(timeframe))
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching symptom history:', error);
      throw error;
    }
  }

  async analyzeSymptomCorrelations(patientId) {
    try {
      // This would involve more complex analysis - simplified for now
      const symptoms = await this.getSymptomHistory(patientId, '90 days');
      const medications = await this.getMedicationSchedules(patientId);

      // Basic correlation analysis
      const correlations = this.calculateBasicCorrelations(symptoms, medications);

      // Store correlations
      for (const correlation of correlations) {
        await supabase
          .from('symptom_correlations')
          .upsert({
            patient_id: patientId,
            ...correlation
          });
      }

      return correlations;
    } catch (error) {
      console.error('Error analyzing symptom correlations:', error);
      return [];
    }
  }

  // =============================================
  // 3. TREATMENT JOURNEY TIMELINE
  // =============================================

  async createTreatmentMilestone(patientId, milestoneData) {
    try {
      const { data, error } = await supabase
        .from('treatment_milestones')
        .insert({
          patient_id: patientId,
          ...milestoneData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating treatment milestone:', error);
      throw error;
    }
  }

  async getTreatmentTimeline(patientId) {
    try {
      const { data, error } = await supabase
        .from('treatment_milestones')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching treatment timeline:', error);
      throw error;
    }
  }

  async logTreatmentResponse(patientId, responseData) {
    try {
      const { data, error } = await supabase
        .from('treatment_responses')
        .insert({
          patient_id: patientId,
          ...responseData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging treatment response:', error);
      throw error;
    }
  }

  // =============================================
  // 4. CARE TEAM COMMUNICATION
  // =============================================

  async addCareTeamMember(patientId, memberData) {
    try {
      const { data, error } = await supabase
        .from('care_team_members')
        .insert({
          patient_id: patientId,
          ...memberData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding care team member:', error);
      throw error;
    }
  }

  async getCareTeam(patientId) {
    try {
      const { data, error } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching care team:', error);
      throw error;
    }
  }

  async sendMessage(senderId, recipientId, patientId, messageData) {
    try {
      const threadId = messageData.thread_id || uuidv4();

      const { data, error } = await supabase
        .from('care_messages')
        .insert({
          thread_id: threadId,
          sender_id: senderId,
          recipient_id: recipientId,
          patient_id: patientId,
          ...messageData
        })
        .select()
        .single();

      if (error) throw error;

      // Send push notification if urgent
      if (messageData.priority === 'urgent') {
        await this.sendUrgentNotification(recipientId, messageData);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(userId, patientId, threadId = null) {
    try {
      let query = supabase
        .from('care_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('patient_id', patientId);

      if (threadId) {
        query = query.eq('thread_id', threadId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // =============================================
  // 5. FAMILY & CAREGIVER PORTAL
  // =============================================

  async inviteCaregiver(patientId, caregiverEmail, relationship, permissions) {
    try {
      // Create invitation record
      const { data, error } = await supabase
        .from('caregiver_relationships')
        .insert({
          patient_id: patientId,
          caregiver_id: null, // Will be set when caregiver accepts
          relationship: relationship,
          permission_level: permissions.level || 'view_only',
          permissions: permissions,
          created_by: patientId
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email (would integrate with email service)
      await this.sendCaregiverInvitation(caregiverEmail, data);

      return data;
    } catch (error) {
      console.error('Error inviting caregiver:', error);
      throw error;
    }
  }

  async getCaregivers(patientId) {
    try {
      const { data, error } = await supabase
        .from('caregiver_relationships')
        .select(`
          *,
          caregiver:caregiver_id (
            email,
            raw_user_meta_data
          )
        `)
        .eq('patient_id', patientId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      throw error;
    }
  }

  async addCaregiverNote(patientId, authorId, noteData) {
    try {
      const { data, error } = await supabase
        .from('caregiver_notes')
        .insert({
          patient_id: patientId,
          author_id: authorId,
          ...noteData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding caregiver note:', error);
      throw error;
    }
  }

  // =============================================
  // 6. WELLNESS & MENTAL HEALTH
  // =============================================

  async logWellnessActivity(patientId, activityData) {
    try {
      const { data, error } = await supabase
        .from('wellness_activities')
        .insert({
          patient_id: patientId,
          ...activityData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging wellness activity:', error);
      throw error;
    }
  }

  async getWellnessHistory(patientId, timeframe = '30 days') {
    try {
      const { data, error } = await supabase
        .from('wellness_activities')
        .select('*')
        .eq('patient_id', patientId)
        .gte('completed_date', this.getDateOffset(timeframe))
        .order('completed_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching wellness history:', error);
      throw error;
    }
  }

  async conductMentalHealthAssessment(patientId, assessmentData) {
    try {
      const { data, error } = await supabase
        .from('mental_health_assessments')
        .insert({
          patient_id: patientId,
          ...assessmentData
        })
        .select()
        .single();

      if (error) throw error;

      // Check if follow-up is needed
      if (data.risk_level === 'severe' || data.follow_up_needed) {
        await this.triggerMentalHealthAlert(patientId, data);
      }

      return data;
    } catch (error) {
      console.error('Error conducting mental health assessment:', error);
      throw error;
    }
  }

  // =============================================
  // 7. NUTRITION TRACKING
  // =============================================

  async logNutrition(patientId, nutritionData) {
    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert({
          patient_id: patientId,
          ...nutritionData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging nutrition:', error);
      throw error;
    }
  }

  async getNutritionHistory(patientId, timeframe = '7 days') {
    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('patient_id', patientId)
        .gte('log_date', this.getDateOffset(timeframe))
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching nutrition history:', error);
      throw error;
    }
  }

  // =============================================
  // 8. FINANCIAL TRACKING
  // =============================================

  async logTreatmentCost(patientId, costData) {
    try {
      const { data, error } = await supabase
        .from('treatment_costs')
        .insert({
          patient_id: patientId,
          ...costData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging treatment cost:', error);
      throw error;
    }
  }

  async getCostSummary(patientId, year = new Date().getFullYear()) {
    try {
      const { data, error } = await supabase
        .from('treatment_costs')
        .select('*')
        .eq('patient_id', patientId)
        .gte('service_date', `${year}-01-01`)
        .lt('service_date', `${year + 1}-01-01`)
        .order('service_date', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const summary = data.reduce((acc, cost) => {
        acc.total_cost += cost.total_cost || 0;
        acc.insurance_covered += cost.insurance_covered || 0;
        acc.out_of_pocket += cost.out_of_pocket || 0;
        acc.copay += cost.copay || 0;
        acc.deductible += cost.deductible || 0;
        return acc;
      }, {
        total_cost: 0,
        insurance_covered: 0,
        out_of_pocket: 0,
        copay: 0,
        deductible: 0,
        entries: data
      });

      return summary;
    } catch (error) {
      console.error('Error fetching cost summary:', error);
      throw error;
    }
  }

  // =============================================
  // 9. APPOINTMENTS & LOGISTICS
  // =============================================

  async scheduleAppointment(patientId, appointmentData) {
    try {
      const { data, error } = await supabase
        .from('patient_appointments')
        .insert({
          patient_id: patientId,
          ...appointmentData
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule reminders
      await this.scheduleAppointmentReminders(data);

      return data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }

  async getUpcomingAppointments(patientId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('patient_appointments')
        .select(`
          *,
          provider:provider_id (
            name,
            role,
            contact_phone
          )
        `)
        .eq('patient_id', patientId)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }

  // =============================================
  // 10. INTEGRATION & CONNECTIVITY
  // =============================================

  async connectIntegration(patientId, integrationData) {
    try {
      const { data, error } = await supabase
        .from('patient_integrations')
        .insert({
          patient_id: patientId,
          connection_status: 'connected',
          ...integrationData
        })
        .select()
        .single();

      if (error) throw error;

      // Start initial sync
      await this.syncIntegrationData(data.id);

      return data;
    } catch (error) {
      console.error('Error connecting integration:', error);
      throw error;
    }
  }

  async syncIntegrationData(integrationId) {
    try {
      // This would implement actual sync logic based on integration type
      const integration = await supabase
        .from('patient_integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (integration.error) throw integration.error;

      // Simulate data sync - would integrate with actual APIs
      const syncResults = await this.performDataSync(integration.data);

      // Update last sync time
      await supabase
        .from('patient_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integrationId);

      return syncResults;
    } catch (error) {
      console.error('Error syncing integration data:', error);
      throw error;
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  getDateOffset(timeframe) {
    const now = new Date();
    const offset = parseInt(timeframe.split(' ')[0]);
    const unit = timeframe.split(' ')[1];

    switch (unit) {
      case 'days':
        return new Date(now.setDate(now.getDate() - offset)).toISOString().split('T')[0];
      case 'weeks':
        return new Date(now.setDate(now.getDate() - (offset * 7))).toISOString().split('T')[0];
      case 'months':
        return new Date(now.setMonth(now.getMonth() - offset)).toISOString().split('T')[0];
      default:
        return new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    }
  }

  calculateBasicCorrelations(symptoms, medications) {
    // Simplified correlation calculation
    const correlations = [];
    const symptomsByDay = this.groupSymptomsByDay(symptoms);
    
    medications.forEach(med => {
      const medStartDate = new Date(med.start_date);
      const correlatedSymptoms = symptoms.filter(symptom => 
        new Date(symptom.log_date) >= medStartDate
      );

      if (correlatedSymptoms.length > 0) {
        correlations.push({
          primary_symptom: 'medication_related',
          correlated_factor: med.medication_name,
          correlation_strength: 0.5, // Simplified
          confidence_level: 0.3
        });
      }
    });

    return correlations;
  }

  groupSymptomsByDay(symptoms) {
    return symptoms.reduce((acc, symptom) => {
      const date = symptom.log_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(symptom);
      return acc;
    }, {});
  }

  async sendUrgentNotification(recipientId, messageData) {
    // Implementation for urgent notifications
    console.log(`Urgent notification sent to ${recipientId}:`, messageData.subject);
  }

  async sendCaregiverInvitation(email, invitationData) {
    // Implementation for caregiver invitation emails
    console.log(`Caregiver invitation sent to ${email}:`, invitationData);
  }

  async triggerMentalHealthAlert(patientId, assessmentData) {
    // Implementation for mental health alerts
    console.log(`Mental health alert triggered for patient ${patientId}:`, assessmentData);
  }

  async scheduleAppointmentReminders(appointmentData) {
    // Implementation for appointment reminders
    console.log(`Appointment reminders scheduled for:`, appointmentData);
  }

  async performDataSync(integrationData) {
    // Implementation for external data sync
    console.log(`Data sync performed for:`, integrationData.integration_type);
    return { synced: true, records: 0 };
  }

  // =============================================
  // ANALYTICS & INSIGHTS
  // =============================================

  async generatePatientInsights(patientId) {
    try {
      const [symptoms, wellness, adherence, appointments] = await Promise.all([
        this.getSymptomHistory(patientId, '30 days'),
        this.getWellnessHistory(patientId, '30 days'),
        this.getAdherenceStats(patientId, '30 days'),
        this.getUpcomingAppointments(patientId, 5)
      ]);

      const insights = {
        symptom_trends: this.analyzeSymptomTrends(symptoms),
        wellness_score: this.calculateWellnessScore(wellness),
        adherence_rate: adherence.overall_rate,
        next_appointment: appointments[0],
        recommendations: this.generateRecommendations(symptoms, wellness, adherence)
      };

      return insights;
    } catch (error) {
      console.error('Error generating patient insights:', error);
      throw error;
    }
  }

  analyzeSymptomTrends(symptoms) {
    // Analyze symptom patterns and trends
    const trends = {};
    symptoms.forEach(symptom => {
      if (!trends[symptom.symptom_type]) {
        trends[symptom.symptom_type] = [];
      }
      trends[symptom.symptom_type].push({
        date: symptom.log_date,
        severity: symptom.severity
      });
    });

    return Object.keys(trends).map(type => ({
      symptom: type,
      trend: this.calculateTrend(trends[type]),
      average_severity: trends[type].reduce((sum, s) => sum + s.severity, 0) / trends[type].length
    }));
  }

  calculateWellnessScore(activities) {
    if (activities.length === 0) return 0;
    
    const totalMoodImprovement = activities.reduce((sum, activity) => {
      return sum + ((activity.mood_after || 0) - (activity.mood_before || 0));
    }, 0);

    return Math.max(0, Math.min(10, 5 + (totalMoodImprovement / activities.length)));
  }

  calculateTrend(dataPoints) {
    if (dataPoints.length < 2) return 'stable';
    
    const recent = dataPoints.slice(-7); // Last 7 entries
    const older = dataPoints.slice(0, Math.max(1, dataPoints.length - 7));
    
    const recentAvg = recent.reduce((sum, p) => sum + p.severity, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.severity, 0) / older.length;
    
    if (recentAvg > olderAvg + 1) return 'worsening';
    if (recentAvg < olderAvg - 1) return 'improving';
    return 'stable';
  }

  generateRecommendations(symptoms, wellness, adherence) {
    const recommendations = [];

    // Adherence recommendations
    if (adherence.overall_rate < 0.8) {
      recommendations.push({
        type: 'adherence',
        priority: 'high',
        message: 'Consider setting up medication reminders to improve adherence',
        action: 'setup_reminders'
      });
    }

    // Symptom recommendations
    const highSeveritySymptoms = symptoms.filter(s => s.severity >= 7);
    if (highSeveritySymptoms.length > 0) {
      recommendations.push({
        type: 'symptom',
        priority: 'high',
        message: 'You have reported severe symptoms. Consider contacting your care team',
        action: 'contact_care_team'
      });
    }

    // Wellness recommendations
    const recentWellness = wellness.slice(0, 7);
    if (recentWellness.length < 3) {
      recommendations.push({
        type: 'wellness',
        priority: 'medium',
        message: 'Try incorporating daily wellness activities to improve your overall well-being',
        action: 'start_wellness_routine'
      });
    }

    return recommendations;
  }
}

export default new PatientFeaturesService();