import type { ServiceItem, SocialLink } from '@/lib/content/home';

type HeroSectionProps = {
  heroImagePath: string;
  services: ServiceItem[];
  socialLinks: SocialLink[];
};

export function HeroSection({ heroImagePath, services, socialLinks }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative h-dvh bg-cover bg-center px-4 pb-4 pt-24 text-white sm:px-6 sm:pb-6 lg:px-8 lg:pb-8"
      style={{ backgroundImage: `url('${heroImagePath}')` }}
      aria-label="Hero section"
    >
      <div className="absolute inset-0 bg-[rgba(34,43,39,0.42)]" />

      <div className="container relative z-10 mx-auto flex h-full flex-col">
        <div className="grid flex-1 grid-cols-1 items-end gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_1fr] lg:gap-8">
          <aside id="services" className="self-start lg:col-start-1 lg:row-start-1" aria-label="Core services">
            <ul className="m-0 grid list-none gap-1 p-0 md:gap-2">
              {services.map((service) => (
                <li key={service.label}>
                  <a
                    href={service.href}
                    className="inline-flex min-h-11 items-center text-base leading-snug text-white/90 no-underline md:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    ↳ {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="lg:col-start-1 lg:row-start-2">
            <h1 className="m-0 max-w-full leading-tight tracking-tight lg:max-w-[11ch] text-8xl xl:text-9xl">
              Build advanced AI apps with our expertise.
            </h1>
          </div>

          <nav
            className="justify-self-start lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-self-end lg:self-center"
            aria-label="Social links"
          >
            <ul className="m-0 flex list-none flex-wrap gap-3 p-0 md:gap-4 lg:grid lg:gap-4">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="inline-flex min-h-11 items-center gap-2 text-base text-white/95 no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:text-xl lg:[text-orientation:mixed] lg:[writing-mode:vertical-rl]"
                    aria-label={social.label}
                  >
                    <span aria-hidden="true" className="text-base font-semibold leading-none lg:text-3xl">
                      {social.symbol}
                    </span>
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
