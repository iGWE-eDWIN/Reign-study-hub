import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { checkOrigin, ipHash, rateLimit, verifyCaptcha } from '@/lib/security';
import { hasPdfHeader, validatePdfMetadata } from '@/lib/validators/forms';
import { serviceEnquiryEnvelope } from '@/lib/validators/service-enquiries';
import { generateServiceForm, validateServiceAnswers } from '@/lib/service-forms';
import { sendNotificationEmail } from '@/lib/email';
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  let consumedIntent: string | undefined;
  let saved = false;
  try {
    checkOrigin(request);
    if (Number(request.headers.get('content-length') || 0) > 60000) throw new Error('Request too large.');
    await rateLimit(request, 'submit:service-enquiry');
    const raw = await request.text();
    if (raw.length > 60000) throw new Error('Request too large.');
    const input = serviceEnquiryEnvelope.parse(JSON.parse(raw));
    await verifyCaptcha(input.captcha_token);
    const db = adminClient();
    const { data: service, error: serviceError } = await db.from('services').select('id,slug,title,short_description,content').eq('slug', input.service_slug).eq('is_published', true).maybeSingle();
    if (serviceError || !service) throw new Error('This service is unavailable. Refresh the page and try again.');
    const definition = generateServiceForm(service);
    const validation = validateServiceAnswers(definition, input.answers);
    if (Object.keys(validation.errors).length) return NextResponse.json({ error: 'Please check your form entries.', fields: validation.errors }, { status: 400 });
    const answers = validation.answers;
    if (definition.documentRequired && !input.document_path) throw new Error('Please upload your required document as a PDF.');
    let pdf: Buffer | undefined;
    if (input.document_path || input.upload_intent) {
      if (!input.document_path || !input.upload_intent) throw new Error('Please upload your PDF again.');
      const { data: intent, error } = await db.from('upload_intents').update({ consumed: true }).eq('id', input.upload_intent).eq('path', input.document_path).eq('ip_hash', ipHash(request)).eq('consumed', false).gt('expires_at', new Date().toISOString()).select('id').maybeSingle();
      if (error || !intent) throw new Error('Your upload has expired or was already submitted. Please upload again.');
      consumedIntent = intent.id;
      const { data: file, error: fileError } = await db.storage.from('documents').download(input.document_path);
      if (fileError || !file) throw new Error('Your PDF upload could not be verified.');
      validatePdfMetadata(file.type, file.size);
      pdf = Buffer.from(await file.arrayBuffer());
      if (!hasPdfHeader(pdf)) throw new Error('The file does not contain a valid PDF header.');
    }
    const labeledAnswers = Object.fromEntries(definition.fields.filter(field=>Object.hasOwn(answers,field.name)).map(field=>[field.label,answers[field.name]]));
    const row = { service_id: service.id, service_slug: service.slug, service_title: service.title, full_name: answers.full_name, email: answers.email, phone: answers.phone, answers: labeledAnswers, document_path: input.document_path || null, agree_privacy: true, consent_contact: true };
    const { data: record, error: insertError } = await db.from('service_enquiries').insert(row).select('id,reference').single();
    if (insertError || !record) throw new Error('Could not save your enquiry. Please try again.');
    saved = true;
    let emailSent = false;
    let emailError: string | null = null;
    try {
      let signedUrl: string | undefined;
      if (row.document_path) {
        const { data, error } = await db.storage.from('documents').createSignedUrl(row.document_path, 86400);
        if (error) throw new Error('Could not generate the email document link.');
        signedUrl = data.signedUrl;
      }
      await sendNotificationEmail({ kind: `${service.title} enquiry`, reference: record.reference, fields: { full_name: row.full_name, email: row.email, phone: row.phone, service: service.title, ...labeledAnswers }, signedUrl, pdf });
      emailSent = true;
    } catch (error) { emailError = error instanceof Error ? error.message : 'Email delivery failed.'; console.error(`Notification failed for ${record.reference}:`, emailError); }
    const { error: deliveryError } = await db.from('service_enquiries').update({ email_sent: emailSent, email_error: emailError }).eq('id', record.id);
    if (deliveryError) console.error('Could not update service enquiry email flag', record.id, deliveryError.code);
    return NextResponse.json({ reference: record.reference });
  } catch (error) {
    if (consumedIntent && !saved) await adminClient().from('upload_intents').update({ consumed: false }).eq('id', consumedIntent);
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please check your form entries.', fields: error.flatten().fieldErrors }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Enquiry unavailable. Please try again.' }, { status: 400 });
  }
}
