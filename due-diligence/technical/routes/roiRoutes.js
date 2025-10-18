import express from 'express';

const router = express.Router();

// Simple ROI calculator for PGx programs
// Inputs: annualADECost, testCost, targetPopulation, expectedTestingRate, expectedADEreductionPct
router.post('/pgx', (req, res) => {
  const {
    annualADECost = 10000000, // $10M default
    testCost = 300,           // $300 per test
    targetPopulation = 5000,  // eligible lives
    expectedTestingRate = 0.4, // 40% tested
    expectedADEreductionPct = 0.25 // 25% reduction in ADE costs among tested
  } = req.body || {};

  const tests = Math.round(targetPopulation * expectedTestingRate);
  const programCost = tests * testCost;
  const savings = annualADECost * expectedTestingRate * expectedADEreductionPct;
  const net = savings - programCost;
  const roi = programCost > 0 ? (net / programCost) : null;

  res.json({
    inputs: { annualADECost, testCost, targetPopulation, expectedTestingRate, expectedADEreductionPct },
    outputs: { tests, programCost, savings, net, roi }
  });
});

export default router;

