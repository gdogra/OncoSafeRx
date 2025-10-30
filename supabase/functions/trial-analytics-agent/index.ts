// Supabase Edge Function: trial-analytics-agent
// Purpose:
// - Iterate over a list of marketed drugs (from DB or fallback) and query public registries (ClinicalTrials.gov)
// - Normalize trial metadata with oncology relevance, phase distribution, and heuristic DDI signals
// - Persist per-drug analytics to Postgres (table: trial_analytics) and optionally upload raw JSON to Storage
//
// Invoke:
//  curl -X POST https://<YOUR-PROJECT-REF>.functions.supabase.co/trial-analytics-agent //       -H "Authorization: Bearer <service_role_or_anon_if_allowed>" //       -H "Content-Type: application/json" //       -d '{"mode":"batch","limit":100}'

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

// @ts-ignore deno-lint-ignore
const serve = (globalThis as any).Deno?.serve || ((handler: any) => addEventListener('fetch', (e: any) => e.respondWith(handler(e.request))))

type Phase = "Early Phase 1" | "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4" | "Not specified";

interface StudyLite {
  nctId: string;
  title: string;
  condition: string;
  phase: Phase;
  status: string;
  intervention?: string;
}

const CLINICALTRIALS_BASE = "https://clinicaltrials.gov/api/v2/studies";

// Oncology relevance keywords
const ONCO_TERMS = [
  "cancer", "carcinoma", "sarcoma", "lymphoma", "leukemia", "myeloma", "melanoma",
  "oncology", "tumor", "neoplasm", "glioma", "blastoma"
];

// DDI heuristic: co-intervention patterns suggesting potential combination/interaction signals
// We flag if another drug-like token appears in the intervention name/arm label.
const DRUG_LIKE = /(\p{L}{4,}|[A-Z][a-z]{3,}|[A-Za-z0-9\-]{4,})/iu;

function isOncology(condition: string): boolean {
  const c = (condition || "").toLowerCase();
  return ONCO_TERMS.some((t) => c.includes(t));
}

function countPhases(studies: StudyLite[]) {
  const counts: Record<string, number> = {
    "Early Phase 1": 0,
    "Phase 1": 0,
    "Phase 2": 0,
    "Phase 3": 0,
    "Phase 4": 0,
    "Not specified": 0,
  };
  for (const s of studies) {
    const p = s.phase || "Not specified";
    counts[p] = (counts[p] || 0) + 1;
  }
  return counts;
}

function estimateDdiSignals(studies: StudyLite[], primaryDrug: string) {
  const pd = (primaryDrug || "").toLowerCase();
  let signals = 0;
  for (const s of studies) {
    const iv = (s.intervention || s.title || "").toLowerCase();
    if (!iv) continue;
    if (iv.includes(pd)) {
      const m = iv.match(DRUG_LIKE);
      if (m && !m[0].toLowerCase().includes(pd) && m[0].length >= 4) {
        signals++;
      }
    }
  }
  return signals;
}

async function fetchTrialsForDrug(drug: string, maxPages = 2, pageSize = 50) {
  const studies: StudyLite[] = [];
  let pageToken: string | undefined = undefined;
  for (let i = 0; i < maxPages; i++) {
    const params = new URLSearchParams({
      format: "json",
      pageSize: String(pageSize),
      "query.term": drug,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const resp = await fetch(`${CLINICALTRIALS_BASE}?${params.toString()}`, {
      headers: { "User-Agent": "OncoSafeRx/TrialAnalyticsAgent" },
    });
    if (!resp.ok) break;
    const data = await resp.json().catch(() => ({}));
    const list = (data?.studies || []) as any[];
    for (const study of list) {
      const ps = study.protocolSection || {};
      const ident = ps.identificationModule || {};
      const design = ps.designModule || {};
      const status = ps.statusModule || {};
      const cond = ps.conditionsModule || {};
      const arm = ps.armsInterventionsModule || {};
      const item: StudyLite = {
        nctId: ident.nctId || "",
        title: ident.briefTitle || "",
        condition: cond.conditions?.[0] || "",
        phase: (design.phases?.[0] || "Not specified") as Phase,
        status: status.overallStatus || "",
        intervention: arm?.interventions?.[0]?.name || arm?.armGroups?.[0]?.armGroupLabel || "",
      };
      if (item.nctId) studies.push(item);
    }
    pageToken = data?.nextPageToken;
    if (!pageToken) break;
  }
  return studies;
}

async function upsertAnalytics(supabase: any, payload: {
  drug: string;
  total: number;
  oncologyTotal: number;
  phaseCounts: Record<string, number>;
  ddiSignals: number;
  updatedAt: string;
}) {
  const { error } = await supabase.from("trial_analytics").upsert(payload, {
    onConflict: "drug", ignoreDuplicates: false,
  });
  if (error) throw error;
}

async function listMarketedDrugs(supabase: any, limit: number | null) {
  const { data, error } = await supabase
    .from("marketed_drugs")
    .select("name")
    .limit(limit ?? 1000);
  if (error) throw error;
  const arr = (data || []).map((d: any) => d.name).filter(Boolean);
  if (arr.length > 0) return arr;
  return [
    "Pembrolizumab", "Nivolumab", "Trastuzumab", "Osimertinib",
    "Imatinib", "Olaparib", "Irinotecan", "5-Fluorouracil",
  ];
}

export const main = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      headers: { "Content-Type": "application/json" },
      status: 405,
    });
  }
  const body = await req.json().catch(() => ({}));
  const limit: number | null = typeof body?.limit === "number" ? body.limit : null;
  const pageSize: number = typeof body?.pageSize === "number" ? body.pageSize : 50;
  const maxPages: number = typeof body?.maxPages === "number" ? body.maxPages : 2;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const t0 = Date.now();
  const drugs = await listMarketedDrugs(supabase, limit);

  const results: any[] = [];
  for (const drug of drugs) {
    try {
      const studies = await fetchTrialsForDrug(drug, maxPages, pageSize);
      const total = studies.length;
      const onc = studies.filter((s) => isOncology(s.condition)).length;
      const phaseCounts = countPhases(studies);
      const ddiSignals = estimateDdiSignals(studies, drug);
      const row = {
        drug,
        total,
        oncologyTotal: onc,
        phaseCounts,
        ddiSignals,
        updatedAt: new Date().toISOString(),
      };
      await upsertAnalytics(supabase, row);
      results.push({ drug, total, oncologyTotal: onc, ddiSignals });
    } catch (e) {
      results.push({ drug, error: (e as Error)?.message || String(e) });
    }
  }

  const durationMs = Date.now() - t0;
  // Best-effort run log (ignore if table not present)
  try {
    await supabase.from('trial_analytics_runs').insert({
      processed: results.length,
      duration_ms: durationMs,
      started_at: new Date(t0).toISOString(),
      finished_at: new Date().toISOString()
    });
  } catch (_) {}

  return new Response(JSON.stringify({ ok: true, processed: results.length, durationMs, results }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

serve((req: Request) => main(req));
