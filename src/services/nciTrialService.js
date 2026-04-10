/**
 * NCI Clinical Trials API Service
 *
 * Queries the NCI Clinical Trials API (free, no auth) for biomarker-matched
 * clinical trials. Complements the existing ClinicalTrials.gov integration
 * with NCI's curated cancer-specific trial data.
 *
 * API docs: https://clinicaltrialsapi.cancer.gov/
 */

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour cache
const NCI_BASE = 'https://clinicaltrialsapi.cancer.gov/api/v2';

/**
 * Search NCI clinical trials by biomarker.
 * @param {string} biomarker - e.g., "EGFR", "BRAF V600E", "MSI-H"
 * @param {Object} [options]
 * @param {string} [options.cancerType] - Filter by cancer type
 * @param {string} [options.phase] - Filter by trial phase (I, II, III)
 * @param {number} [options.limit] - Max results (default 10)
 */
export async function searchTrialsByBiomarker(biomarker, options = {}) {
  const { cancerType, phase, limit = 10 } = options;
  const key = `nci:biomarker:${biomarker}:${cancerType || ''}:${phase || ''}:${limit}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    params.set('size', String(limit));
    params.set('current_trial_status', 'Active');

    // Search in biomarker and arm_description fields
    if (biomarker) {
      params.set('keyword', biomarker);
    }

    if (phase) {
      params.set('phase.phase', phase === 'I' ? 'I' : phase === 'II' ? 'II' : 'III');
    }

    const url = `${NCI_BASE}/trials?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.warn(`[NCI] API returned ${res.status}`);
      return { trials: [], total: 0, source: 'NCI Clinical Trials API', error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const trials = (data.data || data.trials || []).slice(0, limit).map(t => ({
      nctId: t.nct_id,
      title: t.brief_title || t.official_title,
      phase: t.phase?.phase || 'N/A',
      status: t.current_trial_status,
      leadOrg: t.lead_org,
      principalInvestigator: t.principal_investigator,
      description: t.brief_summary,
      eligibility: t.eligibility?.structured?.gender,
      sites: (t.sites || []).slice(0, 5).map(s => ({
        name: s.org_name,
        city: s.org_city,
        state: s.org_state_or_province,
        country: s.org_country,
        status: s.recruitment_status,
      })),
      biomarkers: (t.biomarkers || []).map(b => ({
        name: b.name,
        type: b.assay_purpose,
      })),
      nciUrl: `https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/v?id=${t.nct_id}`,
      ctGovUrl: `https://clinicaltrials.gov/study/${t.nct_id}`,
    }));

    const result = {
      trials,
      total: data.total || trials.length,
      query: { biomarker, cancerType, phase },
      source: 'NCI Clinical Trials API',
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.error('[NCI] Trial search error:', err.message);
    return { trials: [], total: 0, source: 'NCI Clinical Trials API', error: err.message };
  }
}

/**
 * Get trial detail by NCT ID from NCI.
 */
export async function getTrialByNctId(nctId) {
  const key = `nci:trial:${nctId}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${NCI_BASE}/trials/${nctId}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.data || data;
    cache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

export default { searchTrialsByBiomarker, getTrialByNctId };
