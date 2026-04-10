/**
 * Direct RxNorm API client — calls NLM's RxNorm REST API
 * directly from the browser (free, CORS-enabled, no backend needed).
 *
 * Used as primary drug search when the Express backend is unavailable.
 * https://rxnav.nlm.nih.gov/REST
 */

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';

/** Simple in-memory cache to avoid hammering RxNorm */
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000; // 1 minute

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
  // Trim cache
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    for (let i = 0; i < 50; i++) cache.delete(oldest[i][0]);
  }
}

/**
 * Search for drugs by name using RxNorm's /drugs endpoint.
 * Returns up to `limit` results with rxcui, name, and tty.
 */
export async function searchDrugs(query: string, limit = 12): Promise<any[]> {
  if (!query || query.length < 2) return [];
  const key = `search:${query.toLowerCase()}:${limit}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const results: any[] = [];
    for (const group of (data?.drugGroup?.conceptGroup || [])) {
      for (const prop of (group.conceptProperties || [])) {
        results.push({
          name: prop.name,
          rxcui: prop.rxcui,
          tty: prop.tty,
          synonym: prop.synonym || '',
        });
      }
    }
    const trimmed = results.slice(0, limit);
    setCache(key, trimmed);
    return trimmed;
  } catch {
    return [];
  }
}

/**
 * Get drug name suggestions (autocomplete) using RxNorm's /spellingsuggestions
 * and /approximateTerm endpoints.
 */
export async function getSuggestions(query: string, limit = 12): Promise<any[]> {
  if (!query || query.length < 2) return [];
  const key = `suggest:${query.toLowerCase()}:${limit}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    // Try spelling suggestions first (faster)
    const res = await fetch(`${RXNORM_BASE}/spellingsuggestions.json?name=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      const suggestions = data?.suggestionGroup?.suggestionList?.suggestion || [];
      if (suggestions.length > 0) {
        // Get rxcui for each suggestion
        const results = await Promise.all(
          suggestions.slice(0, limit).map(async (name: string) => {
            try {
              const idRes = await fetch(`${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(name)}&search=1`);
              if (idRes.ok) {
                const idData = await idRes.json();
                const rxcui = idData?.idGroup?.rxnormId?.[0] || '';
                return { name, rxcui, tty: 'SU' };
              }
            } catch {}
            return { name, rxcui: '', tty: 'SU' };
          })
        );
        setCache(key, results);
        return results;
      }
    }

    // Fallback to approximate term
    const approxRes = await fetch(
      `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=${limit}`
    );
    if (approxRes.ok) {
      const data = await approxRes.json();
      const results = (data?.approximateGroup?.candidate || []).map((c: any) => ({
        name: c.name || query,
        rxcui: c.rxcui || '',
        tty: 'AT',
        score: c.score,
      }));
      setCache(key, results);
      return results;
    }
  } catch {}

  return [];
}

/**
 * Wrapper that mimics the /api/drugs/suggestions response format
 * for drop-in replacement in existing components.
 */
export async function fetchSuggestions(query: string, limit = 12): Promise<Response> {
  const results = await getSuggestions(query, limit);
  return new Response(JSON.stringify({
    success: true,
    results: results.map(r => ({
      rxcui: r.rxcui,
      name: r.name,
      tty: r.tty,
      generic_name: r.name,
    })),
    count: results.length,
    source: 'RxNorm (NLM)',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
