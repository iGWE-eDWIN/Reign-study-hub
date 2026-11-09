import { z } from 'zod';
import { cleanText } from './validators/forms';
export type AdminField={name:string;label:string;kind?:'textarea'|'number'|'checkbox'|'image'|'datetime-local'|'json'|'email';required?:boolean;hint?:string};
export type ResourceConfig={title:string;singular:string;fields:AdminField[];columns:string[];flag?:string;record?:boolean};
const f=(name:string,label:string,kind?:AdminField['kind'],required=false,hint?:string):AdminField=>({name,label,kind,required,hint});
const published=f('is_published','Published','checkbox');const order=f('sort_order','Display order','number');const active=f('is_active','Active','checkbox');
export const resources:Record<string,ResourceConfig>={
 service_enquiries:{title:'Service enquiries',singular:'Service enquiry',fields:[],columns:['full_name','email','service_title','status','created_at','email_sent'],record:true},
 applications:{title:'Applications',singular:'Application',fields:[],columns:['full_name','email','first_choice_country','status','created_at','email_sent'],record:true},
 appointments:{title:'Appointments',singular:'Appointment',fields:[],columns:['full_name','service_type','appointment_date','status','email_sent'],record:true},
 contact_messages:{title:'Messages',singular:'Message',fields:[],columns:['name','subject','is_read','created_at','email_sent'],record:true},
 slides:{title:'Hero slides',singular:'Hero slide',columns:['headline','is_active','sort_order'],fields:[f('tagline','Tagline'),f('headline','Headline',undefined,true),f('subtext','Subtext','textarea'),f('image_url','Slide image','image'),f('cta_label','Button label'),f('cta_link','Button destination',undefined,true,'Use a local path such as /apply, or an https URL.'),order,active]},
 services:{title:'Services',singular:'Service',columns:['title','slug','is_published'],fields:[f('title','Title',undefined,true),f('slug','URL slug',undefined,true),f('short_description','Short description','textarea',true),f('content','Page content','textarea',true),f('image_url','Service image','image'),order,published]},
 testimonials:{title:'Testimonials',singular:'Testimonial',columns:['name','title','is_published'],fields:[f('name','Name',undefined,true),f('title','Title / course'),f('quote','Quote','textarea',true),f('image_url','Portrait','image'),published]},
 posts:{title:'News & blog',singular:'Post',columns:['title','slug','is_published','published_at'],fields:[f('title','Title',undefined,true),f('slug','URL slug',undefined,true),f('excerpt','Excerpt','textarea'),f('content','Article content','textarea',true),f('cover_image_url','Cover image','image'),f('published_at','Publication date','datetime-local'),published]},
 faqs:{title:'FAQs',singular:'FAQ',columns:['question','is_published','sort_order'],fields:[f('question','Question',undefined,true),f('answer','Answer','textarea',true),order,published]},
 partners:{title:'Partners',singular:'Partner',columns:['name','is_published','sort_order'],fields:[f('name','Partner name',undefined,true),f('logo_url','Partner logo','image'),order,published]},
 team_members:{title:'Team members',singular:'Team member',columns:['name','role','is_published'],fields:[f('name','Name',undefined,true),f('role','Role',undefined,true),f('bio','Biography / message','textarea'),f('image_url','Photograph','image'),order,published]},
 destinations:{title:'Destinations',singular:'Destination',columns:['name','is_active','sort_order'],fields:[f('name','Country / destination',undefined,true),f('flag_emoji','Flag emoji'),f('description','Short description'),f('image_url','Destination image','image'),f('requirements','Required documents','json',false,'A JSON list of strings, for example ["Passport biodata page", "Academic certificates"].'),order,active]},
 programme_levels:{title:'Programme levels',singular:'Programme level',columns:['name','is_active','sort_order'],fields:[f('name','Name',undefined,true),order,active]},
 appointment_service_types:{title:'Appointment services',singular:'Appointment service',columns:['name','is_active','sort_order'],fields:[f('name','Name',undefined,true),order,active]},
 site_settings:{title:'Site settings',singular:'Site settings',columns:[],fields:[f('site_name','Site name',undefined,true),f('tagline','Tagline'),f('parent_company','Parent company'),f('logo_url','Logo','image'),f('email','Contact email','email',true),f('whatsapp_number','WhatsApp number',undefined,false,'International digits only, e.g. 2348034239813'),f('working_hours','Working hours'),f('phone_numbers','Phone numbers','json',true,'Example: ["+234 803 423 9813", "+44 7480 251588"]'),f('addresses','Offices','json',true,'Example: [{"label":"Head Office", "address":"Your full address"}]'),f('social_links','Social links','json',false,'Example: {"Instagram":"https://instagram.com/youraccount"}'),f('stats','Verified counters','json',false,'Example: [{"label":"Your verified metric", "value":10, "suffix":"+"}]. Leave [] until verified.'),f('about_text','About','textarea'),f('vision_text','Vision','textarea'),f('mission_text','Mission','textarea'),f('values_text','Values','textarea'),f('processing_fee','Processing fee',undefined,false,'Leave empty to hide. Include currency when configured.'),f('map_embed_url','Google Maps embed URL',undefined,false,'Optional https://www.google.com/maps/embed URL. Default map searches the existing head office address.'),f('privacy_text','Approved privacy policy','textarea'),f('application_process','Application process','json',false,'List of {"title":"…", "description":"…"} objects.'),f('document_checklists','Programme document checklists','json',false,'List of {"title":"Undergraduate / Diploma", "items":["Document name"]} objects. Only add approved requirements.')]},
};
const plain=z.string().max(30000).transform(cleanText);
const url=z.string().refine(v=>v===''||/^\/(?!\/)[^\s]*$/.test(v)||/^https:\/\/[^\s]+$/.test(v),'Use a local path or an https URL.');
const jsonFields:Record<string,z.ZodType>={
 requirements:z.array(z.string().min(1).max(500)).max(100),phone_numbers:z.array(z.string().max(40)).max(20),addresses:z.array(z.object({label:z.string().min(1),address:z.string().min(1)})).max(20),social_links:z.record(z.string().max(40),z.string().url().startsWith('https://')),stats:z.array(z.object({label:z.string().min(1),value:z.number().nonnegative(),suffix:z.string().optional()})).max(20),application_process:z.array(z.object({title:z.string().min(1),description:z.string().min(1)})).max(30),document_checklists:z.array(z.object({title:z.string().min(1),items:z.array(z.string().min(1))})).max(20),
};
export function contentSchema(resource:string){const config=Object.hasOwn(resources,resource)?resources[resource]:undefined;if(!config||config.record)throw new Error('Unknown content type.');const shape:Record<string,z.ZodType>={};
 for(const field of config.fields){let schema:z.ZodType=plain;
  if(field.kind==='checkbox')schema=z.boolean();
  else if(field.kind==='number')schema=z.number().int().min(-10000).max(10000);
  else if(field.kind==='json')schema=jsonFields[field.name]||z.unknown();
  else if(field.kind==='image')schema=url.refine(v=>!v||v.startsWith('/assets/')||v.startsWith('https://images.unsplash.com/')||/^https:\/\/(thumb|upload)\.wikimedia\.org\/wikipedia\/commons\//.test(v)||(process.env.NEXT_PUBLIC_SUPABASE_URL&&v.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-media/`)),'Upload an image or use an existing site-media URL.');
  else if(field.name==='slug')schema=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use lowercase words separated by hyphens.').max(150);
  else if(field.name==='cta_link')schema=url;
  else if(field.name==='whatsapp_number')schema=z.string().regex(/^\d{7,15}$|^$/,'Use international digits only.');
  else if(field.name==='map_embed_url')schema=z.string().refine(v=>!v||/^https:\/\/(www\.)?google\.com\/maps\/embed/.test(v),'Use a Google Maps embed URL.');
  else if(field.kind==='email')schema=z.string().email();
  else if(field.kind==='datetime-local')schema=z.union([z.string().datetime(),z.null()]);
  else if(field.required)schema=z.string().transform(cleanText).pipe(z.string().min(1,'This field is required.').max(30000));
  shape[field.name]=schema;
 }
 return z.object(shape).superRefine((value,ctx)=>{if(resource==='posts'&&value.is_published&&!value.published_at)ctx.addIssue({code:'custom',path:['published_at'],message:'A published post needs a publication date.'});});
}
