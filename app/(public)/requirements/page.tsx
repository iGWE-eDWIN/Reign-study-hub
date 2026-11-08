import { getDestinations } from '@/lib/content';
import { Requirements } from '@/components/interactive';
import { PageHero, CTA } from '@/components/sections';
export const metadata={title:'Country Application Requirements'};
export default async function CountryRequirements({searchParams}:{searchParams:Promise<{country?:string}>}){return <><PageHero eyebrow="Through our system" title="Country Application Requirements" description="Document categories handled through the REIGN STUDY HUB LTD application system."/><section className="section"><div className="container"><Requirements destinations={await getDestinations()} initial={(await searchParams).country}/></div></section><CTA/></>}
