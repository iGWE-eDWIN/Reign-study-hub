'use client';
import Image from '@/components/site-image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Clock3, Mail, MapPin, Menu, X, Globe } from 'lucide-react';
import type { Service, SiteSettings } from '@/types/content';
import { safeHref } from '@/lib/utils';
const discover = [{title:'About Us',href:'/about'},{title:'Meet the MD / Team',href:'/meet-the-md'},{title:'FAQ',href:'/faq'},{title:'Destinations',href:'/destinations'},{title:'Requirements',href:'/requirements'},{title:'News & Insights',href:'/blog'}];
export function Header({settings,services}:{settings:SiteSettings;services:Service[]}) {
 const [open,setOpen]=useState(false); const pathname=usePathname();const drawer=useRef<HTMLDivElement>(null);const toggle=useRef<HTMLButtonElement>(null);const desktopNav=useRef<HTMLElement>(null);
 useEffect(()=>{if(!open)return; const previous=document.body.style.overflow;document.body.style.overflow='hidden'; drawer.current?.querySelector<HTMLElement>('a,button')?.focus();const listener=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus();}if(e.key==='Tab'){const nodes=drawer.current?.querySelectorAll<HTMLElement>('a,button');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',listener);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',listener);};},[open]);
 // Keep native disclosure keyboard behavior while dismissing inactive desktop menus.
 useEffect(()=>{
  const dismissOutside=(event:Event)=>{
   if(!(event.target instanceof Node))return;
   desktopNav.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details=>{
    if(!details.contains(event.target as Node))details.open=false;
   });
  };
  const dismissOnEscape=(event:KeyboardEvent)=>{
   if(event.key!=='Escape')return;
   const active=desktopNav.current?.querySelector<HTMLDetailsElement>('details[open]');
   if(!active)return;
   active.open=false;
   active.querySelector<HTMLElement>('summary')?.focus();
   event.preventDefault();
  };
  document.addEventListener('pointerdown',dismissOutside);
  document.addEventListener('focusin',dismissOutside);
  document.addEventListener('keydown',dismissOnEscape);
  return()=>{
   document.removeEventListener('pointerdown',dismissOutside);
   document.removeEventListener('focusin',dismissOutside);
   document.removeEventListener('keydown',dismissOnEscape);
  };
 },[]);
 useEffect(()=>{desktopNav.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details=>{details.open=false;});},[pathname]);
 const groups=[{title:'Discover',items:discover},{title:'Services',items:[{title:'All Services',href:'/services'},...services.map(s=>({title:s.title,href:`/services/${s.slug}`}))]}];
 return <><div className="bg-navy-dark text-white/80 text-[11px]"><div className="container flex min-h-10 items-center justify-between gap-4 py-2"><span className="hidden max-w-[55%] items-center gap-2 lg:flex"><MapPin size={13} className="shrink-0"/><span className="truncate">{settings.addresses[0]?.address}</span></span><a className="flex items-center gap-2 break-all" href={`mailto:${settings.email}`}><Mail size={13}/>{settings.email}</a><div className="flex items-center gap-4">{settings.working_hours&&<span className="hidden items-center gap-2 sm:flex"><Clock3 size={13}/>{settings.working_hours}</span>}{Object.entries(settings.social_links).map(([name,url])=><a key={name} href={safeHref(url)} aria-label={name} target="_blank" rel="noopener noreferrer"><Globe size={14}/><span className="sr-only">{name}</span></a>)}</div></div></div>
 <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl"><div className="container flex h-22 items-center justify-between gap-2 sm:gap-4"><Link href="/" aria-label="Reign Study Hub home"><Image src={settings.logo_url||'/assets/logo-header.png'} alt={settings.site_name} width={168} height={84} loading="eager" fetchPriority="high" className="h-[70px] w-28 object-contain sm:w-[140px]"/></Link><nav ref={desktopNav} aria-label="Main navigation" className="hidden items-center gap-7 xl:flex"><Link aria-current={pathname==='/'?'page':undefined} href="/" className="text-[13px] font-semibold hover:text-brand-blue">Home</Link>{groups.map(group=><details key={group.title} className="group relative" onToggle={event=>{const current=event.currentTarget;if(current.open)desktopNav.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details=>{if(details!==current)details.open=false;});}}><summary className="flex min-h-12 cursor-pointer list-none items-center gap-1 text-[13px] font-semibold">{group.title}<ChevronDown size={13}/></summary><div className="absolute top-full left-0 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">{group.items.map(item=><Link key={item.href} href={item.href} onClick={e=>e.currentTarget.closest('details')?.removeAttribute('open')} className="block rounded px-4 py-3 text-xs hover:bg-soft">{item.title}</Link>)}</div></details>)}<Link href="/apply" className="text-[13px] font-semibold">Apply Now</Link><Link href="/contact" className="text-[13px] font-semibold">Contact Us</Link></nav><div className="flex shrink-0 items-center gap-2 sm:gap-3"><a href="https://www.pistravels.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit our partner PIS Travels (opens in a new tab)" className="flex min-h-11 items-center rounded p-1 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"><Image src="/images/pis-logo.png" alt="PIS International Travel Consult" width={778} height={210} className="h-auto w-20 object-contain sm:w-36 lg:w-40"/></a><button ref={toggle} onClick={()=>setOpen(true)} aria-label="Open navigation" aria-expanded={open} className="flex h-12 w-12 items-center justify-center xl:hidden"><Menu/></button></div></div></header>
 {open&&<div className="fixed inset-0 z-50 bg-navy-dark/50" onClick={()=>setOpen(false)}><div ref={drawer} role="dialog" aria-modal="true" aria-label="Navigation" className="ml-auto h-dvh w-[min(360px,100%)] overflow-y-auto bg-white p-6" onClick={e=>e.stopPropagation()}><div className="mb-6 flex items-center justify-between"><span className="font-bold text-navy">Explore Reign</span><button aria-label="Close navigation" className="p-3" onClick={()=>{setOpen(false);toggle.current?.focus();}}><X/></button></div><nav aria-label="Mobile navigation">{[{title:'Home',href:'/'},...discover,{title:'Services',href:'/services'},...services.map(s=>({title:s.title,href:`/services/${s.slug}`})),{title:'Apply Now',href:'/apply'},{title:'Contact Us',href:'/contact'}].map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className="block border-b border-slate-100 py-3 text-sm">{item.title}</Link>)}</nav></div></div>}</>;
}
