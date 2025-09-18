import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const trials = JSON.parse(readFileSync(join(__dirname, '../data/trials.sample.json'), 'utf8'));

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
  let withDistance = results;
  if (lat && lon) {
    const alat = parseFloat(String(lat));
    const alon = parseFloat(String(lon));
    withDistance = results.map(x => {
      const distances = (x.locations || []).map(loc => haversine(alat, alon, loc.lat, loc.lon)).filter(Number.isFinite);
      const minKm = distances.length ? Math.min(...distances) : null;
      return { ...x, distance_km: minKm };
    });
    if (radius_km) {
      const r = parseFloat(String(radius_km));
      withDistance = withDistance.filter(x => x.distance_km === null || x.distance_km <= r);
    }
    withDistance.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
  }

  res.json({ count: withDistance.length, trials: withDistance });
});

export default router;
