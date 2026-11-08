import { getPosts } from '@/lib/content';
import { PageHero, NewsCards, Empty } from '@/components/sections';
export const metadata={title:'News & Insights'};
export default async function News(){const posts=await getPosts();return <><PageHero eyebrow="News & insights" title="Latest from Reign Study Hub"/><section className="section"><div className="container">{posts.length?<NewsCards posts={posts}/>:<Empty message="No news has been published yet. Check back for updates from our team."/>}</div></section></>}
