'use client';

import { CursorHoverCard } from '@/components/ui/cursor-hover-card';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import { gsap } from 'gsap';
import type { ProjectItem } from '@/lib/content/home';

type ProjectsSectionProps = {
  projects: ProjectItem[];
};

type ProjectRevealTextProps = {
  text: string;
  className?: string;
  characterClassName?: string;
  mode?: 'characters' | 'words';
};

function ProjectRevealText({ text, className, characterClassName = 'text-gradient-black-gray', mode = 'characters' }: ProjectRevealTextProps) {
  if (mode === 'words') {
    return (
      <span className={className} aria-label={text} data-project-reveal data-project-reveal-mode="words">
        {text.split(' ').map((word, wordIndex, words) => (
          <span key={`${word}-${wordIndex}`} className="inline-flex overflow-hidden whitespace-nowrap align-baseline" aria-hidden="true">
            <span className={`inline-flex ${characterClassName}`} data-project-word>
              {word}
            </span>
            {wordIndex < words.length - 1 ? <span className="whitespace-pre"> </span> : null}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className} aria-label={text} data-project-reveal data-project-reveal-mode="characters">
      {text.split(' ').map((word, wordIndex, words) => (
        <span key={`${word}-${wordIndex}`} className="inline-flex whitespace-nowrap" aria-hidden="true">
          {Array.from(word).map((character, characterIndex) => (
            <span key={`${character}-${characterIndex}`} className="inline-flex overflow-hidden align-baseline">
              <span className={`inline-flex ${characterClassName}`} data-project-character>
                {character}
              </span>
            </span>
          ))}
          {wordIndex < words.length - 1 ? <span className="whitespace-pre"> </span> : null}
        </span>
      ))}
    </span>
  );
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const playImageInterference = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const surface = event.currentTarget.querySelector<HTMLElement>('[data-project-image-surface]');

    if (!surface) {
      return;
    }

    gsap.killTweensOf(surface);
    gsap.timeline()
      .to(surface, { filter: 'blur(3px) saturate(1.25)', x: -3, y: 2, scale: 1.012, duration: 0.11, ease: 'power2.out' })
      .to(surface, { filter: 'blur(1.5px) saturate(0.92)', x: 3, y: -1, scale: 1.006, duration: 0.1, ease: 'power2.out' })
      .to(surface, { filter: 'blur(2.5px) saturate(1.12)', x: -1, y: -2, scale: 1.01, duration: 0.1, ease: 'power2.out' })
      .to(surface, { filter: 'blur(0) saturate(1)', x: 0, y: 0, scale: 1, duration: 0.28, ease: 'power3.out', clearProps: 'filter,transform' });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const revealBlocks = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-project-reveal]'));
    const imageBlocks = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-project-image]'));
    const imageCovers = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-project-image-cover]'));
    const allCharacters = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-project-character]'));
    const allWords = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-project-word]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set([...allCharacters, ...allWords], { yPercent: 0, autoAlpha: 1 });
      gsap.set(imageCovers, { autoAlpha: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(allCharacters, { yPercent: 110, autoAlpha: 0 });
      gsap.set(allWords, { yPercent: 110, autoAlpha: 0 });
      gsap.set(imageCovers, { xPercent: 0 });
    }, section);

    const revealedTextBlocks = new Set<Element>();
    const textObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || revealedTextBlocks.has(entry.target)) {
            return;
          }

          revealedTextBlocks.add(entry.target);
          const mode = entry.target.getAttribute('data-project-reveal-mode');
          const targets = gsap.utils.toArray<HTMLElement>(
            entry.target.querySelectorAll(mode === 'words' ? '[data-project-word]' : '[data-project-character]'),
          );

          gsap.to(targets, {
            yPercent: 0,
            autoAlpha: 1,
            duration: mode === 'words' ? 0.58 : 0.72,
            ease: 'power3.out',
            stagger: mode === 'words' ? 0 : 0.018,
          });

          textObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.25 },
    );

    const revealedImages = new Set<Element>();
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || revealedImages.has(entry.target)) {
            return;
          }

          revealedImages.add(entry.target);
          const leftCover = entry.target.querySelector('[data-project-image-cover="left"]');
          const rightCover = entry.target.querySelector('[data-project-image-cover="right"]');

          gsap.timeline({ defaults: { duration: 1.05, ease: 'expo.inOut' } })
            .to(leftCover, { xPercent: -100 }, 0)
            .to(rightCover, { xPercent: 100 }, 0);

          imageObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '20% 0px -8% 0px', threshold: 0.01 },
    );

    revealBlocks.forEach((block) => textObserver.observe(block));
    imageBlocks.forEach((block) => imageObserver.observe(block));

    return () => {
      textObserver.disconnect();
      imageObserver.disconnect();
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="box-border bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="Projects section">
      <div className="container mx-auto">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start md:gap-14">
          <h2 className="m-0 max-w-[13ch] -translate-y-4 pb-2 text-[clamp(2.8rem,5vw,4.8rem)] leading-[1.15] tracking-tight text-gradient-black-gray md:-translate-y-6">
            <ProjectRevealText text="Designing AI products with intent" />
          </h2>
          <p className="m-0 max-w-[38rem] justify-self-start text-sm leading-7 text-black/60 md:ml-auto md:pt-30 md:text-right md:text-base">
            <ProjectRevealText
              text="I craft end-to-end artificial intelligence systems and agentic pipelines, from experimental interfaces to production-ready workflows that turn complex ideas into clear, useful product experiences."
              className="text-black/60"
              characterClassName="text-black/60"
              mode="words"
            />
          </p>
        </div>
        <div className="mt-12 flex flex-col gap-20 md:gap-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const primaryWidth = isEven ? 'md:basis-[calc(66.666%-0.5rem)]' : 'md:basis-[calc(33.333%-0.5rem)]';
            const secondaryWidth = isEven ? 'md:basis-[calc(33.333%-0.5rem)]' : 'md:basis-[calc(66.666%-0.5rem)]';
            const fallbackClass = 'bg-gradient-to-br from-[#cfc7bb] via-[#a6b7a4] to-[#5c6c63]';
            const imageStyle = project.imageUrl ? { backgroundImage: `url('${project.imageUrl}')` } : undefined;

            return (
              <CursorHoverCard key={project.name} label="View now" iconVariant="arrow-up-right" iconOnly className="relative block">
                <a
                  href={project.href}
                  className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  <article>
                    <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden md:snap-none md:overflow-x-visible md:overflow-y-visible">
                      <div
                        data-project-image
                        onPointerEnter={playImageInterference}
                        className={`${primaryWidth} project-image-frame relative aspect-video w-[90%] shrink-0 snap-start overflow-hidden rounded-2xl md:shrink-0`}
                        aria-hidden="true"
                      >
                        <div data-project-image-surface className={`absolute inset-0 rounded-2xl border border-black/20 bg-cover bg-center will-change-[filter,transform] ${project.imageUrl ? '' : fallbackClass}`} style={imageStyle} />
                        <span data-project-image-cover="left" className="absolute inset-y-0 left-0 z-10 w-1/2 bg-white" />
                        <span data-project-image-cover="right" className="absolute inset-y-0 right-0 z-10 w-1/2 bg-white" />
                      </div>
                      <div
                        data-project-image
                        onPointerEnter={playImageInterference}
                        className={`${secondaryWidth} project-image-frame relative aspect-video w-[90%] shrink-0 snap-start overflow-hidden rounded-2xl md:shrink-0`}
                        aria-hidden="true"
                      >
                        <div data-project-image-surface className={`absolute inset-0 rounded-2xl border border-black/20 bg-cover bg-center will-change-[filter,transform] ${project.imageUrl ? '' : fallbackClass}`} style={imageStyle} />
                        <span data-project-image-cover="left" className="absolute inset-y-0 left-0 z-10 w-1/2 bg-white" />
                        <span data-project-image-cover="right" className="absolute inset-y-0 right-0 z-10 w-1/2 bg-white" />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <span className="inline-flex items-center gap-3 text-xl leading-none tracking-tight text-gradient-black-gray md:text-2xl">
                        <span className="relative inline-flex items-center transition-transform duration-500 ease-out group-hover:translate-x-8">
                          <span className="absolute left-0 inline-flex -translate-x-8 translate-y-[0.08em] text-black opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" aria-hidden="true">
                            <ArrowRight size={22} />
                          </span>
                          <ProjectRevealText text={project.name} />
                        </span>
                      </span>
                      <p className="m-0 max-w-[32rem] text-left text-sm leading-relaxed text-black/60 md:mr-20 md:text-right md:text-base">
                        <ProjectRevealText text={project.description} className="text-black/60" characterClassName="text-black/60" mode="words" />
                      </p>
                    </div>
                  </article>
                </a>
              </CursorHoverCard>
            );
          })}
        </div>

        <div className="mt-20 flex justify-center">
          <a href="https://github.com/quasar082" target="_blank" rel="noopener noreferrer" aria-label="View more projects on GitHub">
            <InteractiveHoverButton>View More</InteractiveHoverButton>
          </a>
        </div>
      </div>
    </section>
  );
}