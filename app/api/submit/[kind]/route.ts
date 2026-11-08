import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { schemas, hasPdfHeader, validatePdfMetadata, type SubmissionKind } from '@/lib/validators/forms';
import { checkOrigin, ipHash, rateLimit, verifyCaptcha } from '@/lib/security';
import { sendNotificationEmail } from '@/lib/email';
export const maxDuration=60;
const tables={application:'applications',appointment:'appointments',contact:'contact_messages'} as const;
async function assertOption(table:string,name:string){if(!name)return;const{data,error}=await adminClient().from(table).select('id').eq('name',name).eq('is_active',true).maybeSingle();if(error||!data)throw new Error('A selected option is no longer available. Refresh and select again.');}
export async function POST(request:NextRequest,{params}:{params:Promise<{kind:string}>}){
 let consumedIntent:string|undefined;let saved=false;
 try{
  checkOrigin(request);if(Number(request.headers.get('content-length')||0)>40000)throw new Error('Request too large.');
  const{kind}=await params;if(!Object.hasOwn(schemas,kind))return NextResponse.json({error:'Unknown form.'},{status:404});
  await rateLimit(request,`submit:${kind}`);
  const raw=await request.text();if(raw.length>40000)throw new Error('Request too large.');
  const input=schemas[kind as SubmissionKind].parse(JSON.parse(raw));await verifyCaptcha(input.captcha_token);
  const {website: _website,captcha_token: _captcha,...fields}=input;
  const db=adminClient();let pdf:Buffer|undefined;let signedUrl:string|undefined;let row:Record<string,unknown>={...fields};
  if(kind==='application'){
   const app=schemas.application.parse(input);
   await Promise.all([assertOption('destinations',app.first_choice_country),assertOption('destinations',app.second_choice_country),assertOption('programme_levels',app.programme_level)]);
   if(!app.document_path||!app.upload_intent)throw new Error('Please upload your compiled PDF.');
   const {data:intent,error:intentError}=await db.from('upload_intents').update({consumed:true}).eq('id',app.upload_intent).eq('path',app.document_path).eq('ip_hash',ipHash(request)).eq('consumed',false).gt('expires_at',new Date().toISOString()).select('id').maybeSingle();
   if(intentError||!intent)throw new Error('Your upload has expired or was already submitted. Please upload again.');consumedIntent=intent.id;
   const{data:file,error:fileError}=await db.storage.from('documents').download(app.document_path);if(fileError||!file)throw new Error('PDF upload could not be verified.');validatePdfMetadata(file.type,file.size);pdf=Buffer.from(await file.arrayBuffer());if(!hasPdfHeader(pdf))throw new Error('The file does not contain a valid PDF header.');
   const keys=['full_name','email','phone','date_of_birth','place_of_birth','state_of_origin','lga','passport_number','passport_issue_date','passport_expiry_date','passport_place_of_issue','marital_status','first_choice_country','second_choice_country','preferred_courses','programme_level','document_path'];
   row=Object.fromEntries(keys.map(key=>[key,fields[key as keyof typeof fields]??null]));
   row.passport_issue_date=app.passport_issue_date||null;row.passport_expiry_date=app.passport_expiry_date||null;
   row.extra_details=Object.fromEntries(Object.entries(fields).filter(([key])=>!keys.includes(key)&&key!=='upload_intent'));
  }else if(kind==='appointment'){
   const apt=schemas.appointment.parse(input);await Promise.all([assertOption('destinations',apt.destination),assertOption('appointment_service_types',apt.service_type)]);
  }
  const table=tables[kind as SubmissionKind];const{data:record,error}=await db.from(table).insert(row).select('id,reference').single();if(error||!record)throw new Error('Could not save your submission. Please try again.');saved=true;
  let mailSent=false;let mailError:string|null=null;
  try{
   if(kind==='application'){const result=await db.storage.from('documents').createSignedUrl(String(row.document_path),86400);if(result.error)throw new Error('Could not generate the email document link.');signedUrl=result.data.signedUrl;}
   await sendNotificationEmail({kind,reference:record.reference,fields:row,signedUrl,pdf});mailSent=true;
  }catch(error){mailError=error instanceof Error?error.message:'Email delivery failed.';console.error(`Notification failed for ${record.reference}:`,mailError);}
  const {error:deliveryError}=await db.from(table).update({email_sent:mailSent,email_error:mailError}).eq('id',record.id);if(deliveryError)console.error('Could not update email delivery flag',record.id,deliveryError.code);
  return NextResponse.json({reference:record.reference});
 }catch(error){
  if(consumedIntent&&!saved)await adminClient().from('upload_intents').update({consumed:false}).eq('id',consumedIntent);
  if(error instanceof z.ZodError)return NextResponse.json({error:'Please check your form entries.',fields:error.flatten().fieldErrors},{status:400});
  return NextResponse.json({error:error instanceof Error?error.message:'Submission unavailable. Please try again.'},{status:400});
 }
}
