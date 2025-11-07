import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { RxNormService } from '../services/rxnormService.js';
import { DailyMedService } from '../services/dailymedService.js';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';
import supabaseService from '../config/supabase.js';
import clinicalIntelligenceService from '../services/clinicalIntelligenceService.js';
import { searchLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate, schemas } from '../utils/validation.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const rxnormService = new RxNormService();
const dailymedService = new DailyMedService();

// Brand alias normalization for non-US brand names → generics (loaded from JSON)
const DEFAULT_BRAND_ALIASES = {
  'arkamin': 'clonidine',
  'metpure': 'metoprolol',
  'probowel': null,
  'dytor': 'torsemide',
  'cilacar': 'cilnidipine',
  'cilicar': 'cilnidipine',
  'kbind': 'calcium polystyrene sulfonate',
  'oxra': 'dapagliflozin',
  'zolfresh': 'zolpidem',
  'febutaz': 'febuxostat',
  'montair fx': 'montelukast fexofenadine'
};

let BRAND_ALIASES = new Map(Object.entries(DEFAULT_BRAND_ALIASES));
let brandAliasesLoadedAt = 0;
const BRAND_ALIAS_TTL_MS = 5 * 60 * 1000; // refresh every 5 min
const BRAND_ALIAS_PATH = path.resolve('src/config/brandAliases.json');

const loadBrandAliases = () => {
  try {
    const stat = fs.statSync(BRAND_ALIAS_PATH);
    if (stat.mtimeMs <= brandAliasesLoadedAt && BRAND_ALIASES.size) return;
    const raw = fs.readFileSync(BRAND_ALIAS_PATH, 'utf8');
    const obj = JSON.parse(raw);
    const entries = Object.entries(obj || {}).map(([k, v]) => [String(k).toLowerCase(), v]);
    BRAND_ALIASES = new Map(entries);
    brandAliasesLoadedAt = stat.mtimeMs;
    console.log(`Brand aliases loaded: ${BRAND_ALIASES.size} entries`);
  } catch (e) {
    // Fall back to defaults
    if (!BRAND_ALIASES || !BRAND_ALIASES.size) {
      BRAND_ALIASES = new Map(Object.entries(DEFAULT_BRAND_ALIASES));
    }
  }
};

// External API integration for comprehensive brand alias lookup
const searchExternalBrandAliases = async (query, timeout = 5000) => {
  const results = [];
  
  // Search multiple external APIs in parallel
  const searchPromises = [
    searchRxNavBrands(query, timeout),
    searchDrugBankBrands(query, timeout),
    searchOpenFDABrands(query, timeout)
  ];
  
  try {
    const responses = await Promise.allSettled(searchPromises);
    
    responses.forEach(response => {
      if (response.status === 'fulfilled' && Array.isArray(response.value)) {
        results.push(...response.value);
      }
    });
    
    // Deduplicate and normalize results
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.brand.toLowerCase()}-${(result.generic || '').toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
  } catch (error) {
    console.warn('External brand alias search failed:', error.message);
    return [];
  }
};

