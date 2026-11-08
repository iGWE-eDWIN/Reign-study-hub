import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { sessionClient } from './supabase/server';
// Share verification between the protected layout and page within this render only.
// React clears this cache between requests; no user session is cached globally.
export const requireAdmin = cache(async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/admin/login?setup=required');
  const client = await sessionClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: profile } = await client.from('admin_profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin/login?error=unauthorized');
  return { client, user };
});
