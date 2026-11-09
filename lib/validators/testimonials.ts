import { z } from 'zod';
import { cleanText } from './forms';
export const MAX_PORTRAIT_SIZE = 3 * 1024 * 1024;
const text = (min:number,max:number) => z.string().transform(cleanText).pipe(z.string().min(min).max(max));
export const testimonialSubmissionSchema = z.object({
  name: text(2,120),
  title: text(0,160).optional().default(''),
  quote: text(20,3000),
  agree_publish: z.literal('true','Please consent to publication of your experience and portrait.'),
  website: z.string().max(0,'Spam detected.').optional().default(''),
  captcha_token: z.string().max(2048).optional().default(''),
});
export function portraitExtension(type:string,bytes:Uint8Array) {
  if (bytes.length === 0 || bytes.length > MAX_PORTRAIT_SIZE) throw new Error('Choose a portrait up to 3MB.');
  if(type==='image/jpeg' && bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff) return 'jpg';
  if(type==='image/png' && [137,80,78,71,13,10,26,10].every((byte,i)=>bytes[i]===byte)) return 'png';
  const ascii=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
  if(type==='image/webp' && ascii(0,4)==='RIFF' && ascii(8,12)==='WEBP' && ['VP8 ','VP8L','VP8X'].includes(ascii(12,16))) return 'webp';
  throw new Error('Choose a valid JPEG, PNG or WebP portrait.');
}
export function testimonialPortraitPath(id:string,imageUrl:unknown) {
  return imageUrl===`/api/testimonial-portraits/${id}` ? `portraits/${id}` : null;
}
