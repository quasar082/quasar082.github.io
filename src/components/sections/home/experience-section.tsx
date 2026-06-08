import type { ExperienceItem } from '@/lib/content/home';

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
};

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experience" className="box-border min-h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="Experience section">
      <div className="container mx-auto">
        <h2 className="m-0 text-5xl leading-tight tracking-tight text-gradient-black-gray md:text-7xl lg:text-8xl">Experience</h2>

        <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
          {experiences.map((experience) => (
            <article key={`${experience.date}-${experience.role}`} className="grid grid-cols-1 gap-4 py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
              <p className="m-0 text-base font-medium tracking-wide text-gradient-black-gray opacity-80 md:text-lg">{experience.date}</p>
              <h3 className="m-0 text-xl font-medium leading-tight text-gradient-black-gray md:text-2xl">{experience.role}</h3>
              <p className="m-0 text-sm leading-relaxed text-gradient-black-gray opacity-45 md:text-base">{experience.details}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
