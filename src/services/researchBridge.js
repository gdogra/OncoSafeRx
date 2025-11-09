import { createClient } from '@supabase/supabase-js';
import patientFeaturesService from './patientFeaturesService.js';
import oncologistFeaturesService from './oncologistFeaturesService.js';
import studentFeaturesService from './studentFeaturesService.js';
import researcherFeaturesService from './researcherFeaturesService.js';

class ResearchBridge {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async createRealWorldEvidenceStudy(researcherId, studyConfig) {
    try {
      const study = await researcherFeaturesService.createRWEStudy(researcherId, studyConfig);
      
      const patientCriteria = {
        cancer_type: studyConfig.cancer_type,
        treatment_status: studyConfig.treatment_status || 'any',
        age_range: studyConfig.age_range,
        stage_range: studyConfig.stage_range
      };

      const eligiblePatients = await this.findEligiblePatients(patientCriteria);
      
      for (const patient of eligiblePatients) {
        await this.supabase
          .from('rwe_patient_cohorts')
          .insert({
            study_id: study.id,
            patient_id: patient.id,
            enrollment_date: new Date().toISOString(),
            consent_status: 'pending'
          });
      }

      await this.generateStudyBaseline(study.id, eligiblePatients);
      
      return {
        study,
        eligible_patients_count: eligiblePatients.length,
        cohort_characteristics: await this.analyzeCohortCharacteristics(eligiblePatients)
      };
    } catch (error) {
      console.error('Error creating RWE study:', error);
      throw error;
    }
  }

  async findEligiblePatients(criteria) {
    try {
      let query = this.supabase
        .from('patient_profiles')
        .select(`
          *,
          patient_medical_history(*),
          treatment_plans(*)
        `);

      if (criteria.cancer_type && criteria.cancer_type !== 'any') {
        query = query.eq('cancer_type', criteria.cancer_type);
      }

      if (criteria.age_range) {
        const currentDate = new Date();
        const minBirthDate = new Date(currentDate.getFullYear() - criteria.age_range.max, currentDate.getMonth(), currentDate.getDate());
        const maxBirthDate = new Date(currentDate.getFullYear() - criteria.age_range.min, currentDate.getMonth(), currentDate.getDate());
        query = query.gte('date_of_birth', minBirthDate.toISOString())
                    .lte('date_of_birth', maxBirthDate.toISOString());
      }

      if (criteria.stage_range) {
        query = query.in('cancer_stage', criteria.stage_range);
      }

      const { data: patients, error } = await query;
      if (error) throw error;

      return patients || [];
    } catch (error) {
      console.error('Error finding eligible patients:', error);
      throw error;
    }
  }

  async analyzeCohortCharacteristics(patients) {
    const characteristics = {
      total_patients: patients.length,
      age_distribution: this.calculateAgeDistribution(patients),
      cancer_type_distribution: this.calculateCancerTypeDistribution(patients),
      stage_distribution: this.calculateStageDistribution(patients),
      gender_distribution: this.calculateGenderDistribution(patients),
      comorbidities: this.analyzeComorbidities(patients)
    };

    return characteristics;
  }

