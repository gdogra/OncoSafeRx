// Naive mapping from targeted therapies to common biomarkers.
// This is a lightweight helper to improve UX when hopping to Trials.
export function inferBiomarkerForDrug(drugName: string | undefined | null): string | null {
  if (!drugName) return null;
  const name = drugName.toLowerCase();
  const pairs: Array<[RegExp, string]> = [
    [/osimertinib|erlotinib|gefitinib|afatinib/, 'EGFR'],
    [/cetuximab|panitumumab/, 'EGFR'],
    [/crizotinib|alectinib|brigatinib|ceritinib/, 'ALK'],
    [/entrectinib|larotrectinib/, 'NTRK'],
    [/vemurafenib|dabrafenib|encorafenib/, 'BRAF'],
    [/trastuzumab|lapatinib|pertuzumab|tucatinib/, 'HER2'],
    [/imatinib/, 'BCR-ABL'],
    [/pembrolizumab|nivolumab|atezolizumab|durvalumab|avelumab/, 'PD-L1'],
    [/olaparib|talazoparib|niraparib|rucaparib/, 'BRCA1'], // Roughly suggests BRCA pathway
  ];
  for (const [pattern, marker] of pairs) {
    if (pattern.test(name)) return marker;
  }
  return null;
}

