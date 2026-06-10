'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type HomePreloaderProps = {
  onComplete: () => void;
};

export function HomePreloader({ onComplete }: HomePreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const word = wordRef.current;
    const logo = logoRef.current;

    if (!root || !word || !logo) {
      onComplete();
      return;
    }

    const finish = () => {
      if (hasCompletedRef.current) {
        return;
      }

      hasCompletedRef.current = true;
      onComplete();
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(root, { autoAlpha: 0, yPercent: -100 });
      finish();
      return;
    }

    const context = gsap.context(() => {
      gsap.set(root, { yPercent: 0, autoAlpha: 1 });
      gsap.set(word, { clipPath: 'inset(0 50% 0 50%)', autoAlpha: 1 });
      gsap.set(logo, { autoAlpha: 0, scale: 0.86, rotate: -6 });

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: finish,
      });

      timeline
        .to(word, { clipPath: 'inset(0 0% 0 0%)', duration: 0.92 })
        .to(word, { clipPath: 'inset(0 50% 0 50%)', duration: 0.72, delay: 0.24 })
        .to(logo, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.8)' }, '-=0.2')
        .to(logo, { autoAlpha: 0, y: -24, scale: 0.94, duration: 0.38, ease: 'power2.in' }, '+=0.48')
        .to(root, { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '-=0.16')
        .set(root, { autoAlpha: 0 });
    }, root);

    return () => {
      context.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white text-black"
      aria-label="Loading Quasar homepage"
      role="status"
    >
      <span className="sr-only">Loading</span>
      <span className="relative grid place-items-center" aria-hidden="true">
        <span ref={wordRef} className="col-start-1 row-start-1 block text-[clamp(3rem,14vw,14rem)] font-medium leading-none tracking-[-0.075em] text-gradient-black-gray">
          quasar
        </span>
        <span ref={logoRef} className="col-start-1 row-start-1 inline-flex h-20 w-28 items-center justify-center sm:h-24 sm:w-36">
          <span className="relative block h-12 w-20 sm:h-16 sm:w-28">
            <span className="absolute inset-y-0 left-0 w-[42%] bg-black" />
            <span className="absolute left-[38%] top-0 h-[42%] w-[62%] bg-black" />
          </span>
        </span>
      </span>
    </div>
  );
}
