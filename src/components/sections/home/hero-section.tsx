import { heroImagePath, services, socialLinks } from './data';

type HeroSectionProps = {
  isMenuOpen: boolean;
  onOpenMenu: () => void;
};

export function HeroSection({ isMenuOpen, onOpenMenu }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative h-dvh bg-cover bg-center px-4 py-4 text-white sm:px-6 lg:px-8"
      style={{ backgroundImage: `url('${heroImagePath}')` }}
      aria-label="Hero section"
    >
      <div className="absolute inset-0 bg-[rgba(34,43,39,0.42)]" />

      <div className="container relative z-10 mx-auto flex h-dvh flex-col py-4 sm:py-6 lg:py-8">
        <header className="flex items-center justify-between">
          <a
            href="#home"
            className="inline-flex min-h-11 items-center gap-2.5 text-3xl font-semibold leading-none text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-4xl"
            aria-label="Quasar home"
          >
            <span className="relative inline-block h-5 w-8" aria-hidden="true">
              <span className="absolute inset-y-0 left-0 w-[42%] bg-white" />
              <span className="absolute left-[38%] top-0 h-[42%] w-[62%] bg-white" />
            </span>
            <span>Quasar</span>
          </a>

          <button
            type="button"
            className="inline-flex min-h-12 min-w-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border border-white/45 bg-white/10 transition hover:bg-white/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none motion-reduce:transform-none"
            aria-expanded={isMenuOpen}
            aria-controls="hero-menu-overlay"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={onOpenMenu}
          >
            <span className="h-0.5 w-5 rounded-full bg-white" />
            <span className="h-0.5 w-5 rounded-full bg-white" />
            <span className="h-0.5 w-5 rounded-full bg-white" />
          </button>
        </header>

        <div className="mt-6 grid flex-1 grid-cols-1 items-end gap-5 md:mt-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_1fr] lg:gap-8">
          <aside id="services" className="self-start lg:col-start-1 lg:row-start-1" aria-label="Core services">
            <ul className="m-0 grid list-none gap-1 p-0 md:gap-2">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="inline-flex min-h-11 items-center text-base leading-snug text-white/90 no-underline md:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    ↳ {service}
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
