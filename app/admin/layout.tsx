import type { Metadata } from 'next';
export const metadata:Metadata={title:{default:'Admin | Reign Study Hub',template:'%s | Reign Admin'},robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default function AdminRoot({children}:{children:React.ReactNode}){return children;}
