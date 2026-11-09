export type ServiceField = {name:string;label:string;type:'text'|'textarea'|'email'|'tel'|'date'|'number'|'select';required:boolean;options?:string[];showWhen?:{field:string;values:string[]}};
export type ServiceFormDefinition = {title:string;fields:ServiceField[];documents:string[];documentRequired:boolean};
type ServiceCopy = {title:string;content:string;short_description?:string};
const f=(name:string,label:string,type:ServiceField['type']='text',required=true,options?:string[]):ServiceField=>({name,label,type,required,...(options?{options}:{})});
const levels=['Undergraduate','Master’s','PhD / Doctoral','Vocational / Professional'];
export function generateServiceForm(service:ServiceCopy):ServiceFormDefinition {
 const title=service.title;const text=`${title} ${service.short_description||''} ${service.content}`.toLowerCase();
 const fields:ServiceField[]=[f('full_name','Full name'),f('email','Email address','email'),f('phone','Active phone number','tel')];
 const documents:string[]=[];let documentRequired=false;
 // Match the service title first, so incidental references to other services do not change its form.
 const subject=title.toLowerCase();
 if(/yellow|vaccination|icvp/.test(subject)){
  fields.push(f('date_of_birth','Date of birth','date'),f('gender','Gender','select',true,['Male','Female','Prefer to self-describe']),f('residential_address','Residential address','textarea'),f('destination','Proposed travel destination'),f('travel_date','Intended travel date','date'));
  documents.push('International passport data page');documentRequired=true;
 }else if(/passport/.test(subject)){
  fields.push(f('passport_category','Passport application category','select',true,['New passport','Renewal','Lost passport replacement','Damaged passport replacement','Data modification']),f('date_of_birth','Date of birth','date'),f('residential_address','Residential address','textarea'),f('nin','National Identification Number (NIN)'),f('modification_details','Details of the correction or update','textarea'));
  fields[fields.length-1].showWhen={field:'passport_category',values:['Data modification']};
  documents.push('New passport: birth certificate, local government/state of origin certificate and recent passport photograph','Renewal: previous passport data page and recent passport photograph','Lost or damaged passport: relevant passport information, police report and affidavit where applicable','Data modification: supporting evidence for the requested correction');
 }else if(/sponsor|placement|scholarship management/.test(subject)){
  fields.push(f('sponsor_type','Sponsor type','select',true,['Individual / Private sponsor','Community / Traditional institution','Government agency','Company','Foundation / NGO','Religious / Educational institution']),f('organisation','Organisation / sponsor name'),f('beneficiaries','Number of beneficiaries','number'),f('programme_level','Programme level','select',true,levels),f('destination','Preferred study destinations'),f('courses','Preferred courses / study areas'),f('funding_budget','Sponsorship budget and currency'),f('intake','Target intake / timeline'),f('support_needed','Scholarship administration and placement support needed','textarea'));
 }else if(/visa/.test(subject)){
  fields.push(f('destination','Study destination'),f('admission_status','Admission status','select',true,['Admission received','Application pending','Preparing to apply']),f('institution','University / institution'),f('programme','Programme / course'),f('travel_date','Intended travel date','date'),f('financial_support','Financial support / sponsorship plan','textarea'),f('previous_refusal','Previous visa refusal?','select',true,['No','Yes']),f('refusal_details','Refusal details','textarea'));
  fields[fields.length-1].showWhen={field:'previous_refusal',values:['Yes']};
  documents.push('Valid international passport','University admission / acceptance letter, if received','Academic certificates and transcripts','Tuition payment evidence, where applicable','Financial support evidence','Accommodation, medical / insurance and country-specific documents, where required');
 }else if(/departure/.test(subject)){
  fields.push(f('destination','Destination country and city'),f('institution','University / institution'),f('departure_date','Planned departure date','date'),f('visa_status','Visa status','select',true,['Approved','Pending','Not yet applied']),f('support_needed','Support needed','textarea'),f('accommodation','Accommodation arrangements','textarea',false),f('flight','Flight / airport arrangements','textarea',false));
 }else if(/scholarship|funding/.test(subject)){
  fields.push(f('qualification','Highest qualification and grades'),f('programme_level','Intended programme level','select',true,levels),f('courses','Preferred courses'),f('destination','Preferred destinations'),f('funding_budget','Available budget and funding needed'),f('admission_status','Existing admission offers','textarea',false));
  documents.push('Academic certificates and transcripts','CV and any existing admission offer, where available');
 }else if(/university|course|admission/.test(subject)){
  fields.push(f('programme_level','Programme level','select',true,levels),f('qualification','Academic qualifications and grades','textarea'),f('courses','Preferred courses / study areas'),f('destination','Preferred study destinations'),f('budget','Annual tuition budget and currency'),f('intake','Preferred intake'),f('career_goals','Career goals','textarea',/selection|course/.test(subject)),f('institution','Preferred university / institution','text',false),f('english_proficiency','English proficiency evidence, if available','text',false));
  documents.push('Undergraduate: WAEC / NECO or equivalent, passport, photograph and transcripts where applicable','Master’s: degree certificate, transcripts, passport, CV and statement of purpose','PhD: Master’s and Bachelor’s certificates, transcripts, research proposal and academic CV','Vocational: relevant qualifications, passport and photograph','Recommendation letters, work experience and English proficiency evidence where required');
 }else{
  // Unrecognised new services derive fields from explicit numbered/bulleted requirement sections.
  const requirements=service.content.split(/(?:application\s+requirements|requirements(?:\s+for[^\n:]*)?|information\s+required)\s*:?/i).slice(1).join('\n').split(/(?:how to apply|why choose|general information|important information|contact us)/i)[0]||'';
  const items=requirements.split(/\n|(?:\s+\d+[.)]\s+)|[•]/).map(x=>x.replace(/^\s*[-*]\s*/,'').trim()).filter(x=>x.length>2&&x.length<180).slice(0,20);
  for(const item of items){
   if(/document|certificate|passport.*page|photograph|transcript|letter|affidavit|report|proof|cv|résumé/i.test(item)){documents.push(item);continue;}
   if(/full name|email|phone|telephone/i.test(item))continue;
   const name='requirement_'+fields.length;
   fields.push(f(name,item,/date/i.test(item)?'date':/address|details|description/i.test(item)?'textarea':'text',!/optional|where applicable|if available/i.test(item)));
  }
  if(fields.length===3){
   if(/destination|country/i.test(text))fields.push(f('destination','Destination / country'));
   if(/travel date|departure/i.test(text))fields.push(f('travel_date','Intended travel date','date'));
   fields.push(f('requirements','Your requirements and the assistance you need','textarea'));
  }
 }
 fields.push(f('additional_information','Additional information','textarea',false));
 return {title,fields,documents,documentRequired};
}
export function visibleServiceFields(definition:ServiceFormDefinition,answers:Record<string,unknown>){return definition.fields.filter(field=>!field.showWhen||field.showWhen.values.includes(String(answers[field.showWhen.field]||'')));}
export function validateServiceAnswers(definition:ServiceFormDefinition,input:unknown){
 const raw=input&&typeof input==='object'&&!Array.isArray(input)?input as Record<string,unknown>:{};
 const answers:Record<string,string>={};const errors:Record<string,string>={};
 for(const field of visibleServiceFields(definition,raw)){
  const value=typeof raw[field.name]==='string'?(raw[field.name] as string).trim():'';
  if(field.required&&!value){errors[field.name]=`${field.label} is required.`;continue;}
  if(value.length>3000){errors[field.name]='Use at most 3,000 characters.';continue;}
  if(value){
   if(field.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))errors[field.name]='Enter a valid email address.';
   if(field.type==='tel'&&!/^[+\d\s().-]{7,30}$/.test(value))errors[field.name]='Enter a valid phone number.';
   if(field.options&&!field.options.includes(value))errors[field.name]='Choose an available option.';
   if(field.type==='number'&&(!/^\d+$/.test(value)||Number(value)<1))errors[field.name]='Enter a positive whole number.';
   if(field.name==='nin'&&!/^\d{11}$/.test(value))errors[field.name]='Enter your 11-digit NIN.';
   if(field.type==='date'){
    const date=new Date(value+'T00:00:00Z');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value)errors[field.name]='Enter a valid date.';
    else if(field.name==='date_of_birth'&&date>new Date())errors[field.name]='Date of birth cannot be in the future.';
   }
  }
  answers[field.name]=value;
 }
 return {answers,errors};
}
