import supabaseService from '../config/supabase.js';

async function main() {
  if (!supabaseService.enabled || !supabaseService.client?.auth?.admin) {
    console.error('Supabase not configured or admin API unavailable. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const sb = supabaseService.client;

  // Fetch application users
  const { data: appUsers, error: usersErr } = await sb.from('users').select('*');
  if (usersErr) {
    console.error('Failed to fetch users:', usersErr.message);
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const u of appUsers) {
    const email = u.email;
    if (!email) { skipped++; continue; }

    let authUserId = u.id; // current PK
    let needCreate = false;

    // Try to verify current id exists in auth.users
    if (authUserId) {
      try {
        const { data, error } = await sb.auth.admin.getUserById(authUserId);
        if (error || !data?.user) {
          needCreate = true;
        }
      } catch {
        needCreate = true;
      }
    } else {
      needCreate = true;
    }

    if (needCreate) {
      // Create auth user with a temporary password; do not send email
      const tempPass = `Temp-${Math.random().toString(36).slice(2)}!A9`;
      const { data, error } = await sb.auth.admin.createUser({
        email,
        password: tempPass,
        email_confirm: true,
        user_metadata: { migrated: true }
      });
      if (error) {
        console.warn(`Auth create skipped for ${email}: ${error.message}`);
        skipped++;
        continue;
      }
      authUserId = data.user?.id;
      created++;
    }

    // Ensure profile row PK matches auth user id
    if (authUserId && authUserId !== u.id) {
      const { error: upErr } = await sb
        .from('users')
        .update({ id: authUserId, updated_at: new Date().toISOString() })
        .eq('email', email);
      if (upErr) {
        console.warn(`Failed to update profile id for ${email}: ${upErr.message}`);
      } else {
        updated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(JSON.stringify({ migrated: true, created, updated, skipped, total: appUsers.length }, null, 2));
}

main().catch((e) => {
  console.error('Migration failed:', e?.message || e);
  process.exit(1);
});

