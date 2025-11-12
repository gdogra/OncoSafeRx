import express from 'express';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for external API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(apiLimiter);

// Helper function for API error handling
const handleApiError = (res, error, source) => {
  console.error(`${source} API Error:`, error);
  res.status(500).json({
    error: `Failed to fetch data from ${source}`,
    message: error.message,
    timestamp: new Date().toISOString()
  });
};

// Helper function to add CORS headers
const addCorsHeaders = (res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
};

// DailyMed API Endpoints
router.get('/dailymed/spl/:setId', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { setId } = req.params;
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'DailyMed API error',
        status: response.status,
        statusText: response.statusText
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'DailyMed',
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'DailyMed');
  }
});

router.get('/dailymed/search', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { drug_name, limit = 10 } = req.query;
    if (!drug_name) {
      return res.status(400).json({ error: 'drug_name parameter is required' });
    }
    
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(drug_name)}&pagesize=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'DailyMed search error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'DailyMed',
      query: drug_name,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'DailyMed Search');
  }
});

// OpenFDA API Endpoints
router.get('/openfda/drug/event', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { search, limit = 10 } = req.query;
    if (!search) {
      return res.status(400).json({ error: 'search parameter is required' });
    }
    
    const url = `https://api.fda.gov/drug/event.json?search=${encodeURIComponent(search)}&limit=${limit}`;
    
    const response = await fetch(url);
    if (response.status === 404) {
      // Normalize OpenFDA 404 (no results) to a 200 with empty list for better UX
      return res.json({
        source: 'OpenFDA',
        query: search,
        timestamp: new Date().toISOString(),
        data: { results: [] }
      });
    }
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'OpenFDA API error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'OpenFDA',
      query: search,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'OpenFDA');
  }
});

router.get('/openfda/drug/label', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { search, limit = 10 } = req.query;
    if (!search) {
      return res.status(400).json({ error: 'search parameter is required' });
    }
    
    const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(search)}&limit=${limit}`;
    
    const response = await fetch(url);
    if (response.status === 404) {
      // Normalize OpenFDA 404 (no results) to a 200 with empty list for better UX
      return res.json({
        source: 'OpenFDA Labels',
        query: search,
        timestamp: new Date().toISOString(),
        data: { results: [] }
      });
    }
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'OpenFDA Label API error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'OpenFDA Labels',
      query: search,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'OpenFDA Labels');
  }
});

// ClinicalTrials.gov API Endpoints
router.get('/clinicaltrials/studies', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { 
      query: searchQuery, 
      condition,
      intervention,
      status = 'RECRUITING',
      pageSize = 10 
    } = req.query;
    
    const params = new URLSearchParams();
    if (searchQuery) params.append('query.term', searchQuery);
    if (condition) params.append('query.cond', condition);
    if (intervention) params.append('query.intr', intervention);
    params.append('filter.overallStatus', status);
    params.append('pageSize', pageSize);
    params.append('format', 'json');
    
    const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'ClinicalTrials.gov API error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'ClinicalTrials.gov',
      query: { searchQuery, condition, intervention, status },
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'ClinicalTrials.gov');
  }
});

router.get('/clinicaltrials/study/:nctId', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { nctId } = req.params;
    const url = `https://clinicaltrials.gov/api/v2/studies/${nctId}?format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'ClinicalTrials.gov study error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'ClinicalTrials.gov',
      nctId: nctId,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'ClinicalTrials.gov Study');
  }
});

// PubMed API Endpoints
router.get('/pubmed/search', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { term, retmax = 10, retstart = 0, sort = 'relevance' } = req.query;
    if (!term) {
      return res.status(400).json({ error: 'term parameter is required' });
    }
    
    // First, search for PMIDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${retmax}&retstart=${retstart}&sort=${sort}&retmode=json`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      return res.status(searchResponse.status).json({
        error: 'PubMed search error',
        status: searchResponse.status
      });
    }
    
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];
    
    if (pmids.length === 0) {
      return res.json({
        source: 'PubMed',
        query: term,
        timestamp: new Date().toISOString(),
        data: { articles: [], count: 0 }
      });
    }
    
    // Then fetch article details
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
    
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    res.json({
      source: 'PubMed',
      query: term,
      timestamp: new Date().toISOString(),
      data: {
        count: searchData.esearchresult?.count || 0,
        articles: summaryData.result || {}
      }
    });
  } catch (error) {
    handleApiError(res, error, 'PubMed');
  }
});

router.get('/pubmed/article/:pmid', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { pmid } = req.params;
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&rettype=abstract`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'PubMed article fetch error',
        status: response.status
      });
    }
    
    const xmlData = await response.text();
    res.json({
      source: 'PubMed',
      pmid: pmid,
      timestamp: new Date().toISOString(),
      data: xmlData
    });
  } catch (error) {
    handleApiError(res, error, 'PubMed Article');
  }
});

// RxNorm API Endpoints
router.get('/rxnorm/drugs', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'name parameter is required' });
    }
    
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(name)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'RxNorm API error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'RxNorm',
      query: name,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'RxNorm');
  }
});

router.get('/rxnorm/rxcui/:rxcui/properties', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { rxcui } = req.params;
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'RxNorm properties error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'RxNorm',
      rxcui: rxcui,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'RxNorm Properties');
  }
});

router.get('/rxnorm/rxcui/:rxcui/interactions', async (req, res) => {
  addCorsHeaders(res);
  try {
    const { rxcui } = req.params;
    const url = `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'RxNorm interactions error',
        status: response.status
      });
    }
    
    const data = await response.json();
    res.json({
      source: 'RxNorm',
      rxcui: rxcui,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    handleApiError(res, error, 'RxNorm Interactions');
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: [
      'DailyMed',
      'OpenFDA',
      'ClinicalTrials.gov',
      'PubMed',
      'RxNorm'
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;
