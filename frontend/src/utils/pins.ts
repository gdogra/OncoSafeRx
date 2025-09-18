const KEY = 'oncosaferx_pins';

export type PinMap = Record<string, { name: string; t: number }>;

export function getPins(): PinMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function isPinned(rxcui?: string): boolean {
  if (!rxcui) return false;
  const pins = getPins();
  return !!pins[rxcui];
}

export function togglePin(rxcui: string, name: string): PinMap {
  const pins = getPins();
  if (pins[rxcui]) delete pins[rxcui];
  else pins[rxcui] = { name, t: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(pins)); } catch {}
  return pins;
}

export function clearPins() {
  try { localStorage.removeItem(KEY); } catch {}
}

export function reorderPins(order: string[]) {
  const current = getPins();
  const next: PinMap = {};
  // Rebuild object in provided order to preserve insertion order
  let ts = Date.now();
  for (const rxcui of order) {
    const entry = current[rxcui];
    if (entry) {
      next[rxcui] = { name: entry.name, t: ts-- };
    }
  }
  // Append any missing (new) pins at the end in their current order
  Object.entries(current).forEach(([rxcui, v]) => {
    if (!next[rxcui]) next[rxcui] = v;
  });
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
}
