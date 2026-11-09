'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { Captcha } from './public-form';
export function TestimonialForm(){
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [done,setDone]=useState(false);const [token,setToken]=useState('');const [resetKey,setResetKey]=useState(0);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setError('');const data=new FormData(event.currentTarget);const photo=data.get('portrait');
  if(photo instanceof File&&photo.size){
   if(!['image/jpeg','image/png','image/webp'].includes(photo.type)){setError('Choose a JPEG, PNG or WebP photo.');return;}
   if(photo.size>3*1024*1024){setError('Choose a photo smaller than 3MB.');return;}
  }
  if(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY&&!token){setError('Please complete the verification.');return;}
  data.set('captcha_token',token);data.set('agree_publish',data.get('agree_publish')==='on'?'true':'false');
  setBusy(true);
  try{
   const response=await fetch('/api/testimonials',{method:'POST',body:data});const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Your experience could not be submitted. Please try again.');
   setDone(true);
  }catch(error){setError(error instanceof Error?error.message:'Please try again.');setToken('');setResetKey(n=>n+1);}finally{setBusy(false);}
 }
 if(done)return <div role="status" className="surface p-8 text-center md:p-12"><CheckCircle2 size={48} className="mx-auto mb-5 text-green-700"/><h2 className="text-2xl">Thank you for sharing your experience</h2><p className="mt-4 text-sm leading-7 text-slate-500">Your testimonial has been received for review. Our team can edit and publish it on the website after reviewing it.</p><Link href="/" className="btn mt-7">Return to home</Link></div>;
 return <form onSubmit={submit} className="surface min-w-0 p-5 md:p-8"><h2 className="text-2xl">Tell us about your journey</h2><p className="mt-3 mb-7 text-sm leading-7 text-slate-500">Share your honest experience with Reign Study Hub to help future students. Fields marked * are required.</p><div className="honeypot" aria-hidden="true"><label htmlFor="testimonial-website">Leave empty</label><input id="testimonial-website" name="website" tabIndex={-1} autoComplete="off"/></div><div className="grid min-w-0 gap-6 sm:grid-cols-2"><div className="field"><label htmlFor="testimonial-name">Your name *</label><input id="testimonial-name" name="name" required minLength={2} maxLength={120} autoComplete="name"/></div><div className="field"><label htmlFor="testimonial-title">Course, destination or service (optional)</label><input id="testimonial-title" name="title" maxLength={160} placeholder="e.g. Master’s admission, Canada"/></div><div className="field sm:col-span-2"><label htmlFor="testimonial-quote">Your experience *</label><textarea id="testimonial-quote" name="quote" rows={7} required minLength={20} maxLength={3000} placeholder="How did our team help you? What was your experience during the process?"/><p className="text-xs leading-6 text-slate-500">Please leave out passport numbers, financial information and other private details.</p></div><div className="field sm:col-span-2"><label htmlFor="testimonial-portrait">Your photo (optional)</label><input id="testimonial-portrait" name="portrait" type="file" accept="image/jpeg,image/png,image/webp"/><p className="text-xs leading-6 text-slate-500">Upload your own portrait. JPEG, PNG or WebP, maximum 3MB.</p></div></div><label className="mt-7 flex items-start gap-3 text-xs leading-6"><input name="agree_publish" type="checkbox" required className="mt-1.5 h-4 w-4 shrink-0"/><span>I confirm this is my experience and I have permission to share this photo. I agree that Reign Study Hub may review, edit and publish my name, experience and photo on this website. I have read the <Link href="/privacy" target="_blank" className="underline">privacy policy</Link>.</span></label><Captcha onToken={setToken} resetKey={resetKey}/>{error&&<p role="alert" className="mt-5 rounded bg-red-50 p-4 text-sm text-red-800">{error}</p>}<button disabled={busy} type="submit" className="btn mt-7 w-full">{busy?<><LoaderCircle size={18} className="animate-spin"/>Submitting…</>:<>Submit your experience<Send size={17}/></>}</button><p className="mt-4 text-xs text-slate-500">Testimonials are reviewed before appearing publicly.</p></form>;
}
