import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    console.error('Supabase service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient(url, service);

  const deriveNames = (email, meta = {}) => {
    let first = meta.first_name || '';
    let last = meta.last_name || '';
    if (!first && meta.given_name) first = meta.given_name;
    if (!last && meta.family_name) last = meta.family_name;
    if (!first && email) {
      const local = String(email).split('@')[0];
      const parts = local.split(/[._-]/);
      first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Clinician';
    }
    if (!last) last = 'User';
    return { first, last };
  };

  let page = 1;
  const perPage = 1000;
  let total = 0, created = 0, updated = 0, skipped = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const users = data?.users || [];
    if (users.length === 0) break;
    for (const u of users) {
      total++;
      const email = u.email || null;
      const meta = u.user_metadata || {};
      const role = meta.role || 'oncologist';
      const names = deriveNames(email, meta);
      const { data: existing } = await admin.from('users').select('id').eq('id', u.id).maybeSingle();
      const payload = {
        id: u.id,
        email,
        role,
        first_name: names.first,
        last_name: names.last,
        created_at: new Date().toISOString()
      };
      if (!existing) {
        const { error: insErr } = await admin.from('users').upsert(payload, { onConflict: 'id' });
        if (!insErr) created++; else skipped++;
      } else {
        const { error: upErr } = await admin.from('users').update({
          email,
          role,
          first_name: names.first,
          last_name: names.last,
          updated_at: new Date().toISOString()
        }).eq('id', u.id);
        if (!upErr) updated++; else skipped++;
      }
    }
    page++;
  }

  console.log(JSON.stringify({ ok: true, total, created, updated, skipped }));
}

main().catch((e) => { console.error(e?.message || e); process.exit(1); });

