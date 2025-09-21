import express from 'express';
import { PGX_CPT, PAYER_NOTES } from '../data/billingCoverage.js';

const router = express.Router();

router.get('/pgx/codes', (req, res) => {
  res.json({ count: PGX_CPT.length, codes: PGX_CPT });
});

router.get('/pgx/payers', (req, res) => {
  res.json({ count: PAYER_NOTES.length, payers: PAYER_NOTES });
});

export default router;

