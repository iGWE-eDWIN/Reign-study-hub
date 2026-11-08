import { getDestinations } from '@/lib/content';
import { PageHero, DestinationCards, CTA } from '@/components/sections';
export const metadata={title:'Study Destinations'};
export default async function Destinations(){return <><PageHero eyebrow="Study destinations" title="Explore your global opportunities" description="Explore world-class education in our priority destinations and beyond."/><section className="section"><div className="container"><DestinationCards destinations={await getDestinations()}/></div></section><CTA/></>}
