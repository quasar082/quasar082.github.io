import { CursorHoverCard } from '@/components/ui/cursor-hover-card';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import type { ProjectItem } from '@/lib/content/home';

type ProjectsSectionProps = {
  projects: ProjectItem[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="box-border bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="Projects section">
      <div className="container mx-auto">
        <p className="mb-3 text-sm uppercase tracking-[0.32em] text-black/55">My project</p>
        <h2 className="m-0 max-w-full text-5xl leading-tight tracking-tight text-gradient-black-gray md:text-7xl lg:text-8xl">Projects</h2>

        <div className="mt-12 flex flex-col gap-20 md:gap-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const primaryWidth = isEven ? 'md:w-3/4' : 'md:w-1/4';
            const secondaryWidth = isEven ? 'md:w-1/4' : 'md:w-3/4';
            const imageStyle = project.imageUrl ? { backgroundImage: `url('${project.imageUrl}')` } : undefined;

            return (
              <CursorHoverCard key={project.name} label="View now" iconVariant="arrow-up-right" className="relative block">
                <a
                  href={project.href}
                  className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  <article>
                    <div className="flex h-[80vh] min-h-[520px] w-full flex-col gap-4 overflow-hidden md:flex-row">
                      <div
                        className={`${primaryWidth} h-1/2 bg-cover bg-center md:h-full ${project.imageUrl ? '' : project.placeholderClass}`}
                        style={imageStyle}
                        aria-hidden="true"
                      />
                      <div
                        className={`${secondaryWidth} h-1/2 bg-cover bg-center bg-blend-multiply grayscale transition duration-700 group-hover:grayscale-0 md:h-full ${project.imageUrl ? 'bg-black/20' : project.placeholderClass}`}
                        style={imageStyle}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="mt-5 block text-xl leading-none tracking-tight text-gradient-black-gray transition-opacity group-hover:opacity-70 md:text-2xl">
                      {project.name}
                    </span>
                  </article>
                </a>
              </CursorHoverCard>
            );
          })}
        </div>

        <div className="mt-20 flex justify-center">
          <a href="https://github.com/quasar082" target="_blank" rel="noopener noreferrer" aria-label="View more projects on GitHub">
            <InteractiveHoverButton>View More</InteractiveHoverButton>
          </a>
        </div>
      </div>
    </section>
  );
}
