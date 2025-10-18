// Clinical calculators (MVP)

// Mosteller BSA (m^2) = sqrt( (height(cm) * weight(kg)) / 3600 )
export function calculateBSA(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  return Math.sqrt((h * w) / 3600);
}

// Cockcroft–Gault CrCl (mL/min)
// CrCl = ((140 - age) * weight(kg) * factor) / (72 * Scr), factor=0.85 if female
export function calculateCrCl({ ageYears, weightKg, serumCreatinineMgDl, sex }) {
  const age = Number(ageYears);
  const wt = Number(weightKg);
  const scr = Number(serumCreatinineMgDl);
  if (!age || !wt || !scr || age <= 0 || wt <= 0 || scr <= 0) return null;
  const factor = String(sex).toLowerCase().startsWith('f') ? 0.85 : 1.0;
  return (((140 - age) * wt * factor) / (72 * scr));
}

// Opioid MME conversion helpers (oral unless specified)
// Factors are approximate and intended for safety screening, not direct conversions
export const MME_FACTORS = {
  morphine: { route: 'oral', factor: 1 },
  hydrocodone: { route: 'oral', factor: 1 },
  oxycodone: { route: 'oral', factor: 1.5 },
  hydromorphone: { route: 'oral', factor: 4 },
  oxymorphone: { route: 'oral', factor: 3 },
  codeine: { route: 'oral', factor: 0.15 },
  tramadol: { route: 'oral', factor: 0.1 },
  tapentadol: { route: 'oral', factor: 0.4 },
  meperidine: { route: 'oral', factor: 0.1 },
  // Fentanyl patch uses mcg/hr; MME/day ≈ mcg/hr × 2.4
  fentanyl_transdermal: { route: 'transdermal', factorMcgPerHr: 2.4 },
  // Methadone is non-linear; apply tiered factor by total daily dose
  methadone: { route: 'oral', nonlinear: true }
};

function methadoneFactorForDailyDose(totalDailyMg) {
  if (!Number.isFinite(totalDailyMg) || totalDailyMg <= 0) return 0;
  if (totalDailyMg <= 20) return 4;
  if (totalDailyMg <= 40) return 8;
  if (totalDailyMg <= 60) return 10;
  return 12; // >60 mg/day
}

// Calculate MME for a list of opioid medications
// meds: [{ name, doseMgPerDose, dosesPerDay, route, unit, strengthMcgPerHr, totalDailyDoseMg }]
export function calculateMME(meds = []) {
  const details = [];
  let totalMME = 0;
  const notes = [];

  for (const m of meds) {
    const name = String(m.name || '').toLowerCase();
    const route = (m.route || 'oral').toLowerCase();
    
    // Find matching opioid by checking if the drug name contains the opioid name
    let factorEntry = null;
    if (name.includes('fentanyl') && route.includes('trans')) {
      factorEntry = MME_FACTORS.fentanyl_transdermal;
    } else {
      // Check each opioid in MME_FACTORS to see if the drug name contains it
      for (const [opioidName, factor] of Object.entries(MME_FACTORS)) {
        if (name.includes(opioidName)) {
          factorEntry = factor;
          break;
        }
      }
    }

    if (!factorEntry) {
      details.push({ name: m.name, route, mmePerDay: 0, included: false, note: 'Unsupported or excluded from MME (e.g., buprenorphine)' });
      continue;
    }

    // Buprenorphine is generally excluded from MME calculations
    if (name.includes('buprenorphine')) {
      details.push({ name: m.name, route, mmePerDay: 0, included: false, note: 'Buprenorphine excluded from MME' });
      continue;
    }

    let mme = 0;
    if (factorEntry.factorMcgPerHr) {
      const mcgPerHr = Number(m.strengthMcgPerHr || m.mcgPerHr || 0);
      if (mcgPerHr > 0) {
        mme = mcgPerHr * factorEntry.factorMcgPerHr; // already per day
      }
    } else if (factorEntry.nonlinear && name.includes('methadone')) {
      const totalDaily = Number(m.totalDailyDoseMg || (Number(m.doseMgPerDose || 0) * Number(m.dosesPerDay || 0)));
      const f = methadoneFactorForDailyDose(totalDaily);
      mme = totalDaily * f;
    } else {
      const dosePerDose = Number(m.doseMgPerDose || 0);
      const dosesPerDay = Number(m.dosesPerDay || 0);
      const totalDaily = dosePerDose * dosesPerDay;
      mme = totalDaily * (factorEntry.factor || 0);
    }

    mme = Number.isFinite(mme) ? Math.round(mme * 10) / 10 : 0;
    totalMME += mme;
    details.push({ name: m.name, route, mmePerDay: mme, included: true });
  }

  // Safety thresholds
  const thresholds = {
    cautionAt50: totalMME >= 50,
    avoidAbove90: totalMME >= 90
  };

  if (thresholds.cautionAt50) notes.push('MME ≥ 50: consider risk mitigation and naloxone');
  if (thresholds.avoidAbove90) notes.push('MME ≥ 90: avoid or justify with careful monitoring');

  return { totalMME: Math.round(totalMME * 10) / 10, details, thresholds, notes };
}

export default { calculateBSA, calculateCrCl, calculateMME, MME_FACTORS };
