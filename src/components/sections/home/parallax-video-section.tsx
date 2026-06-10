'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PARALLAX_VIDEO_URL = '/parallax-showcase.mp4';

export function ParallaxVideoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        video,
        { yPercent: -18 },
        {
          yPercent: 18,
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
    <section id="parallax-video" ref={sectionRef} className="relative h-dvh w-full overflow-hidden bg-white mt-50" aria-label="Visual interlude">
      <video
        ref={videoRef}
        className="absolute inset-x-0 -top-[18dvh] h-[136dvh] w-full object-cover will-change-transform"
        src={PARALLAX_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
    </section>
  );
}
