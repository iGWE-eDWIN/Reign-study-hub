import type { MetadataRoute } from 'next';
import { getPosts, getServices } from '@/lib/content';
import { siteUrl } from '@/lib/utils';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const[services,posts]=await Promise.all([getServices(),getPosts()]);return ['','/about','/meet-the-md','/faq','/services','/destinations','/requirements','/apply','/book-appointment','/contact','/blog','/privacy',...services.map(s=>`/services/${s.slug}`),...posts.map(p=>`/blog/${p.slug}`)].map(path=>({url:`${siteUrl()}${path}`,changeFrequency:'weekly',priority:path===''?1:.7}));}
