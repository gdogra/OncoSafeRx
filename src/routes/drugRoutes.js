import express from 'express';
import { RxNormService } from '../services/rxnormService.js';
import { DailyMedService } from '../services/dailymedService.js';
import supabaseService from '../config/supabase.js';
import clinicalIntelligenceService from '../services/clinicalIntelligenceService.js';
import { searchLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate, schemas } from '../utils/validation.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const rxnormService = new RxNormService();
const dailymedService = new DailyMedService();

// Lightweight suggestions endpoint for typeahead
router.get('/suggestions', 
  searchLimiter,
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    const limit = Math.max(1, Math.min(20, Number(req.query.limit) || 8));
    if (q.length < 2) return res.json({ suggestions: [] });

    // Try RxNorm first (gracefully handle connectivity errors)
    let rxResults = [];
    try {
      rxResults = await rxnormService.searchDrugs(q);
    } catch (e) {
      console.warn('RxNorm suggestions failed:', e?.message || e);
    }
    let suggestions = (rxResults || [])
      .map(d => ({
        id: d.rxcui || d.name,
        name: d.name || d.synonym || '',
        category: 'drug',
        rxcui: d.rxcui || null
      }))
      .filter(s => s.name);

    // Offline/local fallback if RxNorm is unavailable or returned nothing
    let offline = false;
    if (!suggestions.length) {
      const OFFLINE = [
        // Aspirin and related drugs
        { name: 'aspirin', rxcui: '1191' },
        { name: 'aspirin 81 mg', rxcui: '243670' },
        { name: 'aspirin 325 mg', rxcui: '211154' },
        { name: 'aspirin buffered', rxcui: '1299896' },
        { name: 'aspirin enteric coated', rxcui: '1299897' },
        { name: 'aspirin/dipyridamole', rxcui: '214154' },
        { name: 'aspirin/oxycodone', rxcui: '1049502' },
        { name: 'acetylsalicylic acid', rxcui: '1191' },
        
        // Analgesics
        { name: 'acetaminophen', rxcui: '161' },
        { name: 'acetaminophen 325 mg', rxcui: '313782' },
        { name: 'acetaminophen 500 mg', rxcui: '313782' },
        { name: 'acetaminophen/codeine', rxcui: '993781' },
        { name: 'acetaminophen/hydrocodone', rxcui: '857005' },
        { name: 'acetaminophen/oxycodone', rxcui: '1049502' },
        { name: 'acetaminophen/tramadol', rxcui: '836654' },
        
        // NSAIDs
        { name: 'ibuprofen', rxcui: '5640' },
        { name: 'ibuprofen 200 mg', rxcui: '310965' },
        { name: 'ibuprofen 400 mg', rxcui: '310965' },
        { name: 'ibuprofen 600 mg', rxcui: '310965' },
        { name: 'ibuprofen 800 mg', rxcui: '310965' },
        { name: 'naproxen', rxcui: '7258' },
        { name: 'naproxen sodium', rxcui: '7258' },
        { name: 'naproxen 220 mg', rxcui: '849574' },
        { name: 'naproxen 500 mg', rxcui: '849574' },
        { name: 'diclofenac', rxcui: '3355' },
        { name: 'celecoxib', rxcui: '140587' },
        { name: 'meloxicam', rxcui: '6960' },
        
        // Opioids
        { name: 'morphine', rxcui: '7052' },
        { name: 'morphine sulfate', rxcui: '7052' },
        { name: 'morphine immediate release', rxcui: '861467' },
        { name: 'morphine extended release', rxcui: '861467' },
        { name: 'oxycodone', rxcui: '7804' },
        { name: 'oxycodone 5 mg', rxcui: '1049502' },
        { name: 'oxycodone 10 mg', rxcui: '1049502' },
        { name: 'oxycodone immediate release', rxcui: '1049502' },
        { name: 'oxycodone extended release', rxcui: '1049502' },
        { name: 'hydrocodone', rxcui: '5489' },
        { name: 'hydrocodone/acetaminophen', rxcui: '857005' },
        { name: 'hydromorphone', rxcui: '3423' },
        { name: 'codeine', rxcui: '2670' },
        { name: 'tramadol', rxcui: '10689' },
        { name: 'tramadol 50 mg', rxcui: '836654' },
        { name: 'tramadol extended release', rxcui: '836654' },
        { name: 'fentanyl', rxcui: '4337' },
        { name: 'fentanyl patch', rxcui: '197696' },
        { name: 'methadone', rxcui: '6813' },
        
        // Anticonvulsants
        { name: 'gabapentin', rxcui: '25480' },
        { name: 'gabapentin 100 mg', rxcui: '352385' },
        { name: 'gabapentin 300 mg', rxcui: '352385' },
        { name: 'gabapentin 600 mg', rxcui: '352385' },
        { name: 'pregabalin', rxcui: '187832' },
        { name: 'pregabalin 25 mg', rxcui: '597823' },
        { name: 'pregabalin 50 mg', rxcui: '597823' },
        { name: 'pregabalin 75 mg', rxcui: '597823' },
        
        // PPIs
        { name: 'omeprazole', rxcui: '7646' },
        { name: 'omeprazole 20 mg', rxcui: '40790' },
        { name: 'omeprazole 40 mg', rxcui: '40790' },
        { name: 'pantoprazole', rxcui: '40790' },
        { name: 'pantoprazole 20 mg', rxcui: '40790' },
        { name: 'pantoprazole 40 mg', rxcui: '40790' },
        { name: 'esomeprazole', rxcui: '298459' },
        { name: 'lansoprazole', rxcui: '17128' },
        
        // Anticoagulants
        { name: 'clopidogrel', rxcui: '32968' },
        { name: 'clopidogrel 75 mg', rxcui: '309362' },
        { name: 'warfarin', rxcui: '11289' },
        { name: 'warfarin sodium', rxcui: '11289' },
        { name: 'rivaroxaban', rxcui: '1114195' },
        { name: 'apixaban', rxcui: '1364430' },
        { name: 'dabigatran', rxcui: '1037042' },
        
        // Indian medications
        { name: 'arkamin', rxcui: 'IND001' }, // Clonidine
        { name: 'metpure', rxcui: 'IND002' }, // Metoprolol
        { name: 'probowel', rxcui: 'IND003' }, // Probiotic
        { name: 'dytor', rxcui: 'IND004' }, // Furosemide
        { name: 'cilicar', rxcui: 'IND005' }, // Cilnidipine
        { name: 'kbind', rxcui: 'IND006' }, // Calcium polystyrene sulfonate
        { name: 'oxra', rxcui: 'IND007' }, // Oxcarbazepine
        { name: 'zolfresh', rxcui: 'IND008' } // Zolpidem
      ];
      const lc = q.toLowerCase();
      suggestions = OFFLINE
        .filter(d => d.name.toLowerCase().includes(lc))
        .slice(0, limit)
        .map(d => ({ id: d.rxcui || d.name, name: d.name, category: 'drug', rxcui: d.rxcui || null }));
      offline = true;
    }

    res.json({ suggestions: suggestions.slice(0, limit), offline });
  })
);

