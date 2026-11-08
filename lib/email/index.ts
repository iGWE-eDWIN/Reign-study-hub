import 'server-only';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
interface Attachment {filename:string;content:Buffer}
interface Email {to:string;subject:string;html:string;replyTo?:string;attachments?:Attachment[]}
async function deliver(email:Email){
 const from=process.env.EMAIL_FROM;
 if(!from)throw new Error('EMAIL_FROM is not configured.');
 if(process.env.EMAIL_PROVIDER==='smtp'){
  if(!process.env.SMTP_USER||!process.env.SMTP_PASSWORD)throw new Error('SMTP is not configured.');
  const port=Number(process.env.SMTP_PORT||465);
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.gmail.com',port,secure:port===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:20000});
  await transport.sendMail({from,to:email.to,subject:email.subject,html:email.html,replyTo:email.replyTo,attachments:email.attachments});
 }else{
  if(!process.env.RESEND_API_KEY)throw new Error('Resend is not configured.');
  const {error}=await new Resend(process.env.RESEND_API_KEY).emails.send({from,to:email.to,subject:email.subject,html:email.html,replyTo:email.replyTo,attachments:email.attachments?.map(a=>({filename:a.filename,content:a.content}))});
  if(error)throw new Error(error.message);
 }
}
export async function sendNotificationEmail({kind,reference,fields,signedUrl,pdf}:{kind:string;reference:string;fields:Record<string,unknown>;signedUrl?:string;pdf?:Buffer}){
 const email=String(fields.email);const rows=Object.entries(fields).filter(([key])=>!['website','captcha_token','upload_intent'].includes(key)).map(([key,value])=>`<tr><th style="padding:10px;text-align:left;border-bottom:1px solid #ddd;vertical-align:top">${escape(key.replace(/_/g,' '))}</th><td style="padding:10px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escape(typeof value==='object'?JSON.stringify(value,null,2):String(value??''))}</td></tr>`).join('');
 await deliver({to:process.env.NOTIFICATION_EMAIL||'reignstudyabroad@gmail.com',replyTo:email,subject:`Reign Study Hub: ${kind} — ${reference}`,html:`<div style="font-family:Arial,sans-serif;color:#0a2540;max-width:800px;margin:auto"><h1>New ${escape(kind)}</h1><p>Reference: <strong>${escape(reference)}</strong></p><table style="border-collapse:collapse;width:100%">${rows}</table>${signedUrl?`<p><a href="${escape(signedUrl)}">View application PDF (expires in 24 hours)</a></p>`:''}</div>`,attachments:pdf&&pdf.length<5*1024*1024?[{filename:`${reference}.pdf`,content:pdf}]:undefined});
 if(process.env.SEND_AUTOREPLIES==='true'){
  try{await deliver({to:email,replyTo:process.env.NOTIFICATION_EMAIL||'reignstudyabroad@gmail.com',subject:`We received your ${kind} — ${reference}`,html:`<p>Thank you for contacting REIGN STUDY HUB LTD.</p><p>We received your ${escape(kind)}. Your reference is <strong>${escape(reference)}</strong>. Our team will review and contact you.</p><p>Submission does not guarantee admission, a scholarship or a visa.</p>`});}catch(error){console.error('Auto-reply failed',error instanceof Error?error.message:'Unknown mail error');}
 }
}
