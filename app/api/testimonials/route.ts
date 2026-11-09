import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { checkOrigin, rateLimit, verifyCaptcha } from '@/lib/security';
import { MAX_PORTRAIT_SIZE, portraitExtension, testimonialSubmissionSchema } from '@/lib/validators/testimonials';
export const maxDuration = 60;
export async function POST(request:NextRequest) {
  let uploadedPath:string|undefined;
  let saved=false;
  try {
    checkOrigin(request);
    if(!request.headers.get('content-type')?.startsWith('multipart/form-data')) throw new Error('Submit the testimonial using the form.');
    if(Number(request.headers.get('content-length')||0)>MAX_PORTRAIT_SIZE+30000) throw new Error('Your submission is too large. Choose a portrait up to 3MB.');
    await rateLimit(request,'submit:testimonial',3);
    // Read with an actual byte limit as Content-Length can be absent or forged.
    if(!request.body) throw new Error('Your submission is empty.');
    const reader=request.body.getReader();const chunks:Uint8Array[]=[];let total=0;
    while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_PORTRAIT_SIZE+30000){await reader.cancel();throw new Error('Your submission is too large. Choose a portrait up to 3MB.');}chunks.push(value);}
    const body=Buffer.concat(chunks);
    const form=await new Request(request.url,{method:'POST',headers:{'content-type':request.headers.get('content-type')!},body}).formData();
    const input=testimonialSubmissionSchema.parse(Object.fromEntries(form));
    await verifyCaptcha(input.captcha_token);
    const id=randomUUID();const db=adminClient();let imageUrl='';
    const portrait=form.get('portrait');
    if(portrait instanceof File && portrait.size>0){
      if(portrait.size>MAX_PORTRAIT_SIZE)throw new Error('Choose a portrait up to 3MB.');
      const bytes=Buffer.from(await portrait.arrayBuffer());portraitExtension(portrait.type,bytes);
      const path=`portraits/${id}`;
      const {error}=await db.storage.from('testimonial-portraits').upload(path,bytes,{contentType:portrait.type,upsert:false});
      if(error)throw new Error('Could not upload your portrait. Please try again.');
      uploadedPath=path;imageUrl=`/api/testimonial-portraits/${id}`;
    }else if(portrait!==null && !(portrait instanceof File)){throw new Error('Choose a valid portrait file.');}
    const {error}=await db.from('testimonials').insert({id,name:input.name,title:input.title,quote:input.quote,image_url:imageUrl,is_published:false,submitted_by_public:true,agreed_to_publish:true});
    if(error)throw new Error('Could not save your experience. Please try again.');
    saved=true;
    return NextResponse.json({ok:true,message:'Thank you for sharing your experience. Our team will review it before publishing.'});
  }catch(error){
    if(uploadedPath&&!saved){const {error:cleanupError}=await adminClient().storage.from('testimonial-portraits').remove([uploadedPath]);if(cleanupError)console.error('Testimonial portrait cleanup failed',cleanupError.message);}
    if(error instanceof z.ZodError)return NextResponse.json({error:error.issues[0]?.message||'Please check your form entries.',fields:error.flatten().fieldErrors},{status:400});
    return NextResponse.json({error:error instanceof Error?error.message:'Submission unavailable. Please try again.'},{status:400});
  }
}
