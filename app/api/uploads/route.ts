import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { checkOrigin, ipHash, rateLimit } from '@/lib/security';
import { validatePdfMetadata } from '@/lib/validators/forms';
export async function POST(request:NextRequest){try{
 checkOrigin(request);if(Number(request.headers.get('content-length')||0)>5000)throw new Error('Request too large.');
 await rateLimit(request,'upload',8);
 const body=z.object({type:z.string(),size:z.number(),website:z.string().max(0)}).parse(await request.json());validatePdfMetadata(body.type,body.size);
 const db=adminClient();const path=`applications/${randomUUID()}.pdf`;
 const {data:intent,error:insertError}=await db.from('upload_intents').insert({path,ip_hash:ipHash(request)}).select('id').single();if(insertError)throw new Error('Could not prepare your upload.');
 const {data,error}=await db.storage.from('documents').createSignedUploadUrl(path,{upsert:false});if(error||!data)throw new Error('Could not prepare your upload.');
 return NextResponse.json({path,token:data.token,intent:intent.id});
 }catch(error){return NextResponse.json({error:error instanceof z.ZodError?'Invalid upload request.':error instanceof Error?error.message:'Upload unavailable.'},{status:400});}}
