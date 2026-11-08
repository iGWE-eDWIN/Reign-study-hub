import type { Metadata } from 'next';
import { Montserrat, Open_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { siteUrl } from '@/lib/utils';
import './globals.css';
const montserrat = Montserrat({subsets:['latin'],variable:'--font-montserrat',display:'swap'});
const openSans = Open_Sans({subsets:['latin'],variable:'--font-open-sans',display:'swap'});
export const metadata: Metadata = {
 metadataBase:new URL(siteUrl()),title:{default:'Reign Study Hub | Your Global Education Partner',template:'%s | Reign Study Hub'},
 description:'REIGN STUDY HUB LTD – International education consultancy. University admissions, scholarships, study visas and student support. A subsidiary of PIS INT\'L SYNERGY LTD.',
 openGraph:{type:'website',siteName:'Reign Study Hub',images:[{url:'/assets/logo.png',width:1774,height:887}]},
 twitter:{card:'summary_large_image'},icons:{icon:'/assets/logo-icon.png'},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body className={`${montserrat.variable} ${openSans.variable} font-sans antialiased`}><a href="#main" className="fixed left-4 -top-20 z-[100] rounded bg-white p-4 focus:top-4">Skip to content</a>{children}<Toaster richColors closeButton position="top-right" /></body></html>;
}
