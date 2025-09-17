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

      res.json({
        input: details,
        phenotypes,
        count: suggestions.length,
        suggestions
      });
      const suggestions = suggestAlternatives(details);
      res.json({
        input: details,
        count: suggestions.length,
        suggestions
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
