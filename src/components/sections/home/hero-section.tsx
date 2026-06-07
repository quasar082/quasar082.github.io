import type { ServiceItem } from '@/lib/content/home';

const heroVideoPath = '/hero/DNA 3D Animation by Tridimensi on Dribbble.mp4';

type HeroSectionProps = {
  services: ServiceItem[];
};

export function HeroSection({ services }: HeroSectionProps) {
  return (
    <section
      id="home"
      data-home-hero-image
      className="relative h-dvh overflow-hidden px-4 pb-10 pt-24 text-white sm:px-6 sm:pb-10 lg:px-8 lg:pb-8"
      aria-label="Hero section"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideoPath}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[rgba(34,43,39,0.42)]" />

      <div className="container relative z-10 mx-auto flex h-full flex-col">
        <div className="grid flex-1 grid-cols-1 items-end gap-5 lg:grid-rows-[auto_1fr] lg:items-end lg:gap-y-3">
          <aside id="services" className="self-start lg:row-start-1" aria-label="Core services">
            <ul className="m-0 grid list-none gap-1 p-0 md:gap-2">
              {services.map((service) => (
                <li key={service.label} className="inline-flex min-h-11 items-center text-base leading-snug text-white/90 2xl:text-lg">
                  ↳ {service.label}
                </li>
              ))}
            </ul>
          </aside>

          <div className="lg:row-start-2">
            <h1 className="m-0 max-w-full leading-tight tracking-tight lg:max-w-[12ch] text-[clamp(2rem,10vmin,15rem)] xl:text-[clamp(2rem,12vmin,20rem)]">
              Build advanced AI apps with our expertise.
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
