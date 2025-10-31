import express from 'express';
import clinicalTrialsService from '../services/clinicalTrialsService.js';
import fhirPatientService from '../services/fhirPatientService.js';
import internationalRegistries from '../services/internationalRegistriesService.js';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * Search clinical trials with patient-specific filtering
 */
router.get('/search', async (req, res) => {
  try {
    const {
      condition,
      intervention,
      age,
      gender,
      recruitmentStatus = 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING',
      phase,
      location,
      pageSize = 100,
      pageToken,
      studyType,
      maxResults,
      includeExpanded
    } = req.query;

    // Allow broad unfiltered search (e.g., default recruiting studies) by omitting condition/intervention

    const results = await clinicalTrialsService.searchTrials({
      condition,
      intervention,
      age: age ? parseInt(age) : undefined,
      gender,
      recruitmentStatus,
      phase,
      location,
      pageSize: parseInt(pageSize),
      pageToken,
      studyType,
      maxResults: maxResults ? parseInt(maxResults) : null,
      includeExpanded: includeExpanded === 'true'
    });

    res.json({
      success: true,
      data: results,
      meta: {
        searchCriteria: { condition, intervention, age, gender },
        resultCount: results.studies.length,
        totalCount: results.totalCount,
        hasNextPage: !!results.nextPageToken
      }
    });

  } catch (error) {
    console.error('Clinical trials search error:', error);
    res.status(500).json({
      error: 'Failed to search clinical trials',
      message: error.message
    });
  }
});

/**
 * Get detailed information about a specific trial
 */
router.get('/trial/:nctId', async (req, res) => {
  try {
    const { nctId } = req.params;
    
    if (!nctId || !nctId.match(/^NCT\d+$/)) {
      return res.status(400).json({
        error: 'Invalid NCT ID format. Expected format: NCT followed by numbers'
      });
    }

    const trialDetails = await clinicalTrialsService.getTrialDetails(nctId);
    
    res.json({
      success: true,
      data: trialDetails
    });

  } catch (error) {
    console.error(`Trial details error for ${req.params.nctId}:`, error);
    res.status(404).json({
      error: 'Trial not found',
      message: error.message
    });
  }
});

/**
 * Search trials by drug/medication
 */
router.get('/search-by-drug', async (req, res) => {
  try {
    const { drug, patientId } = req.query;
    
    if (!drug) {
      return res.status(400).json({
        error: 'Drug parameter is required'
      });
    }

    // Get patient profile if provided
    let patientProfile = {};
    if (patientId) {
      try {
        // Prefer looking up the patient via FHIR service
        const patient = await fhirPatientService.getPatientById(patientId);
        patientProfile = {
          condition: patient?.conditions?.[0],
          age: patient?.age,
          gender: patient?.gender
        };
      } catch (lookupErr) {
        // Fallback to query parameters if lookup fails
        console.warn(`Patient lookup failed for ${patientId}:`, lookupErr.message);
        patientProfile = {
          condition: req.query.condition,
          age: req.query.age ? parseInt(req.query.age) : undefined,
          gender: req.query.gender
        };
      }
    }

    const results = await clinicalTrialsService.searchTrialsByDrug(drug, patientProfile);
    
    res.json({
      success: true,
      data: results,
      meta: {
        searchType: 'drug-based',
        drug,
        patientProfile
      }
    });

  } catch (error) {
    console.error('Drug-based trial search error:', error);
    res.status(500).json({
      error: 'Failed to search trials by drug',
      message: error.message
    });
  }
});

/**
 * Search trials by genomic profile
 */
router.post('/search-by-genomics', async (req, res) => {
  try {
    const { genomicData, patientProfile } = req.body;
    
    if (!genomicData) {
      return res.status(400).json({
        error: 'Genomic data is required'
      });
    }

    const results = await clinicalTrialsService.searchTrialsByGenomicProfile(
      genomicData, 
      patientProfile || {}
    );
    
    res.json({
      success: true,
      data: results,
      meta: {
        searchType: 'genomics-based',
        genomicCriteria: {
          mutations: genomicData.mutations?.length || 0,
          biomarkers: genomicData.biomarkers?.length || 0,
          tumorType: genomicData.tumorType
        }
      }
    });

  } catch (error) {
    console.error('Genomics-based trial search error:', error);
    res.status(500).json({
      error: 'Failed to search trials by genomic profile',
      message: error.message
    });
  }
});

