import { z } from 'zod';
export const serviceEnquiryEnvelope = z.object({
  service_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150),
  answers: z.record(z.string().max(150), z.string().max(10000)).refine(v=>Object.keys(v).length<=100,'Too many answers.'),
  document_path: z.string().regex(/^applications\/[0-9a-f-]+\.pdf$/).optional().or(z.literal('')),
  upload_intent: z.string().uuid().optional().or(z.literal('')),
  website: z.string().max(0).optional().default(''),
  captcha_token: z.string().max(2048).optional().default(''),
  agree_privacy: z.literal(true),
  consent_contact: z.literal(true),
});
