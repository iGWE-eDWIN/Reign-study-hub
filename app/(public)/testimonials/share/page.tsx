import { PageHero } from '@/components/sections';
import { TestimonialForm } from '@/components/testimonial-form';
export const metadata={title:'Share your experience',description:'Share your experience with Reign Study Hub and help future students plan their journey.'};
export default function ShareTestimonial(){return <><PageHero eyebrow="Student experiences" title="Your story can inspire someone’s next step" description="Tell us about your experience with Reign Study Hub."/><section className="section"><div className="container max-w-4xl"><TestimonialForm/></div></section></>;}
