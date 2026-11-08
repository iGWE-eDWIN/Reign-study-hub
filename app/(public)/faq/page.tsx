import { getFAQs } from '@/lib/content';
import { PageHero, Empty, CTA } from '@/components/sections';
import { FAQAccordion } from '@/components/interactive';
export const metadata={title:'Frequently Asked Questions'};
export default async function FAQ(){const rows=await getFAQs();return <><PageHero eyebrow="FAQ" title="Your questions, answered" description="Contact our team for guidance specific to your study plans."/><section className="section"><div className="container">{rows.length?<FAQAccordion faqs={rows}/>:<Empty message="Frequently asked questions are being prepared. Our team can help with your questions directly."/>}</div></section><CTA/></>}
