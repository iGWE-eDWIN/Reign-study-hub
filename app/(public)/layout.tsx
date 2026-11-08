import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getServices, getSettings } from '@/lib/content';
export default async function PublicLayout({children}:{children:React.ReactNode}) {
 const [settings,services]=await Promise.all([getSettings(),getServices()]);
 return <><Header settings={settings} services={services}/><main id="main">{children}</main><Footer settings={settings} services={services}/></>;
}
