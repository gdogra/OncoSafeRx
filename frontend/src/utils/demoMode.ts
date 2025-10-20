export function isDemoMode(): boolean {
  try {
    const win: any = typeof window !== 'undefined' ? window : {};
    const flags = win.__OSRX_FEATURES__ || {};
    if (typeof flags.demoMode === 'boolean') return flags.demoMode;
    const v = (localStorage.getItem('osrx_demo_mode') || '').toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  } catch {
    return false;
  }
}
