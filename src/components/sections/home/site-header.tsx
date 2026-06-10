'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type SiteHeaderProps = {
  isMenuOpen: boolean;
  onOpenMenu?: () => void;
  sticky?: boolean;
  homeHref?: string;
  isVisible?: boolean;
  isInverted?: boolean;
  playIntro?: boolean;
};

type HeaderRevealTextProps = {
  shouldInvertTone: boolean;
};

function HeaderRevealText({ shouldInvertTone }: HeaderRevealTextProps) {
  const text = 'Quasar';

  return (
    <span className="relative grid leading-none">
      <span
        className={`col-start-1 row-start-1 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          shouldInvertTone ? 'opacity-0' : 'opacity-100'
        } text-gradient-black-gray`}
      >
        {Array.from(text).map((character, index) => (
          <span key={`dark-${character}-${index}`} className="inline-flex overflow-hidden align-baseline" aria-hidden="true">
            <span className="inline-flex text-gradient-black-gray" data-header-character>
              {character}
            </span>
          </span>
        ))}
      </span>
      <span className={`col-start-1 row-start-1 transition-opacity duration-300 ease-out motion-reduce:transition-none ${shouldInvertTone ? 'opacity-100' : 'opacity-0'}`}>
        {Array.from(text).map((character, index) => (
          <span key={`light-${character}-${index}`} className="inline-flex overflow-hidden align-baseline" aria-hidden="true">
            <span className="inline-flex" data-header-character>
              {character}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

export function SiteHeader({ isMenuOpen, onOpenMenu, sticky = false, homeHref = '#home', isVisible = true, isInverted = false, playIntro = false }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const hasMenuToggle = typeof onOpenMenu === 'function';
  const shouldInvertTone = isMenuOpen || isInverted;
  const toneClass = shouldInvertTone ? 'text-white' : 'text-black';
  const barClass = shouldInvertTone ? 'bg-white' : 'bg-black';

  useEffect(() => {
    const header = headerRef.current;

    if (!header || !playIntro) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems = gsap.utils.toArray<HTMLElement>(header.querySelectorAll('[data-header-character], [data-header-reveal]'));

    if (reduceMotion) {
      gsap.set(revealItems, { yPercent: 0, y: 0, autoAlpha: 1 });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(revealItems, { yPercent: 110, autoAlpha: 0 });

      gsap.to(revealItems, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.74,
        ease: 'power3.out',
        stagger: 0.035,
        delay: 1,
      });
    }, header);

    return () => {
      context.revert();
    };
  }, [playIntro]);

  return (
    <header
      ref={headerRef}
      className={`${
        sticky
          ? 'fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8 transition-[transform,color] duration-300 ease-out motion-reduce:transition-none'
          : 'relative z-10 transition-colors duration-300 ease-out motion-reduce:transition-none'
      } ${toneClass} ${sticky && !isVisible && !isMenuOpen ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href={homeHref}
          className="inline-flex min-h-11 items-center gap-2.5 text-2xl xl:text-3xl font-semibold leading-none no-underline transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none md:text-4xl"
          aria-label="Quasar home"
        >
          <span className="relative inline-flex overflow-hidden" aria-hidden="true">
            <span className="relative inline-block h-5 w-8" data-header-reveal>
              <span className={`absolute inset-y-0 left-0 w-[42%] transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
              <span className={`absolute left-[38%] top-0 h-[42%] w-[62%] transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
            </span>
          </span>
          <HeaderRevealText shouldInvertTone={shouldInvertTone} />
        </Link>

        {hasMenuToggle ? (
          <button
            type="button"
            className="inline-flex min-h-11 min-w-6 cursor-pointer items-center justify-center bg-transparent p-0 transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none"
            aria-expanded={isMenuOpen}
            aria-controls="hero-menu-overlay"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={onOpenMenu}
          >
            <span className="inline-flex w-full overflow-hidden">
              <span className="relative h-4 w-full xl:h-5" aria-hidden="true" data-header-reveal>
                {isMenuOpen ? (
                  <>
                    <span className={`absolute left-1/2 top-1/2 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 origin-center rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
                    <span className={`absolute left-1/2 top-1/2 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2 -rotate-45 origin-center rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
                  </>
                ) : (
                  <>
                    <span className={`absolute left-1/2 top-0 h-0.5 w-full -translate-x-1/2 rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
                    <span className={`absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
                    <span className={`absolute left-[65%] bottom-0 h-0.5 w-4 -translate-x-1/2 rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none ${barClass}`} />
                  </>
                )}
              </span>
            </span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
