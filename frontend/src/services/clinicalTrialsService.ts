/**
 * Clinical Trials Service — Direct ClinicalTrials.gov API
 * Uses the free, CORS-enabled ClinicalTrials.gov v2 API.
 * No backend needed.
 */

export interface ClinicalTrial {
  id: string;
  nctId: string;
  title: string;
  phase: string;
  status: string;
  sponsor: string;
  conditions: string[];
  interventions: string[];
  eligibilityCriteria: {
    age: { min?: number; max?: number };
    gender?: string;
    criteria?: string;
  };
  locations: { facility: string; city: string; state: string; country: string }[];
  estimatedEnrollment: number;
  currentEnrollment: number;
  primaryEndpoint: string;
  secondaryEndpoints: string[];
  drugInteractionRisk: 'Low' | 'Moderate' | 'High';
  lastUpdated: string;
  url: string;
}

export interface PatientProfile {
  age: number;
  gender: 'Male' | 'Female' | 'All';
  diagnosis: string[];
  currentMedications: { name: string; dose: string; frequency: string }[];
  priorTreatments: string[];
  performanceStatus: number;
  biomarkers: { name: string; value: string; status: string }[];
  genetics: { gene: string; variant: string; status: string }[];
  zipCode: string;
}

export interface TrialMatch {
  trial: ClinicalTrial;
  matchScore: number;
  eligibilityStatus: 'Eligible' | 'Likely Eligible' | 'Possibly Eligible' | 'Not Eligible';
  matchReasons: string[];
  concerns: string[];
  nextSteps: string[];
}

// ClinicalTrials.gov v2 API base
const CT_API = 'https://clinicaltrials.gov/api/v2';

// Simple cache
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 10 * 60_000; // 10 min

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function parseTrial(study: any): ClinicalTrial {
  const proto = study.protocolSection || {};
  const id = proto.identificationModule || {};
  const status = proto.statusModule || {};
  const design = proto.designModule || {};
  const arms = proto.armsInterventionsModule || {};
  const eligibility = proto.eligibilityModule || {};
  const contacts = proto.contactsLocationsModule || {};
  const description = proto.descriptionModule || {};
  const outcomes = proto.outcomesModule || {};
  const sponsor = proto.sponsorCollaboratorsModule || {};

  const interventionNames = (arms.interventions || []).map((i: any) => i.name || '').filter(Boolean);
  const conditionNames = (proto.conditionsModule?.conditions || []);

  const locations = (contacts.locations || []).slice(0, 5).map((loc: any) => ({
    facility: loc.facility || '',
    city: loc.city || '',
    state: loc.state || '',
    country: loc.country || '',
  }));

  const primaryOutcomes = (outcomes.primaryOutcomes || []).map((o: any) => o.measure || '');
  const secondaryOutcomes = (outcomes.secondaryOutcomes || []).map((o: any) => o.measure || '');

  // Parse age range
  const minAge = eligibility.minimumAge ? parseInt(eligibility.minimumAge) : undefined;
  const maxAge = eligibility.maximumAge ? parseInt(eligibility.maximumAge) : undefined;

  return {
    id: id.nctId || '',
    nctId: id.nctId || '',
    title: id.officialTitle || id.briefTitle || '',
    phase: (design.phases || []).join(', ') || 'N/A',
    status: status.overallStatus || 'Unknown',
    sponsor: sponsor.leadSponsor?.name || '',
    conditions: conditionNames,
    interventions: interventionNames,
    eligibilityCriteria: {
      age: { min: minAge, max: maxAge },
      gender: eligibility.sex || 'All',
      criteria: eligibility.eligibilityCriteria || '',
    },
    locations,
    estimatedEnrollment: design.enrollmentInfo?.count || 0,
    currentEnrollment: 0,
    primaryEndpoint: primaryOutcomes[0] || '',
    secondaryEndpoints: secondaryOutcomes,
    drugInteractionRisk: 'Low',
    lastUpdated: status.lastUpdatePostDateStruct?.date || '',
    url: `https://clinicaltrials.gov/study/${id.nctId}`,
  };
}

