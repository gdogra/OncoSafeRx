import express from 'express';
import { RxNormService } from '../services/rxnormService.js';
import KNOWN_INTERACTIONS from '../data/knownInteractions.js';
import suggestAlternatives from '../engine/alternatives.js';

const router = express.Router();
const rxnormService = new RxNormService();

// Discovery endpoint
router.get('/cds-services', (req, res) => {
  res.json({
    services: [
      {
        id: 'oncosaferx-medication-prescribe',
        hook: 'medication-prescribe',
        title: 'OncoSafeRx Medication Safety',
        description: 'Checks oncology-relevant DDI and PGx and suggests safer alternatives',
        prefetch: {},
        cdsHooksVersion: '1.0'
      }
    ]
  });
});

// Simple medication-prescribe service (MVP demo)
router.post('/cds-services/oncosaferx-medication-prescribe', async (req, res) => {
  try {
    const { context } = req.body || {};
    const { medications = [] } = context || {};

    // Expecting medications as RXCUI strings or objects with rxcui/name
    const details = [];
    for (const m of medications) {
      const id = typeof m === 'string' ? m : (m.rxcui || m.id);
      if (!id) continue;
      const d = await rxnormService.getDrugDetails(id);
      if (d) details.push({ rxcui: d.rxcui, name: d.name });
    }

    // Very basic rule: if any curated pair matches, add a card
    const names = details.map(d => (d.name || '').toLowerCase());
    const hits = KNOWN_INTERACTIONS.filter(k =>
      names.some(n => n.includes(k.drugs[0])) && names.some(n => n.includes(k.drugs[1]))
    );

    const cards = hits.map(h => ({
      summary: `Potential interaction: ${h.drugs[0]} + ${h.drugs[1]}`,
      indicator: h.severity === 'major' ? 'critical' : h.severity === 'moderate' ? 'warning' : 'info',
      source: { label: 'OncoSafeRx', url: 'https://oncosaferx.com' },
      detail: `${h.effect}. Management: ${h.management}`,
      links: [
        { label: 'View curated guidance', url: 'https://oncosaferx.com/curated', type: 'absolute' }
      ]
    }));

    // Add alternatives card if available
    const alts = suggestAlternatives(details);
    if (alts.length > 0) {
      const top = alts[0];
      cards.push({
        summary: `Consider alternative to ${top.forDrug?.name}`,
        indicator: 'info',
        source: { label: 'OncoSafeRx' },
        detail: `With ${top.withDrug?.name}, consider switching to ${top.alternative?.name}. Reason: ${top.rationale}`
      });
    }

    res.json({ cards });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
