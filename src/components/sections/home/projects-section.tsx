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
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start md:gap-14">
          <h2 className="m-0 max-w-[12ch] -translate-y-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-tight text-gradient-black-gray md:-translate-y-6">
            My projects
          </h2>
          <p className="m-0 max-w-[30rem] text-sm leading-7 text-black/60 md:pt-2 md:text-base">
            AI-driven concepts, interfaces, and systems that turn complex ideas into clear, useful product experiences.
          </p>
        </div>
        <div className="mt-12 flex flex-col gap-20 md:gap-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const primaryWidth = isEven ? 'md:basis-[calc(60%-0.5rem)]' : 'md:basis-[calc(40%-0.5rem)]';
            const secondaryWidth = isEven ? 'md:basis-[calc(40%-0.5rem)]' : 'md:basis-[calc(60%-0.5rem)]';
            const fallbackClass = 'bg-gradient-to-br from-[#cfc7bb] via-[#a6b7a4] to-[#5c6c63]';
            const imageStyle = project.imageUrl ? { backgroundImage: `url('${project.imageUrl}')` } : undefined;

            return (
              <CursorHoverCard key={project.name} label="View now" iconVariant="arrow-up-right" iconOnly className="relative block">
                <a
                  href={project.href}
                  className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  <article>
                    <div className="flex h-[80vh] min-h-[520px] w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden md:snap-none md:overflow-x-visible md:overflow-y-visible">
                      <div
                        className={`${primaryWidth} h-full w-[90%] shrink-0 snap-start rounded-2xl border border-black/20 bg-cover bg-center md:shrink-0 ${project.imageUrl ? '' : fallbackClass}`}
                        style={imageStyle}
                        aria-hidden="true"
                      />
                      <div
                        className={`${secondaryWidth} h-full w-[90%] shrink-0 snap-start rounded-2xl border border-black/20 bg-cover bg-center bg-blend-multiply grayscale transition duration-700 group-hover:grayscale-0 md:shrink-0 ${project.imageUrl ? 'bg-black/20' : fallbackClass}`}
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
