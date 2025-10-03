#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !service) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, service)

function buildProfileFromPatient(patient, id) {
  const p = patient?.data || patient || {}
  const genetics = Array.isArray(p.genetics) ? p.genetics : []
  const meds = Array.isArray(p.medications) ? p.medications : []
  const allergies = Array.isArray(p.allergies) ? p.allergies : []
  const conditions = Array.isArray(p.conditions) ? p.conditions : []

  const current_medications = meds.map(m => {
    try { return m?.drug?.rxcui || m?.drug?.name || '' } catch { return '' }
  }).filter(Boolean)
  const allergy_list = allergies.map(a => {
    try { return a?.allergen || a || '' } catch { return '' }
  }).filter(Boolean)
  const comorbidities = conditions.map(c => {
    try { return c?.icd10Code || c?.condition || '' } catch { return '' }
  }).filter(Boolean)

  return {
    patient_id: String(id || p?.id || ''),
    genetic_profile: genetics,
    current_medications,
    allergies: allergy_list,
    comorbidities,
    updated_at: new Date().toISOString()
  }
}

async function main() {
  const pageSize = Number(process.env.PATIENT_SYNC_PAGE_SIZE || 500)
  const upsertChunk = Number(process.env.PATIENT_SYNC_CHUNK || 100)
  let from = 0
  let totalProcessed = 0
  let totalUpserted = 0
  console.log(`Starting patient_profiles backfill with pageSize=${pageSize}, chunk=${upsertChunk}`)

  while (true) {
    const to = from + pageSize - 1
    const { data: rows, error, count } = await supabase
      .from('patients')
      .select('id,user_id,data,updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching patients:', error)
      process.exit(1)
    }
    if (!rows || rows.length === 0) break

    const profiles = rows.map(r => buildProfileFromPatient(r, r.id)).filter(p => p.patient_id)
    // Upsert in chunks
    for (let i = 0; i < profiles.length; i += upsertChunk) {
      const chunk = profiles.slice(i, i + upsertChunk)
      const { error: upErr } = await supabase
        .from('patient_profiles')
        .upsert(chunk, { onConflict: 'patient_id' })
      if (upErr) {
        console.error('Upsert error:', upErr)
      } else {
        totalUpserted += chunk.length
      }
      // small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 50))
    }

    totalProcessed += rows.length
    console.log(`Processed ${totalProcessed}/${count ?? '?'} (upserted so far: ${totalUpserted})`)
    from += pageSize
  }

  console.log(`Completed backfill. Patients processed=${totalProcessed}, profiles upserted=${totalUpserted}`)
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})

