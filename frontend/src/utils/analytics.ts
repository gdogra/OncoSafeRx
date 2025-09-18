export type SearchEvent = {
  t: number; // timestamp
  q: string;
  count?: number;
};

export type SelectionEvent = {
  t: number;
  rxcui: string;
  name: string;
  source?: string; // e.g., 'search_results', 'autocomplete', 'card_action'
};

const KEYS = {
  searches: 'oncosaferx_analytics_searches',
  selections: 'oncosaferx_analytics_selections',
};

function append<T>(key: string, item: T, max = 200) {
  try {
    const raw = localStorage.getItem(key);
    const list: T[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    if (list.length > max) list.pop();
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

export const analytics = {
  logSearch(q: string, count?: number) {
    append<SearchEvent>(KEYS.searches, { t: Date.now(), q, count });
  },
  logSelection(rxcui: string, name: string, source?: string) {
    append<SelectionEvent>(KEYS.selections, { t: Date.now(), rxcui, name, source });
  },
  clearSearches() {
    try { localStorage.removeItem(KEYS.searches); } catch {}
  },
  clearSelections() {
    try { localStorage.removeItem(KEYS.selections); } catch {}
  },
  getRecentSearches(limit = 8): string[] {
    try {
      const raw = localStorage.getItem(KEYS.searches);
      const list: SearchEvent[] = raw ? JSON.parse(raw) : [];
      const seen = new Set<string>();
      const recent: string[] = [];
      for (const e of list) {
        const q = (e.q || '').trim();
        if (!q) continue;
        if (seen.has(q.toLowerCase())) continue;
        seen.add(q.toLowerCase());
        recent.push(q);
        if (recent.length >= limit) break;
      }
      return recent;
    } catch {
      return [];
    }
  },
  getTopSelections(days = 30, limit = 5): Array<{ rxcui: string; name: string; count: number }> {
    try {
      const raw = localStorage.getItem(KEYS.selections);
      const list: SelectionEvent[] = raw ? JSON.parse(raw) : [];
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const counts: Record<string, { name: string; count: number }> = {};
      list.filter(e => e.t >= cutoff).forEach(e => {
        const key = e.rxcui || e.name;
        if (!counts[key]) counts[key] = { name: e.name, count: 0 };
        counts[key].count += 1;
      });
      return Object.entries(counts)
        .map(([rxcuiOrName, v]) => ({ rxcui: rxcuiOrName, name: v.name, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch {
      return [];
    }
  },
};
