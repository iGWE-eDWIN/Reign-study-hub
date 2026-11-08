import Image from '@/components/site-image';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/content';
import { PageHero } from '@/components/sections';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await getPosts()).find(p=>p.slug===slug);return {title:p?.title||'News',description:p?.excerpt,openGraph:{images:p?.cover_image_url?[p.cover_image_url]:['/assets/logo.png']}};}
export default async function Post({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await getPosts()).find(p=>p.slug===slug);if(!p)notFound();return <><PageHero eyebrow="News & insights" title={p.title} description={p.excerpt}/><article className="container max-w-3xl py-14">{p.cover_image_url&&<Image src={p.cover_image_url} alt={p.title} width={1000} height={600} className="mb-8 h-auto w-full rounded-lg"/>}{p.published_at&&<p className="mb-6 text-xs text-slate-500">Published {new Date(p.published_at).toLocaleDateString('en-GB')}</p>}<div className="rich-copy">{p.content}</div></article></>}
