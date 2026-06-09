'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

function formatExperienceDate(date: string) {
  const normalizedDate = date.replace(/[()]/g, '');
  const matches = [...normalizedDate.matchAll(/(\d{1,2})\/(\d{4})/g)];

  if (matches.length === 2) {
    const [startMonth, startYear] = [matches[0][1], matches[0][2]];
    const [endMonth, endYear] = [matches[1][1], matches[1][2]];

    return `1/${startMonth}/${startYear.slice(-2)} - 1/${endMonth}/${endYear.slice(-2)}`;
  }

  const yearRange = normalizedDate.match(/^(\d{4})-(\d{4})$/);

  if (yearRange) {
    return `1/1/${yearRange[1].slice(-2)} - 1/1/${yearRange[2].slice(-2)}`;
  }

  return normalizedDate;
}

function formatExperienceMeta(experience: ExperienceItem) {
  return [formatExperienceDate(experience.period), experience.employmentType, experience.workMode, experience.location].filter(Boolean).join(' · ');
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const roleRef = useRef<HTMLParagraphElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const companyRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const metaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const activeExperience = experiences[activeExperienceIndex] ?? experiences[0];

  useEffect(() => {
    const getRoleAnchor = () => roleRef.current?.getBoundingClientRect().top ?? window.innerHeight * 0.5;

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
    const role = roleRef.current;

    if (role) {
      timeline.fromTo(
        role,
        { autoAlpha: 0, yPercent: 12, scale: 0.98, clipPath: 'inset(0 0 100% 0)' },
        { autoAlpha: 1, yPercent: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.45, ease: 'expo.out' },
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

    const meta = metaRefs.current[activeExperienceIndex];

    if (meta) {
      timeline.fromTo(
        meta,
        { autoAlpha: 0, height: 0, y: -8, x: -6, clipPath: 'inset(0 100% 0 0)' },
        {
          autoAlpha: 1,
          height: 'auto',
          y: 0,
          x: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.34,
          ease: 'power4.out',
        },
        0.1,
      );
    }

    return () => {
      timeline.kill();
    };
  }, [activeExperienceIndex]);

  return (
    <section ref={sectionRef} id="experience" className="box-border  bg-white  text-black my-100" aria-label="Experience section">
      <div className="container mx-auto">
        <div className="mt-12 grid gap-8 [container-type:inline-size] md:grid-cols-2 md:gap-10">
          <div className="md:sticky md:top-1/2 md:h-fit">
            <p ref={roleRef} className="m-0 text-[clamp(2rem,7cqw,5rem)] text-right font-medium tracking-[-0.07em] text-gradient-black-gray transition-opacity duration-300" aria-live="polite">
              {activeExperience?.role}
            </p>
          </div>

          <div>
            {experiences.map((experience, index) => {
              const isActive = index === activeExperienceIndex;

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
                  {isActive ? (
                    <div
                      ref={(meta) => {
                        metaRefs.current[index] = meta;
                      }}
                      className="overflow-hidden"
                    >
                      <p className="m-0 mt-1 text-[clamp(0.75rem,1.3cqw,1rem)] font-medium tracking-[-0.02em] text-black/45">
                        {formatExperienceMeta(experience)}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
