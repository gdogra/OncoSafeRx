import { Patient, TreatmentCourse, GenomicProfile, Toxicity } from '../types/clinical';

export class PatientService {
  private readonly STORAGE_KEY = 'oncosaferx_patients';
  private readonly TREATMENT_HISTORY_KEY = 'oncosaferx_treatment_history';
  private readonly API_BASE_URL = '/api/patients';

  // Helper method to get auth token
  private getAuthToken(): string {
    try {
      const tokens = localStorage.getItem('osrx_auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.access_token || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  // Get all patients from database (with localStorage fallback)
  public async getPatients(): Promise<Patient[]> {
    try {
      // Use minimal headers - backend has optional auth with fallback user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(this.API_BASE_URL, {
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Loaded ${data.patients?.length || 0} patients from database`);
        return (data.patients || []).map((patient: any) => this.transformApiPatient(patient));
      } else {
        console.error(`❌ API call failed with status ${response.status}: ${response.statusText}`);
        console.error('🔄 Loading patients from localStorage instead');
        return this.getPatientsFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Network error loading patients from API:', error);
      console.error('🔄 Loading patients from localStorage instead');
      return this.getPatientsFromLocalStorage();
    }
  }

  // Fallback to localStorage
  private getPatientsFromLocalStorage(): Patient[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving patients from localStorage:', error);
      return [];
    }
  }

  // Get patient by ID from database (with localStorage fallback)
  public async getPatient(id: string): Promise<Patient | null> {
    try {
      // Use minimal headers - backend has optional auth with fallback user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const patientData = data.patient?.data || data.patient;
        return patientData ? this.transformApiPatient(patientData) : null;
      } else {
        console.warn('API failed, falling back to localStorage');
        const patients = this.getPatientsFromLocalStorage();
        return patients.find(p => p.id === id) || null;
      }
    } catch (error) {
      console.error('Error retrieving patient from API:', error);
      const patients = this.getPatientsFromLocalStorage();
      return patients.find(p => p.id === id) || null;
    }
  }

  // Save patient to database (with localStorage fallback)
  public async savePatient(patient: Patient): Promise<Patient> {
    try {
      console.log('🚀 savePatient called with:', { id: patient.id, name: `${patient.firstName} ${patient.lastName}` });
      console.log('🌐 API_BASE_URL:', this.API_BASE_URL);
      
      // Use minimal headers - backend has optional auth with fallback user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Transform flat Patient structure to nested backend format
      const backendPatient = {
        id: patient.id,
        demographics: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          sex: patient.gender,
          mrn: patient.mrn,
          heightCm: patient.height,
          weightKg: patient.weight
        },
        allergies: patient.allergies || [],
        medications: patient.currentMedications || [],
        conditions: patient.contraindications?.map(c => ({ condition: c })) || [],
        labValues: patient.labValues || [],
        genetics: patient.genomicProfile?.variants || [],
        vitals: [],
        treatmentHistory: patient.treatmentHistory || [],
        notes: [],
        preferences: {},
        lastUpdated: new Date().toISOString(),
        isActive: true
      };
      
      console.log('🔄 Transforming patient data:', { 
        original: patient, 
        transformed: backendPatient 
      });
      
      console.log('📤 Making POST request to:', this.API_BASE_URL);
      console.log('📤 Request payload:', { patient: backendPatient });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ patient: backendPatient }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📨 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Patient saved to database successfully');
        
        // Transform backend response back to frontend Patient format
        const savedPatient = data.patient;
        if (savedPatient?.data || savedPatient?.demographics) {
          const demographics = savedPatient.data?.demographics || savedPatient.demographics;
          return {
            ...patient,
            id: savedPatient.id || patient.id,
            firstName: demographics?.firstName || patient.firstName,
            lastName: demographics?.lastName || patient.lastName,
            dateOfBirth: demographics?.dateOfBirth || patient.dateOfBirth,
            gender: demographics?.sex || patient.gender,
            mrn: demographics?.mrn || patient.mrn,
            height: demographics?.heightCm || patient.height,
            weight: demographics?.weightKg || patient.weight
          };
        }
        
        return patient;
      } else {
        const errorText = await response.text();
        console.error(`❌ API call failed with status ${response.status}: ${response.statusText}`);
        console.error('❌ Error response body:', errorText);
        console.error('🔄 Falling back to localStorage - data will NOT persist across sessions');
        this.savePatientToLocalStorage(patient);
        return patient;
      }
    } catch (error) {
      console.error('❌ Network error saving patient to API:', error);
      console.error('🔄 Falling back to localStorage - data will NOT persist across sessions');
      try {
        this.savePatientToLocalStorage(patient);
        console.log('✅ Patient saved to localStorage successfully');
      } catch (localError) {
        console.warn('⚠️ localStorage save also failed, but returning patient anyway');
      }
      return patient;
    }
  }

  // Fallback to localStorage
  private savePatientToLocalStorage(patient: Patient): void {
    try {
      const patients = this.getPatientsFromLocalStorage();
      const existingIndex = patients.findIndex(p => p.id === patient.id);
      
      if (existingIndex !== -1) {
        patients[existingIndex] = patient;
        console.log('✅ Updated existing patient in localStorage');
      } else {
        patients.push(patient);
        console.log('✅ Added new patient to localStorage');
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patients));
      console.log('✅ Successfully saved patient to localStorage:', patient.id);
    } catch (error) {
      console.error('Error saving patient to localStorage:', error);
      // Don't throw - this prevents UI blocking
      console.warn('⚠️ Patient save to localStorage failed, but continuing...');
    }
  }

  // Delete patient from database (with localStorage fallback)
  public async deletePatient(id: string): Promise<void> {
    try {
      // Use minimal headers - backend has optional auth with fallback user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Patient deleted from database');
      } else {
        console.warn('API failed, falling back to localStorage');
        this.deletePatientFromLocalStorage(id);
      }
    } catch (error) {
      console.error('Error deleting patient from API:', error);
      this.deletePatientFromLocalStorage(id);
    }
  }

  // Fallback to localStorage
  private deletePatientFromLocalStorage(id: string): void {
    try {
      const patients = this.getPatientsFromLocalStorage();
      const filtered = patients.filter(p => p.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting patient from localStorage:', error);
      throw new Error('Failed to delete patient');
    }
  }

  // Search patients from database (with localStorage fallback)
  public async searchPatients(query: string): Promise<Patient[]> {
    try {
      // Use minimal headers - backend has optional auth with fallback user
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}?q=${encodeURIComponent(query)}`, {
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return (data.patients || []).map((patient: any) => this.transformApiPatient(patient));
      } else {
        console.warn('API failed, falling back to localStorage');
        return this.searchPatientsInLocalStorage(query);
      }
    } catch (error) {
      console.error('Error searching patients from API:', error);
      return this.searchPatientsInLocalStorage(query);
    }
  }

  // Fallback to localStorage
  private searchPatientsInLocalStorage(query: string): Patient[] {
    const patients = this.getPatientsFromLocalStorage();
    const lowerQuery = query.toLowerCase();
    
    return patients.filter(patient => 
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.mrn?.toLowerCase().includes(lowerQuery) ||
      patient.diagnosis.toLowerCase().includes(lowerQuery)
    );
  }

  // Add treatment course
  public async addTreatmentCourse(patientId: string, course: TreatmentCourse): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.treatmentHistory = patient.treatmentHistory || [];
    patient.treatmentHistory.push(course);
    await this.savePatient(patient);
  }

  // Update treatment course
  public async updateTreatmentCourse(patientId: string, courseId: string, updates: Partial<TreatmentCourse>): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    const courseIndex = patient.treatmentHistory.findIndex(c => c.id === courseId);
    if (courseIndex === -1) throw new Error('Treatment course not found');
    
    patient.treatmentHistory[courseIndex] = {
      ...patient.treatmentHistory[courseIndex],
      ...updates
    };
    
    await this.savePatient(patient);
  }

  // Add toxicity event
  public async addToxicity(patientId: string, courseId: string, toxicity: Toxicity): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    const course = patient.treatmentHistory.find(c => c.id === courseId);
    if (!course) throw new Error('Treatment course not found');
    
    course.toxicities = course.toxicities || [];
    course.toxicities.push(toxicity);
    await this.savePatient(patient);
  }

