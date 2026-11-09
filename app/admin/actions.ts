'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { contentSchema, resources } from '@/lib/admin-config';
export type ActionResult={ok:boolean;error?:string;id?:string};
function refresh(){revalidateTag('content',{expire:0});revalidatePath('/','layout');revalidatePath('/admin','layout');}
export async function saveContent(resource:string,id:string|null,input:Record<string,unknown>):Promise<ActionResult>{
 const{client}=await requireAdmin();
 try{
  const data=contentSchema(resource).parse(input);
  const result=resource==='site_settings'?await client.from(resource).upsert({...data,id:1}).select('id').single():id?await client.from(resource).update(data).eq('id',z.string().uuid().parse(id)).select('id').single():await client.from(resource).insert(data).select('id').single();
  if(result.error)throw new Error(result.error.code==='23505'?'This name or slug already exists.':'Could not save changes. Please try again.');
  refresh();return {ok:true,id:String(result.data.id)};
 }catch(error){return {ok:false,error:error instanceof z.ZodError?error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '):error instanceof Error?error.message:'Save failed.'};}
}
export async function deleteRecord(resource:string,id:string):Promise<ActionResult>{
 const{client}=await requireAdmin();if(!Object.hasOwn(resources,resource)||resource==='site_settings')return {ok:false,error:'This record cannot be deleted.'};
 z.string().uuid().parse(id);
 let documentPath:string|undefined;
 if(['applications','service_enquiries'].includes(resource)){const {data}=await client.from(resource).select('document_path').eq('id',id).single();documentPath=data?.document_path;}
 const{error}=await client.from(resource).delete().eq('id',id);if(error)return {ok:false,error:'Delete failed. Please try again.'};
 if(documentPath){const{error:storageError}=await client.storage.from('documents').remove([documentPath]);if(storageError){console.error('Document cleanup failed',id,storageError.message);refresh();return {ok:true,error:'Record deleted, but its PDF could not be removed. Remove the orphaned file in Supabase Storage.'};}}
 refresh();return {ok:true};
}
export async function updateSubmission(resource:string,id:string,input:Record<string,unknown>):Promise<ActionResult>{
 const{client}=await requireAdmin();z.string().uuid().parse(id);
 const schema=['applications','service_enquiries'].includes(resource)?z.object({status:z.enum(['new','reviewing','approved','rejected','contacted']),admin_notes:z.string().trim().max(10000)}):resource==='appointments'?z.object({status:z.enum(['pending','confirmed','completed','cancelled'])}):resource==='contact_messages'?z.object({is_read:z.boolean()}):null;
 if(!schema)return {ok:false,error:'Invalid record type.'};const parsed=schema.safeParse(input);if(!parsed.success)return {ok:false,error:'Invalid record details.'};
 const{error}=await client.from(resource).update(parsed.data).eq('id',id);if(error)return {ok:false,error:'Update failed.'};revalidatePath('/admin','layout');return {ok:true};
}
export async function documentLink(id:string,resource='applications'):Promise<ActionResult>{const{client}=await requireAdmin();if(!['applications','service_enquiries'].includes(resource))return {ok:false,error:'Invalid document type.'};z.string().uuid().parse(id);const{data,error}=await client.from(resource).select('document_path').eq('id',id).single();if(error||!data?.document_path)return {ok:false,error:'Document not found.'};const signed=await client.storage.from('documents').createSignedUrl(data.document_path,300);return signed.error?{ok:false,error:'Could not open the PDF.'}:{ok:true,id:signed.data.signedUrl};}
