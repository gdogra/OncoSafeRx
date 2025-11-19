// Supabase Edge Function: agents-run
// Unified entry point: { agent_type, patient_id, payload }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runAgent } from '../../../backend/agents/dispatcher.ts';
import type { AgentType, AgentContext } from '../../../backend/agents/types.ts';

type RunRequest = {
  agent_type: AgentType;
  patient_id: string;
  payload: unknown;
};

function getSupabaseClient(req: Request) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
  return supabase;
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const supabase = getSupabaseClient(req);

    const auth = await supabase.auth.getUser();
    if (!auth.data.user) return jsonResponse(401, { error: 'Unauthorized' });

    const body = (await req.json()) as RunRequest;
    if (!body.agent_type || !body.patient_id) {
      return jsonResponse(400, { error: 'agent_type and patient_id are required' });
    }

    // Optional: load current regimen for convenience when not present in payload
    let payload = body.payload;
    if (body.agent_type === 'DDI' || body.agent_type === 'DATA_QUALITY' || body.agent_type === 'PGX') {
      // Load latest regimen if medications not provided
      // Note: front-end can also send explicit medications in payload
      const hasMeds = payload && (payload as any).medications && Array.isArray((payload as any).medications);
      if (!hasMeds) {
        const { data: regData } = await supabase
          .from('medication_regimens')
          .select('*')
          .eq('patient_id', body.patient_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (regData?.meds && !hasMeds) {
          payload = { ...(payload as object), medications: regData.meds };
        }
      }
    }

    // Persist agent run start
    const { data: runRow, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        patient_id: body.patient_id,
        agent_type: body.agent_type,
        input: payload,
        status: 'running',
      })
      .select()
      .single();

    if (runError) return jsonResponse(500, { error: 'Failed to persist agent run start', details: runError.message });

    const ctx: AgentContext = {
      supabase,
      logger: console,
    };

    let output: unknown;
    try {
      output = await runAgent(body.agent_type, payload, ctx);
    } catch (agentError) {
      // Persist failure
      await supabase.from('agent_runs').update({ status: 'failed', output: { error: String(agentError) } }).eq('id', runRow.id);
      return jsonResponse(400, { error: 'Agent execution failed', details: String(agentError) });
    }

    await supabase.from('agent_runs').update({ status: 'succeeded', output }).eq('id', runRow.id);
    return jsonResponse(200, { run_id: runRow.id, output });
  } catch (e) {
    return jsonResponse(500, { error: 'Internal error', details: String(e) });
  }
});