function scoreTrialMatch(trial: ClinicalTrial, profile: PatientProfile): TrialMatch {
  let score = 50;
  const reasons: string[] = [];
  const concerns: string[] = [];
  const nextSteps: string[] = [];

  // Check age
  const { min, max } = trial.eligibilityCriteria.age;
  if (min && profile.age < min) { score -= 30; concerns.push(`Minimum age ${min}, patient is ${profile.age}`); }
  else if (max && profile.age > max) { score -= 30; concerns.push(`Maximum age ${max}, patient is ${profile.age}`); }
  else { score += 10; reasons.push('Age within eligible range'); }

  // Check gender
  const gender = trial.eligibilityCriteria.gender;
  if (gender && gender !== 'All' && gender !== profile.gender) {
    score -= 40; concerns.push(`Trial requires ${gender} patients`);
  }

  // Check condition match
  const diagLower = profile.diagnosis.map(d => d.toLowerCase());
  const condMatch = trial.conditions.some(c => diagLower.some(d => c.toLowerCase().includes(d) || d.includes(c.toLowerCase())));
  if (condMatch) { score += 20; reasons.push('Diagnosis matches trial conditions'); }

  // Check medication conflicts
  const critText = (trial.eligibilityCriteria.criteria || '').toLowerCase();
  for (const med of profile.currentMedications) {
    if (critText.includes(med.name.toLowerCase()) && critText.includes('exclud')) {
      score -= 15; concerns.push(`${med.name} may be excluded per eligibility criteria`);
    }
  }

  // Check intervention relevance
  const interventionText = trial.interventions.join(' ').toLowerCase();
  for (const med of profile.currentMedications) {
    if (interventionText.includes(med.name.toLowerCase())) {
      score += 10; reasons.push(`Trial involves ${med.name}`);
    }
  }

  // Recruiting bonus
  if (trial.status === 'RECRUITING') { score += 10; reasons.push('Actively recruiting'); }

  // Phase bonus
  if (trial.phase.includes('3') || trial.phase.includes('III')) { score += 5; reasons.push('Phase 3 trial (large, established)'); }

  score = Math.max(0, Math.min(100, score));

  let eligibilityStatus: TrialMatch['eligibilityStatus'] = 'Possibly Eligible';
  if (score >= 70) eligibilityStatus = 'Eligible';
  else if (score >= 50) eligibilityStatus = 'Likely Eligible';
  else if (score < 30) eligibilityStatus = 'Not Eligible';

  if (trial.status === 'RECRUITING') nextSteps.push('Contact trial coordinator for screening');
  nextSteps.push(`Review full eligibility: ${trial.url}`);

  return { trial, matchScore: score, eligibilityStatus, matchReasons: reasons, concerns, nextSteps };
}

