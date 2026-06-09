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
  const companyRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const metaRefs = useRef<(HTMLParagraphElement | null)[]>([]);
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

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { overwrite: true } });
    const role = roleRef.current;

    if (role) {
      timeline.fromTo(
        role,
        { autoAlpha: 0, yPercent: 18, scale: 0.96, filter: 'blur(10px)', clipPath: 'inset(0 0 100% 0)' },
        { autoAlpha: 1, yPercent: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0)', duration: 0.58, ease: 'expo.out' },
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
          x: isActive ? 0 : -10,
          scale: isActive ? 1.015 : 0.985,
          letterSpacing: isActive ? '-0.085em' : '-0.07em',
          filter: isActive ? 'blur(0px)' : 'blur(0.8px)',
          duration: 0.48,
          ease: 'expo.out',
        },
        0,
      );
    });

    const meta = metaRefs.current[activeExperienceIndex];

    if (meta) {
      timeline.fromTo(
        meta,
        { autoAlpha: 0, y: -10, x: -8, filter: 'blur(6px)', clipPath: 'inset(0 100% 0 0)' },
        { autoAlpha: 1, y: 0, x: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)', duration: 0.46, ease: 'power4.out' },
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
                  key={`${experience.date}-${experience.role}`}
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
                    {getCompanyName(experience.details)}
                  </p>
                  {isActive ? (
                    <p
                      ref={(meta) => {
                        metaRefs.current[index] = meta;
                      }}
                      className="m-0 mt-1 text-[clamp(0.75rem,1.3cqw,1rem)] font-medium tracking-[-0.02em] text-black/45"
                    >
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
