import { 
  Team, 
  TeamMember, 
  TumorBoard, 
  TumorBoardCase, 
  ClinicalPathway, 
  CommunicationThread, 
  Message, 
  ConsultationRequest,
  WorkflowTemplate,
  ActionItem
} from '../types/collaboration';

export class CollaborationService {
  private readonly TEAMS_KEY = 'oncosaferx_teams';
  private readonly TUMOR_BOARDS_KEY = 'oncosaferx_tumor_boards';
  private readonly PATHWAYS_KEY = 'oncosaferx_pathways';
  private readonly COMMUNICATIONS_KEY = 'oncosaferx_communications';
  private readonly CONSULTATIONS_KEY = 'oncosaferx_consultations';
  private readonly WORKFLOWS_KEY = 'oncosaferx_workflows';

  // Team Management
  public getTeams(): Team[] {
    try {
      const stored = localStorage.getItem(this.TEAMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving teams:', error);
      return [];
    }
  }

  public getTeam(id: string): Team | null {
    const teams = this.getTeams();
    return teams.find(t => t.id === id) || null;
  }

  public saveTeam(team: Team): void {
    try {
      const teams = this.getTeams();
      const existingIndex = teams.findIndex(t => t.id === team.id);
      
      if (existingIndex !== -1) {
        teams[existingIndex] = team;
      } else {
        teams.push(team);
      }
      
      localStorage.setItem(this.TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving team:', error);
      throw new Error('Failed to save team');
    }
  }

  public addTeamMember(teamId: string, member: TeamMember): void {
    const team = this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    team.members.push(member);
    team.lastActivity = new Date().toISOString();
    this.saveTeam(team);
  }

  public removeTeamMember(teamId: string, memberId: string): void {
    const team = this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    team.members = team.members.filter(m => m.id !== memberId);
    team.lastActivity = new Date().toISOString();
    this.saveTeam(team);
  }

  public updateMemberAvailability(teamId: string, memberId: string, availability: any): void {
    const team = this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    const member = team.members.find(m => m.id === memberId);
    if (!member) throw new Error('Member not found');
    
    member.availability = availability;
    member.lastActive = new Date().toISOString();
    this.saveTeam(team);
  }

  // Tumor Board Management
  public getTumorBoards(): TumorBoard[] {
    try {
      const stored = localStorage.getItem(this.TUMOR_BOARDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving tumor boards:', error);
      return [];
    }
  }

  public getTumorBoard(id: string): TumorBoard | null {
    const boards = this.getTumorBoards();
    return boards.find(b => b.id === id) || null;
  }

  public saveTumorBoard(board: TumorBoard): void {
    try {
      const boards = this.getTumorBoards();
      const existingIndex = boards.findIndex(b => b.id === board.id);
      
      if (existingIndex !== -1) {
        boards[existingIndex] = board;
      } else {
        boards.push(board);
      }
      
      localStorage.setItem(this.TUMOR_BOARDS_KEY, JSON.stringify(boards));
    } catch (error) {
      console.error('Error saving tumor board:', error);
      throw new Error('Failed to save tumor board');
    }
  }

  public addTumorBoardCase(boardId: string, tumorBoardCase: TumorBoardCase): void {
    const board = this.getTumorBoard(boardId);
    if (!board) throw new Error('Tumor board not found');
    
    board.cases.push(tumorBoardCase);
    board.lastModified = new Date().toISOString();
    this.saveTumorBoard(board);
  }

  public updateTumorBoardCase(boardId: string, caseId: string, updates: Partial<TumorBoardCase>): void {
    const board = this.getTumorBoard(boardId);
    if (!board) throw new Error('Tumor board not found');
    
    const caseIndex = board.cases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) throw new Error('Case not found');
    
    board.cases[caseIndex] = { ...board.cases[caseIndex], ...updates };
    board.lastModified = new Date().toISOString();
    this.saveTumorBoard(board);
  }

  public addActionItem(boardId: string, actionItem: ActionItem): void {
    const board = this.getTumorBoard(boardId);
    if (!board) throw new Error('Tumor board not found');
    
    board.actionItems.push(actionItem);
    board.lastModified = new Date().toISOString();
    this.saveTumorBoard(board);
  }

  public updateActionItem(boardId: string, actionItemId: string, updates: Partial<ActionItem>): void {
    const board = this.getTumorBoard(boardId);
    if (!board) throw new Error('Tumor board not found');
    
    const itemIndex = board.actionItems.findIndex(a => a.id === actionItemId);
    if (itemIndex === -1) throw new Error('Action item not found');
    
    board.actionItems[itemIndex] = { ...board.actionItems[itemIndex], ...updates };
    board.lastModified = new Date().toISOString();
    this.saveTumorBoard(board);
  }

  // Clinical Pathways
  public getClinicalPathways(): ClinicalPathway[] {
    try {
      const stored = localStorage.getItem(this.PATHWAYS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving clinical pathways:', error);
      return [];
    }
  }

  public getClinicalPathway(id: string): ClinicalPathway | null {
    const pathways = this.getClinicalPathways();
    return pathways.find(p => p.id === id) || null;
  }

  public saveClinicalPathway(pathway: ClinicalPathway): void {
    try {
      const pathways = this.getClinicalPathways();
      const existingIndex = pathways.findIndex(p => p.id === pathway.id);
      
      if (existingIndex !== -1) {
        pathways[existingIndex] = pathway;
      } else {
        pathways.push(pathway);
      }
      
      localStorage.setItem(this.PATHWAYS_KEY, JSON.stringify(pathways));
    } catch (error) {
      console.error('Error saving clinical pathway:', error);
      throw new Error('Failed to save clinical pathway');
    }
  }

  public findPathwaysForCondition(condition: string, stage?: string): ClinicalPathway[] {
    const pathways = this.getClinicalPathways();
    return pathways.filter(p => 
      p.condition.toLowerCase().includes(condition.toLowerCase()) &&
      (!stage || !p.stage || p.stage === stage)
    );
  }

  // Communication
  public getCommunicationThreads(): CommunicationThread[] {
    try {
      const stored = localStorage.getItem(this.COMMUNICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving communications:', error);
      return [];
    }
  }

  public getCommunicationThread(id: string): CommunicationThread | null {
    const threads = this.getCommunicationThreads();
    return threads.find(t => t.id === id) || null;
  }

  public saveCommunicationThread(thread: CommunicationThread): void {
    try {
      const threads = this.getCommunicationThreads();
      const existingIndex = threads.findIndex(t => t.id === thread.id);
      
      if (existingIndex !== -1) {
        threads[existingIndex] = thread;
      } else {
        threads.push(thread);
      }
      
      localStorage.setItem(this.COMMUNICATIONS_KEY, JSON.stringify(threads));
    } catch (error) {
      console.error('Error saving communication thread:', error);
      throw new Error('Failed to save communication thread');
    }
  }

  public addMessage(threadId: string, message: Message): void {
    const thread = this.getCommunicationThread(threadId);
    if (!thread) throw new Error('Communication thread not found');
    
    thread.messages.push(message);
    thread.lastActivity = new Date().toISOString();
    this.saveCommunicationThread(thread);
  }

  public getThreadsForUser(userId: string): CommunicationThread[] {
    const threads = this.getCommunicationThreads();
    return threads.filter(t => t.participants.includes(userId));
  }

  public getUnreadMessages(userId: string): Message[] {
    const threads = this.getThreadsForUser(userId);
    const unreadMessages: Message[] = [];
    
    threads.forEach(thread => {
      thread.messages.forEach(message => {
        if (message.senderId !== userId) {
          const acknowledgment = message.acknowledgments.find(a => a.userId === userId);
          if (!acknowledgment) {
            unreadMessages.push(message);
          }
        }
      });
    });
    
    return unreadMessages;
  }

  // Consultations
  public getConsultationRequests(): ConsultationRequest[] {
    try {
      const stored = localStorage.getItem(this.CONSULTATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving consultation requests:', error);
      return [];
    }
  }

  public getConsultationRequest(id: string): ConsultationRequest | null {
    const requests = this.getConsultationRequests();
    return requests.find(r => r.id === id) || null;
  }

  public saveConsultationRequest(request: ConsultationRequest): void {
    try {
      const requests = this.getConsultationRequests();
      const existingIndex = requests.findIndex(r => r.id === request.id);
      
      if (existingIndex !== -1) {
        requests[existingIndex] = request;
      } else {
        requests.push(request);
      }
      
      localStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving consultation request:', error);
      throw new Error('Failed to save consultation request');
    }
  }

  public getConsultationRequestsForUser(userId: string): ConsultationRequest[] {
    const requests = this.getConsultationRequests();
    return requests.filter(r => 
      r.requesterId === userId || 
      r.assignedTo === userId ||
      (r.consultantResponse?.responderId === userId)
    );
  }

  public getPendingConsultations(specialty?: string): ConsultationRequest[] {
    const requests = this.getConsultationRequests();
    return requests.filter(r => 
      r.status === 'pending' &&
      (!specialty || r.specialtyRequested === specialty)
    );
  }

  // Workflows
  public getWorkflowTemplates(): WorkflowTemplate[] {
    try {
      const stored = localStorage.getItem(this.WORKFLOWS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving workflow templates:', error);
      return [];
    }
  }

  public getWorkflowTemplate(id: string): WorkflowTemplate | null {
    const templates = this.getWorkflowTemplates();
    return templates.find(t => t.id === id) || null;
  }

  public saveWorkflowTemplate(template: WorkflowTemplate): void {
    try {
      const templates = this.getWorkflowTemplates();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex !== -1) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving workflow template:', error);
      throw new Error('Failed to save workflow template');
    }
  }

  // Analytics and Reporting
  public getTeamActivitySummary(teamId: string, days: number = 30): any {
    const team = this.getTeam(teamId);
    if (!team) return null;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const boards = this.getTumorBoards().filter(b => 
      b.attendees.some(a => team.members.some(m => m.id === a)) &&
      new Date(b.scheduledDate) >= cutoffDate
    );

    const threads = this.getCommunicationThreads().filter(t =>
      t.participants.some(p => team.members.some(m => m.id === p)) &&
      new Date(t.lastActivity) >= cutoffDate
    );

    const consultations = this.getConsultationRequests().filter(r =>
      team.members.some(m => m.id === r.requesterId || m.id === r.assignedTo) &&
      new Date(r.createdDate) >= cutoffDate
    );

    return {
      teamId,
      period: `${days} days`,
      tumorBoards: boards.length,
      casesPresented: boards.reduce((sum, b) => sum + b.cases.length, 0),
      communicationThreads: threads.length,
      messages: threads.reduce((sum, t) => sum + t.messages.length, 0),
      consultations: consultations.length,
      actionItems: boards.reduce((sum, b) => sum + b.actionItems.length, 0),
      completedActionItems: boards.reduce((sum, b) => 
        sum + b.actionItems.filter(a => a.status === 'completed').length, 0
      )
    };
  }

  public getTumorBoardMetrics(boardId?: string): any {
    let boards = this.getTumorBoards();
    if (boardId) {
      const board = this.getTumorBoard(boardId);
      boards = board ? [board] : [];
    }

    const totalCases = boards.reduce((sum, b) => sum + b.cases.length, 0);
    const casesWithConsensus = boards.reduce((sum, b) => 
      sum + b.cases.filter(c => c.consensusReached).length, 0
    );
    const totalActionItems = boards.reduce((sum, b) => sum + b.actionItems.length, 0);
    const completedActionItems = boards.reduce((sum, b) => 
      sum + b.actionItems.filter(a => a.status === 'completed').length, 0
    );

    return {
      totalBoards: boards.length,
      totalCases,
      consensusRate: totalCases > 0 ? (casesWithConsensus / totalCases) * 100 : 0,
      totalActionItems,
      actionItemCompletionRate: totalActionItems > 0 ? (completedActionItems / totalActionItems) * 100 : 0,
      averageCasesPerBoard: boards.length > 0 ? totalCases / boards.length : 0
    };
  }

  // Sample data generation
  // Fetch teams from API
  public async fetchTeams(specialty?: string): Promise<Team[]> {
    try {
      const RAW = import.meta.env.VITE_API_URL || '/api';
      const API_BASE = /^https?:\/\//i.test(RAW) ? RAW : (RAW.startsWith('/') ? RAW : `/${RAW}`);
      const params = new URLSearchParams();
      if (specialty) params.append('specialty', specialty);
      
      const response = await fetch(`${API_BASE}/collaboration/teams?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.teams.map(this.transformApiTeam);
    } catch (error) {
      console.warn('Failed to fetch teams from API, using sample data:', error);
      this.generateSampleData();
      return this.getTeams();
    }
  }

  // Fetch tumor boards from API
  public async fetchTumorBoards(teamId?: string): Promise<TumorBoard[]> {
    try {
      const RAW2 = import.meta.env.VITE_API_URL || '/api';
      const API_BASE = /^https?:\/\//i.test(RAW2) ? RAW2 : (RAW2.startsWith('/') ? RAW2 : `/${RAW2}`);
      const params = new URLSearchParams();
      if (teamId) params.append('teamId', teamId);
      
      const response = await fetch(`${API_BASE}/collaboration/tumor-boards?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.tumorBoards.map(this.transformApiTumorBoard);
    } catch (error) {
      console.warn('Failed to fetch tumor boards from API, using sample data:', error);
      this.generateSampleData();
      return this.getTumorBoards();
    }
  }

  // Fetch clinical pathways from API
  public async fetchClinicalPathways(cancerType?: string): Promise<ClinicalPathway[]> {
    try {
      const RAW3 = import.meta.env.VITE_API_URL || '/api';
      const API_BASE = /^https?:\/\//i.test(RAW3) ? RAW3 : (RAW3.startsWith('/') ? RAW3 : `/${RAW3}`);
      const params = new URLSearchParams();
      if (cancerType) params.append('cancerType', cancerType);
      
      const response = await fetch(`${API_BASE}/collaboration/pathways?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.pathways.map(this.transformApiPathway);
    } catch (error) {
      console.warn('Failed to fetch pathways from API, using sample data:', error);
      this.generateSampleData();
      return this.getClinicalPathways();
    }
  }

  // Transform API data to frontend models
  private transformApiTeam(apiTeam: any): Team {
    return {
      id: apiTeam.id,
      name: apiTeam.name,
      description: apiTeam.description,
      specialty: String(apiTeam.specialty || 'multidisciplinary').toLowerCase() as any,
      members: (apiTeam.members || []).map((member: any) => ({
        id: member.id,
        name: member.name,
        role: (String(member.role || 'physician').toLowerCase().replace(' ', '_')) as any,
        title: member.role,
        email: member.email,
        phone: member.phone,
        specialty: member.specialization,
        credentials: [],
        permissions: [{ resource: 'patients', actions: ['view'] }],
        availability: { status: 'available' as const },
        joinedDate: apiTeam.createdDate || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      })),
      patients: [],
      createdDate: apiTeam.createdDate || new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: apiTeam.isActive !== false
    };
  }

  private transformApiTumorBoard(apiBoard: any): TumorBoard {
    return {
      id: apiBoard.id,
      name: apiBoard.name,
      type: 'weekly',
      scheduledDate: apiBoard.nextMeeting || new Date().toISOString(),
      duration: apiBoard.schedule?.duration || 60,
      location: apiBoard.location || 'Virtual',
      virtualMeetingUrl: apiBoard.schedule?.virtualLink,
      chair: (apiBoard.chair?.id || '') as string,
      presenters: (apiBoard.presenters || []).map((p: any) => p.id),
      attendees: (apiBoard.attendees || []).map((a: any) => a.id),
      cases: [],
      agenda: [],
      notes: '',
      decisions: [],
      actionItems: [],
      status: 'scheduled',
      createdBy: apiBoard.createdBy || 'system',
      createdDate: apiBoard.createdDate || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  }

  private transformApiPathway(apiPathway: any): ClinicalPathway {
    return {
      id: apiPathway.id,
      name: apiPathway.name,
      version: apiPathway.version || '1.0',
      condition: apiPathway.cancerType || apiPathway.condition || 'Oncology',
      stage: apiPathway.stage,
      lineOfTherapy: apiPathway.lineOfTherapy,
      steps: [],
      decisionPoints: [],
      evidenceBasis: apiPathway.evidenceBasis || 'Institutional guidelines',
      lastReviewed: apiPathway.lastUpdated || new Date().toISOString(),
      reviewBy: apiPathway.reviewBy || 'Clinical Committee',
      approvedBy: apiPathway.approvedBy || 'Medical Director',
      effectiveDate: apiPathway.effectiveDate || new Date().toISOString(),
      patientsEnrolled: apiPathway.patientsEnrolled || 0,
      completionRate: apiPathway.completionRate || 0,
      outcomeMetrics: [],
      varianceReporting: true,
      qualityIndicators: []
    };
  }

  public generateSampleData(): void {
    const existingTeams = this.getTeams();
    if (existingTeams.length > 0) return;

    // Sample team
    const sampleTeam: Team = {
      id: 'team_001',
      name: 'Thoracic Oncology Team',
      description: 'Multidisciplinary team focused on lung cancer care',
      specialty: 'oncology',
      members: [
        {
          id: 'member_001',
          name: 'Dr. Sarah Johnson',
          role: 'physician',
          title: 'Medical Oncologist',
          email: 'sjohnson@hospital.com',
          phone: '555-0101',
          specialty: 'Medical Oncology',
          credentials: ['MD', 'FACP'],
          permissions: [
            {
              resource: 'patients',
              actions: ['view', 'create', 'edit', 'approve']
            }
          ],
          availability: {
            status: 'available',
            message: 'Available for consultations'
          },
          joinedDate: '2024-01-01',
          lastActive: new Date().toISOString()
        }
      ],
      patients: ['patient_001', 'patient_002'],
      createdDate: '2024-01-01',
      lastActivity: new Date().toISOString(),
      isActive: true
    };

    this.saveTeam(sampleTeam);

    // Sample tumor board
    const sampleBoard: TumorBoard = {
      id: 'board_001',
      name: 'Weekly Thoracic Tumor Board',
      type: 'weekly',
      scheduledDate: new Date().toISOString(),
      duration: 60,
      location: 'Conference Room A',
      chair: 'member_001',
      presenters: ['member_001'],
      attendees: ['member_001'],
      cases: [],
      agenda: [],
      notes: '',
      decisions: [],
      actionItems: [],
      status: 'scheduled',
      createdBy: 'member_001',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.saveTumorBoard(sampleBoard);

    // Sample clinical pathway
    const samplePathway: ClinicalPathway = {
      id: 'pathway_001',
      name: 'Stage IV NSCLC Treatment Pathway',
      version: '1.0',
      condition: 'Non-small cell lung cancer',
      stage: 'IV',
      lineOfTherapy: 'First-line',
      steps: [],
      decisionPoints: [],
      evidenceBasis: 'NCCN Guidelines 2024',
      lastReviewed: new Date().toISOString(),
      reviewBy: 'Dr. Johnson',
      approvedBy: 'Medical Director',
      effectiveDate: new Date().toISOString(),
      patientsEnrolled: 0,
      completionRate: 0,
      outcomeMetrics: [],
      varianceReporting: true,
      qualityIndicators: []
    };

    this.saveClinicalPathway(samplePathway);
  }
}

export const collaborationService = new CollaborationService();
