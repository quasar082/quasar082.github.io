'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PARALLAX_IMAGE_URL = '/parallax-showcase.jpg';

export function ParallaxImageSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const section = sectionRef.current;
      const image = imageRef.current;

      if (!section || !image) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const travel = image.offsetHeight - rect.height;
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const clampedProgress = Math.min(1, Math.max(0, progress));

      gsap.set(image, { y: -travel * clampedProgress });
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateParallax);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-dvh w-full overflow-hidden bg-black" aria-label="Visual interlude">
      <div
        ref={imageRef}
        className="absolute inset-x-0 top-0 h-[128dvh] will-change-transform bg-cover bg-center"
        style={{ backgroundImage: `url('${PARALLAX_IMAGE_URL}')` }}
        aria-hidden="true"
      />
    </section>
  );
}
