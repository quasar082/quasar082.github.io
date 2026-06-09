'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

type SmoothScrollProviderProps = {
  children: React.ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      duration: 1.05,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    const refreshScrollTriggers = () => {
      ScrollTrigger.refresh();
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const refreshId = window.requestAnimationFrame(refreshScrollTriggers);

    const scrollToHash = (hash: string) => {
      if (!hash) {
        return;
      }

      const id = hash.slice(1);
      if (!id) {
        return;
      }

      const target = document.getElementById(id);
      if (!target) {
        return;
      }

      lenis.scrollTo(target, {
        duration: 1,
      });
    };

    scrollToHash(window.location.hash);

    const onHashChange = () => {
      scrollToHash(window.location.hash);
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('load', refreshScrollTriggers);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('load', refreshScrollTriggers);
      window.cancelAnimationFrame(refreshId);
      gsap.ticker.remove(updateLenis);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return children;
}