  calculateAgeDistribution(patients) {
    const ageGroups = {
      '18-30': 0,
      '31-50': 0,
      '51-65': 0,
      '66-80': 0,
      '80+': 0
    };

    patients.forEach(patient => {
      if (patient.date_of_birth) {
        const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
        if (age <= 30) ageGroups['18-30']++;
        else if (age <= 50) ageGroups['31-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else if (age <= 80) ageGroups['66-80']++;
        else ageGroups['80+']++;
      }
    });

    return ageGroups;
  }

  calculateCancerTypeDistribution(patients) {
    const distribution = {};
    patients.forEach(patient => {
      if (patient.cancer_type) {
        distribution[patient.cancer_type] = (distribution[patient.cancer_type] || 0) + 1;
      }
    });
    return distribution;
  }

  calculateStageDistribution(patients) {
    const distribution = {};
    patients.forEach(patient => {
      if (patient.cancer_stage) {
        distribution[patient.cancer_stage] = (distribution[patient.cancer_stage] || 0) + 1;
      }
    });
    return distribution;
  }

  calculateGenderDistribution(patients) {
    const distribution = { male: 0, female: 0, other: 0, not_specified: 0 };
    patients.forEach(patient => {
      const gender = patient.gender || 'not_specified';
      distribution[gender] = (distribution[gender] || 0) + 1;
    });
    return distribution;
  }

  analyzeComorbidities(patients) {
    const comorbidityCounts = {};
    patients.forEach(patient => {
      if (patient.patient_medical_history) {
        patient.patient_medical_history.forEach(history => {
          if (history.comorbidities) {
            history.comorbidities.forEach(comorbidity => {
              comorbidityCounts[comorbidity] = (comorbidityCounts[comorbidity] || 0) + 1;
            });
          }
        });
      }
    });
    return Object.entries(comorbidityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
  }

  async generateClinicalEducationContent(researcherId, contentConfig) {
    try {
      const researcherProfile = await researcherFeaturesService.getResearcherProfile(researcherId);
      if (!researcherProfile) {
        throw new Error('Researcher profile not found');
      }

      const publications = await researcherFeaturesService.getPublications(researcherId, {
        status: 'published',
        limit: 10
      });

      const clinicalTrials = await researcherFeaturesService.getClinicalTrials(researcherId, {
        study_status: ['completed', 'active'],
        limit: 5
      });

      const educationalContent = [];

      for (const publication of publications) {
        const educationalCase = await this.createEducationalCaseFromPublication(
          publication, 
          researcherProfile,
          contentConfig
        );
        if (educationalCase) {
          educationalContent.push(educationalCase);
        }
      }

      for (const trial of clinicalTrials) {
        const trialCase = await this.createEducationalCaseFromTrial(
          trial,
          researcherProfile,
          contentConfig
        );
        if (trialCase) {
          educationalContent.push(trialCase);
        }
      }

      await this.distributeEducationalContent(educationalContent, contentConfig.target_audience);

      return {
        content_created: educationalContent.length,
        publications_used: publications.length,
        trials_used: clinicalTrials.length,
        target_audience: contentConfig.target_audience
      };
    } catch (error) {
      console.error('Error generating clinical education content:', error);
      throw error;
    }
  }

  async createEducationalCaseFromPublication(publication, researcher, config) {
    try {
      const educationalCase = {
        case_title: `Research Insights: ${publication.title}`,
        specialty: researcher.specialization,
        difficulty_level: this.determineDifficultyFromPublication(publication),
        learning_objectives: [
          'Understand latest research findings in oncology',
          'Apply evidence-based treatment approaches',
          'Analyze study methodology and clinical implications'
        ],
        case_description: this.generateCaseDescriptionFromPublication(publication),
        patient_scenario: await this.generatePatientScenarioFromResearch(publication),
        questions: await this.generateQuestionsFromPublication(publication),
        references: [
          {
            title: publication.title,
            journal: publication.journal,
            publication_date: publication.publication_date,
            doi: publication.doi
          }
        ],
        created_by_researcher_id: researcher.id,
        source_type: 'research_publication',
        source_id: publication.id
      };

      const { data, error } = await this.supabase
        .from('educational_cases')
        .insert(educationalCase)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating educational case from publication:', error);
      return null;
    }
  }

  async createEducationalCaseFromTrial(trial, researcher, config) {
    try {
      const trialAnalytics = await researcherFeaturesService.generateTrialAnalytics(trial.id, researcher.user_id);
      
      const educationalCase = {
        case_title: `Clinical Trial Insights: ${trial.trial_identifier}`,
        specialty: researcher.specialization,
        difficulty_level: this.determineDifficultyFromTrial(trial),
        learning_objectives: [
          'Understand clinical trial design and methodology',
          'Analyze patient enrollment and outcomes',
          'Apply trial results to clinical practice'
        ],
        case_description: this.generateCaseDescriptionFromTrial(trial, trialAnalytics),
        patient_scenario: await this.generatePatientScenarioFromTrial(trial, trialAnalytics),
        questions: await this.generateQuestionsFromTrial(trial, trialAnalytics),
        references: [
          {
            title: trial.trial_title,
            trial_identifier: trial.trial_identifier,
            phase: trial.study_phase,
            start_date: trial.start_date
          }
        ],
        created_by_researcher_id: researcher.id,
        source_type: 'clinical_trial',
        source_id: trial.id
      };

      const { data, error } = await this.supabase
        .from('educational_cases')
        .insert(educationalCase)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating educational case from trial:', error);
      return null;
    }
  }

  async facilitateResearchCollaboration(researcherId, collaborationConfig) {
    try {
      const researcherProfile = await researcherFeaturesService.getResearcherProfile(researcherId);
      
      const potentialCollaborators = await this.findPotentialCollaborators(
        researcherProfile,
        collaborationConfig
      );

      const collaboration = await researcherFeaturesService.createCollaboration(researcherId, {
        ...collaborationConfig,
        collaboration_type: 'cross_platform',
        status: 'active',
        discovered_collaborators: potentialCollaborators.length
      });

      for (const collaborator of potentialCollaborators) {
        await this.sendCollaborationInvitation(collaboration.id, collaborator, researcherProfile);
      }

      if (collaborationConfig.include_education_bridge) {
        await this.setupEducationCollaborationBridge(collaboration.id, researcherProfile);
      }

      if (collaborationConfig.include_clinical_bridge) {
        await this.setupClinicalCollaborationBridge(collaboration.id, researcherProfile);
      }

      return {
        collaboration,
        potential_collaborators: potentialCollaborators.length,
        invitations_sent: potentialCollaborators.length,
        bridges_established: {
          education: collaborationConfig.include_education_bridge,
          clinical: collaborationConfig.include_clinical_bridge
        }
      };
    } catch (error) {
      console.error('Error facilitating research collaboration:', error);
      throw error;
    }
  }

  async findPotentialCollaborators(researcher, config) {
    try {
      const collaborators = [];

      if (config.include_oncologists) {
        const oncologists = await this.findOncologistCollaborators(researcher, config);
        collaborators.push(...oncologists);
      }

      if (config.include_students) {
        const students = await this.findStudentCollaborators(researcher, config);
        collaborators.push(...students);
      }

      if (config.include_other_researchers) {
        const otherResearchers = await this.findResearcherCollaborators(researcher, config);
        collaborators.push(...otherResearchers);
      }

      return collaborators;
    } catch (error) {
      console.error('Error finding potential collaborators:', error);
      throw error;
    }
  }

  async findOncologistCollaborators(researcher, config) {
    try {
      const { data: oncologists, error } = await this.supabase
        .from('oncologist_profiles')
        .select('*')
        .ilike('specialization', `%${researcher.specialization}%`)
        .neq('user_id', researcher.user_id)
        .limit(config.max_oncologist_collaborators || 10);

      if (error) throw error;

      return oncologists.map(oncologist => ({
        ...oncologist,
        platform: 'oncologist',
        collaboration_potential: this.calculateCollaborationPotential(researcher, oncologist, 'oncologist')
      }));
    } catch (error) {
      console.error('Error finding oncologist collaborators:', error);
      return [];
    }
  }

  async findStudentCollaborators(researcher, config) {
    try {
      const { data: students, error } = await this.supabase
        .from('student_profiles')
        .select('*')
        .ilike('specialization', `%${researcher.specialization}%`)
        .eq('program_type', 'medical_school')
        .gte('year_level', 3)
        .limit(config.max_student_collaborators || 5);

      if (error) throw error;

      return students.map(student => ({
        ...student,
        platform: 'student',
        collaboration_potential: this.calculateCollaborationPotential(researcher, student, 'student')
      }));
    } catch (error) {
      console.error('Error finding student collaborators:', error);
      return [];
    }
  }

  async findResearcherCollaborators(researcher, config) {
    try {
      const { data: researchers, error } = await this.supabase
        .from('researcher_profiles')
        .select('*')
        .overlap('research_interests', researcher.research_interests)
        .neq('user_id', researcher.user_id)
        .limit(config.max_researcher_collaborators || 10);

      if (error) throw error;

      return researchers.map(otherResearcher => ({
        ...otherResearcher,
        platform: 'researcher',
        collaboration_potential: this.calculateCollaborationPotential(researcher, otherResearcher, 'researcher')
      }));
    } catch (error) {
      console.error('Error finding researcher collaborators:', error);
      return [];
    }
  }

  calculateCollaborationPotential(researcher, collaborator, platform) {
    let score = 0;

    if (platform === 'oncologist' || platform === 'researcher') {
      if (researcher.specialization === collaborator.specialization) score += 30;
      if (researcher.research_interests) {
        const commonInterests = researcher.research_interests.filter(interest =>
          collaborator.research_interests?.includes(interest) ||
          collaborator.specialization?.toLowerCase().includes(interest.toLowerCase())
        );
        score += commonInterests.length * 10;
      }
    }

    if (platform === 'student') {
      if (collaborator.specialization === researcher.specialization) score += 25;
      if (collaborator.year_level >= 3) score += 15;
    }

    if (platform === 'researcher') {
      if (collaborator.h_index && researcher.h_index) {
        const indexDiff = Math.abs(collaborator.h_index - researcher.h_index);
        score += Math.max(0, 20 - indexDiff);
      }
    }

    return Math.min(score, 100);
  }

  async sendCollaborationInvitation(collaborationId, collaborator, researcher) {
    try {
      const invitation = {
        collaboration_id: collaborationId,
        invitee_user_id: collaborator.user_id,
        invitee_platform: collaborator.platform,
        invited_by: researcher.user_id,
        invitation_message: this.generateCollaborationMessage(researcher, collaborator),
        status: 'pending',
        collaboration_potential_score: collaborator.collaboration_potential
      };

      const { data, error } = await this.supabase
        .from('collaboration_invitations')
        .insert(invitation)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending collaboration invitation:', error);
      throw error;
    }
  }

  generateCollaborationMessage(researcher, collaborator) {
    return `Hello! I'm ${researcher.position} at ${researcher.institution}, specializing in ${researcher.specialization}. I'm interested in collaborating on research projects that align with our shared interests. Would you be interested in exploring potential collaboration opportunities?`;
  }

  async setupEducationCollaborationBridge(collaborationId, researcher) {
    try {
      const bridge = {
        collaboration_id: collaborationId,
        bridge_type: 'education',
        researcher_id: researcher.id,
        features: [
          'case_sharing',
          'student_mentorship',
          'curriculum_development',
          'assessment_collaboration'
        ],
        status: 'active'
      };

      const { data, error } = await this.supabase
        .from('collaboration_bridges')
        .insert(bridge)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting up education collaboration bridge:', error);
      throw error;
    }
  }

  async setupClinicalCollaborationBridge(collaborationId, researcher) {
    try {
      const bridge = {
        collaboration_id: collaborationId,
        bridge_type: 'clinical',
        researcher_id: researcher.id,
        features: [
          'trial_collaboration',
          'patient_referrals',
          'data_sharing',
          'biomarker_studies'
        ],
        status: 'active'
      };

      const { data, error } = await this.supabase
        .from('collaboration_bridges')
        .insert(bridge)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting up clinical collaboration bridge:', error);
      throw error;
    }
  }

  async generateStudyBaseline(studyId, patients) {
    const baselineData = {
      study_id: studyId,
      total_patients: patients.length,
      demographics: this.analyzeCohortCharacteristics(patients),
      baseline_date: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('rwe_study_baselines')
      .insert(baselineData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  determineDifficultyFromPublication(publication) {
    if (publication.impact_factor > 10) return 5;
    if (publication.impact_factor > 5) return 4;
    if (publication.impact_factor > 2) return 3;
    return 2;
  }

  determineDifficultyFromTrial(trial) {
    if (trial.study_phase === 'phase_iii') return 5;
    if (trial.study_phase === 'phase_ii') return 4;
    if (trial.study_phase === 'phase_i') return 3;
    return 2;
  }

  generateCaseDescriptionFromPublication(publication) {
    return `This case explores the clinical implications and practical applications of recent research findings published in ${publication.journal}. Students will analyze the study methodology, interpret results, and consider how these findings might influence current clinical practice in oncology.`;
  }

  generateCaseDescriptionFromTrial(trial, analytics) {
    return `This case examines a ${trial.study_phase} clinical trial investigating treatments for ${trial.cancer_type}. Students will explore trial design, patient selection criteria, outcome measures, and the potential impact of trial results on standard of care.`;
  }

  async generatePatientScenarioFromResearch(publication) {
    return `A 62-year-old patient presents with findings that align with the research described in "${publication.title.substring(0, 100)}...". Consider how the study findings might influence your diagnostic approach and treatment decisions.`;
  }

  async generatePatientScenarioFromTrial(trial, analytics) {
    return `Consider a patient who might be eligible for the clinical trial "${trial.trial_title.substring(0, 100)}...". Evaluate the inclusion/exclusion criteria, potential benefits and risks, and the informed consent process.`;
  }

  async generateQuestionsFromPublication(publication) {
    return [
      `What are the key findings of this study and how do they advance our understanding of oncology?`,
      `How might these research findings change current clinical practice?`,
      `What are the limitations of this study and what future research is needed?`,
      `How would you explain these findings to a patient in your care?`
    ];
  }

  async generateQuestionsFromTrial(trial, analytics) {
    return [
      `What is the primary endpoint of this trial and why was it selected?`,
      `How do the inclusion and exclusion criteria ensure appropriate patient selection?`,
      `What are the potential risks and benefits for patients participating in this trial?`,
      `How might the results of this trial influence future treatment protocols?`
    ];
  }

  async distributeEducationalContent(content, targetAudience) {
    for (const case_ of content) {
      if (targetAudience.includes('students')) {
        await this.supabase
          .from('student_case_assignments')
          .insert({
            case_id: case_.id,
            assigned_to: 'all_students',
            assignment_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
      }

      if (targetAudience.includes('oncologists')) {
        await this.supabase
          .from('oncologist_education_content')
          .insert({
            case_id: case_.id,
            content_type: 'research_case',
            publication_date: new Date().toISOString()
          });
      }
    }
  }
}

const researchBridge = new ResearchBridge();
export default researchBridge;