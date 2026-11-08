'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Pause, Play } from 'lucide-react';
import Image from '@/components/site-image';
import photographs from '@/lib/destination-photography.json';
import type { Destination } from '@/types/content';

function destinationLink(destination: Destination) {
  return destination.requirements.length ? `/requirements?country=${encodeURIComponent(destination.name)}` : '/book-appointment';
}

export function DestinationCarousel({ destinations }: { destinations: Destination[] }) {
  const pictured = destinations.filter(destination => destination.image_url);
  const additional = destinations.filter(destination => !destination.image_url);
  const reducedMotion = useReducedMotion();
  const [viewport, api] = useEmblaCarousel({ align: 'start', loop: true, duration: reducedMotion ? 0 : 45 });
  const [selected, setSelected] = useState(0);
  const [textSlide, setTextSlide] = useState(0);
  const [textReady, setTextReady] = useState<Record<string, boolean>>({});
  const markReady = useCallback((source: string) => {
    setTextReady(current => current[source] ? current : { ...current, [source]: true });
  }, []);
  const activeSource = pictured[selected]?.image_url;
  useEffect(() => {
    const timer = window.setTimeout(() => setTextSlide(selected), reducedMotion ? 0 : 450);
    return () => window.clearTimeout(timer);
  }, [selected, reducedMotion]);
  useEffect(() => {
    if (!activeSource) return;
    // Keep text usable even if an external image is slow or unavailable.
    const timer = window.setTimeout(() => markReady(activeSource), 2200);
    return () => window.clearTimeout(timer);
  }, [activeSource, markReady]);
  const [snaps, setSnaps] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const sync = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setSnaps(Math.max(1, api.scrollSnapList().length));
  }, [api]);
  useEffect(() => {
    if (!api) return;
    const startDrag = () => setDragging(true);
    const endDrag = () => setDragging(false);
    sync();
    api.on('select', sync).on('reInit', sync).on('pointerDown', startDrag).on('pointerUp', endDrag);
    return () => { api.off('select', sync).off('reInit', sync).off('pointerDown', startDrag).off('pointerUp', endDrag); };
  }, [api, sync]);
  useEffect(() => {
    if (!api || pictured.length < 2 || reducedMotion || !autoPlay || hovered || focused || dragging) return;
    const timer = window.setInterval(() => { if (!document.hidden) api.scrollNext(); }, 6000);
    return () => window.clearInterval(timer);
  }, [api, pictured.length, reducedMotion, autoPlay, hovered, focused, dragging]);
  const credits = pictured.flatMap(destination => {
    const photo = photographs[destination.name as keyof typeof photographs];
    return photo && photo.image_url === destination.image_url ? [photo] : [];
  });

  if (!destinations.length) return <p className="text-sm text-slate-500">Contact our team to discuss your preferred study destination.</p>;

  return <div className="destination-carousel">
    {pictured.length > 0 && <div role="region" aria-roledescription="carousel" aria-label="Study destinations"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div ref={viewport} className="destination-carousel-viewport" tabIndex={0} aria-label="Destination cards. Use left and right arrow keys to browse."
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); api?.scrollPrev(); }
          if (event.key === 'ArrowRight') { event.preventDefault(); api?.scrollNext(); }
        }}>
        <div className="destination-carousel-track">
          {pictured.map((destination, index) => <div className="destination-carousel-slide" key={destination.name} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${pictured.length}`} aria-hidden={index !== selected}>
            <Link href={destinationLink(destination)} className="destination-card" tabIndex={index === selected ? 0 : -1}>
              <Image src={destination.image_url} alt="" fill loading="lazy" sizes="(max-width:1279px) 100vw, 1240px" className="destination-card-image" onLoad={() => markReady(destination.image_url)} onError={() => markReady(destination.image_url)} />
              <div className="destination-card-shade" />
              <span className="destination-card-category"><MapPin size={14} aria-hidden="true" />Study destination</span>
              {destination.flag_emoji && <span className="destination-card-flag" aria-hidden="true">{destination.flag_emoji}</span>}
              <div className="destination-card-copy" data-visible={index === selected && textSlide === index && !!textReady[destination.image_url]}>
                <p className="destination-card-eyebrow">Your next chapter</p>
                <h3>{destination.name}</h3>
                {destination.description && <p className="destination-card-description">{destination.description}</p>}
                <div className="destination-card-footer"><span>{destination.requirements.length ? 'Explore study requirements' : 'Discuss your study options'}</span><span className="destination-card-arrow"><ArrowUpRight size={24} aria-hidden="true" /></span></div>
              </div>
            </Link>
          </div>)}
        </div>
      </div>
      {pictured.length > 1 && <div className="destination-carousel-bottom">
        <div className="destination-carousel-position" aria-label={`Carousel position ${selected + 1} of ${snaps}`}><strong>{String(selected + 1).padStart(2, '0')}</strong><span className="destination-carousel-progress" aria-hidden="true"><span style={{ width: `${(selected + 1) / snaps * 100}%` }} /></span><span>{String(snaps).padStart(2, '0')}</span></div>
        <div className="service-carousel-navigation">
          {!reducedMotion && <button aria-label={autoPlay ? 'Pause automatic destination slides' : 'Play automatic destination slides'} onClick={() => { setAutoPlay(value => !value); setFocused(false); }}>{autoPlay ? <Pause size={18} /> : <Play size={18} />}</button>}
          <button aria-label="Previous destination" onClick={() => api?.scrollPrev()}><ArrowLeft size={20} /></button>
          <button aria-label="Next destination" onClick={() => api?.scrollNext()}><ArrowRight size={20} /></button>
        </div>
      </div>}
      {credits.length > 0 && <details className="service-photo-credits"><summary>Destination photo credits</summary><ul>{credits.map(photo => <li key={photo.source}><a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.name}</a> — {photo.author}, <a href={photo.license_url} target="_blank" rel="noopener noreferrer">{photo.license}</a>. Displayed with responsive cropping.</li>)}</ul></details>}
    </div>}
    {additional.length > 0 && <div className="destination-more"><h2>More study destinations</h2><p>Contact our team to explore the options for your preferred destination.</p><div>{additional.map(destination => <Link key={destination.name} href={destinationLink(destination)}>{destination.flag_emoji} {destination.name}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div></div>}
  </div>;
}
