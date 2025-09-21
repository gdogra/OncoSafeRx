import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error listing users:', error);
      process.exit(1);
    }

    console.log(`Found ${data.users.length} users`);
    for (const u of data.users) {
      console.log(JSON.stringify({
        id: u.id,
        email: u.email,
        confirmed_at: u.email_confirmed_at,
        created_at: u.created_at,
        provider: u.app_metadata?.provider,
        role: u.user_metadata?.role,
      }));
    }
  } catch (e) {
    console.error('Unexpected failure:', e);
    process.exit(1);
  }
}

main();

