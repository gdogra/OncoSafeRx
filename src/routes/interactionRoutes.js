import express from 'express';
import { RxNormService } from '../services/rxnormService.js';
import { DrugInteraction } from '../models/Interaction.js';
import supabaseService from '../config/supabase.js';
import KNOWN_INTERACTIONS from '../data/knownInteractions.js';
import RXCUI_MAP from '../data/rxcuiMap.js';
import { interactionLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();
const rxnormService = new RxNormService();

// List all locally curated interactions
// simple in-memory cache for resolved RXCUIs
const rxcuiCache = new Map();
// In-memory overlay for runtime additions/edits (non-persistent)
const CURATED_OVERLAY = [];

function getAllKnown() {
  return [...KNOWN_INTERACTIONS, ...CURATED_OVERLAY];
}

// Simple token gate for demo/admin overlay edits
const ADMIN_TOKEN = process.env.CURATED_EDITOR_TOKEN || process.env.ADMIN_API_TOKEN || null;
function requireAdminToken(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Admin token not configured' });
  }
  const provided = req.headers['x-admin-token'] || req.query.token;
  if (!provided || String(provided) !== String(ADMIN_TOKEN)) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }
  next();
}

router.get('/known', async (req, res) => {
  try {
    const { drug, drugA, drugB, severity, limit, resolveRx, view } = req.query;
    const originA = String(req.query.originA || '').trim();
    const originB = String(req.query.originB || '').trim();

    let results = getAllKnown();

    // Filter by single drug name (matches either in the pair, case-insensitive, substring)
    if (drug && typeof drug === 'string') {
      const term = drug.toLowerCase();
      results = results.filter(k => k.drugs.some(d => d.toLowerCase().includes(term)));
    }

    // Filter by two drug names (order-insensitive, both must match)
    if (drugA && drugB && typeof drugA === 'string' && typeof drugB === 'string') {
      const a = drugA.toLowerCase();
      const b = drugB.toLowerCase();
      results = results.filter(k => {
        const names = k.drugs.map(d => d.toLowerCase());
        return (names.some(n => n.includes(a)) && names.some(n => n.includes(b)));
      });
    }

    // Filter by severity (exact match, case-insensitive)
    if (severity && typeof severity === 'string') {
      const sev = severity.toLowerCase();
      results = results.filter(k => (k.severity || '').toLowerCase() === sev);
    }

    // Enrich with RXCUI mapping; optionally resolve unknown RXCUIs via RxNorm
    const enriched = await Promise.all(results.map(async (k) => {
      const drug_rxnorm = await Promise.all((k.drugs || []).map(async (name) => {
        const key = name.toLowerCase();
        let rxcui = RXCUI_MAP[key] || rxcuiCache.get(key) || null;

        if (!rxcui && resolveRx === 'true') {
          try {
            const found = await rxnormService.searchDrugs(name);
            // prefer Ingredient (IN), then Brand Name (BN), then SCD
            const byTty = (tty) => found.find(f => (f.tty || '').toUpperCase() === tty);
            const preferred = byTty('IN') || byTty('BN') || byTty('SCD') || found[0];
            rxcui = preferred?.rxcui || null;
            if (rxcui) rxcuiCache.set(key, rxcui);
          } catch (e) {
            // ignore resolution failure; leave null
          }
        }

        return { name, rxcui };
      }));

      return { ...k, drug_rxnorm };
    }));

    // Apply optional limit after enrichment
    let limited = enriched;
    const n = parseInt(limit, 10);
    if (!isNaN(n) && n > 0) {
      limited = enriched.slice(0, n);
    }

    // Optional CSV/TSV export
    if (view === 'csv' || view === 'tsv') {
      const isTsv = view === 'tsv';
      const sep = isTsv ? '\t' : ',';
      const mime = isTsv ? 'text/tab-separated-values' : 'text/csv';
      res.setHeader('Content-Type', `${mime}; charset=utf-8`);

      const safe = (v) => {
        const s = String(v ?? '');
        // For TSV, just replace newlines/tabs; for CSV, escape quotes and wrap
        if (isTsv) return s.replace(/[\t\n\r]+/g, ' ').trim();
        return '"' + s.replace(/"/g, '""').replace(/[\n\r]+/g, ' ') + '"';
      };

      const headerCols = ['drugA','drugA_rxcui','drugA_origin','drugB','drugB_rxcui','drugB_origin','severity','mechanism','effect','management','evidence_level','sources'];
      const header = isTsv ? headerCols.join(sep) + '\n' : headerCols.map(safe).join(sep) + '\n';
      const originA = String(req.query.originA || '').trim();
      const originB = String(req.query.originB || '').trim();

      const rows = limited.map(item => {
        const a = item.drug_rxnorm[0] || { name: '', rxcui: '' };
        const b = item.drug_rxnorm[1] || { name: '', rxcui: '' };
        const fields = [
          a.name, a.rxcui || '', originA,
          b.name, b.rxcui || '', originB,
          item.severity || '', item.mechanism || '', item.effect || '', item.management || '',
          item.evidence_level || '', Array.isArray(item.sources) ? item.sources.join(';') : ''
        ];
        return isTsv ? fields.map(safe).join(sep) : fields.map(safe).join(sep);
      }).join('\n');

      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filterPart = [drug && `drug-${drug}`, drugA && `a-${drugA}`, drugB && `b-${drugB}`, severity && `sev-${severity}`]
        .filter(Boolean).join('_') || 'all';
      const filename = `curated-interactions_${filterPart}_${ts}.${isTsv ? 'tsv' : 'csv'}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(header + rows + (rows ? '\n' : ''));
    }

    // Optional compact enriched JSON view
    if (view === 'enriched') {
      const compact = limited.map(item => ({
        drugA: item.drug_rxnorm[0],
        drugB: item.drug_rxnorm[1],
        originA: originA || undefined,
        originB: originB || undefined,
        severity: item.severity,
        mechanism: item.mechanism,
        effect: item.effect,
        management: item.management,
        evidence_level: item.evidence_level,
        sources: item.sources
      }));
      return res.json({
        count: compact.length,
        total: enriched.length,
        filters: { drug: drug || null, drugA: drugA || null, drugB: drugB || null, originA: originA || null, originB: originB || null, severity: severity || null },
        interactions: compact
      });
    }

    // Default verbose view
    return res.json({
      count: limited.length,
      total: enriched.length,
      filters: { drug: drug || null, drugA: drugA || null, drugB: drugB || null, originA: originA || null, originB: originB || null, severity: severity || null },
      interactions: limited
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin-lite: add curated interaction to in-memory overlay (non-persistent)
router.post('/known', requireAdminToken, asyncHandler(async (req, res) => {
  const { drugs, severity, mechanism, effect, management, evidence_level, sources } = req.body || {};
  if (!Array.isArray(drugs) || drugs.length !== 2 || !drugs[0] || !drugs[1]) {
    return res.status(400).json({ error: 'drugs must be [drugA, drugB]' });
  }
  const item = {
    drugs: [String(drugs[0]).toLowerCase().trim(), String(drugs[1]).toLowerCase().trim()],
    severity: String(severity || '').toLowerCase() || 'moderate',
    mechanism: mechanism || '',
    effect: effect || '',
    management: management || '',
    evidence_level: evidence_level || '',
    sources: Array.isArray(sources) ? sources : (sources ? [sources] : [])
  };
  CURATED_OVERLAY.push(item);
  res.status(201).json({ added: 1, item });
}));

// Persist curated interaction to database (Supabase) using RXCUIs
router.post('/known/db', requireAdminToken, asyncHandler(async (req, res) => {
  const { drugA, drugB, severity, mechanism, effect, management, evidence_level, sources } = req.body || {};
  if ((!drugA || !drugB) || !(typeof drugA === 'string') || !(typeof drugB === 'string')) {
    return res.status(400).json({ error: 'drugA and drugB are required (name or RXCUI)' });
  }

  // Resolve inputs to RXCUIs if names provided
  const resolveToRxcui = async (value) => {
    const key = String(value).toLowerCase();
    if (/^\d+$/.test(key)) return key; // already RXCUI
    let rxcui = RXCUI_MAP[key] || rxcuiCache.get(key) || null;
    if (!rxcui) {
      try {
        const found = await rxnormService.searchDrugs(String(value));
        const byTty = (tty) => found.find(f => (f.tty || '').toUpperCase() === tty);
        const preferred = byTty('IN') || byTty('BN') || byTty('SCD') || found[0];
        rxcui = preferred?.rxcui || null;
        if (rxcui) rxcuiCache.set(key, rxcui);
      } catch {}
    }
    return rxcui;
  };

  const a = await resolveToRxcui(drugA);
  const b = await resolveToRxcui(drugB);
  if (!a || !b) {
    return res.status(400).json({ error: 'Unable to resolve RXCUIs for provided drugs' });
  }

  try {
    const inserted = await supabaseService.insertDrugInteraction({
      drug1_rxcui: a,
      drug2_rxcui: b,
      severity: (severity || '').toLowerCase(),
      mechanism: mechanism || '',
      effect: effect || '',
      management: management || '',
      evidence_level: evidence_level || '',
      sources: Array.isArray(sources) ? sources : (sources ? [sources] : [])
    });
    return res.status(201).json({ ok: true, interaction: inserted });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to persist curated interaction', details: e?.message || String(e) });
  }
}));

// Query curated interactions stored in DB (admin)
router.get('/known/db', requireAdminToken, asyncHandler(async (req, res) => {
  const { drugA, drugB } = req.query || {};

  const normalizeSeverity = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'high') return 'major';
    if (v === 'low') return 'minor';
    return v || 'unknown';
  };

  const toArray = (x) => Array.isArray(x) ? x : (x ? [x] : []);
  const resolveIfNeeded = async (val) => {
    if (!val) return null;
    const s = String(val);
    if (/^\d+$/.test(s)) return s;
    const key = s.toLowerCase();
    let rxcui = RXCUI_MAP[key] || rxcuiCache.get(key) || null;
    if (!rxcui) {
      try {
        const found = await rxnormService.searchDrugs(s);
        const byTty = (tty) => found.find(f => (f.tty || '').toUpperCase() === tty);
        const preferred = byTty('IN') || byTty('BN') || byTty('SCD') || found[0];
        rxcui = preferred?.rxcui || null;
        if (rxcui) rxcuiCache.set(key, rxcui);
      } catch {}
    }
    return rxcui;
  };

  const a = await resolveIfNeeded(drugA);
  const b = await resolveIfNeeded(drugB);

  if (a && b) {
    const list = await supabaseService.checkMultipleInteractions([a, b]);
    return res.json({ count: list.length, interactions: list.map(i => ({ ...i, severity: normalizeSeverity(i.severity) })) });
  }

  if (a && !b) {
    const list = await supabaseService.getDrugInteractions(a);
    return res.json({ count: list.length, interactions: list.map(i => ({ ...i, severity: normalizeSeverity(i.severity) })) });
  }

  return res.json({ count: 0, interactions: [] });
}));

router.get('/known/overlay', (req, res) => {
  res.json({ count: CURATED_OVERLAY.length, interactions: CURATED_OVERLAY });
});

router.delete('/known/overlay', requireAdminToken, (req, res) => {
  CURATED_OVERLAY.length = 0;
  res.json({ cleared: true });
});

// Check interactions between multiple drugs
router.post('/check',
  interactionLimiter,
  validate(schemas.interactionCheck, 'body'),
  asyncHandler(async (req, res) => {
    console.log('🔍 DDI Check Request:', req.body);
    const { drugs } = req.body;
    
    // Add scientific metadata
    const metadata = {
      method: 'Systematic literature review and regulatory document analysis',
      dataSources: ['ClinicalTrials.gov', 'FDA DailyMed', 'PubMed/PMC'],
      lastUpdated: new Date().toISOString().split('T')[0],
      evidenceLevel: 'Mixed (A-C based on individual interactions)',
      citationFormat: 'OncoSafeRx Evidence Explorer. Drug-Drug Interaction Database. Accessed ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      confidence: 'Medium to High (varies by interaction pair)'
    };

    const interactions = [];
    const drugDetails = [];

    // Get details for each drug from Supabase first, then RxNorm
    for (const drugId of drugs) {
      if (rxnormService.isValidRxcui(drugId)) {
        let drug;
        try {
          drug = await supabaseService.getDrugByRxcui(drugId);
        } catch (error) {
          console.warn(`Local drug lookup failed for ${drugId}:`, error.message);
        }
        
        // If not found locally, get from RxNorm
        if (!drug) {
          const rxnormDrug = await rxnormService.getDrugDetails(drugId);
          if (rxnormDrug) {
            drug = {
              rxcui: rxnormDrug.rxcui,
              name: rxnormDrug.name,
              generic_name: rxnormDrug.genericName || rxnormDrug.name
            };
          }
        }
        
        if (drug) {
          drugDetails.push(drug);
        }
      }
    }

    // Local stored interactions (curated dataset)
    const localStored = getLocalStoredInteractions(drugDetails);
    interactions.push(...localStored);

    // Check interactions from Supabase database (disabled/no-op)
    try {
      const storedInteractions = await supabaseService.checkMultipleInteractions(drugs);
      interactions.push(...storedInteractions);
    } catch (error) {
      console.warn('Stored interactions lookup failed:', error.message);
    }

    // Also check external interactions and provide sample data for demo
    const externalInteractions = [];
    
    // Check known interaction patterns for demo purposes
    const knownInteractions = getKnownInteractions(drugDetails);
    externalInteractions.push(...knownInteractions);
    
    for (let i = 0; i < drugDetails.length; i++) {
      for (let j = i + 1; j < drugDetails.length; j++) {
        const drug1 = drugDetails[i];
        const drug2 = drugDetails[j];
        
        try {
          const drug1Interactions = await rxnormService.getDrugInteractions(drug1.rxcui);
          const pairInteractions = drug1Interactions.filter(interaction => 
            interaction.drug2?.rxcui === drug2.rxcui || 
            interaction.drug1?.rxcui === drug2.rxcui
          );
          externalInteractions.push(...pairInteractions);
        } catch (error) {
          console.warn(`External interaction lookup failed for ${drug1.rxcui}:`, error.message);
        }
      }
    }

    const normalizeSeverity = (s) => {
      const v = String(s || '').toLowerCase();
      if (v === 'high') return 'major';
      if (v === 'low') return 'minor';
      return v || 'unknown';
    };

    res.json({
      inputDrugs: drugs,
      foundDrugs: drugDetails.map(d => ({ rxcui: d.rxcui, name: d.name })),
      interactionCount: interactions.length + externalInteractions.length,
      sources: {
        stored: interactions.length,
        external: externalInteractions.length
      },
      metadata,
      interactions: {
        stored: interactions.map(interaction => ({
          ...interaction,
          severity: normalizeSeverity(interaction.severity),
          riskLevel: assessRiskLevel(normalizeSeverity(interaction.severity))
        })),
        external: externalInteractions.map(interaction => ({
          ...interaction,
          severity: normalizeSeverity(interaction.severity),
          riskLevel: assessRiskLevel(normalizeSeverity(interaction.severity))
        }))
      }
    });
  })
);

// Get all known interactions for a specific drug
router.get('/drug/:rxcui', async (req, res) => {
  try {
    const { rxcui } = req.params;
    
    if (!rxnormService.isValidRxcui(rxcui)) {
      return res.status(400).json({ error: 'Invalid RXCUI format' });
    }

    const interactions = await rxnormService.getDrugInteractions(rxcui);
    const drug = await rxnormService.getDrugDetails(rxcui);
    
    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    // Categorize interactions by severity
    const categorized = {
      major: interactions.filter(i => i.severity === 'high' || i.severity === 'major'),
      moderate: interactions.filter(i => i.severity === 'moderate'),
      minor: interactions.filter(i => i.severity === 'low' || i.severity === 'minor'),
      unknown: interactions.filter(i => !i.severity || 
        !['high', 'major', 'moderate', 'low', 'minor'].includes(i.severity))
    };

    res.json({
      drug: {
        rxcui: drug.rxcui,
        name: drug.name
      },
      totalInteractions: interactions.length,
      breakdown: {
        major: categorized.major.length,
        moderate: categorized.moderate.length,
        minor: categorized.minor.length,
        unknown: categorized.unknown.length
      },
      interactions: categorized
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assessment helper
function assessRiskLevel(severity) {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'major':
      return 'HIGH';
    case 'moderate':
      return 'MODERATE';
    case 'low':
    case 'minor':
      return 'LOW';
    default:
      return 'UNKNOWN';
  }
}

// Known interactions for demo purposes (name-based matching)
function getKnownInteractions(drugDetails) {
  const interactions = [];
  const knownPairs = getAllKnown();
  
  for (let i = 0; i < drugDetails.length; i++) {
    for (let j = i + 1; j < drugDetails.length; j++) {
      const drug1 = drugDetails[i];
      const drug2 = drugDetails[j];
      
      // Check if this pair matches any known interactions
      for (const knownPair of knownPairs) {
        const drug1Name = drug1.name?.toLowerCase() || '';
        const drug2Name = drug2.name?.toLowerCase() || '';
        
        const matchesPair = knownPair.drugs.some(drugName => 
          drug1Name.includes(drugName) && knownPair.drugs.some(otherDrug => 
            otherDrug !== drugName && drug2Name.includes(otherDrug)
          )
        );
        
        if (matchesPair) {
          interactions.push({
            drug1_rxcui: drug1.rxcui || 'unknown',
            drug2_rxcui: drug2.rxcui || 'unknown',
            drug1: { 
              name: drug1.name || drug1.generic_name || 'Unknown Drug', 
              generic_name: drug1.generic_name || drug1.name || 'Unknown Drug' 
            },
            drug2: { 
              name: drug2.name || drug2.generic_name || 'Unknown Drug', 
              generic_name: drug2.generic_name || drug2.name || 'Unknown Drug' 
            },
            severity: knownPair.severity,
            mechanism: knownPair.mechanism,
            effect: knownPair.effect,
            management: knownPair.management,
            evidence_level: knownPair.evidence_level,
            sources: knownPair.sources,
            riskLevel: assessRiskLevel(knownPair.severity)
          });
        }
      }
    }
  }
  
  return interactions;
}

// Local dataset as stored interactions
function getLocalStoredInteractions(drugDetails) {
  const interactions = [];
  const knownPairs = getAllKnown();

  for (let i = 0; i < drugDetails.length; i++) {
    for (let j = i + 1; j < drugDetails.length; j++) {
      const drug1 = drugDetails[i];
      const drug2 = drugDetails[j];

      for (const knownPair of knownPairs) {
        const drug1Name = drug1.name?.toLowerCase() || '';
        const drug2Name = drug2.name?.toLowerCase() || '';

        const a = knownPair.drugs[0].toLowerCase();
        const b = knownPair.drugs[1].toLowerCase();

        const matches =
          (drug1Name.includes(a) && drug2Name.includes(b)) ||
          (drug1Name.includes(b) && drug2Name.includes(a));

        if (matches) {
          interactions.push({
            drug1_rxcui: drug1.rxcui || 'unknown',
            drug2_rxcui: drug2.rxcui || 'unknown',
            drug1: { 
              name: drug1.name || drug1.generic_name || 'Unknown Drug', 
              generic_name: drug1.generic_name || drug1.name || 'Unknown Drug' 
            },
            drug2: { 
              name: drug2.name || drug2.generic_name || 'Unknown Drug', 
              generic_name: drug2.generic_name || drug2.name || 'Unknown Drug' 
            },
            severity: knownPair.severity,
            mechanism: knownPair.mechanism,
            effect: knownPair.effect,
            management: knownPair.management,
            evidence_level: knownPair.evidence_level,
            sources: knownPair.sources,
            riskLevel: assessRiskLevel(knownPair.severity)
          });
        }
      }
    }
  }

  return interactions;
}

export default router;
