'use client';

import { memo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ContactSocial, ExperienceItem } from '@/lib/content/home';
import { ContactSection } from './contact-section';
import { ExperienceSection } from './experience-section';

type ExperienceContactTransitionProps = {
  experiences: ExperienceItem[];
  contactSocials: ContactSocial[];
};

export const ExperienceContactTransition = memo(function ExperienceContactTransition({ experiences, contactSocials }: ExperienceContactTransitionProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contactLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const contactLayer = contactLayerRef.current;

    if (!wrapper || !contactLayer) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(contactLayer, { yPercent: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        contactLayer,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: contactLayer,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, wrapper);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section ref={wrapperRef} className="relative bg-white">
      <ExperienceSection experiences={experiences} />
      <div ref={contactLayerRef} className="relative z-20 -mt-[100vh] h-dvh overflow-hidden will-change-transform">
        <ContactSection contactSocials={contactSocials} />
      </div>
    </section>
  );
});
