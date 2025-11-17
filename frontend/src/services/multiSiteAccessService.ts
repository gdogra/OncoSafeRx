/**
 * Multi-Site Access Control Service
 * Manages patient data access across the global OncoSafeRx network
 */

import { 
  NetworkSite, 
  MultiSiteUserPermissions, 
  MultiSitePatientProfile,
  SiteAccess,
  AccessAuditLog,
  TemporaryAccess,
  CrossSiteReferral,
  NetworkConfiguration
} from '../types/multiSite';

export class MultiSiteAccessService {
  private networkConfig: NetworkConfiguration | null = null;
  private currentUser: MultiSiteUserPermissions | null = null;
  private auditEnabled = true;

  /**
   * Initialize the multi-site access service
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Load network configuration
      this.networkConfig = await this.loadNetworkConfiguration();
      
      // Load user permissions
      this.currentUser = await this.loadUserPermissions(userId);
      
      // Initialize audit logging
      this.initializeAuditLogging();
    } catch (error) {
      console.error('Failed to initialize multi-site access:', error);
      throw error;
    }
  }

  /**
   * Get all sites accessible to the current user
   */
  getAccessibleSites(): NetworkSite[] {
    if (!this.currentUser || !this.networkConfig) return [];

    return this.networkConfig.sites.filter(site => 
      this.hasAccessToSite(site.siteId)
    );
  }

  /**
   * Check if user has access to a specific site
   */
  hasAccessToSite(siteId: string): boolean {
    if (!this.currentUser) return false;

    // Always has access to home site
    if (this.currentUser.homeSite === siteId) return true;

    // Check authorized sites
    return this.currentUser.authorizedSites.some(access => 
      access.siteId === siteId && this.isAccessValid(access)
    );
  }

  /**
   * Check if user can access a specific patient
   */
  async canAccessPatient(patientId: string, action: 'view' | 'edit' | 'export' = 'view'): Promise<{
    allowed: boolean;
    reason?: string;
    requiresJustification?: boolean;
    siteContext?: string;
  }> {
    if (!this.currentUser) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    try {
      // Get patient metadata
      const patient = await this.getPatientMetadata(patientId);
      if (!patient) {
        return { allowed: false, reason: 'Patient not found' };
      }

      // Check site-level access
      const siteAccess = this.checkSiteAccess(patient.siteMetadata.primarySite);
      if (!siteAccess.allowed) {
        return { allowed: false, reason: siteAccess.reason };
      }

      // Check patient-specific permissions
      const patientAccess = this.checkPatientAccess(patient, action);
      if (!patientAccess.allowed) {
        return { allowed: false, reason: patientAccess.reason };
      }

      // Check data sharing consents
      const consentAccess = this.checkDataSharingConsent(patient);
      if (!consentAccess.allowed) {
        return { 
          allowed: false, 
          reason: consentAccess.reason,
          requiresJustification: true 
        };
      }

      // Log access attempt
      await this.logAccess(patientId, action, 'allowed');

      return { 
        allowed: true,
        siteContext: patient.siteMetadata.primarySite
      };

    } catch (error) {
      console.error('Error checking patient access:', error);
      await this.logAccess(patientId, action, 'error');
      return { allowed: false, reason: 'Access check failed' };
    }
  }

  /**
   * Get patients accessible to current user with site context
   */
  async getAccessiblePatients(filters?: {
    siteId?: string;
    specialty?: string;
    accessLevel?: string;
    lastUpdatedAfter?: string;
  }): Promise<{
    patients: MultiSitePatientProfile[];
    totalCount: number;
    accessSummary: {
      homeSitePatients: number;
      consultationPatients: number;
      researchPatients: number;
      emergencyAccess: number;
    };
  }> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Build query based on user's site access
      const accessibleSites = this.getAccessibleSites().map(site => site.siteId);
      const query = this.buildPatientQuery(accessibleSites, filters);
      
      // Fetch patients from accessible sites
      const response = await fetch('/api/patients/multi-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userPermissions: this.currentUser,
          auditContext: {
            action: 'list_patients',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter patients based on individual access rules
      const filteredPatients = await this.filterPatientsByAccess(data.patients);

      // Generate access summary
      const accessSummary = this.generateAccessSummary(filteredPatients);

      return {
        patients: filteredPatients,
        totalCount: filteredPatients.length,
        accessSummary
      };

    } catch (error) {
      console.error('Error fetching accessible patients:', error);
      throw error;
    }
  }

