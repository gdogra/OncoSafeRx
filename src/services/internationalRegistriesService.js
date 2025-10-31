import axios from 'axios';
import { translateToEnglish, normalizeNFC } from './translationService.js';

function normalizePhase(v) {
  if (!v) return 'Not specified';
  const s = String(v).toUpperCase();
  if (s.includes('I/II') || s.includes('PHASE 1/2')) return 'Phase 1/2';
  if (s.includes('II/III') || s.includes('PHASE 2/3')) return 'Phase 2/3';
  if (s.includes('I') && !s.includes('II')) return 'Phase 1';
  if (s.includes('II') && !s.includes('III')) return 'Phase 2';
  if (s.includes('III')) return 'Phase 3';
  if (s.includes('IV')) return 'Phase 4';
  return 'Not specified';
}

async function toCanonicalTrial({
  id,
  title,
  condition,
  intervention,
  phase,
  status,
  country,
  url,
  locations,
  origin
}) {
  // Normalize values
  const titleN = normalizeNFC(title || '');
  const conditionN = normalizeNFC(condition || '');
  const interventionN = normalizeNFC(intervention || '');
  const tTitle = await translateToEnglish(titleN);
  const tCond = await translateToEnglish(conditionN);
  const tIntr = await translateToEnglish(interventionN);

  return {
    nctId: id || 'N/A',
    title: tTitle.translated || titleN || 'No title available',
    titleOriginal: titleN,
    titleLanguage: tTitle.language,
    phase: normalizePhase(phase),
    status: status || 'Unknown',
    condition: tCond.translated || conditionN || 'Not specified',
    conditionOriginal: conditionN,
    intervention: tIntr.translated || interventionN || 'Not specified',
    interventionOriginal: interventionN,
    sponsor: 'Not specified',
    locations: (locations || []).map((l) => ({
      facility: l?.facility || l?.name || 'Unknown',
      city: l?.city || '',
      state: l?.state || '',
      country: l?.country || country || '',
      lat: typeof l?.lat === 'number' ? l.lat : undefined,
      lon: typeof l?.lon === 'number' ? l.lon : undefined,
      status: l?.status || ''
    })),
    eligibilityScore: 0,
    matchScore: 0,
    estimatedEnrollment: 0,
    ageRange: 'Not specified',
    gender: 'All',
    inclusionCriteria: [],
    exclusionCriteria: [],
    description: '',
    detailedDescription: '',
    lastUpdated: new Date().toISOString(),
    url: url || '',
    isEligible: false,
    confidenceLevel: 'low',
    origin: origin || 'international',
    registrationIds: [id].filter(Boolean)
  };
}

async function safeGet(url, params = {}, timeout = 20000) {
  try {
    const resp = await axios.get(url, { params, timeout, headers: { 'User-Agent': 'OncoSafeRx/1.0' } });
    return resp.data;
  } catch (_e) {
    return null;
  }
}

// CTRI (India). Prefer bulk CSV/XML if available via env var; otherwise returns empty list.
async function fetchCTRI({ drug, condition }) {
  const out = [];
  const base = process.env.CTRI_BULK_URL || '';
  if (!base) return out;
  const data = await safeGet(base, { drug, condition });
  if (!data) return out;
  const rows = Array.isArray(data?.trials) ? data.trials : [];
  for (const r of rows) {
    out.push(await toCanonicalTrial({
      id: r?.trial_id || r?.ctri_number || r?.id,
      title: r?.title || r?.public_title,
      condition: r?.condition,
      intervention: r?.intervention,
      phase: r?.phase,
      status: r?.status,
      country: 'India',
      url: r?.url || (r?.ctri_number ? `https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=${encodeURIComponent(r.ctri_number)}` : ''),
      locations: (r?.sites || []).map((s) => ({ facility: s?.name, city: s?.city, state: s?.state, country: 'India' })),
      origin: 'CTRI'
    }));
  }
  return out;
}

// ChiCTR (China). Requires bulk endpoint or partner proxy; otherwise returns empty list.
async function fetchChiCTR({ drug, condition }) {
  const out = [];
  const base = process.env.CHICTR_BULK_URL || '';
  if (!base) return out;
  const data = await safeGet(base, { drug, condition });
  if (!data) return out;
  const rows = Array.isArray(data?.trials) ? data.trials : [];
  for (const r of rows) {
    out.push(await toCanonicalTrial({
      id: r?.registration_number || r?.id,
      title: r?.title || r?.public_title,
      condition: r?.condition,
      intervention: r?.intervention,
      phase: r?.phase,
      status: r?.status,
      country: 'China',
      url: r?.url || (r?.registration_number ? `https://www.chictr.org.cn/showproj.aspx?proj=${encodeURIComponent(r.registration_number)}` : ''),
      locations: (r?.sites || []).map((s) => ({ facility: s?.name, city: s?.city, state: s?.province, country: 'China' })),
      origin: 'ChiCTR'
    }));
  }
  return out;
}

// JPRN umbrella (Japan) – supports UMIN/JAPIC/JMACCT via bulk/proxy.
async function fetchJPRN({ drug, condition }) {
  const out = [];
  const base = process.env.JPRN_BULK_URL || '';
  if (!base) return out;
  const data = await safeGet(base, { drug, condition });
  if (!data) return out;
  const rows = Array.isArray(data?.trials) ? data.trials : [];
  for (const r of rows) {
    out.push(await toCanonicalTrial({
      id: r?.jprn || r?.umin_id || r?.id,
      title: r?.title || r?.official_title,
      condition: r?.condition,
      intervention: r?.intervention,
      phase: r?.phase,
      status: r?.status,
      country: 'Japan',
      url: r?.url || (r?.umin_id ? `https://center6.umin.ac.jp/cgi-open-bin/ctr_e/ctr_view.cgi?recptno=${encodeURIComponent(r.umin_id)}` : ''),
      locations: (r?.sites || []).map((s) => ({ facility: s?.name, city: s?.city, state: s?.prefecture, country: 'Japan' })),
      origin: 'JPRN'
    }));
  }
  return out;
}

function dedupeByKey(items) {
  const seen = new Set();
  const out = [];
  for (const t of items) {
    const key = [
      (t.nctId || '').toUpperCase(),
      (t.title || '').toUpperCase(),
      (t.condition || '').toUpperCase(),
      (t.phase || '').toUpperCase(),
      (t.locations?.[0]?.country || '').toUpperCase(),
      t.origin || ''
    ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

class InternationalRegistriesService {
  async search({ drug, condition, country, maxResults = 500 }) {
    const queries = [];
    queries.push(fetchCTRI({ drug, condition }));
    queries.push(fetchChiCTR({ drug, condition }));
    queries.push(fetchJPRN({ drug, condition }));
    const settled = await Promise.allSettled(queries);
    const all = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []));
    let out = dedupeByKey(all);
    if (country) {
      const c = String(country).toLowerCase();
      out = out.filter((t) => (t.locations || []).some((l) => (l.country || '').toLowerCase().includes(c)));
    }
    return out.slice(0, Math.max(1, Math.min(maxResults, 5000)));
  }
}

export default new InternationalRegistriesService();
