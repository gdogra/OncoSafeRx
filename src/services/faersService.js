/**
 * FDA Adverse Event Reporting System (FAERS) Service
 *
 * Queries OpenFDA's drug/event endpoint for real-world adverse event
 * data. Free, no API key required (240 requests/min default).
 *
 * This provides:
 * - Top adverse events for any drug
 * - Signal detection (disproportionality analysis)
 * - Serious outcome rates (death, hospitalization, disability)
 * - Drug-drug co-reported adverse events
 */

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 }); // 24-hour cache
const BASE = 'https://api.fda.gov/drug/event.json';

/**
 * Get top adverse events for a drug, ranked by report count.
 * @param {string} drugName - Generic drug name (e.g., "pembrolizumab")
 * @param {number} limit - Max results (default 20)
 * @returns {Promise<Object>} Ranked adverse events with counts and seriousness
 */
export async function getAdverseEvents(drugName, limit = 20) {
  const key = `faers:ae:${drugName.toLowerCase()}:${limit}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return { drug: drugName, events: [], total: 0, source: 'FDA FAERS' };
      throw new Error(`OpenFDA ${res.status}`);
    }
    const data = await res.json();
    const events = (data.results || []).map((r, i) => ({
      rank: i + 1,
      event: r.term,
      count: r.count,
    }));

    const result = {
      drug: drugName,
      events,
      total: events.reduce((s, e) => s + e.count, 0),
      source: 'FDA FAERS via OpenFDA',
      disclaimer: 'FAERS data has limitations: reports are voluntary, causality is not established, and reporting rates vary.',
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.error(`[FAERS] Error fetching events for ${drugName}:`, err.message);
    return { drug: drugName, events: [], total: 0, error: err.message, source: 'FDA FAERS' };
  }
}

/**
 * Get serious outcome breakdown for a drug.
 * Returns counts of: death, hospitalization, life-threatening, disability, congenital anomaly.
 */
export async function getSeriousOutcomes(drugName) {
  const key = `faers:serious:${drugName.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const outcomes = [
    { field: 'seriousnessdeath', label: 'Death' },
    { field: 'seriousnesshospitalization', label: 'Hospitalization' },
    { field: 'seriousnesslifethreatening', label: 'Life-threatening' },
    { field: 'seriousnessdisabling', label: 'Disability' },
    { field: 'seriousnesscongenitalanomali', label: 'Congenital anomaly' },
    { field: 'seriousnessother', label: 'Other serious' },
  ];

  const results = [];
  for (const outcome of outcomes) {
    try {
      const url = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"+AND+${outcome.field}:1&count=patient.reaction.reactionmeddrapt.exact&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const total = (data.results || []).reduce((s, r) => s + r.count, 0);
        results.push({ outcome: outcome.label, count: total });
      } else {
        results.push({ outcome: outcome.label, count: 0 });
      }
      // Rate limit: OpenFDA allows 240/min without key
      await new Promise(r => setTimeout(r, 300));
    } catch {
      results.push({ outcome: outcome.label, count: 0 });
    }
  }

  const result = {
    drug: drugName,
    outcomes: results,
    totalReports: results.reduce((s, r) => s + r.count, 0),
    source: 'FDA FAERS via OpenFDA',
  };
  cache.set(key, result);
  return result;
}

/**
 * Drug-drug co-reporting analysis.
 * Finds the most common concomitant drugs reported with adverse events.
 * Useful for identifying interaction-related safety signals.
 */
export async function getConcomitantDrugs(drugName, limit = 15) {
  const key = `faers:concomitant:${drugName.toLowerCase()}:${limit}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&count=patient.drug.openfda.generic_name.exact&limit=${limit + 5}`;
    const res = await fetch(url);
    if (!res.ok) return { drug: drugName, concomitant: [], source: 'FDA FAERS' };
    const data = await res.json();

    // Filter out the queried drug itself
    const concomitant = (data.results || [])
      .filter(r => r.term.toLowerCase() !== drugName.toLowerCase())
      .slice(0, limit)
      .map((r, i) => ({
        rank: i + 1,
        drug: r.term,
        coReportCount: r.count,
      }));

    const result = {
      drug: drugName,
      concomitant,
      source: 'FDA FAERS via OpenFDA',
      interpretation: 'Drugs frequently co-reported in adverse event reports. Does NOT establish causation or interaction.',
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    return { drug: drugName, concomitant: [], error: err.message, source: 'FDA FAERS' };
  }
}

/**
 * Demographic breakdown of adverse event reporters for a drug.
 */
export async function getDemographics(drugName) {
  const key = `faers:demo:${drugName.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const result = { drug: drugName, source: 'FDA FAERS via OpenFDA' };

  // Age distribution
  try {
    const url = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&count=patient.patientonsetageunit`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      result.ageUnits = data.results || [];
    }
  } catch {}

  // Sex distribution
  try {
    await new Promise(r => setTimeout(r, 300));
    const url = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&count=patient.patientsex`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const sexMap = { '0': 'Unknown', '1': 'Male', '2': 'Female' };
      result.sex = (data.results || []).map(r => ({
        sex: sexMap[r.term] || r.term,
        count: r.count,
      }));
    }
  } catch {}

  cache.set(key, result);
  return result;
}

export default {
  getAdverseEvents,
  getSeriousOutcomes,
  getConcomitantDrugs,
  getDemographics,
};
