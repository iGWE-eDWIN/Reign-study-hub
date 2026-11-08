import { redirect } from 'next/navigation';
import { sessionClient } from '@/lib/supabase/server';
import { AdminAuth } from '@/components/admin-auth';
export default async function Reset(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL)redirect('/admin/login');const client=await sessionClient();const{data:{user}}=await client.auth.getUser();if(!user)redirect('/admin/login');const{data}=await client.from('admin_profiles').select('role').eq('user_id',user.id).single();if(data?.role!=='admin')redirect('/admin/login');return <main id="main" className="flex min-h-dvh items-center justify-center bg-soft p-5"><div className="surface w-full max-w-md p-8"><h1 className="text-2xl">Reset your password</h1><AdminAuth reset/></div></main>}
