'use client';

import {useRef} from 'react';
import {useTranslations} from 'next-intl';
import {gsap, useGSAP} from '@/lib/gsap';
import {usePreloaderDone} from '@/hooks/usePreloaderDone';
import {TextReveal} from '@/components/animations/TextReveal';
import {ServicesBlock} from '@/components/about/ServicesBlock';

export function AboutSection() {
  const t = useTranslations('About');
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  // Image parallax
  useGSAP(
    () => {
      if (!preloaderDone || !imageRef.current) return;
      gsap.fromTo(
        imageRef.current,
        {yPercent: 8},
        {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    },
    {scope: sectionRef, dependencies: [preloaderDone]},
  );

  // Text parallax (slightly slower than image for depth)
  useGSAP(
    () => {
      if (!preloaderDone || !textRef.current) return;
      gsap.fromTo(
        textRef.current,
        {yPercent: 4},
        {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    },
    {scope: sectionRef, dependencies: [preloaderDone]},
  );

  return (
    <section ref={sectionRef}>
      {/* ===== PART 1: Introduction ===== */}
      <div style={{paddingTop: '14rem', paddingBottom: '14rem'}}>
        <div className="mx-auto max-w-screen-2xl px-6 md:px-8 lg:px-12">
          {/* Large heading — full width */}
          <div className="mb-16 md:mb-24">
            <TextReveal
              as="h2"
              type="words"
              stagger={0.04}
              className="font-display text-text-primary"
              style={{
                fontSize: 'var(--text-display-lg)',
                fontWeight: 'var(--font-weight-display)',
                lineHeight: '1.1',
              }}
            >
              {t('introHeading')}
            </TextReveal>
          </div>

          {/* Image left (4/7) + Text right (3/7) */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8 md:gap-12 items-start">
            {/* Image — order-2 on mobile (below text), order-1 on md+ */}
            <div
              ref={imageRef}
              className="relative order-2 md:order-1 md:col-span-4"
            >
              <div className="relative overflow-hidden">
                <img
                  src="/images/about-deepstriker.png"
                  alt="Deep Striker mech artwork"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
                {/* White blur edges */}
                <div
                  className="absolute inset-x-0 top-0 h-[25%]"
                  style={{background: 'linear-gradient(to bottom, var(--warm-white) 0%, transparent 100%)'}}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[25%]"
                  style={{background: 'linear-gradient(to top, var(--warm-white) 0%, transparent 100%)'}}
                />
                <div
                  className="absolute inset-y-0 left-0 w-[20%]"
                  style={{background: 'linear-gradient(to right, var(--warm-white) 0%, transparent 100%)'}}
                />
                <div
                  className="absolute inset-y-0 right-0 w-[20%]"
                  style={{background: 'linear-gradient(to left, var(--warm-white) 0%, transparent 100%)'}}
                />
              </div>
            </div>

            {/* Text — order-1 on mobile (above image), order-2 on md+ */}
            <div
              ref={textRef}
              className="order-1 md:order-2 md:col-span-3 flex flex-col justify-start"
            >
              {/* Subtitle with icon */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-text-muted" style={{fontSize: 'var(--text-base)'}}>+</span>
                <span
                  className="font-body text-text-muted uppercase tracking-wider"
                  style={{fontSize: 'var(--text-sm)'}}
                >
                  {t('aboutSubtitle')}
                </span>
              </div>

              {/* Bio text */}
              <TextReveal
                as="p"
                type="lines"
                stagger={0.05}
                className="font-body text-text-secondary"
                style={{
                  fontSize: 'var(--text-xl)',
                  lineHeight: '1.8',
                }}
              >
                {t('introBio')}
              </TextReveal>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PART 2: "I can help you with" + 3 service cards ===== */}
      <div style={{paddingTop: '14rem', paddingBottom: '14rem'}}>
        <div className="mx-auto max-w-screen-2xl px-6 md:px-8 lg:px-12">
          <ServicesBlock />
        </div>
      </div>
    </section>
  );
}
