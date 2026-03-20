'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/gsap';
import { useLenis } from 'lenis/react';

const PRELOADER_KEY = 'rq-preloader-seen';
const HOMEPAGE_ROUTES = ['/', '/en', '/en/', '/vi', '/vi/'];

/**
 * Full-screen preloader with curtain-reveal animation.
 *
 * Strategy against FOUC (flash of unstyled content):
 * - SSR always renders the black curtain overlay (fixed, z-60, covers viewport).
 *   This means the very first paint is black — no white flash possible.
 * - On hydration, an effect checks route + sessionStorage:
 *   • First homepage visit → run text + curtain animation
 *   • Returning visit or non-homepage → unmount immediately
 * - The curtain itself blocks visibility, so no extra body class or
 *   inline script hacks are needed.
 */
export default function Preloader() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // 'pending' = SSR default (curtain visible, waiting for hydration decision)
  // 'animate' = run the full text + curtain sequence
  // 'done' = unmount
  const [phase, setPhase] = useState<'pending' | 'animate' | 'done'>('pending');

  // Decide after hydration: animate or skip
  useEffect(() => {
    const isHomepage = HOMEPAGE_ROUTES.includes(pathname);
    const alreadySeen = sessionStorage.getItem(PRELOADER_KEY) === 'true';

    if (isHomepage && !alreadySeen) {
      setPhase('animate');
    } else {
      setPhase('done');
    }
  }, [pathname]);

  // Lock scroll during animation
  useEffect(() => {
    if (phase === 'animate' && lenis) {
      lenis.stop();
    }
  }, [lenis, phase]);

  const onSequenceComplete = useCallback(() => {
    lenis?.start();
    sessionStorage.setItem(PRELOADER_KEY, 'true');
    setPhase('done');
  }, [lenis]);

  useGSAP(
    () => {
      if (phase !== 'animate') return;
      if (
        !text1Ref.current ||
        !text2Ref.current ||
        !topHalfRef.current ||
        !bottomHalfRef.current
      )
        return;

      const tl = gsap.timeline({ onComplete: onSequenceComplete });

      tl.set(text1Ref.current, { opacity: 0 });
      tl.set(text2Ref.current, { opacity: 0 });

      // "Welcome to party" — fade in, hold, fade out
      tl.to(text1Ref.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
      tl.to({}, { duration: 0.6 });
      tl.to(text1Ref.current, { opacity: 0, duration: 0.6, ease: 'power2.in' });

      // "Quasar" — fade in, hold, fade out
      tl.to(text2Ref.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
      tl.to({}, { duration: 0.6 });
      tl.to(text2Ref.current, { opacity: 0, duration: 0.6, ease: 'power2.in' });

      // Curtain split-reveal
      tl.to(topHalfRef.current, { yPercent: -100, duration: 1, ease: 'power3.inOut' }, 'curtain');
      tl.to(bottomHalfRef.current, { yPercent: 100, duration: 1, ease: 'power3.inOut' }, 'curtain');
    },
    { scope: containerRef, dependencies: [lenis, phase, onSequenceComplete] }
  );

  if (phase === 'done') return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60]">
      {/* Text — centered above curtain halves */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div
          ref={text1Ref}
          className="absolute font-display text-[clamp(1.5rem,4vw,3rem)] uppercase text-white font-light tracking-wider opacity-0"
        >
          Welcome to party
        </div>
        <div
          ref={text2Ref}
          className="absolute font-display text-[clamp(4rem,15vw,12rem)] uppercase text-white font-light tracking-wider opacity-0"
        >
          Quasar
        </div>
      </div>
      {/* Curtain halves */}
      <div ref={topHalfRef} className="absolute inset-x-0 top-0 h-1/2 bg-black" />
      <div ref={bottomHalfRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-black" />
    </div>
  );
}
