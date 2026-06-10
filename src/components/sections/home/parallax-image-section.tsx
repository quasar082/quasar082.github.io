'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PARALLAX_IMAGE_URL = '/parallax-showcase.jpg';

export function ParallaxImageSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;

    if (!section || !image) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        image,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-dvh w-full overflow-hidden bg-white mt-50" aria-label="Visual interlude">
      <div
        ref={imageRef}
        className="absolute inset-x-0 -top-[14dvh] h-[128dvh] will-change-transform bg-cover bg-center"
        style={{ backgroundImage: `url('${PARALLAX_IMAGE_URL}')` }}
        aria-hidden="true"
      />
    </section>
  );
}
