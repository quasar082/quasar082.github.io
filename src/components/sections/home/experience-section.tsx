'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

const EXPERIENCE_TEXT_CLASS = 'text-[clamp(2rem,7cqw,5rem)] font-medium leading-[1] tracking-[-0.07em] text-gradient-black-gray';
const ROLE_ROW_MASK_BUFFER = 5;

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const roleViewportRef = useRef<HTMLDivElement | null>(null);
  const roleTrackRef = useRef<HTMLDivElement | null>(null);
  const roleItemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const companyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  useEffect(() => {
    let frame = 0;

    const updateRowHeight = () => {
      frame = 0;
      const measuredRoleHeight = Math.max(...roleItemRefs.current.map((item) => item?.getBoundingClientRect().height ?? 0));
      const measuredCompanyHeight = Math.max(...companyRefs.current.map((company) => company?.getBoundingClientRect().height ?? 0));
      const measuredRowHeight = Math.max(measuredRoleHeight, measuredCompanyHeight);

      if (measuredRowHeight > 0) {
        setRowHeight(Math.ceil(measuredRowHeight + ROLE_ROW_MASK_BUFFER));
      }
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateRowHeight);
    };

    const resizeObserver = new ResizeObserver(requestUpdate);
    const observedElement = roleViewportRef.current?.parentElement;

    if (observedElement) {
      resizeObserver.observe(observedElement);
    }

    requestUpdate();
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      resizeObserver.disconnect();
      window.removeEventListener('resize', requestUpdate);
    };
  }, [experiences.length]);

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
      const currentRowHeight = rowHeight ?? roleViewportRef.current?.offsetHeight ?? 0;
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
  }, [experiences.length, rowHeight]);

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
            <div ref={roleViewportRef} className="overflow-hidden pt-2 mb-2" style={{ height: rowHeight ?? undefined }} aria-live="polite">
              <div ref={roleTrackRef}>
                {experiences.map((experience, index) => (
                  <p
                    key={`${experience.period}-${experience.role}`}
                    className="m-0 flex items-start justify-end text-right"
                    style={{ height: rowHeight ?? undefined }}
                  >
                    <span
                      ref={(roleItem) => {
                        roleItemRefs.current[index] = roleItem;
                      }}
                      className={EXPERIENCE_TEXT_CLASS}
                    >
                      {experience.role}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div>
            {experiences.map((experience, index) => {
              return (
                <article
                  key={`${experience.period}-${experience.role}-${experience.company}`}
                  ref={(item) => {
                    itemRefs.current[index] = item;
                  }}
                  className="flex items-start"
                  style={{ height: rowHeight ?? undefined }}
                >
                  <p className="m-0">
                    <span
                      ref={(company) => {
                        companyRefs.current[index] = company;
                      }}
                      className={EXPERIENCE_TEXT_CLASS}
                    >
                      {experience.company}
                    </span>
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
