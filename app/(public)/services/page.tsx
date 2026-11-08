import { getServices } from '@/lib/content';
import { PageHero, ServiceCards, CTA } from '@/components/sections';
export const metadata={title:'Our Services'};
export default async function Services(){return <><PageHero eyebrow="Our services" title="Guidance from ambition to arrival" description="Comprehensive support for your study abroad journey."/><section className="section"><div className="container"><ServiceCards services={await getServices()}/></div></section><CTA/></>}
