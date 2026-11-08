import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const login = request.nextUrl.pathname === '/admin/login';
  const reset = request.nextUrl.pathname === '/admin/reset-password';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !key) return login ? response : NextResponse.redirect(new URL('/admin/login?setup=required', request.url));
  const client = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(values) {
      values.forEach(({name,value}) => request.cookies.set(name,value));
      response = NextResponse.next({ request });
      values.forEach(({name,value,options}) => response.cookies.set(name,value,options));
    },
  } });
  const {data: {user}} = await client.auth.getUser();
  if (!login && !reset) {
    const {data: profile} = user ? await client.from('admin_profiles').select('role').eq('user_id',user.id).single() : {data:null};
    if (!user || profile?.role !== 'admin') {
      const redirect = NextResponse.redirect(new URL('/admin/login',request.url));
      response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
      return redirect;
    }
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = { matcher: ['/admin/:path*'] };
