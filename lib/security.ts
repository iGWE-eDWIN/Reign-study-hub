import 'server-only';
import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { adminClient } from './supabase/admin';
import { siteUrl } from './utils';
export function checkOrigin(request:NextRequest){const origin=request.headers.get('origin');if(!origin||origin!==new URL(siteUrl()).origin)throw new Error('Request origin is not allowed.');}
export function ipHash(request:NextRequest){const ip=(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'local').split(',')[0].trim();return createHash('sha256').update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest('hex');}
export async function rateLimit(request:NextRequest,bucket:string,limit=5){const {data,error}=await adminClient().rpc('consume_rate_limit',{p_key:`${bucket}:${ipHash(request)}`,p_limit:limit,p_window:3600});if(error)throw new Error('Submission protection is unavailable. Please try later.');if(!data)throw new Error('Too many requests. Please try again in an hour.');}
export async function verifyCaptcha(token:string){const secret=process.env.TURNSTILE_SECRET_KEY;if(!secret)return;if(!token)throw new Error('Please complete the verification.');const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token}),signal:AbortSignal.timeout(10000)});const result=await response.json() as {success:boolean};if(!result.success)throw new Error('Verification expired. Please try again.');}
