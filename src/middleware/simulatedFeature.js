/**
 * Gate for endpoints whose output is simulated (random or placeholder data),
 * not derived from clinical sources. Such output must never reach a clinician
 * in production.
 *
 * - production: 503 unless ALLOW_SIMULATED_FEATURES=true (explicit demo deploys)
 * - otherwise:  passes through, but every JSON body is stamped with a
 *               `_simulated` notice and the X-OncoSafeRx-Simulated header.
 */
const NOTICE = 'SIMULATED DATA - not derived from clinical sources. Not for clinical use.';

export function isSimulatedAllowed(env = process.env) {
  if (String(env.ALLOW_SIMULATED_FEATURES || '').toLowerCase() === 'true') return true;
  return (env.NODE_ENV || 'development') !== 'production';
}

export function simulatedFeature(featureName = 'This feature') {
  return (req, res, next) => {
    if (!isSimulatedAllowed()) {
      return res.status(503).json({
        error: `${featureName} is disabled: it returns simulated data and is not available in production.`,
        simulated: true
      });
    }
    res.setHeader('X-OncoSafeRx-Simulated', 'true');
    const json = res.json.bind(res);
    res.json = (body) => {
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        return json({ ...body, _simulated: NOTICE });
      }
      return json(body);
    };
    next();
  };
}

export default simulatedFeature;