/**
 * Get trial matching recommendations for a patient
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { patient, preferences = {} } = req.body;
    
    if (!patient) {
      return res.status(400).json({
        error: 'Patient data is required'
      });
    }

    // Multiple search strategies
    const searches = await Promise.allSettled([
      // Search by condition
      patient.conditions?.length > 0 ? 
        clinicalTrialsService.searchTrials({
          condition: patient.conditions[0],
          age: patient.age,
          gender: patient.gender,
          pageSize: 15
        }) : null,
      
      // Search by current medications
      patient.medications?.length > 0 ?
        clinicalTrialsService.searchTrialsByDrug(
          patient.medications[0].name, 
          { condition: patient.conditions?.[0], age: patient.age, gender: patient.gender }
        ) : null,
      
      // Search by genomic data if available
      patient.genomicData ?
        clinicalTrialsService.searchTrialsByGenomicProfile(
          patient.genomicData,
          { condition: patient.conditions?.[0], age: patient.age, gender: patient.gender }
        ) : null
    ].filter(Boolean));

    // Combine and deduplicate results
    const allTrials = new Map();
    searches.forEach(result => {
      if (result.status === 'fulfilled' && result.value?.studies) {
        result.value.studies.forEach(trial => {
          if (!allTrials.has(trial.nctId)) {
            allTrials.set(trial.nctId, trial);
          }
        });
      }
    });

    const combinedTrials = Array.from(allTrials.values())
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
      .slice(0, preferences.maxResults || 20);

    res.json({
      success: true,
      data: {
        studies: combinedTrials,
        totalCount: combinedTrials.length,
        recommendations: {
          highMatch: combinedTrials.filter(t => t.eligibilityScore >= 90),
          mediumMatch: combinedTrials.filter(t => t.eligibilityScore >= 70 && t.eligibilityScore < 90),
          lowMatch: combinedTrials.filter(t => t.eligibilityScore < 70)
        }
      },
      meta: {
        patient: {
          conditions: patient.conditions?.length || 0,
          medications: patient.medications?.length || 0,
          hasGenomicData: !!patient.genomicData
        },
        searchStrategies: searches.length
      }
    });

  } catch (error) {
    console.error('Trial recommendations error:', error);
    res.status(500).json({
      error: 'Failed to generate trial recommendations',
      message: error.message
    });
  }
});

/**
 * Clear trials cache (admin function)
 */
router.post('/clear-cache', async (req, res) => {
  try {
    clinicalTrialsService.clearCache();
    res.json({
      success: true,
      message: 'Clinical trials cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * Summarize filter options (conditions/biomarkers) from ClinicalTrials.gov
 * Rather than using the local sample file, this endpoint queries the live API
 * with a broad recruiting interventional filter and derives options.
 */
router.get('/filters/options', async (req, res) => {
  try {
    const {
      recruitmentStatus = 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING',
      studyType = 'INTERVENTIONAL,OBSERVATIONAL',
      pageSize = 500,
    } = req.query;

    const results = await clinicalTrialsService.searchTrials({
      recruitmentStatus,
      studyType,
      pageSize: parseInt(pageSize)
    });

    const studies = results?.studies || [];

    const conditionsSet = new Set();
    const biomarkersSet = new Set();
    const countriesSet = new Set();

    // Known oncology biomarkers to detect in titles/descriptions
    const biomarkerTerms = [
      'EGFR','ALK','ROS1','BRAF','KRAS','NTRK','RET','BRCA','PD-L1','PDL1','MSI','dMMR','TMB','HER2','ERBB2'
    ];

    studies.forEach((s) => {
      if (s.condition) conditionsSet.add(String(s.condition));
      const hay = [s.title, s.description, s.detailedDescription, s.intervention]
        .filter(Boolean)
        .join(' ') || '';
      const upper = hay.toUpperCase();
      biomarkerTerms.forEach(term => {
        if (upper.includes(term.toUpperCase())) {
          // Normalize PDL1 -> PD-L1, ERBB2 -> HER2
          let norm = term.toUpperCase();
          if (norm === 'PDL1') norm = 'PD-L1';
          if (norm === 'ERBB2') norm = 'HER2';
          biomarkersSet.add(norm);
        }
      });
      // Derive countries from locations if available
      (s.locations || []).forEach((loc) => {
        const c = loc?.country || loc?.Country || null;
        if (c && typeof c === 'string') countriesSet.add(c);
      });
    });

    const conditions = Array.from(conditionsSet).sort((a,b) => a.localeCompare(b));
    const biomarkers = Array.from(biomarkersSet).sort((a,b) => a.localeCompare(b));
    const countries = Array.from(countriesSet).sort((a,b) => a.localeCompare(b));

    return res.json({
      success: true,
      data: {
        conditions,
        biomarkers,
        countries,
        totalStudies: studies.length,
        recruitmentStatus,
        studyType,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('ClinicalTrials filters/options error:', error);
    res.status(500).json({ error: 'Failed to derive filter options' });
  }
});

// Preprints enrichment (optional provider). Expects PREPRINTS_SEARCH_URL env returning { data: [{ title, url }] }
router.get('/preprints/search', async (req, res) => {
  try {
    const { q = '', limit = 5 } = req.query;
    const base = process.env.PREPRINTS_SEARCH_URL;
    if (!base || !q) return res.json({ success: true, data: [] });
    const url = new URL(base);
    url.searchParams.set('q', q);
    url.searchParams.set('limit', String(limit));
    const r = await fetch(url.toString());
    if (!r.ok) return res.json({ success: true, data: [] });
    let body = null; try { body = await r.json(); } catch { body = null; }
    const items = Array.isArray(body?.data) ? body.data : [];
    const mapped = items.slice(0, Math.max(1, Math.min(parseInt(limit), 20)));
    res.json({ success: true, data: mapped });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

/**
 * International registries search (CTRI, ChiCTR, JPRN)
 */
router.get('/international/search', async (req, res) => {
  try {
    const { drug, condition, country, maxResults = 200 } = req.query;
    const results = await internationalRegistries.search({
      drug,
      condition,
      country,
      maxResults: parseInt(maxResults)
    });
    res.json({ success: true, data: { studies: results, totalCount: results.length } });
  } catch (e) {
    res.status(500).json({ error: 'international_search_failed' });
  }
});

export default router;
