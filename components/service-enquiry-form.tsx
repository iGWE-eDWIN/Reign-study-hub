'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Captcha } from './public-form';
import { browserClient } from '@/lib/supabase/browser';
import { validatePdfMetadata, hasPdfHeader, todayInNigeria } from '@/lib/validators/forms';
import { validateServiceAnswers, visibleServiceFields, type ServiceFormDefinition } from '@/lib/service-forms';
export function ServiceEnquiryForm({slug,definition}:{slug:string;definition:ServiceFormDefinition}){
 const [answers,setAnswers]=useState<Record<string,string>>({});const [errors,setErrors]=useState<Record<string,string>>({});
 const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [failure,setFailure]=useState('');const [reference,setReference]=useState('');const [token,setToken]=useState('');const [resetKey,setResetKey]=useState(0);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget);const validated=validateServiceAnswers(definition,answers);setErrors(validated.errors);setFailure('');
  if(Object.keys(validated.errors).length){setFailure('Please check the highlighted fields.');return;}
  setBusy(true);
  try{
   if(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY&&!token)throw new Error('Please complete the verification.');
   if(definition.documentRequired&&!file)throw new Error('Please upload your passport data page as a PDF.');
   const payload:Record<string,unknown>={service_slug:slug,answers:validated.answers,website:form.get('website')||'',agree_privacy:form.get('agree_privacy')==='on',consent_contact:form.get('consent_contact')==='on',captcha_token:token};
   if(file){
    validatePdfMetadata(file.type,file.size);if(!hasPdfHeader(new Uint8Array(await file.slice(0,5).arrayBuffer())))throw new Error('Choose a valid PDF document.');
    const response=await fetch('/api/uploads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:file.type,size:file.size,website:payload.website})});
    const intent=await response.json();if(!response.ok)throw new Error(intent.error||'Could not prepare your document upload.');
    const {error}=await browserClient().storage.from('documents').uploadToSignedUrl(intent.path,intent.token,file,{contentType:'application/pdf'});if(error)throw new Error('Document upload failed. Please try again.');
    payload.document_path=intent.path;payload.upload_intent=intent.intent;
   }
   const response=await fetch('/api/service-enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();
   if(!response.ok){if(result.fields)setErrors(Object.fromEntries(Object.entries(result.fields).map(([key,value])=>[key,Array.isArray(value)?String(value[0]):String(value)])));throw new Error(result.error||'Could not send your enquiry.');}
   setReference(result.reference);setAnswers({});setFile(null);
  }catch(error){setFailure(error instanceof Error?error.message:'Please try again.');setToken('');setResetKey(n=>n+1);}finally{setBusy(false);}
 }
 if(reference)return <div className="surface p-8" role="status"><CheckCircle2 size={40} className="mb-4 text-green-700"/><h2 className="text-2xl">Your enquiry has been received</h2><p className="mt-3 text-sm text-slate-500">Our team will contact you about {definition.title}. Keep your reference:</p><p className="mt-5 break-all rounded bg-soft p-4 font-mono font-bold">{reference}</p></div>;
 return <form onSubmit={submit} className="surface min-w-0 p-5 md:p-8"><h2 className="text-2xl">{definition.title} enquiry</h2><p className="mt-3 mb-7 text-sm text-slate-500">Tell us what you need for this service. Fields marked * are required.</p><div className="honeypot" aria-hidden="true"><label htmlFor="service-website">Leave empty</label><input id="service-website" name="website" tabIndex={-1} autoComplete="off"/></div><div className="grid min-w-0 gap-5 sm:grid-cols-2">{visibleServiceFields(definition,answers).map(field=>{
  const id=`service-${field.name}`;const props={id,name:field.name,value:answers[field.name]||'',required:field.required,'aria-invalid':!!errors[field.name],'aria-describedby':errors[field.name]?id+'-error':undefined,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setAnswers(previous=>({...previous,[field.name]:e.target.value}))};
  return <div key={field.name} className={`field ${field.type==='textarea'?'sm:col-span-2':''}`}><label htmlFor={id}>{field.label}{field.required?' *':''}</label>{field.type==='select'?<select {...props}><option value="">Select an option</option>{field.options?.map(option=><option key={option}>{option}</option>)}</select>:field.type==='textarea'?<textarea {...props} rows={4}/>:<input {...props} type={field.type} maxLength={3000} min={field.type==='number'?1:undefined} max={field.name==='date_of_birth'?todayInNigeria():undefined} autoComplete={field.name==='full_name'?'name':field.type==='email'?'email':field.type==='tel'?'tel':undefined}/>} {errors[field.name]&&<small id={id+'-error'} role="alert">{errors[field.name]}</small>}</div>;
 })}</div>{definition.documents.length>0&&<fieldset className="mt-8 min-w-0"><legend className="font-heading text-sm font-bold">Supporting documents</legend><ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-6 text-slate-500">{definition.documents.map(item=><li key={item}>{item}</li>)}</ul><p className="mt-4 text-xs text-slate-500">{definition.documentRequired?'Upload the required document below.':'Upload the relevant documents you already have. You can enquire before all documents are ready.'} Compile documents into one PDF, maximum 10MB. Documents are private and accessible only to authorised administrators.</p><div className="field mt-4"><label htmlFor="service-documents">Supporting PDF {definition.documentRequired?'*':'(optional)'}</label><input id="service-documents" type="file" accept="application/pdf,.pdf" required={definition.documentRequired} onChange={event=>setFile(event.target.files?.[0]||null)} className="max-w-full"/></div></fieldset>}<div className="mt-8 space-y-4 text-xs"><label className="flex items-start gap-3"><input type="checkbox" name="agree_privacy" required className="mt-1 h-4 w-4 shrink-0"/><span>I confirm my information is accurate and agree to the <Link href="/privacy" target="_blank" className="underline">privacy policy</Link>.</span></label><label className="flex items-start gap-3"><input type="checkbox" name="consent_contact" required className="mt-1 h-4 w-4 shrink-0"/><span>I consent to being contacted about this service enquiry.</span></label></div><Captcha onToken={setToken} resetKey={resetKey}/>{failure&&<p role="alert" className="mt-5 rounded bg-red-50 p-4 text-sm text-red-800">{failure}</p>}<button disabled={busy} className="btn mt-7 w-full" type="submit">{busy?<><LoaderCircle size={18} className="animate-spin"/>Sending enquiry…</>:<>Submit service enquiry<ArrowRight size={18}/></>}</button><p className="mt-4 text-xs text-slate-500">Our team will review your requirements and confirm the next steps.</p></form>;
}
