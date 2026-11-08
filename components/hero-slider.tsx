'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import Image from '@/components/site-image';
import type { Slide } from '@/types/content';
import { safeHref } from '@/lib/utils';

const slideLabels = ['Your global education partner', 'Explore your opportunities', 'Start your journey'];

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const reducedMotion = useReducedMotion();
  const autoplay = useRef(Autoplay({ delay: 7500, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [viewport, api] = useEmblaCarousel({ loop: true, duration: reducedMotion ? 0 : 40 }, reducedMotion ? [] : [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const [playing, setPlaying] = useState(true);

  const syncSlide = useCallback(() => {
    if (!api) return;
    const index = api.selectedScrollSnap();
    setSelected(index);
    setLoaded(current => current.includes(index) ? current : [...current, index]);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const updatePlaying = () => setPlaying(autoplay.current.isPlaying());
    api.on('select', syncSlide);
    api.on('autoplay:play', updatePlaying);
    api.on('autoplay:stop', updatePlaying);
    return () => {
      api.off('select', syncSlide);
      api.off('autoplay:play', updatePlaying);
      api.off('autoplay:stop', updatePlaying);
    };
  }, [api, syncSlide]);

  if (!slides.length) return null;
  const active = slides[selected] || slides[0];
  const words = active.headline.split(' ');
  const lead = words.slice(0, -2).join(' ');
  const accent = words.slice(-2).join(' ');
  const number = (value: number) => String(value).padStart(2, '0');
  const pause = () => { autoplay.current.stop(); setPlaying(false); };

  return (
    <section className="reign-hero" data-atlas={active.image_url.includes("hero-atlas-vintage") ? "vintage" : active.image_url.startsWith("/assets/hero-atlas") ? "true" : undefined} aria-label="Study abroad highlights" aria-roledescription="carousel"
      onFocusCapture={event => { if ((event.target as HTMLElement).closest('a')) pause(); }}>
      <div ref={viewport} className="reign-hero-viewport">
        <div className="reign-hero-track">
          {slides.map((slide, index) => (
            <div className="reign-hero-photo" key={slide.id || index} role="group" aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`} aria-hidden={index !== selected}>
              {slide.image_url && loaded.includes(index) && (
                <Image src={slide.image_url} alt="" fill sizes="100vw"
                  loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="reign-hero-image" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="reign-hero-shade" />
      <div className="container reign-hero-content">
        <motion.div key={selected} className="reign-hero-copy"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}>
          <p className="reign-hero-kicker"><span />{active.tagline === active.headline ? 'Welcome to Reign Study Hub' : active.tagline}</p>
          <h1 className="reign-hero-title">{lead && <>{lead}<br /></>}<span>{accent}</span></h1>
          <p className="reign-hero-description">{active.subtext}</p>
          <div className="reign-hero-actions">
            <Link href={safeHref(active.cta_link)} className="reign-hero-primary">
              {active.cta_label}<ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <Link href={active.cta_link === '/book-appointment' ? '/services' : '/book-appointment'} className="reign-hero-secondary">
              {active.cta_link === '/book-appointment' ? 'Explore our services' : 'Book a consultation'}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className="reign-hero-signature">University admissions <span />Scholarship guidance <span />Visa support</p>
        </motion.div>
        <div className="reign-hero-index" aria-hidden="true"><strong>{number(selected + 1)}</strong><span />{number(slides.length)}</div>
      </div>
      <div className="reign-hero-bottom">
        <div className="container reign-hero-bottom-inner">
          <div className="reign-hero-steps" aria-label="Choose a slide">
            {slides.map((slide, index) => (
              <button key={slide.id || index} className={`reign-hero-step ${index === selected ? 'is-active' : ''}`}
                aria-label={`Slide ${index + 1}: ${slide.headline}`} aria-current={index === selected ? 'true' : undefined}
                onClick={() => { pause(); api?.scrollTo(index); }}>
                <span className="reign-hero-step-number">{number(index + 1)}</span>
                <span className="reign-hero-step-title">{slideLabels[index] || slide.headline}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="reign-hero-controls">
            {!reducedMotion && slides.length > 1 && <button aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              onClick={() => { if (autoplay.current.isPlaying()) pause(); else { autoplay.current.play(); setPlaying(true); } }}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>}
            <button aria-label="Previous slide" onClick={() => { pause(); api?.scrollPrev(); }}><ArrowLeft size={20} /></button>
            <button aria-label="Next slide" onClick={() => { pause(); api?.scrollNext(); }}><ArrowRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
