import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { sessionClient } from '@/lib/supabase/server';
import { portraitExtension, testimonialPortraitPath } from '@/lib/validators/testimonials';
export const dynamic='force-dynamic';
const hidden=()=>new NextResponse(null,{status:404,headers:{'Cache-Control':'private, no-store'}});
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params;if(!z.string().uuid().safeParse(id).success)return hidden();
    const db=adminClient();
    const {data:record,error}=await db.from('testimonials').select('is_published,image_url').eq('id',id).maybeSingle();
    if(error||!record||!testimonialPortraitPath(id,record.image_url))return hidden();
    if(!record.is_published){
      const client=await sessionClient();const {data:{user}}=await client.auth.getUser();if(!user)return hidden();
      const {data:profile}=await client.from('admin_profiles').select('role').eq('user_id',user.id).maybeSingle();if(profile?.role!=='admin')return hidden();
    }
    const {data:file,error:fileError}=await db.storage.from('testimonial-portraits').download(`portraits/${id}`);if(fileError||!file)return hidden();
    const bytes=Buffer.from(await file.arrayBuffer());portraitExtension(file.type,bytes);
    return new NextResponse(bytes,{headers:{'Content-Type':file.type,'Content-Length':String(bytes.length),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
  }catch{return hidden();}
}