// RxNav/RxNorm brand search
const searchRxNavBrands = async (query, timeout = 5000) => {
  try {
    // Search for brand names in RxNav
    const response = await axios.get('https://rxnav.nlm.nih.gov/REST/brands', {
      params: { ingredientname: query },
      timeout
    });
    
    const results = [];
    if (response.data?.brandGroup?.conceptProperties) {
      response.data.brandGroup.conceptProperties.forEach(brand => {
        if (brand.name && brand.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            brand: brand.name,
            generic: query,
            relevance: brand.name.toLowerCase().startsWith(query.toLowerCase()) ? 'high' : 'medium',
            source: 'RxNav'
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.warn('RxNav brand search failed:', error.message);
    return [];
  }
};

// DrugBank API search (if available)
const searchDrugBankBrands = async (query, timeout = 5000) => {
  try {
    // Note: This would require DrugBank API access
    // For now, return empty array - can be implemented with proper API key
    return [];
  } catch (error) {
    console.warn('DrugBank brand search failed:', error.message);
    return [];
  }
};

// OpenFDA brand search
const searchOpenFDABrands = async (query, timeout = 5000) => {
  try {
    // Search OpenFDA drug labels for brand names
    const response = await axios.get('https://api.fda.gov/drug/label.json', {
      params: {
        search: `brand_name:"${query}" OR generic_name:"${query}"`,
        limit: 10
      },
      timeout
    });
    
    const results = [];
    if (response.data?.results) {
      response.data.results.forEach(drug => {
        if (drug.brand_name && drug.generic_name) {
          drug.brand_name.forEach(brand => {
            drug.generic_name.forEach(generic => {
              if (brand.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  brand: brand,
                  generic: generic,
                  relevance: brand.toLowerCase().startsWith(query.toLowerCase()) ? 'high' : 'medium',
                  source: 'OpenFDA'
                });
              }
            });
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.warn('OpenFDA brand search failed:', error.message);
    return [];
  }
};

// Refresh aliases periodically (lazy on first use)
setInterval(() => {
  try { loadBrandAliases(); } catch {}
}, BRAND_ALIAS_TTL_MS).unref?.();

const normalizeQueryToGenerics = (q) => {
  if (!q) return [];
  const lc = String(q).trim().toLowerCase();
  // Ensure aliases are loaded
  try { loadBrandAliases(); } catch {}
  const normalized = [];
  const alias = BRAND_ALIASES.get(lc);
  if (alias) normalized.push(alias);
  // Special handling for combination alias values
  if (alias && alias.includes(' ')) {
    const parts = alias.split(/\s+/).filter(Boolean);
    for (const p of parts) normalized.push(p);
  }
  return Array.from(new Set(normalized));
};

// Lightweight fuzzy score for suggestions
const fuzzyScore = (candidate, query) => {
  if (!candidate || !query) return 0;
  const a = String(candidate).toLowerCase();
  const b = String(query).toLowerCase();
  if (!b) return 0;
  if (a === b) return 1000;
  if (a.startsWith(b)) return 850 - Math.min(100, a.length - b.length);
  const idx = a.indexOf(b);
  if (idx >= 0) return 650 - idx; // earlier matches score higher
  // subsequence (characters in order)
  let i = 0, j = 0, hits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { hits++; j++; }
    i++;
  }
  return hits * 12 - (a.length - hits);
};

// Treat all configured alias keys as Indian market brands (for display tag)
const isIndianBrand = (brand) => {
  try {
    const lc = String(brand || '').toLowerCase();
    return BRAND_ALIASES.has(lc);
  } catch { return false; }
};

// Optional logging for unknown brand candidates
const logUnknownBrand = (term, context = 'suggestions') => {
  try {
    if (!term) return;
    const lc = String(term).trim().toLowerCase();
    if (!lc || lc.length < 2) return;
    if (BRAND_ALIASES.has(lc)) return; // known
    const line = JSON.stringify({ t: new Date().toISOString(), term: lc, ctx: context });
    const logPath = process.env.ALIAS_FEEDBACK_FILE || path.resolve('logs/unknown-brands.log');
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFile(logPath, line + '\n', () => {});
  } catch {}
};

// Helpers to read/write alias JSON and unknown log
const readAliasesJSON = () => {
  try {
    const raw = fs.readFileSync(BRAND_ALIAS_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch { return {}; }
};

const writeAliasesJSON = (obj) => {
  try {
    fs.mkdirSync(path.dirname(BRAND_ALIAS_PATH), { recursive: true });
    fs.writeFileSync(BRAND_ALIAS_PATH, JSON.stringify(obj, null, 2));
    loadBrandAliases();
    return true;
  } catch (e) {
    console.warn('Failed to write brandAliases.json:', e?.message || e);
    return false;
  }
};

const UNKNOWN_LOG_PATH = process.env.ALIAS_FEEDBACK_FILE || path.resolve('logs/unknown-brands.log');
const readUnknownLog = () => {
  try {
    const raw = fs.readFileSync(UNKNOWN_LOG_PATH, 'utf8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const items = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    // Aggregate counts by term
    const counts = new Map();
    items.forEach(it => {
      const k = String(it.term || '').toLowerCase();
      if (!k) return;
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([term, count]) => ({ term, count })).sort((a,b)=> b.count - a.count);
  } catch { return []; }
};

const clearUnknownEntries = (brand) => {
  try {
    if (!fs.existsSync(UNKNOWN_LOG_PATH)) return true;
    const raw = fs.readFileSync(UNKNOWN_LOG_PATH, 'utf8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (!brand) {
      fs.writeFileSync(UNKNOWN_LOG_PATH, '');
      return true;
    }
    const lc = brand.toLowerCase();
    const kept = lines.filter(l => {
      try { const it = JSON.parse(l); return String(it.term || '').toLowerCase() !== lc; } catch { return true; }
    });
    fs.writeFileSync(UNKNOWN_LOG_PATH, kept.join('\n') + (kept.length ? '\n' : ''));
    return true;
  } catch { return false; }
};

// Admin: list current aliases
router.get('/admin/aliases', authenticateToken, requireAdmin, (req, res) => {
  try {
    const obj = readAliasesJSON();
    res.json({ count: Object.keys(obj).length, aliases: obj });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Failed to read aliases' });
  }
});

// Admin: list unknown brand terms (aggregated)
router.get('/admin/aliases/unknown', authenticateToken, requireAdmin, (req, res) => {
  const items = readUnknownLog();
  res.json({ count: items.length, items });
});

// Admin: promote unknown brand to alias mapping
router.post('/admin/aliases/promote', authenticateToken, requireAdmin, express.json(), (req, res) => {
  try {
    const { brand, generic } = req.body || {};
    if (!brand || typeof brand !== 'string') return res.status(400).json({ error: 'brand required' });
    const obj = readAliasesJSON();
    obj[String(brand).toLowerCase()] = generic === null ? null : String(generic || '').toLowerCase() || null;
    const ok = writeAliasesJSON(obj);
    if (!ok) return res.status(500).json({ error: 'Failed to write aliases' });
    // Clear from unknown log
    clearUnknownEntries(brand);
    res.json({ ok: true, brand: String(brand).toLowerCase(), generic: obj[String(brand).toLowerCase()] });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Failed to promote alias' });
  }
});

// Admin: clear unknown log (entire file or one brand)
router.delete('/admin/aliases/unknown', authenticateToken, requireAdmin, (req, res) => {
  const { brand, all } = req.query || {};
  const ok = clearUnknownEntries(all ? undefined : brand);
  if (!ok) return res.status(500).json({ error: 'Failed to clear unknown entries' });
  res.json({ ok: true });
});

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
      // If empty, try normalized brand aliases to generics
      if ((!rxResults || rxResults.length === 0)) {
        const candidates = normalizeQueryToGenerics(q);
        for (const c of candidates) {
          try {
            const r = await rxnormService.searchDrugs(c);
            if (r && r.length) {
              // annotate origin brand/region in suggestion items
              const annotated = r.map(item => ({ ...item, originBrand: q, originRegion: isIndianBrand(q) ? 'IN' : undefined }));
              rxResults = [...rxResults, ...annotated];
            }
          } catch (e2) {
            console.warn('RxNorm alias suggestion failed:', c, e2?.message || e2);
          }
        }
        if ((!rxResults || rxResults.length === 0)) {
          logUnknownBrand(q, 'suggestions');
        }
      }
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
        
        // Indian brand examples (fallback only; try to map to generics via alias)
        { name: 'arkamin', rxcui: null },
        { name: 'metpure', rxcui: null },
        { name: 'probowel', rxcui: null },
        { name: 'dytor', rxcui: null },
        { name: 'cilacar', rxcui: null },
        { name: 'cilicar', rxcui: null },
        { name: 'kbind', rxcui: null },
        { name: 'oxra', rxcui: null },
        { name: 'zolfresh', rxcui: null },
        { name: 'febutaz', rxcui: null },
        { name: 'montair fx', rxcui: null },
      ];
      const lc = q.toLowerCase();
      // Fuzzy-rank offline list
      const ranked = OFFLINE
        .map(d => ({ d, score: fuzzyScore(d.name, lc) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      suggestions = ranked.map(({ d }) => ({ id: d.rxcui || d.name, name: d.name, category: 'drug', rxcui: d.rxcui || null }));
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
      // If RxNorm returns nothing, try brand alias normalization to generics and combine
      if ((!rxnormResults || rxnormResults.length === 0)) {
        const candidates = normalizeQueryToGenerics(q);
        for (const c of candidates) {
          try {
            const r = await rxnormService.searchDrugs(c);
            if (r && r.length) {
              // annotate origin brand/region so frontend can display brand (IN)
              const annotated = r.map(item => ({ ...item, originBrand: q, originRegion: isIndianBrand(q) ? 'IN' : undefined }));
              rxnormResults = [...rxnormResults, ...annotated];
            }
          } catch (e2) {
            console.warn('RxNorm alias search failed:', c, e2?.message || e2);
          }
        }
        if ((!rxnormResults || rxnormResults.length === 0)) {
          logUnknownBrand(q, 'search');
        }
      }
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

// Brand alias search (accessible to all users)
router.get('/brand-aliases/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    // Ensure local aliases are loaded
    try { loadBrandAliases(); } catch {}
    
    const query = String(q).toLowerCase().trim();
    const localResults = [];
    const sources = ['Local'];
    
    // Search through loaded brand aliases (local)
    for (const [brand, generic] of BRAND_ALIASES.entries()) {
      if (brand.includes(query)) {
        localResults.push({
          brand,
          generic,
          relevance: brand.startsWith(query) ? 'high' : 'medium',
          source: 'Local'
        });
      }
    }
    
    // Search external APIs for comprehensive coverage
    let externalResults = [];
    try {
      externalResults = await searchExternalBrandAliases(query, 3000); // 3 second timeout
      if (externalResults.length > 0) {
        const externalSources = [...new Set(externalResults.map(r => r.source))];
        sources.push(...externalSources);
      }
    } catch (error) {
      console.warn('External API search failed, using local only:', error.message);
    }
    
    // Combine and deduplicate results
    const allResults = [...localResults, ...externalResults];
    const seen = new Set();
    const uniqueResults = allResults.filter(result => {
      const key = `${result.brand.toLowerCase()}-${(result.generic || '').toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by relevance (high relevance first, then alphabetical)
    uniqueResults.sort((a, b) => {
      if (a.relevance === 'high' && b.relevance !== 'high') return -1;
      if (b.relevance === 'high' && a.relevance !== 'high') return 1;
      return a.brand.localeCompare(b.brand);
    });
    
    // Enhanced response with source information
    res.json({
      query: q,
      count: uniqueResults.length,
      sources: sources,
      results: uniqueResults.slice(0, 50), // Increased limit for comprehensive results
      message: externalResults.length > 0 
        ? `Found ${localResults.length} local and ${externalResults.length} external brand aliases`
        : localResults.length > 0 
        ? `Found ${localResults.length} local brand aliases`
        : 'No brand aliases found. Try searching for the generic drug name instead.'
    });
    
  } catch (error) {
    console.error('Brand alias search error:', error);
    res.status(500).json({ error: 'Brand alias search failed' });
  }
});

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