  /**
   * Request temporary access to a patient or site
   */
  async requestTemporaryAccess(request: {
    type: 'patient' | 'site';
    targetId: string;
    reason: 'emergency' | 'coverage' | 'consultation' | 'transfer';
    justification: string;
    duration: number; // hours
    requestedAccessLevel: 'read_only' | 'read_write' | 'full';
  }): Promise<{
    approved: boolean;
    accessGranted?: TemporaryAccess;
    requiresApproval?: boolean;
    approvalWorkflowId?: string;
  }> {
    try {
      const response = await fetch('/api/access/temporary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          requestedBy: this.currentUser?.userId,
          requestedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      // If auto-approved (e.g., emergency access), update local permissions
      if (result.approved && result.accessGranted) {
        await this.updateTemporaryAccess(result.accessGranted);
      }

      return result;
    } catch (error) {
      console.error('Error requesting temporary access:', error);
      throw error;
    }
  }

  /**
   * Break glass access for emergencies
   */
  async breakGlassAccess(patientId: string, justification: string): Promise<{
    granted: boolean;
    accessLevel: string;
    expiresAt: string;
    auditId: string;
  }> {
    if (!this.networkConfig?.globalSettings.emergencyAccessEnabled) {
      throw new Error('Emergency access not enabled for this network');
    }

    try {
      const response = await fetch('/api/access/break-glass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          justification,
          requestedBy: this.currentUser?.userId,
          userRole: this.currentUser?.role,
          homeSite: this.currentUser?.homeSite,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      // Log break-glass access
      await this.logBreakGlassAccess(patientId, justification, result.auditId);

      return result;
    } catch (error) {
      console.error('Error requesting break-glass access:', error);
      throw error;
    }
  }

  /**
   * Create cross-site referral
   */
  async createCrossSiteReferral(referral: Omit<CrossSiteReferral, 'id' | 'status' | 'createdAt'>): Promise<CrossSiteReferral> {
    try {
      // Validate sites are in network
      if (!this.hasAccessToSite(referral.fromSite) || 
          !this.networkConfig?.sites.find(s => s.siteId === referral.toSite)) {
        throw new Error('Invalid referral sites');
      }

      const response = await fetch('/api/referrals/cross-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...referral,
          id: this.generateReferralId(),
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating cross-site referral:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for access review
   */
  async getAccessAuditTrail(filters: {
    patientId?: string;
    siteId?: string;
    userId?: string;
    startDate: string;
    endDate: string;
    actions?: string[];
  }): Promise<AccessAuditLog[]> {
    try {
      const response = await fetch('/api/audit/access-trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      const auditLogs = await response.json();
      return auditLogs;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  }

  // Private helper methods

  private async loadNetworkConfiguration(): Promise<NetworkConfiguration> {
    const response = await fetch('/api/network/configuration');
    return response.json();
  }

  private async loadUserPermissions(userId: string): Promise<MultiSiteUserPermissions> {
    const response = await fetch(`/api/users/${userId}/permissions/multi-site`);
    return response.json();
  }

  private isAccessValid(access: SiteAccess): boolean {
    // Check if access has expired
    if (access.restrictions) {
      const timeRestriction = access.restrictions.find(r => r.type === 'time_window');
      if (timeRestriction && timeRestriction.expiresAt) {
        return new Date(timeRestriction.expiresAt) > new Date();
      }
    }
    return true;
  }

  private checkSiteAccess(siteId: string): { allowed: boolean; reason?: string } {
    if (!this.hasAccessToSite(siteId)) {
      return { allowed: false, reason: 'No access to patient\'s primary site' };
    }
    return { allowed: true };
  }

  private checkPatientAccess(patient: MultiSitePatientProfile, action: string): { allowed: boolean; reason?: string } {
    // Check if patient is in user's authorized sites
    if (!patient.siteMetadata.authorizedSites.some(siteId => this.hasAccessToSite(siteId))) {
      return { allowed: false, reason: 'Patient not in authorized sites' };
    }

    // Check data classification restrictions
    if (patient.siteMetadata.dataClassification === 'highly_restricted') {
      const hasSpecialAccess = this.currentUser?.specialPermissions.some(p => 
        p.type === 'legal_hold' || p.type === 'quality_assurance'
      );
      if (!hasSpecialAccess) {
        return { allowed: false, reason: 'Patient data is highly restricted' };
      }
    }

    return { allowed: true };
  }

  private checkDataSharingConsent(patient: MultiSitePatientProfile): { allowed: boolean; reason?: string } {
    const userSite = this.currentUser?.homeSite;
    if (!userSite) return { allowed: false, reason: 'User site not determined' };

    // If same site as patient's primary site, no consent check needed
    if (patient.siteMetadata.primarySite === userSite) {
      return { allowed: true };
    }

    // Check for active consent for cross-site access
    const hasConsent = patient.siteMetadata.dataSharingConsents.some(consent => {
      return consent.authorizedSites.includes(userSite) && 
             !consent.withdrawnAt &&
             (!consent.expiresAt || new Date(consent.expiresAt) > new Date());
    });

    if (!hasConsent) {
      return { allowed: false, reason: 'Patient has not consented to cross-site data sharing' };
    }

    return { allowed: true };
  }

  private async getPatientMetadata(patientId: string): Promise<MultiSitePatientProfile | null> {
    try {
      const response = await fetch(`/api/patients/${patientId}/metadata`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Error fetching patient metadata:', error);
      return null;
    }
  }

  private buildPatientQuery(accessibleSites: string[], filters?: any): any {
    return {
      sites: accessibleSites,
      ...filters,
      userRole: this.currentUser?.role,
      accessLevel: this.currentUser?.crossSiteAccess.level
    };
  }

  private async filterPatientsByAccess(patients: MultiSitePatientProfile[]): Promise<MultiSitePatientProfile[]> {
    const filtered = [];
    for (const patient of patients) {
      const access = await this.canAccessPatient(patient.id);
      if (access.allowed) {
        filtered.push(patient);
      }
    }
    return filtered;
  }

  private generateAccessSummary(patients: MultiSitePatientProfile[]) {
    const userHomeSite = this.currentUser?.homeSite;
    return {
      homeSitePatients: patients.filter(p => p.siteMetadata.primarySite === userHomeSite).length,
      consultationPatients: patients.filter(p => 
        p.siteMetadata.consultations.some(c => c.consultingSite === userHomeSite)
      ).length,
      researchPatients: patients.filter(p => 
        p.researchParticipation.some(r => r.participatingSites.includes(userHomeSite!))
      ).length,
      emergencyAccess: patients.filter(p => 
        this.currentUser?.crossSiteAccess.temporaryAccess?.some(ta => 
          ta.reason === 'emergency' && ta.patientIds?.includes(p.id)
        )
      ).length
    };
  }

  private async logAccess(patientId: string, action: string, result: string): Promise<void> {
    if (!this.auditEnabled) return;

    const auditLog: Omit<AccessAuditLog, 'timestamp'> = {
      action: action as any,
      resourceType: 'patient',
      resourceId: patientId,
      siteAccessed: this.currentUser?.homeSite || 'unknown',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...auditLog,
          timestamp: new Date().toISOString(),
          userId: this.currentUser?.userId,
          result
        })
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  }

  private async logBreakGlassAccess(patientId: string, justification: string, auditId: string): Promise<void> {
    await fetch('/api/audit/break-glass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        justification,
        auditId,
        userId: this.currentUser?.userId,
        timestamp: new Date().toISOString(),
        reviewRequired: this.networkConfig?.globalSettings.breakGlassAuditRequired
      })
    });
  }

  private async updateTemporaryAccess(access: TemporaryAccess): Promise<void> {
    if (!this.currentUser) return;

    // Add to current user's temporary access list
    if (!this.currentUser.crossSiteAccess.temporaryAccess) {
      this.currentUser.crossSiteAccess.temporaryAccess = [];
    }
    this.currentUser.crossSiteAccess.temporaryAccess.push(access);
  }

  private generateReferralId(): string {
    return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // In a real implementation, this would be handled server-side
    return 'client-ip-placeholder';
  }

  private initializeAuditLogging(): void {
    // Initialize audit logging configuration
    this.auditEnabled = true;
  }
}

// Singleton instance
export const multiSiteAccessService = new MultiSiteAccessService();