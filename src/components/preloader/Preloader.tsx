'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/gsap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { usePreloaderStore } from '@/stores/usePreloaderStore';

const HOMEPAGE_ROUTES = ['/', '/en', '/en/', '/vi', '/vi/'];

/**
 * Preloader with curtain-reveal animation.
 *
 * Always plays on homepage (every page load / refresh).
 * Dispatches `preloaderDone` via store so page animations wait for it.
 */
export default function Preloader() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const { lock, unlock } = useScrollLock();
  const setDone = usePreloaderStore((s) => s.setDone);

  const [phase, setPhase] = useState<'pending' | 'animate' | 'done'>('pending');

  // Decide after hydration: animate or skip
  useEffect(() => {
    const curtain = document.getElementById('preloader-curtain');
    // If inline script already removed the curtain (non-homepage), skip
    if (!curtain) {
      setPhase('done');
      setDone();
      return;
    }

    const isHomepage = HOMEPAGE_ROUTES.includes(pathname);

    if (isHomepage) {
      setPhase('animate');
    } else {
      curtain.remove();
      setPhase('done');
      setDone();
    }
  }, [pathname, setDone]);

  // Lock scroll during animation
  useEffect(() => {
    if (phase === 'animate') {
      lock();
    }
  }, [phase, lock]);

  const onSequenceComplete = useCallback(() => {
    unlock();
    const curtain = document.getElementById('preloader-curtain');
    if (curtain) curtain.remove();
    setPhase('done');
    setDone();
  }, [unlock, setDone]);

  useGSAP(
    () => {
      if (phase !== 'animate') return;

      const curtain = document.getElementById('preloader-curtain');
      if (!curtain || !text1Ref.current || !text2Ref.current) return;

      const topHalf = curtain.children[0] as HTMLElement;
      const bottomHalf = curtain.children[1] as HTMLElement;
      if (!topHalf || !bottomHalf) return;

      // Enable pointer events during animation so curtain blocks interaction
      curtain.style.pointerEvents = 'auto';

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
      tl.to(topHalf, { yPercent: -100, duration: 1, ease: 'power3.inOut' }, 'curtain');
      tl.to(bottomHalf, { yPercent: 100, duration: 1, ease: 'power3.inOut' }, 'curtain');
    },
    { scope: containerRef, dependencies: [phase, onSequenceComplete] }
  );

  if (phase === 'done') return null;

  // Only render text overlays — curtain is in layout.tsx as pure HTML
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[61] pointer-events-none flex items-center justify-center"
    >
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
  );
}
