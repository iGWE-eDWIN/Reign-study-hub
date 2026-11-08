import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.ADMIN_SEED_EMAIL?.trim();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!url || !serverKey || !publicKey || !email || !password) {
    throw new Error('Set the Supabase URL, public key, server key, ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in .env.local.');
  }
  if (password.length < 12) throw new Error('ADMIN_SEED_PASSWORD must contain at least 12 characters.');
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(url, serverKey, options);
  console.log(`Checking Supabase project: ${new URL(url).hostname}`);
  let userId: string | undefined;
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    userId = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase())?.id;
    if (userId || data.users.length < 100) break;
  }
  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    if (error) throw error;
  } else {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    userId = data.user.id;
  }
  const { error: profileError } = await admin.from('admin_profiles').upsert({ user_id: userId, role: 'admin' });
  if (profileError) throw new Error(`Password set, but admin access could not be restored: ${profileError.message}. Ensure the database migration has been run.`);
  const client = createClient(url, publicKey, options);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Password set, but login verification failed: ${error.message}`);
  const { data: profile, error: accessError } = await client.from('admin_profiles').select('role').eq('user_id', data.user.id).single();
  await client.auth.signOut();
  if (accessError || profile?.role !== 'admin') throw new Error('Login succeeded, but admin access verification failed. Check the admin_profiles policies.');
  console.log('Admin repaired. Password login and admin access verified. Sign in with ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from .env.local.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Admin repair failed.');
  process.exitCode = 1;
});
