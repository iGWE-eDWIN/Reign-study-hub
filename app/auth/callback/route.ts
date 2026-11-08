import { NextRequest, NextResponse } from 'next/server';
import { sessionClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/utils';
export async function GET(request:NextRequest){const code=request.nextUrl.searchParams.get('code');const next=request.nextUrl.searchParams.get('next');const path=next==='/admin/reset-password'?next:'/admin';if(code){const client=await sessionClient();const{error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(path,siteUrl()));}return NextResponse.redirect(new URL('/admin/login?error=callback',siteUrl()));}
