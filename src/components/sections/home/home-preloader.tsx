'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type HomePreloaderProps = {
  onComplete: () => void;
  onExitStart: () => void;
};

export function HomePreloader({ onComplete, onExitStart }: HomePreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftCoverRef = useRef<HTMLSpanElement>(null);
  const rightCoverRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const hasStartedExitRef = useRef(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const leftCover = leftCoverRef.current;
    const rightCover = rightCoverRef.current;
    const logo = logoRef.current;

    if (!root || !leftCover || !rightCover || !logo) {
      onComplete();
      return;
    }

    const startExit = () => {
      if (hasStartedExitRef.current) {
        return;
      }

      hasStartedExitRef.current = true;
      onExitStart();
    };

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
      startExit();
      finish();
      return;
    }

    const context = gsap.context(() => {
      gsap.set(root, { yPercent: 0, autoAlpha: 1 });
      gsap.set([leftCover, rightCover], { xPercent: 0 });
      gsap.set(logo, { autoAlpha: 0, scale: 0.86, rotate: -6 });

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: finish,
      });

      timeline
        .to({}, { duration: 0.5 })
        .to(leftCover, { xPercent: -100, duration: 0.92 }, 'wordOpen')
        .to(rightCover, { xPercent: 100, duration: 0.92 }, 'wordOpen')
        .to(leftCover, { xPercent: 0, duration: 0.72, delay: 0.24 }, 'wordClose')
        .to(rightCover, { xPercent: 0, duration: 0.72, delay: 0.24 }, 'wordClose')
        .to(logo, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.8)' }, '-=0.2')
        .to(logo, { autoAlpha: 0, y: -24, scale: 0.94, duration: 0.28, ease: 'power2.in' }, '+=0.36')
        .add(startExit, '-=0.02')
        .to(root, { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '<')
        .set(root, { autoAlpha: 0 });
    }, root);

    return () => {
      context.revert();
    };
  }, [onComplete, onExitStart]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white text-black"
      aria-label="Loading Quasar homepage"
      role="status"
    >
      <span className="sr-only">Loading</span>
      <span className="relative grid place-items-center" aria-hidden="true">
        <span className="relative col-start-1 row-start-1 block overflow-hidden">
          <span className="block text-[clamp(3rem,14vw,14rem)] font-medium leading-none tracking-[-0.075em] text-gradient-black-gray">quasar</span>
          <span ref={leftCoverRef} className="absolute inset-y-0 left-0 z-10 w-1/2 bg-white" />
          <span ref={rightCoverRef} className="absolute inset-y-0 right-0 z-10 w-1/2 bg-white" />
        </span>
        <span ref={logoRef} className="invisible col-start-1 row-start-1 inline-flex h-20 w-28 items-center justify-center opacity-0 sm:h-24 sm:w-36">
          <span className="relative block h-12 w-20 sm:h-16 sm:w-28">
            <span className="absolute inset-y-0 left-0 w-[42%] bg-black" />
            <span className="absolute left-[38%] top-0 h-[42%] w-[62%] bg-black" />
          </span>
        </span>
      </span>
    </div>
  );
}
