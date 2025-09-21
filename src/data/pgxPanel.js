// PGx panel descriptor modeled after a multi-specialty 17-gene + 4 HLA panel
// Marks which genes are currently implemented in the MVP (true/false)

export const PGX_PANEL = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  genes: [
    { symbol: 'CYP2D6', implemented: true },
    { symbol: 'CYP2C19', implemented: true },
    { symbol: 'CYP2C9', implemented: true },
    { symbol: 'CYP3A5', implemented: false },
    { symbol: 'CYP3A4', implemented: false },
    { symbol: 'DPYD', implemented: true },
    { symbol: 'UGT1A1', implemented: true },
    { symbol: 'TPMT', implemented: true },
    { symbol: 'NUDT15', implemented: true },
    { symbol: 'SLCO1B1', implemented: true },
    { symbol: 'VKORC1', implemented: true },
    { symbol: 'G6PD', implemented: false },
    { symbol: 'IFNL3', implemented: false },
    { symbol: 'NAT2', implemented: false },
    { symbol: 'CYP2B6', implemented: false },
    { symbol: 'OPRM1', implemented: false },
    { symbol: 'COMT', implemented: false }
  ],
  hla: [
    { symbol: 'HLA-B*57:01', implemented: true },
    { symbol: 'HLA-B*15:02', implemented: true },
    { symbol: 'HLA-A*31:01', implemented: true },
    { symbol: 'HLA-B*58:01', implemented: true }
  ],
  notes: [
    'Panel definition is illustrative and multi-specialty; app is oncology-focused.',
    'Implemented=true indicates rules/data present in current MVP.'
  ]
};

export default PGX_PANEL;
