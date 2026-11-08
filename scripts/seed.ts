import { createClient } from '@supabase/supabase-js';
import seed from '../lib/seed-content.json';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Configure the Supabase URL and server-only service-role key in .env.local.');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// Stable natural keys make reruns safe and preserve content edited in the admin.
async function insertMissing(table: string, entries: Record<string, unknown>[], identity: string) {
  for (const entry of entries) {
    const { data, error } = await db.from(table).select(identity).eq(identity, entry[identity]).maybeSingle();
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data) {
      const result = await db.from(table).insert(entry);
      if (result.error) throw new Error(`${table}: ${result.error.message}`);
    }
  }
  console.log(`Seeded ${table}; existing entries preserved.`);
}

async function main() {
  await insertMissing('site_settings', [seed.site_settings], 'id');
  await insertMissing('services', seed.services, 'slug');
  await insertMissing('destinations', seed.destinations, 'name');
  await insertMissing('programme_levels', seed.programme_levels, 'name');
  await insertMissing('appointment_service_types', seed.appointment_service_types, 'name');
  await insertMissing('slides', seed.slides, 'headline');
  await insertMissing('team_members', seed.team_members, 'name');

  await insertMissing('faqs', seed.faqs, 'question');
  await insertMissing('posts', seed.posts, 'slug');

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) throw new Error('Content seeded. Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD to create the first admin.');
  if (password.length < 12) throw new Error('Use an admin password of at least 12 characters.');
  let adminId: string | undefined;
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    adminId = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase())?.id;
    if (adminId || data.users.length < 100) break;
  }
  if (!adminId) {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw error;
    adminId = data.user.id;
  }
  const { error } = await db.from('admin_profiles').upsert({ user_id: adminId, role: 'admin' });
  if (error) throw error;
  console.log('Admin is ready. Existing account passwords were not changed.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Seed failed.');
  process.exitCode = 1;
});
