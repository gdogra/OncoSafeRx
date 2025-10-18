// Simple dynamic-report version log to simulate evolving evidence

export const PGX_VERSION_LOG = {
  currentVersion: '2025.09.20',
  previousVersion: '2025.07.01',
  changes: [
    {
      version: '2025.09.20',
      date: '2025-09-20T00:00:00Z',
      notes: [
        'CYP2C19 + clopidogrel: reinforced Level A evidence for PM to use prasugrel/ticagrelor',
        'UGT1A1 + irinotecan: clarified dose reduction range (25–50%)',
        'Added HLA-B*58:01 + allopurinol avoidance as Level A in non-oncology context'
      ]
    },
    {
      version: '2025.07.01',
      date: '2025-07-01T00:00:00Z',
      notes: [
        'Initial HLA support (B*57:01, B*15:02, A*31:01) included in dataset',
        'Added VKORC1 placeholder to panel descriptor'
      ]
    }
  ]
};

export default PGX_VERSION_LOG;