  // Update lab values
  public async updateLabValues(patientId: string, labValues: Patient['labValues'][0]): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.labValues = patient.labValues || [];
    patient.labValues.push(labValues);
    
    // Keep only last 50 lab results
    patient.labValues = patient.labValues
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);
    
    await this.savePatient(patient);
  }

  // Update genomic profile
  public async updateGenomicProfile(patientId: string, genomicProfile: GenomicProfile): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.genomicProfile = genomicProfile;
    await this.savePatient(patient);
  }

  // Add biomarker
  public async addBiomarker(patientId: string, biomarker: Patient['biomarkers'][0]): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');
    
    patient.biomarkers = patient.biomarkers || [];
    patient.biomarkers.push(biomarker);
    await this.savePatient(patient);
  }

  // Get treatment timeline
  public async getTreatmentTimeline(patientId: string): Promise<Array<{
    date: string;
    type: 'treatment' | 'lab' | 'toxicity' | 'response';
    title: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
  }>> {
    const patient = await this.getPatient(patientId);
    if (!patient) return [];
    
    const timeline: Array<{
      date: string;
      type: 'treatment' | 'lab' | 'toxicity' | 'response';
      title: string;
      description: string;
      severity?: 'low' | 'medium' | 'high';
    }> = [];
    
    // Add treatment events
    patient.treatmentHistory?.forEach(course => {
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
  public async getPatientStats(): Promise<{
    totalPatients: number;
    activePatients: number;
    patientsOnTreatment: number;
    completedTreatments: number;
    averageAge: number;
    commonDiagnoses: Array<{ diagnosis: string; count: number }>;
  }> {
    const patients = await this.getPatients();
    
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => 
      p.treatmentHistory?.some(course => !course.endDate)
    ).length;
    
    const patientsOnTreatment = patients.filter(p =>
      p.treatmentHistory?.some(course => !course.endDate)
    ).length;
    
    const completedTreatments = patients.reduce((sum, p) =>
      sum + (p.treatmentHistory?.filter(course => course.endDate).length || 0), 0
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


  // Transform API patient data to internal format
  private transformApiPatient(apiPatient: any): Patient {
    return {
      id: apiPatient.id,
      mrn: apiPatient.demographics?.mrn || `MRN${Math.random().toString().slice(2, 8)}`,
      firstName: apiPatient.demographics?.firstName || 'Unknown',
      lastName: apiPatient.demographics?.lastName || 'Patient',
      dateOfBirth: apiPatient.demographics?.dateOfBirth || '1980-01-01',
      gender: apiPatient.demographics?.sex || apiPatient.demographics?.gender || 'unknown',
      height: apiPatient.demographics?.heightCm || 170,
      weight: apiPatient.demographics?.weightKg || 70,
      diagnosis: apiPatient.conditions?.[0]?.name || 'Unknown diagnosis',
      stage: apiPatient.conditions?.[0]?.stage || 'Unknown',
      ecogPerformanceStatus: apiPatient.vitals?.[0]?.performanceStatus || 1,
      renalFunction: {
        creatinine: apiPatient.labValues?.find((lab: any) => lab.labType === 'creatinine')?.value || 1.0
      },
      hepaticFunction: {
        alt: apiPatient.labValues?.find((lab: any) => lab.labType === 'alt')?.value || 25,
        ast: apiPatient.labValues?.find((lab: any) => lab.labType === 'ast')?.value || 25,
        bilirubin: apiPatient.labValues?.find((lab: any) => lab.labType === 'bilirubin')?.value || 1.0,
        albumin: apiPatient.labValues?.find((lab: any) => lab.labType === 'albumin')?.value || 4.0
      },
      allergies: (apiPatient.allergies || []).map((allergy: any) => allergy.allergen),
      currentMedications: (apiPatient.medications || [])
        .filter((med: any) => med.isActive)
        .map((med: any) => med.drugName || med.drug),
      treatmentHistory: apiPatient.treatmentHistory || [],
      contraindications: apiPatient.contraindications || [],
      labValues: apiPatient.labValues || [],
      biomarkers: apiPatient.biomarkers || [],
      genomicProfile: {
        // Map backend genetics to mutations format if present
        mutations: (apiPatient.genetics || []).map((g: any) => ({
          gene: g.geneSymbol || g.gene || 'UNK',
          variant: g.variant || g.alleles?.join('/') || 'NA',
          variantType: g.variantType || 'mutation',
          alleleFrequency: g.alleleFrequency,
          clinicalSignificance: g.clinicalSignificance || 'uncertain'
        })),
        testDate: apiPatient.genetics?.[0]?.testDate || new Date().toISOString(),
        testType: apiPatient.genetics?.[0]?.testMethod || 'NGS',
        microsatelliteInstability: 'MSS'
      }
    };
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
    const existingPatients = this.getPatientsFromLocalStorage();
    if ((existingPatients || []).length === 0) {
      samplePatients.forEach(patient => this.savePatient(patient));
    }
  }

  // Export patient data
  public async exportPatientData(patientId?: string): Promise<string> {
    const data = patientId ? [await this.getPatient(patientId)] : await this.getPatients();
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
