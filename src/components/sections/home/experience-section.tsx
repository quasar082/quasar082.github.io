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
    const getRoleAnchor = () => roleViewportRef.current?.getBoundingClientRect().top ?? window.innerHeight * 0.5;

    const updateActiveExperience = () => {
      const roleAnchor = getRoleAnchor();
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const distance = Math.abs(item.getBoundingClientRect().top - roleAnchor);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveExperienceIndex(closestIndex);
    };

    updateActiveExperience();
    window.addEventListener('scroll', updateActiveExperience, { passive: true });
    window.addEventListener('resize', updateActiveExperience);

    return () => {
      window.removeEventListener('scroll', updateActiveExperience);
      window.removeEventListener('resize', updateActiveExperience);
    };
  }, [experiences.length]);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { overwrite: true } });
    const roleViewport = roleViewportRef.current;
    const roleTrack = roleTrackRef.current;

    if (roleViewport && roleTrack) {
      timeline.to(
        roleTrack,
        {
          y: -activeExperienceIndex * roleViewport.offsetHeight,
          duration: 0.62,
          ease: 'expo.inOut',
        },
        0,
      );
    }

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
          duration: 0.36,
          ease: 'expo.out',
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
