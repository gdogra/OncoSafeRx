/**
 * Treatment Timeline Service
 *
 * Generates a visual timeline of a patient's cancer treatment journey
 * from diagnosis through active treatment, showing:
 * - Treatment cycles (chemo, immunotherapy, targeted therapy)
 * - Lab monitoring points
 * - Imaging/scans
 * - Side effect windows
 * - PGx testing points
 * - Clinical trial eligibility windows
 */

/**
 * Generate a treatment timeline from a regimen and patient data.
 *
 * @param {Object} params
 * @param {string} params.regimen - Regimen name (e.g., 'FOLFOX', 'AC-T')
 * @param {string} params.startDate - Treatment start date (ISO)
 * @param {number} [params.cycles] - Number of planned cycles
 * @param {Object} [params.patientData] - Age, stage, biomarkers
 * @returns {Object} Timeline with events
 */
export function generateTimeline({ regimen, startDate, cycles = 6, patientData = {} }) {
  const start = new Date(startDate || new Date());
  const events = [];

  const regimenData = REGIMEN_TEMPLATES[regimen.toUpperCase()] || REGIMEN_TEMPLATES['CUSTOM'];

  // Pre-treatment events
  events.push({
    date: addDays(start, -14),
    type: 'assessment',
    title: 'Pre-treatment Assessment',
    description: 'Baseline labs (CBC, CMP, LFTs), imaging, performance status evaluation',
    category: 'preparation',
  });

  events.push({
    date: addDays(start, -7),
    type: 'pgx',
    title: 'Pharmacogenomic Testing',
    description: getPGxTestingRecommendation(regimenData.drugs),
    category: 'preparation',
  });

  // Treatment cycles
  for (let cycle = 1; cycle <= cycles; cycle++) {
    const cycleStart = addDays(start, (cycle - 1) * regimenData.cycleDays);

    // Day 1: treatment administration
    events.push({
      date: cycleStart,
      type: 'treatment',
      title: `Cycle ${cycle} — Day 1`,
      description: `${regimenData.name}: ${regimenData.drugs.join(' + ')}`,
      category: 'treatment',
      cycle,
      drugs: regimenData.drugs,
    });

    // Multi-day regimens
    if (regimenData.treatmentDays > 1) {
      for (let d = 2; d <= regimenData.treatmentDays; d++) {
        events.push({
          date: addDays(cycleStart, d - 1),
          type: 'treatment',
          title: `Cycle ${cycle} — Day ${d}`,
          description: regimenData.dayDescriptions?.[d] || `Continue ${regimenData.name}`,
          category: 'treatment',
          cycle,
        });
      }
    }

    // Nadir (blood count lowest point)
    events.push({
      date: addDays(cycleStart, regimenData.nadirDay || 10),
      type: 'monitoring',
      title: `Cycle ${cycle} — Nadir Check`,
      description: 'Expected nadir (lowest blood counts). CBC with differential recommended.',
      category: 'monitoring',
      cycle,
    });

    // Pre-cycle labs for next cycle
    if (cycle < cycles) {
      events.push({
        date: addDays(cycleStart, regimenData.cycleDays - 3),
        type: 'labs',
        title: `Pre-Cycle ${cycle + 1} Labs`,
        description: 'CBC, CMP. Confirm counts adequate for next cycle.',
        category: 'monitoring',
        cycle,
      });
    }

    // Restaging scans every 2-3 cycles
    if (cycle % regimenData.restagingInterval === 0) {
      events.push({
        date: addDays(cycleStart, regimenData.cycleDays - 1),
        type: 'imaging',
        title: `Restaging — After Cycle ${cycle}`,
        description: 'CT/PET scan to assess treatment response (RECIST criteria)',
        category: 'assessment',
        cycle,
      });
    }
  }

  // Post-treatment
  const endDate = addDays(start, cycles * regimenData.cycleDays);
  events.push({
    date: endDate,
    type: 'assessment',
    title: 'End of Treatment Assessment',
    description: 'Final restaging scan, labs, performance status. Transition to surveillance.',
    category: 'assessment',
  });

  events.push({
    date: addDays(endDate, 30),
    type: 'followup',
    title: 'First Follow-Up',
    description: 'Post-treatment follow-up: labs, symptoms, survivorship care plan',
    category: 'followup',
  });

  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    regimen: regimenData.name,
    drugs: regimenData.drugs,
    startDate: start.toISOString(),
    endDate: endDate.toISOString(),
    totalCycles: cycles,
    cycleLengthDays: regimenData.cycleDays,
    durationWeeks: Math.ceil((cycles * regimenData.cycleDays) / 7),
    events,
    eventCount: events.length,
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getPGxTestingRecommendation(drugs) {
  const tests = [];
  const drugsLower = drugs.map(d => d.toLowerCase());
  if (drugsLower.some(d => ['fluorouracil', '5-fu', 'capecitabine'].includes(d))) tests.push('DPYD');
  if (drugsLower.some(d => ['irinotecan'].includes(d))) tests.push('UGT1A1');
  if (drugsLower.some(d => ['tamoxifen'].includes(d))) tests.push('CYP2D6');
  if (drugsLower.some(d => ['mercaptopurine', '6-mp', 'azathioprine', 'thioguanine'].includes(d))) tests.push('TPMT', 'NUDT15');
  if (tests.length === 0) return 'No specific PGx testing required for this regimen';
  return `Recommended PGx testing: ${tests.join(', ')} — results should be available before cycle 1`;
}

const REGIMEN_TEMPLATES = {
  'FOLFOX': { name: 'FOLFOX', drugs: ['fluorouracil', 'leucovorin', 'oxaliplatin'], cycleDays: 14, treatmentDays: 2, nadirDay: 10, restagingInterval: 4 },
  'FOLFIRI': { name: 'FOLFIRI', drugs: ['fluorouracil', 'leucovorin', 'irinotecan'], cycleDays: 14, treatmentDays: 2, nadirDay: 10, restagingInterval: 4 },
  'FOLFIRINOX': { name: 'FOLFIRINOX', drugs: ['fluorouracil', 'leucovorin', 'irinotecan', 'oxaliplatin'], cycleDays: 14, treatmentDays: 2, nadirDay: 10, restagingInterval: 4 },
  'R-CHOP': { name: 'R-CHOP', drugs: ['rituximab', 'cyclophosphamide', 'doxorubicin', 'vincristine', 'prednisone'], cycleDays: 21, treatmentDays: 1, nadirDay: 12, restagingInterval: 3 },
  'AC-T': { name: 'AC → T', drugs: ['doxorubicin', 'cyclophosphamide'], cycleDays: 21, treatmentDays: 1, nadirDay: 12, restagingInterval: 2, dayDescriptions: { 2: 'Paclitaxel (weekly during T phase)' } },
  'CARBOPLATIN-PACLITAXEL': { name: 'Carboplatin/Paclitaxel', drugs: ['carboplatin', 'paclitaxel'], cycleDays: 21, treatmentDays: 1, nadirDay: 14, restagingInterval: 3 },
  'CISPLATIN-ETOPOSIDE': { name: 'Cisplatin/Etoposide', drugs: ['cisplatin', 'etoposide'], cycleDays: 21, treatmentDays: 3, nadirDay: 14, restagingInterval: 3 },
  'GEMCITABINE-CISPLATIN': { name: 'Gemcitabine/Cisplatin', drugs: ['gemcitabine', 'cisplatin'], cycleDays: 21, treatmentDays: 1, nadirDay: 14, restagingInterval: 3 },
  'PEMBROLIZUMAB': { name: 'Pembrolizumab', drugs: ['pembrolizumab'], cycleDays: 21, treatmentDays: 1, nadirDay: 0, restagingInterval: 3 },
  'NIVOLUMAB': { name: 'Nivolumab', drugs: ['nivolumab'], cycleDays: 14, treatmentDays: 1, nadirDay: 0, restagingInterval: 4 },
  'CUSTOM': { name: 'Custom Regimen', drugs: [], cycleDays: 21, treatmentDays: 1, nadirDay: 12, restagingInterval: 3 },
};

export default { generateTimeline, REGIMEN_TEMPLATES };
