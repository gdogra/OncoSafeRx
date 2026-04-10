/**
 * FDA Safety Signal Detection Service
 *
 * Monitors OpenFDA FAERS for disproportionality signals — when a
 * drug-adverse-event pair spikes in reporting frequency vs its
 * historical baseline, that's an early safety signal.
 *
 * Uses the Proportional Reporting Ratio (PRR):
 *   PRR = (a / (a+b)) / (c / (c+d))
 *   where:
 *     a = reports of event E with drug D
 *     b = reports of event E without drug D
 *     c = reports of other events with drug D
 *     d = reports of other events without drug D
 *
 *   Signal detected when PRR ≥ 2 AND a ≥ 3 AND chi-squared ≥ 4
 *
 * Source: Evans SJW et al. Pharmacoepidemiology and Drug Safety 2001;10:483-486
 */

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 }); // 24-hour cache
const BASE = 'https://api.fda.gov/drug/event.json';

/**
 * Detect safety signals for a drug by comparing its adverse event
 * profile against the overall FAERS database.
 *
 * @param {string} drugName - Generic drug name
 * @param {number} minReports - Minimum report count to consider (default 3)
 * @returns {Promise<Object>} Detected signals with PRR scores
 */
export async function detectSignals(drugName, minReports = 3) {
  const key = `signal:${drugName.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    // Step 1: Get top adverse events for this drug (a values)
    const drugEventsUrl = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=25`;
    const drugRes = await fetch(drugEventsUrl);
    if (!drugRes.ok) return { drug: drugName, signals: [], error: `OpenFDA ${drugRes.status}` };
    const drugData = await drugRes.json();
    const drugEvents = drugData.results || [];

    if (drugEvents.length === 0) {
      return { drug: drugName, signals: [], total: 0, source: 'FDA FAERS' };
    }

    // Step 2: Get total reports for this drug (a + c)
    const totalDrugUrl = `${BASE}?search=patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`;
    const totalDrugRes = await fetch(totalDrugUrl);
    let totalDrugReports = 0;
    if (totalDrugRes.ok) {
      const totalData = await totalDrugRes.json();
      totalDrugReports = totalData.meta?.results?.total || 0;
    }

    await new Promise(r => setTimeout(r, 300)); // Rate limit

    // Step 3: For the top events, get overall database counts (a + b)
    // We'll check the top 10 events for signal detection
    const signals = [];
    const eventsToCheck = drugEvents.slice(0, 10);

    for (const event of eventsToCheck) {
      const eventName = event.term;
      const a = event.count; // reports of this event with this drug

      if (a < minReports) continue;

      try {
        // Get total reports of this event across all drugs (a + b)
        const eventTotalUrl = `${BASE}?search=patient.reaction.reactionmeddrapt.exact:"${encodeURIComponent(eventName)}"&limit=1`;
        const eventRes = await fetch(eventTotalUrl);
        if (!eventRes.ok) continue;
        const eventData = await eventRes.json();
        const totalEventReports = eventData.meta?.results?.total || 0;

        // Calculate PRR
        // a = reports of event with drug
        // b = reports of event without drug = totalEventReports - a
        // c = reports of other events with drug = totalDrugReports - a
        // d = estimated total FAERS reports minus a, b, c (use 15M as FAERS total)
        const FAERS_TOTAL = 15000000; // approximate total FAERS reports
        const b = totalEventReports - a;
        const c = totalDrugReports - a;
        const d = FAERS_TOTAL - a - b - c;

        if ((a + b) === 0 || (c + d) === 0) continue;

        const prr = (a / (a + b)) / (c / (c + d));

        // Chi-squared calculation
        const expected = ((a + b) * (a + c)) / (a + b + c + d);
        const chiSquared = expected > 0 ? Math.pow(a - expected, 2) / expected : 0;

        // Signal criteria: PRR ≥ 2, a ≥ 3, chi-squared ≥ 4
        const isSignal = prr >= 2 && a >= minReports && chiSquared >= 4;

        if (isSignal) {
          signals.push({
            event: eventName,
            drugReports: a,
            totalEventReports,
            prr: Math.round(prr * 100) / 100,
            chiSquared: Math.round(chiSquared * 100) / 100,
            signalStrength: prr >= 5 ? 'strong' : prr >= 3 ? 'moderate' : 'weak',
            interpretation: generateInterpretation(drugName, eventName, prr, a),
          });
        }

        await new Promise(r => setTimeout(r, 250)); // Rate limit
      } catch {
        continue;
      }
    }

    // Sort by PRR (strongest signal first)
    signals.sort((a, b) => b.prr - a.prr);

    const result = {
      drug: drugName,
      signals,
      totalDrugReports,
      signalsDetected: signals.length,
      methodology: 'Proportional Reporting Ratio (PRR ≥ 2, n ≥ 3, χ² ≥ 4)',
      reference: 'Evans SJW et al. Pharmacoepidemiol Drug Saf. 2001;10:483-486',
      source: 'FDA FAERS via OpenFDA',
      disclaimer: 'FAERS signals indicate disproportionate reporting, NOT confirmed causation. Clinical validation required.',
      timestamp: new Date().toISOString(),
    };

    cache.set(key, result);
    return result;
  } catch (err) {
    return { drug: drugName, signals: [], error: err.message, source: 'FDA FAERS' };
  }
}

/**
 * Check signals for a patient's entire medication list.
 * Returns only drugs with detected signals.
 */
export async function checkPatientMedications(medications) {
  const results = [];
  for (const drug of medications) {
    const signals = await detectSignals(drug);
    if (signals.signalsDetected > 0) {
      results.push(signals);
    }
    await new Promise(r => setTimeout(r, 500)); // Be gentle with OpenFDA
  }
  return {
    medicationsChecked: medications.length,
    medicationsWithSignals: results.length,
    alerts: results,
    source: 'FDA FAERS via OpenFDA',
  };
}

function generateInterpretation(drug, event, prr, count) {
  const strength = prr >= 5 ? 'strongly' : prr >= 3 ? 'moderately' : 'weakly';
  return `${event.toLowerCase()} is ${strength} disproportionately reported with ${drug} ` +
    `(PRR ${prr.toFixed(1)}, ${count} reports). This is a statistical signal from voluntary ` +
    `reporting — clinical significance should be assessed by the care team.`;
}

export default { detectSignals, checkPatientMedications };
