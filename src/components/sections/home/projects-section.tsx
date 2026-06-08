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
        <h2 className="m-0 max-w-full text-2xl leading-tight tracking-tight text-gradient-black-gray">My projects</h2>
        <hr className="border-t border-gray-300 my-2" />
        <div className="mt- flex flex-col gap-20 md:gap-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const primaryWidth = isEven ? 'md:basis-3/5 md:w-3/5' : 'md:basis-2/5 md:w-2/5';
            const secondaryWidth = isEven ? 'md:basis-2/5 md:w-2/5' : 'md:basis-3/5 md:w-3/5';
            const fallbackClass = 'bg-gradient-to-br from-[#cfc7bb] via-[#a6b7a4] to-[#5c6c63]';
            const imageStyle = project.imageUrl ? { backgroundImage: `url('${project.imageUrl}')` } : undefined;

            return (
              <CursorHoverCard key={project.name} label="View now" iconVariant="arrow-up-right" className="relative block">
                <a
                  href={project.href}
                  className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  <article>
                    <div className="flex h-[80vh] min-h-[520px] w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden md:overflow-hidden">
                      <div
                        className={`${primaryWidth} h-full w-[90%] shrink-0 snap-start border border-black/20 bg-cover bg-center md:w-auto md:shrink-0 ${project.imageUrl ? '' : fallbackClass}`}
                        style={imageStyle}
                        aria-hidden="true"
                      />
                      <div
                        className={`${secondaryWidth} h-full w-[90%] shrink-0 snap-start border border-black/20 bg-cover bg-center bg-blend-multiply grayscale transition duration-700 group-hover:grayscale-0 md:w-auto md:shrink-0 ${project.imageUrl ? 'bg-black/20' : fallbackClass}`}
                        style={imageStyle}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <span className="block text-xl leading-none tracking-tight text-gradient-black-gray transition-opacity group-hover:opacity-70 md:text-2xl">
                        {project.name}
                      </span>
                      <p className="m-0 max-w-[32rem] text-left text-sm leading-relaxed text-black/60 md:mr-20 md:text-right md:text-base">
                        {project.description}
                      </p>
                    </div>
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
