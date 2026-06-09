'use client';

import { useEffect, useRef, useState } from 'react';
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

    return `01/${startMonth.padStart(2, '0')}/${startYear.slice(-2)} - 01/${endMonth.padStart(2, '0')}/${endYear.slice(-2)}`;
  }

  const yearRange = normalizedDate.match(/^(\d{4})-(\d{4})$/);

  if (yearRange) {
    return `01/01/${yearRange[1].slice(-2)} - 01/01/${yearRange[2].slice(-2)}`;
  }

  return normalizedDate;
}

function formatExperienceMeta(date: string) {
  return `${formatExperienceDate(date)} · Full time. Onsite`;
}

function getCompanyName(details: string) {
  return details.split(/\s[-–]\s|\.\s/)[0] ?? details;
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const roleRef = useRef<HTMLParagraphElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const isSnappingRef = useRef(false);
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

    const snapToExperience = (index: number) => {
      const targetItem = itemRefs.current[index];
      const section = sectionRef.current;

      if (!targetItem || !section) {
        return;
      }

      const roleAnchor = getRoleAnchor();
      const targetTop = window.scrollY + targetItem.getBoundingClientRect().top - roleAnchor;
      isSnappingRef.current = true;
      setActiveExperienceIndex(index);
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
      window.setTimeout(() => {
        isSnappingRef.current = false;
      }, 420);
    };

    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;

      if (!section || isSnappingRef.current || Math.abs(event.deltaY) < 8) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const isInsideExperience = rect.top <= window.innerHeight * 0.52 && rect.bottom >= window.innerHeight * 0.48;

      if (!isInsideExperience) {
        return;
      }

      const nextIndex = Math.min(experiences.length - 1, Math.max(0, activeExperienceIndex + (event.deltaY > 0 ? 1 : -1)));

      if (nextIndex === activeExperienceIndex) {
        return;
      }

      event.preventDefault();
      snapToExperience(nextIndex);
    };

    updateActiveExperience();
    window.addEventListener('scroll', updateActiveExperience, { passive: true });
    window.addEventListener('resize', updateActiveExperience);
    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', updateActiveExperience);
      window.removeEventListener('resize', updateActiveExperience);
      window.removeEventListener('wheel', onWheel);
    };
  }, [activeExperienceIndex, experiences.length]);

  return (
    <section ref={sectionRef} id="experience" className="box-border min-h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="Experience section">
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
                <article className='mt-3'
                  key={`${experience.date}-${experience.role}`}
                  ref={(item) => {
                    itemRefs.current[index] = item;
                  }}
                >
                  <p className={`m-0 text-[clamp(2rem,7cqw,5rem)] max-h-fit font-medium leading-[1] tracking-[-0.07em] text-gradient-black-gray transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-35'}`}>
                    {getCompanyName(experience.details)}
                  </p>
                  {isActive ? (
                    <p className="m-0 mt-1 text-[clamp(0.75rem,1.3cqw,1rem)] font-medium tracking-[-0.02em] text-black/45">
                      {formatExperienceMeta(experience.date)}
                    </p>
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
