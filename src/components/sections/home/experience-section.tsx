'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const roleViewportRef = useRef<HTMLDivElement | null>(null);
  const roleTrackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const companyRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);

  useEffect(() => {
    let frame = 0;
    const roleTrack = roleTrackRef.current;

    if (!roleTrack) {
      return;
    }

    const setRoleY = gsap.quickTo(roleTrack, 'y', { duration: 0.28, ease: 'power3.out' });

    const updateExperienceProgress = () => {
      frame = 0;
      const roleAnchor = roleViewportRef.current?.getBoundingClientRect().top ?? window.innerHeight * 0.5;
      const roleHeight = roleViewportRef.current?.offsetHeight ?? 0;
      const itemPositions = itemRefs.current.map((item) => item?.getBoundingClientRect().top ?? 0);

      if (!roleHeight || itemPositions.length === 0) {
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

      setRoleY(-clampedProgress * roleHeight);
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
        <div className="mt-12 grid gap-8 [container-type:inline-size] md:grid-cols-2 md:gap-10">
          <div className="md:sticky md:top-1/2 md:h-fit">
            <div ref={roleViewportRef} className="h-[clamp(2.25rem,7.4cqw,5.4rem)] overflow-hidden" aria-live="polite">
              <div ref={roleTrackRef}>
                {experiences.map((experience) => (
                  <p key={`${experience.period}-${experience.role}`} className="m-0 h-[clamp(2.25rem,7.4cqw,5.4rem)] text-right text-[clamp(2rem,7cqw,5rem)] font-medium leading-[0.95] tracking-[-0.07em] text-gradient-black-gray">
                    {experience.role}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div>
            {experiences.map((experience, index) => {
              return (
                <article className='mt-6'
                  key={`${experience.period}-${experience.role}-${experience.company}`}
                  ref={(item) => {
                    itemRefs.current[index] = item;
                  }}
                >
                  <p
                    ref={(company) => {
                      companyRefs.current[index] = company;
                    }}
                    className="m-0 text-[clamp(2rem,7cqw,5rem)] max-h-fit font-medium leading-[1] tracking-[-0.07em] text-gradient-black-gray"
                  >
                    {experience.company}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
