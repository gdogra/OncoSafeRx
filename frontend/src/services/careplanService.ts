import { adminFetch } from '../utils/adminApi';
// Note: We use adminFetch which handles JWT authentication headers properly

export interface CarePlanGoal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  targetDate: string;
  progress: number;
  category: 'treatment' | 'lifestyle' | 'support' | 'monitoring';
}

export interface CarePlanSection {
  id: string;
  title: string;
  description: string;
  items: string[];
  lastUpdated: string;
}

export interface CarePlanData {
  sections: CarePlanSection[];
  goals: CarePlanGoal[];
  nextAppointment?: string;
  lastUpdated?: string;
  reviewDate?: string;
  doctorName?: string;
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: 'oncologist' | 'nurse' | 'pharmacist' | 'social_worker' | 'nutritionist' | 'surgeon' | 'radiologist' | 'pathologist';
  specialty?: string;
  hospital: string;
  department: string;
  email: string;
  phone: string;
  availability: 'available' | 'busy' | 'offline';
  lastActive: string;
  avatar?: string;
  certifications: string[];
  yearsExperience: number;
}

export interface CareTask {
  id: string;
  title: string;
  description: string;
  type: 'medication' | 'appointment' | 'lab' | 'imaging' | 'consultation' | 'follow_up' | 'education' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  dependencies?: string[];
  patientId: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  stage: string;
  treatmentPhase: 'initial' | 'active' | 'maintenance' | 'surveillance' | 'palliative';
  primaryOncologist: string;
  startDate: string;
  nextReviewDate: string;
  goals: string[];
  milestones: Array<{
    id: string;
    title: string;
    targetDate: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    description: string;
  }>;
  riskFactors: string[];
  allergies: string[];
  currentMedications: string[];
}

export interface CommunicationThread {
  id: string;
  subject: string;
  participants: string[];
  patientId: string;
  type: 'general' | 'urgent' | 'medication' | 'symptoms' | 'results';
  lastMessage: {
    sender: string;
    content: string;
    timestamp: string;
    read: boolean;
  };
  unreadCount: number;
  priority: 'normal' | 'high' | 'urgent';
}

class CarePlanService {
  /**
   * Fetch care plan data for the current user
   */
  async getCarePlanData(): Promise<CarePlanData> {
    try {
      const response = await adminFetch('/careplan/patient');
      return response;
    } catch (error: any) {
      console.error('Error fetching care plan data:', error);
      
      // Return empty structure when API fails
      return {
        sections: [],
        goals: [],
        nextAppointment: undefined,
        lastUpdated: undefined,
        reviewDate: undefined,
        doctorName: undefined
      };
    }
  }

  /**
   * Fetch care team members
   */
  async getCareTeam(): Promise<CareTeamMember[]> {
    try {
      const response = await adminFetch('/careplan/team');
      return response;
    } catch (error) {
      console.error('Error fetching care team:', error);
      return [];
    }
  }

  /**
   * Fetch care tasks
   */
  async getCareTasks(): Promise<CareTask[]> {
    try {
      const response = await adminFetch('/careplan/tasks');
      return response;
    } catch (error) {
      console.error('Error fetching care tasks:', error);
      return [];
    }
  }

  /**
   * Fetch care plans for coordination hub
   */
  async getCarePlans(): Promise<CarePlan[]> {
    try {
      const response = await adminFetch('/careplan/plans');
      return response;
    } catch (error) {
      console.error('Error fetching care plans:', error);
      return [];
    }
  }

  /**
   * Fetch communication threads
   */
  async getCommunications(): Promise<CommunicationThread[]> {
    try {
      const response = await adminFetch('/careplan/communications');
      return response;
    } catch (error) {
      console.error('Error fetching communications:', error);
      return [];
    }
  }

  /**
   * Update care plan goal progress
   */
  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    try {
      await adminFetch(`/careplan/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  /**
   * Create a new care task
   */
  async createTask(task: Omit<CareTask, 'id' | 'createdAt'>): Promise<CareTask> {
    try {
      const response = await adminFetch('/careplan/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: CareTask['status'], notes?: string): Promise<void> {
    try {
      await adminFetch(`/careplan/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Send a message to care team
   */
  async sendMessage(subject: string, content: string, recipients: string[], type: CommunicationThread['type'] = 'general'): Promise<void> {
    try {
      await adminFetch('/careplan/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content, recipients, type })
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Request care plan update from provider
   */
  async requestCarePlanUpdate(message: string): Promise<void> {
    try {
      await adminFetch('/careplan/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
    } catch (error) {
      console.error('Error requesting care plan update:', error);
      throw error;
    }
  }

  /**
   * Generate care plan PDF
   */
  async generateCarePlanPDF(): Promise<Blob> {
    try {
      const response = await fetch('/api/careplan/pdf', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error generating care plan PDF:', error);
      throw error;
    }
  }
  
  private async getAuthToken(): Promise<string | null> {
    try {
      const tokens = localStorage.getItem('osrx_auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.access_token || null;
      }
    } catch {}
    return null;
  }
}

export const careplanService = new CarePlanService();