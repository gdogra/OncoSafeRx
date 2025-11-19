// Scheduled checker: verifies if external sources behind citations have changed
// Reads ddi_evidence, takes first citation.url if present, issues HEAD request, compares ETag/Last-Modified
// Updates ddi_evidence_status.stale when changed

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function getClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(url, key);
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function head(url: string) {
  try {
    const resp = await fetch(url, { method: 'HEAD' });
    return {
      ok: resp.ok,
      status: resp.status,
      etag: resp.headers.get('etag') || undefined,
      lastModified: resp.headers.get('last-modified') || undefined,
    };
  } catch (e) {
    return { ok: false, status: 0, etag: undefined, lastModified: undefined, error: String(e) };
  }
}

Deno.serve(async () => {
  const supabase = getClient();
  const limit = 200; // per run

  // Pull rows with URLs in first citation
  const { data, error } = await supabase
    .from('ddi_evidence')
    .select('uniq_hash, citations')
    .limit(limit);
  if (error) return json(500, { error: 'Query failed', details: error.message });

  let checked = 0;
  let markedStale = 0;

  for (const row of data || []) {
    const url = Array.isArray(row.citations) && row.citations.length > 0 ? row.citations[0]?.url : undefined;
    if (!url) continue;
    const res = await head(url);
    checked++;

    // Read existing status
    const { data: statusRow } = await supabase
      .from('ddi_evidence_status')
      .select('*')
      .eq('uniq_hash', row.uniq_hash)
      .maybeSingle();

    let stale = false;
    if (statusRow) {
      if (res.etag && statusRow.last_etag && res.etag !== statusRow.last_etag) stale = true;
      if (res.lastModified && statusRow.last_modified && res.lastModified !== statusRow.last_modified) stale = true;
      if (!res.ok && statusRow.last_status && res.status !== statusRow.last_status) stale = true;
    }

    const payload = {
      uniq_hash: row.uniq_hash,
      last_checked_at: new Date().toISOString(),
      last_status: res.status,
      last_etag: res.etag || null,
      last_modified: res.lastModified || null,
      stale,
      last_error: (res as any).error || null,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('ddi_evidence_status').upsert(payload, { onConflict: 'uniq_hash' });
    if (stale) markedStale++;
  }

  return json(200, { checked, markedStale });
});

