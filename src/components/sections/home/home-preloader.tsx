'use client';

import { useRef, useState } from 'react';

import { getGsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap';

type HomePreloaderProps = {
  heroImagePath: string;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const waitForFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function HomePreloader({ heroImagePath }: HomePreloaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const inlineImageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      const gsap = getGsap();
      const root = rootRef.current;
      const title = titleRef.current;
      const split = splitRef.current;
      const inlineImage = inlineImageRef.current;
      const image = imageRef.current;
      const heroTarget = document.querySelector<HTMLElement>('[data-home-hero-image]');

      if (!root || !title || !split || !inlineImage || !image || !heroTarget || prefersReducedMotion()) {
        setIsComplete(true);
        ScrollTrigger.refresh();
        return;
      }

      let cancelled = false;
      let timeline: gsap.core.Timeline | null = null;

      const complete = () => {
        setIsComplete(true);
        ScrollTrigger.refresh();
      };

      const measure = async () => {
        await document.fonts?.ready.catch(() => undefined);
        await waitForFrame();
        await waitForFrame();

        if (cancelled) return;

        const inlineRect = inlineImage.getBoundingClientRect();
        const targetRect = heroTarget.getBoundingClientRect();
        const startRect = {
          height: inlineRect.height,
          left: window.innerWidth / 2 - inlineRect.width / 2,
          top: window.innerHeight / 2 - inlineRect.height / 2,
          width: inlineRect.width,
        };

        gsap.set(root, { autoAlpha: 1 });
        gsap.set(title, { autoAlpha: 0, scale: 0.98 });
        gsap.set(split, { columnGap: '0.18em', gridTemplateColumns: 'auto 0 auto' });
        gsap.set(inlineImage, { autoAlpha: 0 });
        gsap.set(image, {
          autoAlpha: 0,
          height: startRect.height,
          left: startRect.left,
          top: startRect.top,
          width: startRect.width,
        });

        timeline = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: complete,
        });

        timeline
          .to(title, { autoAlpha: 1, duration: 0.55, scale: 1, ease: 'power2.out' })
          .to(split, {
            columnGap: 'clamp(0.5rem, 1dvw, 1rem)',
            duration: 0.8,
            gridTemplateColumns: `auto ${startRect.width}px auto`,
          }, '+=0.2')
          .to(inlineImage, { autoAlpha: 1, duration: 0.35 }, '<0.2')
          .to(image, { autoAlpha: 1, duration: 0.18 }, '+=0.35')
          .to(inlineImage, { autoAlpha: 0, duration: 0.18 }, '<')
          .to(image, {
            duration: 1,
            height: targetRect.height,
            left: targetRect.left,
            top: targetRect.top,
            width: targetRect.width,
          }, '<0.05')
          .to(title, { autoAlpha: 0, duration: 0.35, scale: 1.02 }, '<0.15')
          .to(root, { autoAlpha: 0, duration: 0.45, ease: 'power2.inOut', pointerEvents: 'none' }, '-=0.1');
      };

      void measure();

      return () => {
        cancelled = true;
        timeline?.kill();
      };
    },
    { dependencies: [heroImagePath], scope: rootRef }
  );

  if (isComplete) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-white text-[#111] opacity-0 motion-reduce:hidden"
      aria-hidden="true"
    >
      <span className="sr-only">QUASAR PORTFOLIO</span>

      <div className="relative flex h-screen w-screen items-center justify-center px-6 [--image-scale:0.16] [--title-size:3dvw] sm:[--image-scale:0.13] sm:[--title-size:1.8dvw] lg:[--image-scale:0.15] lg:[--title-size:1.35dvw] xl:[--image-scale:0.17] xl:[--title-size:2.8dvw] 2xl:[--image-scale:0.2] 2xl:[--title-size:3.4dvw]">
        <div
          ref={titleRef}
          className="absolute inset-0 z-30 grid place-items-center whitespace-nowrap text-[length:var(--title-size)] font-normal leading-none tracking-[-0.04em] text-[#111]"
        >
          <div ref={splitRef} className="grid grid-cols-[auto_0_auto] items-center justify-center gap-x-[0.18em]">
            <span className="justify-self-end">QUASAR</span>
            <div
              ref={inlineImageRef}
              className="h-[calc(100dvh*var(--image-scale))] w-[calc(100dvw*var(--image-scale))] overflow-hidden opacity-0 shadow-2xl [grid-column:2]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImagePath} alt="" decoding="async" className="h-full w-full object-cover" />
            </div>
            <span className="justify-self-start">PORTFOLIO</span>
          </div>
        </div>

        <div ref={imageRef} className="fixed z-40 overflow-hidden opacity-0 shadow-2xl [will-change:top,left,width,height,opacity]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImagePath} alt="" decoding="async" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
