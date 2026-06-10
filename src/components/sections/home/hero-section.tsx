'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const heroVideoPath = '/hero/DNA 3D Animation by Tridimensi on Dribbble.mp4';

type HeroSectionProps = {
  playIntro?: boolean;
};

type SplitRevealTextProps = {
  text: string;
  className: string;
  characterClassName?: string;
  delayGroup: string;
};

function SplitRevealText({ text, className, characterClassName, delayGroup }: SplitRevealTextProps) {
  return (
    <span className={className} aria-label={text} data-hero-reveal={delayGroup}>
      {Array.from(text).map((character, index) => (
        <span key={`${character}-${index}`} className="inline-block overflow-hidden align-baseline leading-[inherit] pb-[0.06em]" aria-hidden="true">
          <span className={`inline-block leading-[inherit] text-gradient-black-gray ${characterClassName ?? ''}`} data-hero-character>
            {character === ' ' ? ' ' : character}
          </span>
        </span>
      ))}
    </span>
  );
}

export function HeroSection({ playIntro = false }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !playIntro) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const characters = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-hero-character]'));

    if (reduceMotion) {
      gsap.set(characters, { yPercent: 0, autoAlpha: 1 });
      return;
    }

    const context = gsap.context(() => {
      const scrollLabel = section.querySelector('[data-hero-scroll]');
      const revealLines = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-hero-reveal]'));

      gsap.set(characters, { yPercent: 100, autoAlpha: 0 });
      gsap.set(scrollLabel, { y: 18, autoAlpha: 0 });

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      revealLines.forEach((line) => {
        const lineCharacters = gsap.utils.toArray<HTMLElement>(line.querySelectorAll('[data-hero-character]'));

        timeline.to(
          lineCharacters,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.86,
            stagger: 0.045,
          },
          0,
        );
      });

      timeline.to(scrollLabel, { y: 0, autoAlpha: 1, duration: 0.55 }, 0.42);
    }, section);

    return () => {
      context.revert();
    };
  }, [playIntro]);

  return (
    <section ref={sectionRef} id="home" data-home-hero-image className="relative flex h-dvh flex-col overflow-hidden px-4 pt-24 text-black sm:px-6 lg:px-8" aria-label="Hero section">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideoPath}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto mt-auto pb-15 [@media(min-height:900px)]:pb-25">
        <div className="flex w-full flex-col items-center justify-between md:flex-row">
          <div className="mt-auto flex h-full w-fit items-end justify-end leading-none md:justify-start">
            <div data-hero-scroll className="opacity-45">
              <p className="m-0 text-[clamp(0.85rem,1.35vw,1.1rem)] font-semibold leading-none tracking-[-0.03em] text-gradient-black-gray">Scroll</p>
            </div>
          </div>

          <div className="w-4/5 flex-shrink-0 md:w-3/5">
            <div className="@container w-full">
              <p className="w-fit whitespace-nowrap text-[clamp(1rem,32.1cqw,100rem)] font-medium leading-[0.95] text-gradient-black-gray md:text-[clamp(1rem,32.1cqw,100rem)]">
                <SplitRevealText text="quasar" className="block" delayGroup="primary" />
              </p>
            </div>

            <div className="mt-8 ml-auto w-full">
              <p className="m-0 text-left text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-gradient-black-gray">
                <SplitRevealText text="Harness AI" className="block" delayGroup="secondary" />
              </p>
              <p className="mt-2 m-0 text-left text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-gradient-black-gray">
                <SplitRevealText text="Shape what's next." className="block" delayGroup="secondary" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
