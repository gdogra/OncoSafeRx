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

      const details = [];
      for (const id of drugs) {
        if (!rxnormService.isValidRxcui(id)) continue;
        const d = await rxnormService.getDrugDetails(id);
        if (d) details.push({ rxcui: d.rxcui, name: d.name });
      }

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