// Enhanced drug search with clinical insights
router.get('/search', 
  searchLimiter,
  optionalAuth,
  validate(schemas.drugSearch, 'query'),
  asyncHandler(async (req, res) => {
    const { q, patient_context } = req.query;
    
    // Search both local database and external API
    let localResults = [];
    try {
      localResults = await supabaseService.searchDrugs(q, 25);
    } catch (error) {
      console.warn('Local search failed:', error.message);
    }
    
    let rxnormResults = [];
    try {
      rxnormResults = await rxnormService.searchDrugs(q);
    } catch (e) {
      console.warn('RxNorm search failed:', e?.message || e);
    }
    
    // Combine and deduplicate results
    const combinedResults = [...localResults, ...rxnormResults];
    const uniqueResults = combinedResults.filter((drug, index, self) => 
      index === self.findIndex(d => d.rxcui === drug.rxcui)
    );

    // Enhance results with clinical insights
    const enhancedResults = await Promise.all(
      uniqueResults.slice(0, 10).map(async (drug) => {
        try {
          const patientData = patient_context ? JSON.parse(patient_context) : {};
          const insights = await clinicalIntelligenceService.getEnhancedDrugInfo(drug.rxcui, patientData);
          
          return {
            ...drug,
            insights
          };
        } catch (error) {
          console.warn(`Failed to enhance drug ${drug.rxcui}:`, error.message);
          return drug;
        }
      })
    );
    
    res.json({
      query: q,
      count: uniqueResults.length,
      sources: {
        local: localResults.length,
        rxnorm: rxnormResults.length
      },
      results: enhancedResults
    });
  })
);

// Enhanced drug details with comprehensive clinical intelligence
router.get('/:rxcui',
  optionalAuth,
  validate(schemas.rxcui, 'params'),
  asyncHandler(async (req, res) => {
    const { rxcui } = req.params;
    const { patient_context } = req.query;
    
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

// Get drug variants (SCD/SBD/pack)
router.get('/:rxcui/variants',
  validate(schemas.rxcui, 'params'),
  asyncHandler(async (req, res) => {
    const { rxcui } = req.params;
    try {
      const variants = await rxnormService.getDrugVariants(rxcui);
      res.json({ rxcui, count: variants.length, variants });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch drug variants' });
    }
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
