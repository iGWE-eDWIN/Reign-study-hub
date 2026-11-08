import { z } from 'zod';
export const MAX_PDF_SIZE=10*1024*1024;
export const cleanText=(value:string)=>value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/<[^>]*>/g,'');
const text=(min=1,max=200)=>z.string().transform(cleanText).pipe(z.string().min(min,`Please enter at least ${min} characters.`).max(max));
const optionalText=(max=200)=>text(0,max).optional().default('');
const phone=text(7,30).pipe(z.string().regex(/^\+?[\d\s().-]+$/,'Enter a valid phone number.'));
const email=z.string().trim().email('Enter a valid email address.').max(254);
export function todayInNigeria(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'Enter a date.').refine(v=>{const d=new Date(v+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;},'Enter a valid date.');
const optionalDate=z.union([date,z.literal('')]).optional().default('');
export const nigerianStates=['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT'] as const;
const common={email,phone,website:z.string().max(0,'Spam detected.').optional().default(''),captcha_token:z.string().max(2048).optional().default('')};
const consent=z.boolean().refine(v=>v,'Please confirm to continue.');
export const applicationSchema=z.object({
 ...common,full_name:text(2),date_of_birth:date.refine(v=>v<todayInNigeria(),'Date of birth must be in the past.'),place_of_birth:text(),state_of_origin:z.enum(nigerianStates),lga:text(),passport_number:optionalText(40),passport_issue_date:optionalDate,passport_expiry_date:optionalDate,passport_place_of_issue:optionalText(),marital_status:z.enum(['Single','Married','Divorced','Widowed']),first_choice_country:text(),second_choice_country:optionalText(),preferred_courses:text(2,500),programme_level:text(),document_path:optionalText(200),upload_intent:optionalText(100),
 surname:optionalText(),first_name:optionalText(),other_names:optionalText(),gender:optionalText(),age:optionalText(3),nationality:optionalText(),country_of_residence:optionalText(),whatsapp_number:optionalText(30),alternative_phone:optionalText(30),preferred_university:optionalText(),preferred_intake:optionalText(),tuition_budget:optionalText(),qualification:optionalText(),previous_institution:optionalText(),previous_course:optionalText(),graduation_year_grade:optionalText(),has_passport:optionalText(),passport_country:optionalText(),passport_assistance:optionalText(),has_dependants:optionalText(),dependant_number:optionalText(2),dependant_relationship:optionalText(),dependant_details:optionalText(2000),confirm_accurate:consent,agree_privacy:consent,consent_contact:consent,
}).superRefine((v,ctx)=>{
 if(v.passport_issue_date&&v.passport_expiry_date&&v.passport_expiry_date<=v.passport_issue_date)ctx.addIssue({code:'custom',path:['passport_expiry_date'],message:'Expiry must follow the issue date.'});
 if(v.passport_issue_date&&v.passport_issue_date>todayInNigeria())ctx.addIssue({code:'custom',path:['passport_issue_date'],message:'Issue date cannot be in the future.'});
 if(v.second_choice_country&&v.first_choice_country===v.second_choice_country)ctx.addIssue({code:'custom',path:['second_choice_country'],message:'Choose a different second destination.'});
});
export const appointmentSchema=z.object({...common,full_name:text(2),service_type:text(),destination:text(),appointment_date:date.refine(v=>v>=todayInNigeria(),'Choose today or a future date.'),appointment_type:z.enum(['phone call','office visit']),comment:optionalText(3000),referred_by:optionalText()});
export const contactSchema=z.object({...common,name:text(2),subject:text(2),message:text(10,5000)});
export const schemas={application:applicationSchema,appointment:appointmentSchema,contact:contactSchema};
export type SubmissionKind=keyof typeof schemas;
export function validatePdfMetadata(type:string,size:number){if(type!=='application/pdf')throw new Error('Please upload a PDF file.');if(!Number.isSafeInteger(size)||size<5||size>MAX_PDF_SIZE)throw new Error('PDF must be no larger than 10MB.');}
export function hasPdfHeader(bytes:Uint8Array){return bytes.length>=5&&String.fromCharCode(...bytes.subarray(0,5))==='%PDF-';}
