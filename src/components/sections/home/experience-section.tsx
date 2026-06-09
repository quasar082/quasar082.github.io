'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

const EXPERIENCE_TYPE_CLASS = 'text-[clamp(1rem,11cqw,6rem)] leading-[1]';
const EXPERIENCE_TEXT_CLASS = 'font-medium tracking-[-0.03em] text-gradient-black-gray';
const EXPERIENCE_ROW_CLASS = `h-[1.08em] ${EXPERIENCE_TYPE_CLASS}`;

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const roleViewportRef = useRef<HTMLDivElement | null>(null);
  const roleTrackRef = useRef<HTMLDivElement | null>(null);
  const previousPeriodRef = useRef<HTMLDivElement | null>(null);
  const currentPeriodRef = useRef<HTMLDivElement | null>(null);
  const periodValueRef = useRef(experiences[0]?.period ?? '');
  const periodTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const companyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const [periodTransition, setPeriodTransition] = useState(() => ({
    previous: '',
    current: experiences[0]?.period ?? '',
    transitionKey: 0,
  }));

  useEffect(() => {
    let frame = 0;
    const roleTrack = roleTrackRef.current;

    if (!roleTrack) {
      return;
    }

    const setRoleY = (value: number) => {
      gsap.set(roleTrack, { y: value });
    };

    gsap.set(roleTrack, { y: 0 });

    const updateExperienceProgress = () => {
      frame = 0;
      const roleAnchor = roleViewportRef.current?.getBoundingClientRect().top ?? window.innerHeight * 0.5;
      const currentRowHeight = roleViewportRef.current?.offsetHeight ?? 0;
      const itemPositions = companyRefs.current.map((company) => company?.getBoundingClientRect().top ?? 0);

      if (!currentRowHeight || itemPositions.length === 0) {
        return;
      }

      let progressIndex = 0;

      for (let index = 0; index < itemPositions.length - 1; index += 1) {
        const currentTop = itemPositions[index];
        const nextTop = itemPositions[index + 1];

        if (roleAnchor >= currentTop && roleAnchor <= nextTop) {
          const distance = nextTop - currentTop || 1;
          progressIndex = index + (roleAnchor - currentTop) / distance;
          break;
        }

        if (roleAnchor > nextTop) {
          progressIndex = index + 1;
        }
      }

      const clampedProgress = Math.min(experiences.length - 1, Math.max(0, progressIndex));
      const closestIndex = Math.round(clampedProgress);

      setRoleY(-clampedProgress * currentRowHeight);
      setActiveExperienceIndex((currentIndex) => (currentIndex === closestIndex ? currentIndex : closestIndex));
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateExperienceProgress);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [experiences.length]);

  useEffect(() => {
    const nextPeriod = experiences[activeExperienceIndex]?.period ?? '';

    if (periodValueRef.current === nextPeriod) {
      return;
    }

    const previousPeriod = periodValueRef.current;
    periodValueRef.current = nextPeriod;

    setPeriodTransition((current) => ({
      previous: previousPeriod || current.current,
      current: nextPeriod,
      transitionKey: current.transitionKey + 1,
    }));
  }, [activeExperienceIndex, experiences]);

  useEffect(() => {
    const previousPeriod = previousPeriodRef.current;
    const currentPeriod = currentPeriodRef.current;

    periodTimelineRef.current?.kill();

    if (!currentPeriod) {
      return;
    }

    if (periodTransition.transitionKey === 0) {
      gsap.set(currentPeriod, { autoAlpha: 0.7, y: 0 });
      return;
    }

    gsap.set(currentPeriod, { autoAlpha: 0, y: 6, willChange: 'transform, opacity' });

    if (previousPeriod && periodTransition.previous) {
      gsap.set(previousPeriod, { autoAlpha: 0.7, y: 0, willChange: 'transform, opacity' });
    }

    const timeline = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        gsap.set([previousPeriod, currentPeriod].filter(Boolean), { clearProps: 'willChange' });
      },
    });

    if (previousPeriod && periodTransition.previous) {
      timeline.to(
        previousPeriod,
        {
          autoAlpha: 0,
          y: -6,
          duration: 0.32,
          ease: 'power2.out',
        },
        0,
      );
    }

    timeline.to(
      currentPeriod,
      {
        autoAlpha: 0.7,
        y: 0,
        duration: 0.42,
        ease: 'power3.out',
      },
      previousPeriod && periodTransition.previous ? 0.08 : 0,
    );

    periodTimelineRef.current = timeline;

    return () => {
      timeline.kill();
    };
  }, [periodTransition.transitionKey, periodTransition.previous]);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { overwrite: true } });

    companyRefs.current.forEach((company, index) => {
      if (!company) {
        return;
      }

      const isActive = index === activeExperienceIndex;

      timeline.to(
        company,
        {
          autoAlpha: isActive ? 1 : 0.28,
          x: isActive ? 0 : -8,
          scale: isActive ? 1.01 : 0.99,
          duration: 0.28,
          ease: 'power3.out',
        },
        0,
      );
    });

    return () => {
      timeline.kill();
    };
  }, [activeExperienceIndex]);

  return (
    <section ref={sectionRef} id="experience" className="box-border  bg-white  text-black my-100" aria-label="Experience section">
      <div className="container mx-auto">
        <div className="mt-12 grid grid-cols-2 gap-10">
          <div className="sticky top-1/2 h-fit min-w-0 w-full [container-type:inline-size] relative">
            <div ref={roleViewportRef} className={`w-full overflow-hidden ${EXPERIENCE_ROW_CLASS}`} aria-live="polite">
              <div ref={roleTrackRef}>
                {experiences.map((experience) => (
                  <p key={`${experience.period}-${experience.role}`} className={`m-0 flex w-full min-w-0 items-start justify-end text-right ${EXPERIENCE_ROW_CLASS}`}>
                    <span className={EXPERIENCE_TEXT_CLASS}>{experience.role}</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-[calc(100%+0.75rem)] h-5 min-w-max text-right text-sm font-medium uppercase tracking-[0.18em]">
              {periodTransition.previous ? (
                <div
                  key={`previous-${periodTransition.transitionKey}`}
                  ref={previousPeriodRef}
                  className="absolute right-0 top-0 whitespace-nowrap text-gradient-black-gray"
                  aria-hidden="true"
                >
                  {periodTransition.previous}
                </div>
              ) : null}
              <div
                key={`current-${periodTransition.transitionKey}`}
                ref={currentPeriodRef}
                className="absolute right-0 top-0 whitespace-nowrap text-gradient-black-gray"
                style={{ opacity: periodTransition.transitionKey === 0 ? 0.7 : 0 }}
              >
                {periodTransition.current}
              </div>
            </div>
          </div>
         

          <div className="min-w-0 w-full [container-type:inline-size]">
            {experiences.map((experience, index) => {
              return (
                <article
                  key={`${experience.period}-${experience.role}-${experience.company}`}
                  ref={(item) => {
                    itemRefs.current[index] = item;
                  }}
                  className={`flex w-full min-w-0 items-start ${EXPERIENCE_ROW_CLASS}`}
                >
                  <span
                    ref={(company) => {
                      companyRefs.current[index] = company;
                    }}
                    className={EXPERIENCE_TEXT_CLASS}
                  >
                    {experience.company}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
