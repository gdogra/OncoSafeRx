/**
 * Institution Formulary Service
 * Manages hospital/clinic formulary data in localStorage.
 * Used to annotate alternative drug suggestions with formulary status.
 */

export interface FormularyEntry {
  drugName: string
  ndc?: string
  status: 'preferred' | 'non-preferred' | 'restricted' | 'not-on-formulary'
  notes?: string
}

const STORAGE_KEY = 'oncosaferx_formulary'

/**
 * Load formulary from localStorage
 */
export function loadFormulary(): FormularyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/**
 * Save formulary to localStorage
 */
export function saveFormulary(entries: FormularyEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/**
 * Check if a drug is on the formulary
 */
export function isOnFormulary(drugName: string): 'on-formulary' | 'not-on-formulary' | 'unknown' {
  const formulary = loadFormulary()
  if (formulary.length === 0) return 'unknown'
  const lower = drugName.toLowerCase()
  const match = formulary.find(f => f.drugName.toLowerCase() === lower)
  if (!match) return 'not-on-formulary'
  return match.status === 'not-on-formulary' ? 'not-on-formulary' : 'on-formulary'
}

/**
 * Import formulary from CSV text
 * Expected format: drug_name,ndc,status,notes
 */
export function importFromCSV(csvText: string): FormularyEntry[] {
  const lines = csvText.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const entries: FormularyEntry[] = []
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    if (cols[0]) {
      entries.push({
        drugName: cols[0],
        ndc: cols[1] || undefined,
        status: (['preferred', 'non-preferred', 'restricted'].includes(cols[2]?.toLowerCase())
          ? cols[2].toLowerCase() as FormularyEntry['status']
          : 'preferred'),
        notes: cols[3] || undefined,
      })
    }
  }
  return entries
}

/**
 * Add a single drug to the formulary
 */
export function addToFormulary(entry: FormularyEntry): void {
  const current = loadFormulary()
  const idx = current.findIndex(f => f.drugName.toLowerCase() === entry.drugName.toLowerCase())
  if (idx >= 0) current[idx] = entry
  else current.push(entry)
  saveFormulary(current)
}

/**
 * Remove a drug from the formulary
 */
export function removeFromFormulary(drugName: string): void {
  const current = loadFormulary()
  saveFormulary(current.filter(f => f.drugName.toLowerCase() !== drugName.toLowerCase()))
}
