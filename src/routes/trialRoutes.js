import express from 'express';
import trials from '../data/trials.sample.json' assert { type: 'json' };

const router = express.Router();

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get('/search', (req, res) => {
  let { condition, biomarker, line, status, lat, lon, radius_km } = req.query;
  let results = [...trials];

  if (condition) {
    const t = String(condition).toLowerCase();
    results = results.filter(x => x.condition.toLowerCase().includes(t));
  }
  if (biomarker) {
    const b = String(biomarker).toUpperCase();
    results = results.filter(x => (x.biomarkers || []).some(m => m.toUpperCase().includes(b)));
  }
  if (line) {
    const l = String(line).toLowerCase();
    results = results.filter(x => (x.line_of_therapy || '').toLowerCase().includes(l));
  }
  if (status) {
    const s = String(status).toLowerCase();
    results = results.filter(x => (x.status || '').toLowerCase().includes(s));
  }
  if (lat && lon && radius_km) {
    const alat = parseFloat(String(lat));
    const alon = parseFloat(String(lon));
    const r = parseFloat(String(radius_km));
    results = results.filter(x => (x.locations || []).some(loc => haversine(alat, alon, loc.lat, loc.lon) <= r));
  }

  res.json({ count: results.length, trials: results });
});

export default router;

