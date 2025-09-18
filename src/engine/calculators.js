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

export default { calculateBSA, calculateCrCl };

