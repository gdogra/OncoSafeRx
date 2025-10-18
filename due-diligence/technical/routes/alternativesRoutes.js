import express from 'express';
import { RxNormService } from '../services/rxnormService.js';
import { validate, schemas } from '../utils/validation.js';
import suggestAlternatives from '../engine/alternatives.js';

const router = express.Router();
const rxnormService = new RxNormService();

// Suggest alternatives for a given drug set
router.post('/suggest',
  validate(schemas.interactionCheck, 'body'),
  async (req, res) => {
    try {
      const { drugs } = req.body; // array of RXCUIs
      const phenotypes = (req.body && req.body.phenotypes) || {};

      const details = [];
      for (const id of drugs) {
        if (!rxnormService.isValidRxcui(id)) continue;
        const d = await rxnormService.getDrugDetails(id);
        if (d) details.push({ rxcui: d.rxcui, name: d.name });
      }
      let suggestions = suggestAlternatives(details);

      // PGx-aware suggestions (MVP)
      const names = details.map(d => (d.name || '').toLowerCase());
      const addSuggestion = (forName, altName, rationale, withName, pgx) => {
        const forDrug = details.find(d => d.name?.toLowerCase().includes(forName));
        const withDrug = withName ? details.find(d => d.name?.toLowerCase().includes(withName)) : null;
        if (forDrug) {
          suggestions.push({
            forDrug: { rxcui: forDrug.rxcui, name: forDrug.name },
            withDrug: withDrug ? { rxcui: withDrug.rxcui, name: withDrug.name } : undefined,
            alternative: { name: altName, rxcui: null },
            rationale,
            citations: [
              { label: 'CPIC', url: 'https://cpicpgx.org/' },
              { label: 'FDA Label', url: 'https://dailymed.nlm.nih.gov/dailymed/' }
            ],
            pgx: pgx ? [pgx] : []
          });
        }
      };

      const cyp2d6 = String(phenotypes.CYP2D6 || '').toLowerCase();
      if (cyp2d6.includes('poor') || cyp2d6.includes('intermediate')) {
        const pgx = { gene: 'CYP2D6', phenotype: phenotypes.CYP2D6 };
        if (names.some(n => n.includes('codeine'))) addSuggestion('codeine', 'morphine', 'CYP2D6 PM/IM: avoid codeine; use non–CYP2D6-dependent opioid.', undefined, pgx);
        if (names.some(n => n.includes('tramadol'))) addSuggestion('tramadol', 'morphine', 'CYP2D6 PM/IM: avoid tramadol; use non–CYP2D6-dependent opioid.', undefined, pgx);
      }

      const cyp2c19 = String(phenotypes.CYP2C19 || '').toLowerCase();
      if (cyp2c19.includes('poor') || cyp2c19.includes('intermediate')) {
        const pgx = { gene: 'CYP2C19', phenotype: phenotypes.CYP2C19 };
        if (names.some(n => n.includes('clopidogrel'))) addSuggestion('clopidogrel', 'prasugrel or ticagrelor', 'CYP2C19 PM/IM: reduced clopidogrel activation; consider alternative P2Y12 inhibitor.', undefined, pgx);
      }

      // Simple scoring and cost/formulary hints
      const costMap = {
        'pantoprazole': 'low-cost generic',
        'morphine': 'low-cost generic',
        'prasugrel or ticagrelor': 'brand (check coverage)'
      };
      suggestions = suggestions.map(s => {
        let score = 0;
        const reasons = [];
        if (s.pgx && s.pgx.length) score += 2;
        if (s.pgx && s.pgx.length) reasons.push('PGx compatibility (+2)');
        if (/prasugrel|ticagrelor/i.test(s.alternative?.name || '')) score -= 1;
        if (/prasugrel|ticagrelor/i.test(s.alternative?.name || '')) reasons.push('Brand agent (-1)');
        if (/morphine|pantoprazole/i.test(s.alternative?.name || '')) score += 1;
        if (/morphine|pantoprazole/i.test(s.alternative?.name || '')) reasons.push('Low-cost generic (+1)');
        return {
          ...s,
          score,
          explanation: reasons.join('; '),
          costHint: costMap[(s.alternative?.name || '').toLowerCase()] || null,
          formulary: /generic/i.test(costMap[(s.alternative?.name || '').toLowerCase()] || '') ? 'likely-covered' : 'check-coverage'
        };
      }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      // Mark the top suggestion as best
      if (suggestions.length > 0) {
        suggestions = suggestions.map((s, idx) => ({ ...s, best: idx === 0 }));
      }

      res.json({
        input: details,
        phenotypes,
        count: suggestions.length,
        suggestions
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