class ClinicalTrialsService {
  /**
   * Search for clinical trials matching patient criteria
   */
  async searchTrials(patientProfile: PatientProfile): Promise<TrialMatch[]> {
    try {
      // Build search query from patient diagnosis + medications
      const terms = [
        ...patientProfile.diagnosis,
        ...patientProfile.currentMedications.map(m => m.name),
      ].filter(Boolean).join(' OR ');

      if (!terms) return [];

      const cacheKey = `trials:${terms}`;
      const cached = getCached(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        'query.cond': patientProfile.diagnosis.join(' OR ') || 'cancer',
        'query.intr': patientProfile.currentMedications.map(m => m.name).join(' OR ') || '',
        'filter.overallStatus': 'RECRUITING',
        'pageSize': '20',
        'format': 'json',
      });

      const resp = await fetch(`${CT_API}/studies?${params}`, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      const studies = data.studies || [];
      const trials = studies.map(parseTrial);
      const matches = trials
        .map(t => scoreTrialMatch(t, patientProfile))
        .sort((a, b) => b.matchScore - a.matchScore);

      cache.set(cacheKey, { data: matches, ts: Date.now() });
      return matches;
    } catch (error) {
      console.warn('ClinicalTrials.gov API error:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Search trials by condition/drug keyword
   */
  async searchByKeyword(keyword: string, statusFilter: string = 'RECRUITING'): Promise<ClinicalTrial[]> {
    try {
      const cacheKey = `keyword:${keyword}:${statusFilter}`;
      const cached = getCached(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        'query.term': keyword,
        'filter.overallStatus': statusFilter,
        'pageSize': '20',
        'format': 'json',
      });

      const resp = await fetch(`${CT_API}/studies?${params}`, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      const trials = (data.studies || []).map(parseTrial);
      cache.set(cacheKey, { data: trials, ts: Date.now() });
      return trials;
    } catch (error) {
      console.warn('ClinicalTrials.gov search error:', (error as any)?.message);
      return [];
    }
  }

  /**
   * Get a specific trial by NCT ID
   */
  async getTrialByNctId(nctId: string): Promise<ClinicalTrial | null> {
    try {
      const cacheKey = `nct:${nctId}`;
      const cached = getCached(cacheKey);
      if (cached) return cached;

      const resp = await fetch(`${CT_API}/studies/${nctId}?format=json`, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;

      const data = await resp.json();
      const trial = parseTrial(data);
      cache.set(cacheKey, { data: trial, ts: Date.now() });
      return trial;
    } catch {
      return null;
    }
  }

  /**
   * Check eligibility (client-side scoring)
   */
  async checkTrialEligibility(trialId: string, patientProfile: PatientProfile) {
    const trial = await this.getTrialByNctId(trialId);
    if (!trial) return { eligible: false, score: 0, criteria: { met: [], failed: ['Trial not found'], unknown: [] }, drugInteractions: { conflicts: [], warnings: [], recommendations: [] } };

    const match = scoreTrialMatch(trial, patientProfile);
    return {
      eligible: match.matchScore >= 50,
      score: match.matchScore,
      criteria: {
        met: match.matchReasons,
        failed: match.concerns,
        unknown: [],
      },
      drugInteractions: { conflicts: [], warnings: [], recommendations: match.nextSteps },
    };
  }

  /**
   * Get trials by location (uses ClinicalTrials.gov geo search)
   */
  async getTrialsByLocation(zipCode: string, radius: number = 50): Promise<ClinicalTrial[]> {
    try {
      const params = new URLSearchParams({
        'query.cond': 'cancer',
        'filter.overallStatus': 'RECRUITING',
        'filter.geo': `distance(${zipCode},${radius}mi)`,
        'pageSize': '15',
        'format': 'json',
      });

      const resp = await fetch(`${CT_API}/studies?${params}`, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) return [];

      const data = await resp.json();
      return (data.studies || []).map(parseTrial);
    } catch {
      return [];
    }
  }

  /**
   * Analyze drug interactions for trial protocols (client-side)
   */
  async analyzeTrialDrugInteractions(trialId: string, currentMedications: string[]) {
    const trial = await this.getTrialByNctId(trialId);
    if (!trial) return { riskLevel: 'Low' as const, interactions: [], trialModifications: [] };

    // Check the eligibility criteria text for excluded medications
    const critText = (trial.eligibilityCriteria.criteria || '').toLowerCase();
    const conflicts: any[] = [];

    for (const med of currentMedications) {
      if (critText.includes(med.toLowerCase())) {
        const isExcluded = critText.includes('exclud') || critText.includes('prohibit') || critText.includes('not permitted');
        if (isExcluded) {
          conflicts.push({
            drug1: med,
            drug2: trial.interventions[0] || 'trial drug',
            severity: 'Major' as const,
            mechanism: 'Listed in exclusion criteria',
            recommendation: `Discuss with trial coordinator — ${med} may need to be discontinued`,
          });
        }
      }
    }

    return {
      riskLevel: conflicts.length > 0 ? 'High' as const : 'Low' as const,
      interactions: conflicts,
      trialModifications: conflicts.length > 0 ? ['Review excluded medications with trial coordinator'] : [],
    };
  }
}

export const clinicalTrialsService = new ClinicalTrialsService();
