import express from 'express';
import PROTOCOLS from '../data/protocols.js';

const router = express.Router();

// Get all protocols with optional filtering
router.get('/', (req, res) => {
  const { q, cancerType, stage, source, drug } = req.query;
  let items = [...PROTOCOLS];

  // Filter by search query
  if (q) {
    const query = String(q).toLowerCase();
    items = items.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.cancerType.toLowerCase().includes(query) ||
      p.indication.toLowerCase().includes(query) ||
      p.drugs.some(drug => drug.toLowerCase().includes(query))
    );
  }

  // Filter by cancer type
  if (cancerType) {
    const type = String(cancerType).toLowerCase();
    items = items.filter(p => p.cancerType.toLowerCase().includes(type));
  }

  // Filter by stage
  if (stage) {
    const stageFilter = String(stage).toLowerCase();
    items = items.filter(p => p.stage.toLowerCase().includes(stageFilter));
  }

  // Filter by source
  if (source) {
    items = items.filter(p => p.source === source);
  }

  // Filter by drug
  if (drug) {
    const drugFilter = String(drug).toLowerCase();
    items = items.filter(p => 
      p.drugs.some(d => d.toLowerCase().includes(drugFilter))
    );
  }

  // Return summary for list view
  const summary = items.map(p => ({
    id: p.id,
    name: p.name,
    cancerType: p.cancerType,
    stage: p.stage,
    drugs: p.drugs,
    duration: p.duration,
    responseRate: p.responseRate,
    source: p.source,
    indication: p.indication
  }));

  res.json({ 
    count: summary.length, 
    protocols: summary 
  });
});

// Get specific protocol by ID with full details
router.get('/:id', (req, res) => {
  const item = PROTOCOLS.find(p => p.id.toLowerCase() === String(req.params.id).toLowerCase());
  if (!item) {
    return res.status(404).json({ error: 'Protocol not found' });
  }
  res.json(item);
});

// Get unique values for filters
router.get('/filters/values', (req, res) => {
  const cancerTypes = [...new Set(PROTOCOLS.map(p => p.cancerType))].sort();
  const stages = [...new Set(PROTOCOLS.map(p => p.stage))].sort();
  const sources = [...new Set(PROTOCOLS.map(p => p.source))].sort();
  const drugs = [...new Set(PROTOCOLS.flatMap(p => p.drugs))].sort();

  res.json({
    cancerTypes,
    stages,
    sources,
    drugs
  });
});

export default router;