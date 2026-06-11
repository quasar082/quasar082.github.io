'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion, useScroll, useTransform } from 'motion/react';
import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

const EXPERIENCE_TYPE_CLASS = 'text-[clamp(1rem,11cqw,6rem)] leading-[1]';
const EXPERIENCE_TEXT_CLASS = 'font-medium tracking-[-0.03em] text-gradient-black-gray';
const EXPERIENCE_ROW_CLASS = `h-[1.08em] ${EXPERIENCE_TYPE_CLASS}`;

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyColumnRef = useRef<HTMLDivElement | null>(null);
  const roleViewportRef = useRef<HTMLDivElement | null>(null);
  const roleTrackRef = useRef<HTMLDivElement | null>(null);
  const periodRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const companyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const activePeriod = experiences[activeExperienceIndex]?.period ?? '';
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 75%', 'center 30%'],
  });
  const labelRight = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const labelX = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

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
      const currentRowHeight = roleViewportRef.current?.offsetHeight ?? 0;
      const roleAnchor = window.innerHeight * 0.5;
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
    const period = periodRef.current;

    if (!period) {
      return;
    }

    const timeline = gsap.fromTo(
      period,
      { autoAlpha: 0, y: 6 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        ease: 'power3.out',
        overwrite: true,
      },
    );

    return () => {
      timeline.kill();
    };
  }, [activePeriod]);

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
    <section ref={sectionRef} id="experience" className="relative z-0 box-border min-h-screen bg-white pt-80 pb-100 text-black" aria-label="Experience section">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-10 py-24 md:py-28 lg:py-32">
          <div ref={stickyColumnRef} className="sticky top-1/2 h-fit min-w-0 w-full [container-type:inline-size] relative">
            <motion.div
              className="pointer-events-none absolute bottom-[calc(100%+0.9rem)] z-10 w-max text-right text-[clamp(1rem,6cqw,6rem)] leading-[1] font-medium text-gradient-black-gray opacity-70 will-change-transform"
              style={{ right: labelRight, x: labelX }}
              aria-hidden="true"
            >
              Experience
            </motion.div>
            <div ref={roleViewportRef} className={`w-full overflow-hidden ${EXPERIENCE_ROW_CLASS}`} aria-live="polite">
              <div ref={roleTrackRef}>
                {experiences.map((experience) => (
                  <p key={`${experience.period}-${experience.role}`} className={`m-0 flex w-full min-w-0 items-start justify-end text-right ${EXPERIENCE_ROW_CLASS}`}>
                    <span className={EXPERIENCE_TEXT_CLASS}>{experience.role}</span>
                  </p>
                ))}
              </div>
            </div>
            <div ref={periodRef} className="absolute right-0 top-[calc(100%+0.5rem)] text-right text-[clamp(1rem,2.3cqw,6rem)] font-medium text-black/60 opacity-70">
              {activePeriod}
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
