import express from 'express';
import { RxNormService } from '../services/rxnormService.js';
import { DailyMedService } from '../services/dailymedService.js';
import supabaseService from '../config/supabase.js';
import { searchLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();
const rxnormService = new RxNormService();
const dailymedService = new DailyMedService();

// Search for drugs
router.get('/search', 
  searchLimiter,
  validate(schemas.drugSearch, 'query'),
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    // Search both local database and external API
    let localResults = [];
    try {
      localResults = await supabaseService.searchDrugs(q, 25);
    } catch (error) {
      console.warn('Local search failed:', error.message);
    }
    
    const rxnormResults = await rxnormService.searchDrugs(q);
    
    // Combine and deduplicate results
    const combinedResults = [...localResults, ...rxnormResults];
    const uniqueResults = combinedResults.filter((drug, index, self) => 
      index === self.findIndex(d => d.rxcui === drug.rxcui)
    );
    
    res.json({
      query: q,
      count: uniqueResults.length,
      sources: {
        local: localResults.length,
        rxnorm: rxnormResults.length
      },
      results: uniqueResults
    });
  })
);

// Get drug details by RXCUI
router.get('/:rxcui',
  validate(schemas.rxcui, 'params'),
  asyncHandler(async (req, res) => {
    const { rxcui } = req.params;
    
    // Try to get from local database first
    let drug;
    try {
      drug = await supabaseService.getDrugByRxcui(rxcui);
    } catch (error) {
      console.warn('Local drug lookup failed:', error.message);
    }
    
    // If not found locally, fetch from RxNorm and cache it
    if (!drug) {
      const rxnormDrug = await rxnormService.getDrugDetails(rxcui);
      
      if (!rxnormDrug) {
        return res.status(404).json({ error: 'Drug not found' });
      }
      
      // Cache the drug in our database
      try {
        const drugData = {
          rxcui: rxnormDrug.rxcui,
          name: rxnormDrug.name,
          generic_name: rxnormDrug.genericName || rxnormDrug.name,
          brand_names: rxnormDrug.brandNames || [],
          active_ingredients: rxnormDrug.activeIngredients || [],
          dosage_forms: rxnormDrug.dosageForms || [],
          strengths: rxnormDrug.strengths || [],
          therapeutic_class: rxnormDrug.therapeuticClass,
          indication: rxnormDrug.indication
        };
        
        await supabaseService.upsertDrug(drugData);
        drug = drugData;
      } catch (error) {
        console.warn('Failed to cache drug:', error.message);
        // Return the original drug data even if caching failed
        drug = rxnormDrug.toJSON();
      }
    }

    res.json(drug);
  })
);

// Get drug interactions
router.get('/:rxcui/interactions', 
  validate(schemas.rxcui, 'params'),
  asyncHandler(async (req, res) => {
    const { rxcui } = req.params;
    
    // Get interactions from local database
    let localInteractions = [];
    try {
      localInteractions = await supabaseService.getDrugInteractions(rxcui);
    } catch (error) {
      console.warn('Local interactions lookup failed:', error.message);
    }
    
    // Also get external interactions
    const externalInteractions = await rxnormService.getDrugInteractions(rxcui);
    
    res.json({
      rxcui,
      interactionCount: localInteractions.length + externalInteractions.length,
      sources: {
        local: localInteractions.length,
        external: externalInteractions.length
      },
      interactions: {
        stored: localInteractions,
        external: externalInteractions
      }
    });
  })
);

// Search FDA labels via DailyMed
router.get('/labels/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }

    const results = await dailymedService.searchLabels(q);
    res.json({
      query: q,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed FDA label
router.get('/labels/:setId', async (req, res) => {
  try {
    const { setId } = req.params;
    const labelData = await dailymedService.getLabelDetails(setId);
    
    if (!labelData) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(labelData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contraindications for a drug label
router.get('/labels/:setId/contraindications', async (req, res) => {
  try {
    const { setId } = req.params;
    const contraindications = await dailymedService.getContraindications(setId);
    
    res.json({
      setId,
      contraindications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get adverse reactions for a drug label
router.get('/labels/:setId/adverse-reactions', async (req, res) => {
  try {
    const { setId } = req.params;
    const adverseReactions = await dailymedService.getAdverseReactions(setId);
    
    res.json({
      setId,
      adverseReactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;