import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Proxy to Nominatim with proper headers and optional email param to comply with usage policy
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 5, addressdetails = 1 } = req.query;
    if (!q || String(q).trim().length < 3) {
      return res.json({ data: [] });
    }
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('q', String(q));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('addressdetails', String(addressdetails));
    const email = process.env.NOMINATIM_EMAIL;
    if (email) url.searchParams.set('email', email);

    const resp = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': `OncoSafeRx-Geocoder/1.0 ${email || ''}`.trim()
      },
      timeout: 8000
    });
    if (!resp.ok) return res.json({ data: [] });
    const body = await resp.json();
    return res.json({ data: Array.isArray(body) ? body : [] });
  } catch (e) {
    return res.json({ data: [] });
  }
});

export default router;

