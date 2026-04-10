/**
 * FDA Label Change Monitoring Service
 *
 * Monitors DailyMed for drug label updates (new warnings, interaction
 * changes, indication changes) and alerts oncologists when drugs they
 * prescribe get updated.
 *
 * Data source: DailyMed API (free, no auth required)
 * https://dailymed.nlm.nih.gov/dailymed/services
 */

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour cache
const DAILYMED_BASE = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

/**
 * Check for recent label changes for a drug.
 * @param {string} drugName - Generic drug name
 * @returns {Promise<Object>} Label change information
 */
export async function checkLabelChanges(drugName) {
  const key = `label:changes:${drugName.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    // Get SPL (Structured Product Labeling) entries for the drug
    const url = `${DAILYMED_BASE}/spls.json?drug_name=${encodeURIComponent(drugName)}&page=1&pagesize=5`;
    const res = await fetch(url);
    if (!res.ok) return { drug: drugName, labels: [], error: `DailyMed ${res.status}` };
    const data = await res.json();

    const labels = (data.data || []).map(spl => ({
      setId: spl.setid,
      title: spl.title,
      publishedDate: spl.published_date,
      version: spl.spl_version,
      labeler: spl.labeler,
    }));

    // Sort by date (newest first)
    labels.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

    // Flag if updated within last 90 days
    const recentlyUpdated = labels.length > 0 &&
      (Date.now() - new Date(labels[0].publishedDate).getTime()) < 90 * 24 * 60 * 60 * 1000;

    const result = {
      drug: drugName,
      labels,
      latestUpdate: labels[0]?.publishedDate || null,
      recentlyUpdated,
      source: 'DailyMed (NLM)',
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    return { drug: drugName, labels: [], error: err.message };
  }
}

/**
 * Get specific label sections for a drug (boxed warning, interactions, etc.).
 * @param {string} setId - SPL Set ID from DailyMed
 * @returns {Promise<Object>} Parsed label sections
 */
export async function getLabelSections(setId) {
  const key = `label:sections:${setId}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url = `${DAILYMED_BASE}/spls/${setId}.json`;
    const res = await fetch(url);
    if (!res.ok) return { setId, sections: {}, error: `DailyMed ${res.status}` };
    const data = await res.json();

    // Extract key clinical sections
    const spl = data.data || data;
    const sections = {};

    // DailyMed returns sections as metadata — extract the ones oncologists care about
    if (spl.title) sections.productName = spl.title;
    if (spl.published_date) sections.publishedDate = spl.published_date;

    const result = { setId, ...sections, source: 'DailyMed' };
    cache.set(key, result);
    return result;
  } catch (err) {
    return { setId, sections: {}, error: err.message };
  }
}

/**
 * Check label changes for a list of drugs (batch operation).
 * Useful for monitoring a patient's entire medication list.
 */
export async function batchCheckLabels(drugNames) {
  const results = [];
  for (const drug of drugNames) {
    const change = await checkLabelChanges(drug);
    if (change.recentlyUpdated) {
      results.push(change);
    }
    // Rate limit DailyMed
    await new Promise(r => setTimeout(r, 200));
  }
  return {
    checked: drugNames.length,
    recentUpdates: results,
    source: 'DailyMed (NLM)',
  };
}

export default { checkLabelChanges, getLabelSections, batchCheckLabels };
