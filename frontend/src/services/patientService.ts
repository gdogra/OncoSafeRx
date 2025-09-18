import { Patient, TreatmentCourse, GenomicProfile, Toxicity } from '../types/clinical';

export class PatientService {
  private readonly STORAGE_KEY = 'oncosaferx_patients';
  private readonly TREATMENT_HISTORY_KEY = 'oncosaferx_treatment_history';

  // Get all patients
  public getPatients(): Patient[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving patients:', error);
      return [];
    }
  }

  // Get patient by ID
  public getPatient(id: string): Patient | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  // Save patient
  public savePatient(patient: Patient): void {
    try {
      const patients = this.getPatients();
      const existingIndex = patients.findIndex(p => p.id === patient.id);
      
      if (existingIndex !== -1) {
        patients[existingIndex] = patient;
      } else {
        patients.push(patient);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patients));
    } catch (error) {
      console.error('Error saving patient:', error);
      throw new Error('Failed to save patient');
    }
  }

  // Delete patient
  public deletePatient(id: string): void {
    try {
      const patients = this.getPatients();
      const filtered = patients.filter(p => p.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient');
    }
  }

  // Search patients
  public searchPatients(query: string): Patient[] {
    const patients = this.getPatients();
    const lowerQuery = query.toLowerCase();
    
    return patients.filter(patient => 
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.mrn?.toLowerCase().includes(lowerQuery) ||
      patient.diagnosis.toLowerCase().includes(lowerQuery)
    );
  }

  // Add treatment course
  public addTreatmentCourse(patientId: string, course: TreatmentCourse): void {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.treatmentHistory = patient.treatmentHistory || [];
    patient.treatmentHistory.push(course);
    this.savePatient(patient);
  }

  // Update treatment course
  public updateTreatmentCourse(patientId: string, courseId: string, updates: Partial<TreatmentCourse>): void {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    const courseIndex = patient.treatmentHistory.findIndex(c => c.id === courseId);
    if (courseIndex === -1) throw new Error('Treatment course not found');
    
    patient.treatmentHistory[courseIndex] = {
      ...patient.treatmentHistory[courseIndex],
      ...updates
    };
    
    this.savePatient(patient);
  }

  // Add toxicity event
  public addToxicity(patientId: string, courseId: string, toxicity: Toxicity): void {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    const course = patient.treatmentHistory.find(c => c.id === courseId);
    if (!course) throw new Error('Treatment course not found');
    
    course.toxicities = course.toxicities || [];
    course.toxicities.push(toxicity);
    this.savePatient(patient);
  }

  // Update lab values
  public updateLabValues(patientId: string, labValues: Patient['labValues'][0]): void {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.labValues = patient.labValues || [];
    patient.labValues.push(labValues);
    
    // Keep only last 50 lab results
    patient.labValues = patient.labValues
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);
    
    this.savePatient(patient);
  }

  // Update genomic profile
  public updateGenomicProfile(patientId: string, genomicProfile: GenomicProfile): void {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.genomicProfile = genomicProfile;
    this.savePatient(patient);
  }

  // Add biomarker
  public addBiomarker(patientId: string, biomarker: Patient['biomarkers'][0]): void {
    const patient = this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.biomarkers = patient.biomarkers || [];
    patient.biomarkers.push(biomarker);
    this.savePatient(patient);
  }

  // Get treatment timeline
  public getTreatmentTimeline(patientId: string): Array<{
    date: string;
    type: 'treatment' | 'lab' | 'toxicity' | 'response';
    title: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
  }> {
    const patient = this.getPatient(patientId);
    if (!patient) return [];
    
    const timeline: Array<{
      date: string;
      type: 'treatment' | 'lab' | 'toxicity' | 'response';
      title: string;
      description: string;
      severity?: 'low' | 'medium' | 'high';
    }> = [];
    
    // Add treatment events
    patient.treatmentHistory.forEach(course => {
      timeline.push({
        date: course.startDate,
        type: 'treatment',
        title: `Started ${course.regimenName}`,
        description: `Treatment course initiated (${course.cycles} cycles planned)`,
        severity: 'medium'
      });
      
      if (course.endDate) {
        timeline.push({
          date: course.endDate,
          type: 'treatment',
          title: `Completed ${course.regimenName}`,
          description: `Treatment course completed (${course.cycles} cycles)`,
          severity: 'low'
        });
      }
      
      // Add response assessments
      if (course.response) {
        const responseDate = course.endDate || new Date().toISOString().split('T')[0];
        timeline.push({
          date: responseDate,
          type: 'response',
          title: `Response Assessment: ${course.response}`,
          description: `Treatment response evaluated`,
          severity: course.response === 'CR' || course.response === 'PR' ? 'low' : 'medium'
        });
      }
      
      // Add toxicity events
      course.toxicities?.forEach(toxicity => {
        timeline.push({
          date: toxicity.onset,
          type: 'toxicity',
          title: `${toxicity.name} (Grade ${toxicity.grade})`,
          description: `Toxicity event - ${toxicity.attribution} attribution`,
          severity: toxicity.grade >= 3 ? 'high' : 'medium'
        });
      });
    });
    
    // Add lab events (major changes only)
    patient.labValues.forEach(lab => {
      if (lab.anc < 1.0) {
        timeline.push({
          date: lab.date,
          type: 'lab',
          title: 'Neutropenia',
          description: `ANC: ${lab.anc} x10³/μL`,
          severity: lab.anc < 0.5 ? 'high' : 'medium'
        });
      }
      
      if (lab.platelets < 100) {
        timeline.push({
          date: lab.date,
          type: 'lab',
          title: 'Thrombocytopenia',
          description: `Platelets: ${lab.platelets} x10³/μL`,
          severity: lab.platelets < 50 ? 'high' : 'medium'
        });
      }
    });
    
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get patient statistics
  public getPatientStats(): {
    totalPatients: number;
    activePatients: number;
    patientsOnTreatment: number;
    completedTreatments: number;
    averageAge: number;
    commonDiagnoses: Array<{ diagnosis: string; count: number }>;
  } {
    const patients = this.getPatients();
    
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => 
      p.treatmentHistory.some(course => !course.endDate)
    ).length;
    
    const patientsOnTreatment = patients.filter(p =>
      p.treatmentHistory.some(course => !course.endDate)
    ).length;
    
    const completedTreatments = patients.reduce((sum, p) =>
      sum + p.treatmentHistory.filter(course => course.endDate).length, 0
    );
    
    const ages = patients
      .filter(p => p.dateOfBirth)
      .map(p => this.calculateAge(p.dateOfBirth));
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
    
    // Count diagnoses
    const diagnosisCount: Record<string, number> = {};
    patients.forEach(p => {
      if (p.diagnosis) {
        diagnosisCount[p.diagnosis] = (diagnosisCount[p.diagnosis] || 0) + 1;
      }
    });
    
    const commonDiagnoses = Object.entries(diagnosisCount)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalPatients,
      activePatients,
      patientsOnTreatment,
      completedTreatments,
      averageAge,
      commonDiagnoses
    };
  }

  // Calculate age
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Generate sample patients for demo
  public generateSamplePatients(): void {
    const samplePatients: Patient[] = [
      {
        id: 'patient_001',
        mrn: 'MRN001234',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1965-03-15',
        gender: 'male',
        height: 175,
        weight: 80,
        diagnosis: 'Non-small cell lung cancer, stage IV',
        stage: 'IV',
        ecogPerformanceStatus: 1,
        renalFunction: {
          creatinine: 1.1
        },
        hepaticFunction: {
          bilirubin: 0.8,
          alt: 32,
          ast: 28,
          albumin: 4.2
        },
        labValues: [
          {
            date: '2024-09-15',
            hemoglobin: 12.5,
            platelets: 250,
            anc: 3.2,
            wbc: 6.8
          }
        ],
        allergies: ['penicillin'],
        contraindications: [],
        currentMedications: [
          {
            name: 'Pembrolizumab',
            dose: '200mg',
            frequency: 'Every 3 weeks',
            startDate: '2024-08-01'
          }
        ],
        treatmentHistory: [
          {
            id: 'tx_001',
            regimenName: 'Pembrolizumab',
            startDate: '2024-08-01',
            cycles: 4,
            response: 'PR',
            toxicities: [],
            doseModifications: []
          }
        ],
        biomarkers: [
          {
            name: 'PD-L1',
            value: '85%',
            date: '2024-07-15',
            method: '22C3 pharmDx'
          }
        ]
      },
      {
        id: 'patient_002',
        mrn: 'MRN005678',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1958-11-22',
        gender: 'female',
        height: 162,
        weight: 65,
        diagnosis: 'Invasive ductal carcinoma, HER2+',
        stage: 'IIIA',
        ecogPerformanceStatus: 0,
        renalFunction: {
          creatinine: 0.9
        },
        hepaticFunction: {
          bilirubin: 0.6,
          alt: 25,
          ast: 22,
          albumin: 4.0
        },
        labValues: [
          {
            date: '2024-09-15',
            hemoglobin: 11.8,
            platelets: 180,
            anc: 2.8,
            wbc: 5.4
          }
        ],
        allergies: [],
        contraindications: [],
        currentMedications: [
          {
            name: 'Trastuzumab',
            dose: '6mg/kg',
            frequency: 'Every 3 weeks',
            startDate: '2024-07-15'
          }
        ],
        treatmentHistory: [
          {
            id: 'tx_002',
            regimenName: 'AC-T + Trastuzumab',
            startDate: '2024-04-01',
            endDate: '2024-07-15',
            cycles: 8,
            response: 'CR',
            toxicities: [
              {
                name: 'Neuropathy',
                grade: 2,
                onset: '2024-06-15',
                attribution: 'probable'
              }
            ],
            doseModifications: []
          }
        ],
        biomarkers: [
          {
            name: 'HER2',
            value: '3+',
            date: '2024-03-20',
            method: 'IHC'
          }
        ]
      }
    ];

    // Only add if no patients exist
    const existingPatients = this.getPatients();
    if (existingPatients.length === 0) {
      samplePatients.forEach(patient => this.savePatient(patient));
    }
  }

  // Export patient data
  public exportPatientData(patientId?: string): string {
    const data = patientId ? [this.getPatient(patientId)] : this.getPatients();
    return JSON.stringify({
      patients: data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Import patient data
  public importPatientData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.patients && Array.isArray(data.patients)) {
        data.patients.forEach((patient: Patient) => this.savePatient(patient));
      }
    } catch (error) {
      throw new Error('Invalid patient data format');
    }
  }
}

export const patientService = new PatientService();