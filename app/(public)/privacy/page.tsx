import { getSettings } from '@/lib/content';
import { PageHero } from '@/components/sections';
export const metadata={title:'Privacy Policy'};
export default async function Privacy(){const s=await getSettings();return <><PageHero eyebrow="Privacy" title="Privacy Policy"/><div className="container max-w-3xl py-14"><div className="rich-copy">{s.privacy_text||'[Content pending] The approved privacy policy has not yet been supplied. Please contact reignstudyabroad@gmail.com with privacy questions.'}</div></div></>}
