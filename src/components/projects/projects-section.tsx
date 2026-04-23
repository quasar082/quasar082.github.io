import {getTranslations} from 'next-intl/server';
import {TextReveal} from '@/components/ui/text-reveal';
import {ProjectMasonryGrid} from '@/components/projects/project-masonry-grid';
import {PillButton} from '@/components/ui/pill-button';
import type {Project} from '@/lib/data/projects';

interface ProjectsSectionProps {
  projects: Project[];
  locale: string;
}

export async function ProjectsSection({
  projects,
  locale,
}: ProjectsSectionProps) {
  const t = await getTranslations('Projects');

  return (
    <section
      id="projects"
      className="overflow-hidden px-6 py-section-sm md:px-8 md:py-section lg:px-12"
    >
      <div className="mx-auto max-w-screen-2xl">
        {/* Title */}
        <div className="text-center">
          <TextReveal
            as="h2"
            type="words"
            className="font-display text-text-primary"
            style={{
              fontSize: 'var(--text-display-xl)',
              fontWeight: 'var(--font-weight-display)',
            }}
          >
            {t('heading')}
          </TextReveal>
          {/* Underline accent */}
          <div className="mx-auto mt-4 h-px w-10 bg-greige-500" />
        </div>

        {/* Masonry Grid */}
        <div className="mt-16 md:mt-24">
          <ProjectMasonryGrid projects={projects} locale={locale} />
        </div>

        {/* View More CTA */}
        <div className="mt-16 md:mt-24 text-center">
          <PillButton
            label={t('viewMore')}
            variant="outline"
            href="https://github.com/quasar082"
            external
            icon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
