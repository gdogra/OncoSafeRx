import express from 'express';

const router = express.Router();

router.get('/echo', (req, res) => {
  try {
    const headers = Object.fromEntries(Object.entries(req.headers || {}).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)]));
    return res.json({
      ok: true,
      time: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      version: process.env.APP_VERSION || '20.0.0',
      allowDefaultUserEnv: String(process.env.ALLOW_DEFAULT_USER || '').toLowerCase(),
      seenHeaders: headers,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'echo_failed' });
  }
});

export default router;

