'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ContactSocial, ExperienceItem } from '@/lib/content/home';
import { ContactSection } from './contact-section';
import { ExperienceSection } from './experience-section';

type ExperienceContactTransitionProps = {
  experiences: ExperienceItem[];
  contactSocials: ContactSocial[];
};

export function ExperienceContactTransition({ experiences, contactSocials }: ExperienceContactTransitionProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const overlayTriggerRef = useRef<HTMLDivElement>(null);
  const contactLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const overlayTrigger = overlayTriggerRef.current;
    const contactLayer = contactLayerRef.current;

    if (!wrapper || !overlayTrigger || !contactLayer) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(contactLayer, { yPercent: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(contactLayer, { yPercent: 100, force3D: true, willChange: 'transform' });

      gsap.to(contactLayer, {
        yPercent: 0,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: overlayTrigger,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0.35,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onLeave: () => gsap.set(contactLayer, { yPercent: 0 }),
          onEnterBack: () => gsap.set(contactLayer, { willChange: 'transform' }),
          onLeaveBack: () => gsap.set(contactLayer, { yPercent: 100 }),
        },
      });
    }, wrapper);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section ref={wrapperRef} className="relative bg-white">
      <ExperienceSection experiences={experiences} />
      <div ref={overlayTriggerRef} className="relative z-20 -mt-[100vh] h-dvh overflow-hidden">
        <div ref={contactLayerRef} className="h-full will-change-transform">
          <ContactSection contactSocials={contactSocials} />
        </div>
      </div>
    </section>
  );
}
