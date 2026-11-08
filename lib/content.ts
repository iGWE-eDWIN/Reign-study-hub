import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import seed from './seed-content.json';
import photographs from './service-photography.json';
import destinationPhotos from './destination-photography.json';
import type { SiteSettings, Service, Destination, Option, Slide, TeamMember, Post, FAQ, Testimonial, Partner } from '@/types/content';
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
async function rows<T>(table: string, fallback: T[], flag?: string, order = 'sort_order'): Promise<T[]> {
  if (!configured) return fallback;
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!);
  let query = client.from(table).select('*');
  if (flag) query = query.eq(flag,true);
  if (order) query = query.order(order,{ascending: order !== 'published_at'});
  const {data,error} = await query;
  if (error) { console.error(`Content read failed: ${table}`,error.code); throw new Error('Content is temporarily unavailable. Please try again.'); }
  return data as T[];
}
export const getSettings = unstable_cache(async (): Promise<SiteSettings> => {
  if (!configured) return { ...seed.site_settings, whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || seed.site_settings.whatsapp_number };
  const result = await rows<SiteSettings>('site_settings',[],undefined,'');
  if (!result[0]) throw new Error('Site settings are missing. Run the seed script.');
  return { ...result[0], whatsapp_number: result[0].whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '' };
},['site-settings'],{revalidate:300,tags:['content']});
export const getServices = unstable_cache(async()=>(await rows<Service>('services',seed.services,'is_published')).map(service=>{const photo=photographs[service.slug as keyof typeof photographs];return photo&&(!service.image_url||service.image_url.startsWith('/assets/services/'))?{...service,image_url:photo.image_url}:service;}),['services'],{revalidate:300,tags:['content']});
export const getDestinations = unstable_cache(async()=>(await rows<Destination>('destinations',seed.destinations,'is_active')).map(destination=>{const photo=destinationPhotos[destination.name as keyof typeof destinationPhotos];return photo&&(!destination.image_url||destination.image_url===photo.legacy_image_url)?{...destination,image_url:photo.image_url}:destination;}),['destinations'],{revalidate:300,tags:['content']});
export const getLevels = unstable_cache(()=>rows<Option>('programme_levels',seed.programme_levels,'is_active'),['levels'],{revalidate:300,tags:['content']});
export const getServiceTypes = unstable_cache(()=>rows<Option>('appointment_service_types',seed.appointment_service_types,'is_active'),['service-types'],{revalidate:300,tags:['content']});
export const getSlides = unstable_cache(()=>rows<Slide>('slides',seed.slides,'is_active'),['slides'],{revalidate:300,tags:['content']});
export const getTeam = unstable_cache(()=>rows<TeamMember>('team_members',seed.team_members,'is_published'),['team'],{revalidate:300,tags:['content']});
export const getPosts = unstable_cache(async()=>{const posts=await rows<Post>('posts',seed.posts,'is_published','published_at');return posts.length?posts:seed.posts;},['posts-with-starter-content'],{revalidate:300,tags:['content']});
export const getFAQs = unstable_cache(async()=>{const faqs=await rows<FAQ>('faqs',seed.faqs,'is_published');return faqs.length?faqs:seed.faqs;},['faqs-with-starter-content'],{revalidate:300,tags:['content']});
export const getTestimonials = unstable_cache(()=>rows<Testimonial>('testimonials',[],'is_published',''),['testimonials'],{revalidate:300,tags:['content']});
export const getPartners = unstable_cache(()=>rows<Partner>('partners',[],'is_published'),['partners'],{revalidate:300,tags:['content']});
