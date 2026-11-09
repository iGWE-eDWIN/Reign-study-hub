import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServices } from '@/lib/content';
import { generateServiceForm } from '@/lib/service-forms';
import { ServiceEnquiryForm } from '@/components/service-enquiry-form';
import { PageHero } from '@/components/sections';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const service=(await getServices()).find(item=>item.slug===slug);return {title:service?`${service.title} enquiry`:'Service enquiry',robots:{index:false,follow:true}};}
export default async function Enquire({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const service=(await getServices()).find(item=>item.slug===slug);if(!service)notFound();
 const definition=generateServiceForm(service);
 return <><PageHero eyebrow="Service enquiry" title={service.title} description="Share the details relevant to your service and our team will guide your next steps."/><section className="section"><div className="container"><Link href={`/services/${slug}`} className="mb-6 inline-block text-sm text-brand-blue hover:underline">← Back to service details</Link><ServiceEnquiryForm slug={slug} definition={definition}/></div></section></>;
}
