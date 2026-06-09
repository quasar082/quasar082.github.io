'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const activeExperience = experiences[activeExperienceIndex] ?? experiences[0];

  useEffect(() => {
    const updateActiveExperience = () => {
      const viewportAnchor = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const rect = item.getBoundingClientRect();
        const itemAnchor = rect.top + rect.height * 0.5;
        const distance = Math.abs(itemAnchor - viewportAnchor);

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
  }, [experiences]);

  return (
    <section id="experience" className="box-border min-h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="Experience section">
      <div className="container mx-auto">
        <h2 className="m-0 text-5xl leading-tight tracking-tight text-gradient-black-gray md:text-7xl lg:text-8xl">Experience</h2>

        <div className="mt-12 grid gap-8 [container-type:inline-size] md:grid-cols-2 md:gap-10">
          <div className="md:sticky md:top-1/2 md:h-fit md:-translate-y-1/2 md:py-10">
            <p className="m-0 text-[clamp(2rem,7cqw,5rem)] font-medium leading-[0.95] tracking-[-0.07em] text-gradient-black-gray transition-opacity duration-300" aria-live="polite">
              {activeExperience?.role}
            </p>
          </div>

          <div>
            {experiences.map((experience, index) => {
              const isActive = index === activeExperienceIndex;

              return (
                <article
                  key={`${experience.date}-${experience.role}`}
                  ref={(item) => {
                    itemRefs.current[index] = item;
                  }}
                  className="py-3 md:py-4"
                >
                  <p className={`m-0 text-[clamp(2rem,7cqw,5rem)] font-medium leading-[0.95] tracking-[-0.07em] text-gradient-black-gray transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-35'}`}>
                    {experience.details}
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
