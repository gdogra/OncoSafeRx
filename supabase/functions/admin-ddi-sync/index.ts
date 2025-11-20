// Admin Edge Function: Upsert curated aliases and DDI evidence
// Auth: requires header x-admin-secret matching FUNCTION_ADMIN_SECRET

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type AliasItem = { name: string; canonical_name: string; rxnorm_concept_id?: string };
type Citation = { source_type: string; id?: string; url?: string; snippet?: string };
type DDIItem = {
  drug_primary: string; // canonical or RxCUI
  drug_interactor: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  mechanism?: string;
  recommendation?: string;
  evidence_source?: string;
  evidence_level?: string;
  citations?: Citation[];
};

type SyncPayload = {
  aliases?: AliasItem[];
  ddi?: DDIItem[];
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(url, key);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== Deno.env.get('FUNCTION_ADMIN_SECRET')) return json(401, { error: 'Unauthorized' });

  const supabase = getSupabaseClient();

  try {
    const body = (await req.json()) as SyncPayload;
    // Minimal runtime validation
    if (body.aliases && !Array.isArray(body.aliases)) return json(400, { error: 'aliases must be an array' });
    if (body.ddi && !Array.isArray(body.ddi)) return json(400, { error: 'ddi must be an array' });
    const res = { aliases_upserted: 0, ddi_upserted: 0 };

    if (body.aliases && body.aliases.length > 0) {
      const { error } = await supabase.from('drug_aliases').upsert(body.aliases, { onConflict: 'name' });
      if (error) return json(400, { error: 'Alias upsert failed', details: error.message });
      res.aliases_upserted = body.aliases.length;
    }

    if (body.ddi && body.ddi.length > 0) {
      const rows = await Promise.all(
        body.ddi.map(async (d) => ({
          drug_primary: d.drug_primary,
          drug_interactor: d.drug_interactor,
          severity: d.severity,
          mechanism: d.mechanism || null,
          recommendation: d.recommendation || null,
          evidence_source: d.evidence_source || null,
          evidence_level: d.evidence_level || 'unknown',
          citations: d.citations || [],
          uniq_hash: await sha256Hex(`${d.drug_primary.toLowerCase()}|${d.drug_interactor.toLowerCase()}|${(d.evidence_source || '').toLowerCase()}`),
        })),
      );
      const { error } = await supabase.from('ddi_evidence').upsert(rows, { onConflict: 'uniq_hash' });
      if (error) return json(400, { error: 'DDI upsert failed', details: error.message });
      res.ddi_upserted = rows.length;
    }

    return json(200, res);
  } catch (e) {
    return json(400, { error: 'Invalid payload', details: String(e) });
  }
});
