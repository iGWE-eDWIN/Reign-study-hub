import type { SupabaseClient } from '@supabase/supabase-js';
export interface AdminListRow { id: string; [key: string]: unknown }
export interface ListFilters {q?:string;status?:string;country?:string;from?:string;to?:string;page?:string;read?:string}
export function listQuery(client:SupabaseClient,resource:string,filters:ListFilters,columns='*'){
 let query=client.from(resource).select(columns,{count:'exact'});
 const q=filters.q?.replace(/[%_(),.\\]/g,' ').trim().slice(0,100);
 const search=resource==='applications'||resource==='appointments'?'full_name':resource==='contact_messages'?'name':['services','posts'].includes(resource)?'title':resource==='faqs'?'question':resource==='slides'?'headline':'name';
 if(q)query=query.ilike(search,`%${q}%`);
 if(filters.status&&['applications','appointments'].includes(resource))query=query.eq('status',filters.status);
 if(filters.country&&resource==='applications')query=query.eq('first_choice_country',filters.country);
 if(['applications','appointments','contact_messages'].includes(resource)&&filters.from&&/^\d{4}-\d{2}-\d{2}$/.test(filters.from))query=query.gte('created_at',`${filters.from}T00:00:00+01:00`);
 if(['applications','appointments','contact_messages'].includes(resource)&&filters.to&&/^\d{4}-\d{2}-\d{2}$/.test(filters.to))query=query.lte('created_at',`${filters.to}T23:59:59.999+01:00`);
 if(resource==='contact_messages'&&['read','unread'].includes(filters.read||''))query=query.eq('is_read',filters.read==='read');
 return query.order(['applications','appointments','contact_messages'].includes(resource)?'created_at':resource==='posts'?'published_at':resource==='testimonials'?'name':'sort_order',{ascending:!['applications','appointments','contact_messages','posts'].includes(resource)}).returns<AdminListRow[]>();
}
