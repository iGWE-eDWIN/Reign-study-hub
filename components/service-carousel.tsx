'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'framer-motion';
import photographs from '@/lib/service-photography.json';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, FileCheck2, GraduationCap, Plane, ShieldCheck, Pause, Play } from 'lucide-react';
import Image from '@/components/site-image';
import type { Service } from '@/types/content';

const icons = [BookOpen, FileCheck2, GraduationCap, ShieldCheck, Plane];

export function ServiceCarousel({ services }: { services: Service[] }) {
  const reducedMotion = useReducedMotion();
  const [viewport, api] = useEmblaCarousel({ align: 'start', loop: true, duration: reducedMotion ? 0 : 45 });
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!api || reducedMotion || !autoPlay || hovered || focused) return;
    const timer = window.setInterval(() => { if (!document.hidden) api.scrollNext(); }, 5500);
    return () => window.clearInterval(timer);
  }, [api, reducedMotion, autoPlay, hovered, focused]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setSnaps(api.scrollSnapList());
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on('select', sync);
    api.on('reInit', sync);
    return () => { api.off('select', sync); api.off('reInit', sync); };
  }, [api, sync]);

  if (!services.length) return <p className="text-sm text-slate-500">Our team can help you find the right support. Please contact us to discuss your plans.</p>;

  return (
    <div className="service-carousel" role="region" aria-roledescription="carousel" aria-label="Our services"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div ref={viewport} className="service-carousel-viewport" tabIndex={0} aria-label="Service cards. Use left and right arrow keys to browse."
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); api?.scrollPrev(); }
          if (event.key === 'ArrowRight') { event.preventDefault(); api?.scrollNext(); }
        }}>
        <div className="service-carousel-track">
          {services.map((service, index) => {
            const Icon = icons[index % icons.length];
            const photo = photographs[service.slug as keyof typeof photographs];
            const imageUrl = service.image_url && !service.image_url.startsWith('/assets/services/') ? service.image_url : photo?.image_url || '/assets/image-placeholder.svg';
            const showCredit = imageUrl === photo?.image_url;
            return (
              <div className="service-carousel-slide" key={service.slug} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${services.length}`}>
                <article className="service-card">
                  <Link className="service-card-link" href={`/services/${service.slug}`}>
                    <div className="service-card-image">
                      <Image src={imageUrl}
                        alt="" fill loading="lazy" sizes="(max-width:767px) 92vw, (max-width:1023px) 82vw, 610px" style={{objectPosition: showCredit ? photo.position : undefined}} />
                      <span className="service-card-number">{String(index + 1).padStart(2, '0')} /</span>
                      {showCredit && <span className="service-card-location">{photo.name}</span>}
                      <span className="service-card-icon"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span>
                    </div>
                    <div className="service-card-body">
                      <h3>{service.title}</h3>
                      <p>{service.short_description}</p>
                      <span className="service-card-footer">Explore service<span className="service-card-arrow"><ArrowUpRight size={19} aria-hidden="true" /></span></span>
                    </div>
                  </Link>
                </article>
              </div>
            );
          })}
        </div>
      </div>
      <div className="service-carousel-bottom">
        <div className="service-carousel-pagination" aria-label="Choose service carousel position">
          {snaps.map((_, index) => <button key={index} aria-label={`Go to service carousel position ${index + 1}`} aria-current={index === selected ? 'true' : undefined}
            onClick={() => api?.scrollTo(index)}><span className={index === selected ? 'is-active' : ''} /></button>)}
        </div>
        <div className="service-carousel-navigation">
          <span className="service-carousel-hint">{!reducedMotion && autoPlay ? 'Slides automatically' : 'Explore your possibilities'}</span>
          {!reducedMotion && <button aria-label={autoPlay ? 'Pause automatic service slides' : 'Play automatic service slides'} onClick={() => { setAutoPlay(value => !value); setFocused(false); }}>{autoPlay ? <Pause size={18} /> : <Play size={18} />}</button>}
          <button aria-label="Previous services" disabled={!canPrev} onClick={() => api?.scrollPrev()}><ArrowLeft size={20} /></button>
          <button aria-label="Next services" disabled={!canNext} onClick={() => api?.scrollNext()}><ArrowRight size={20} /></button>
        </div>
      </div>
      <details className="service-photo-credits"><summary>University photo credits</summary><ul>{Object.entries(photographs).map(([slug, photo]) => <li key={slug}><a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.name}</a> — {photo.author}, <a href={photo.license_url} target="_blank" rel="noopener noreferrer">{photo.license}</a>. Displayed with responsive cropping.</li>)}</ul></details>
    </div>
  );
}
