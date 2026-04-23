'use client';

import {useEffect, useState} from 'react';

const services = ['Agent Orchestration', 'Harness AI', 'Automate Pipeline', 'Architect System'];
const socialLinks = [
  {label: 'Facebook', href: '#', symbol: 'f'},
  {label: 'Twitter/X', href: '#', symbol: 'X'},
  {label: 'Linkedin', href: '#', symbol: 'in'},
];
const menuItems = ['Home', 'Services', 'Work', 'Contact'];

export default function RootPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroImagePath = '/hero/ChatGPT%20Image%2017_56_07%2023%20thg%204,%202026.png';

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <main className="min-h-dvh overflow-x-clip bg-[#8f9a94]">
      <section
        className="relative min-h-dvh bg-cover bg-center px-4 py-4 text-white sm:px-6 lg:px-8"
        style={{backgroundImage: `url('${heroImagePath}')`}}
        aria-label="Hero section"
      >
        <div className="absolute inset-0 bg-[rgba(34,43,39,0.42)]" />

        <div className="container relative z-10 mx-auto flex min-h-dvh flex-col py-4 sm:py-6 lg:py-8">
          <header className="flex items-center justify-between">
            <a
              href="#"
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
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="h-0.5 w-5 rounded-full bg-white" />
              <span className="h-0.5 w-5 rounded-full bg-white" />
              <span className="h-0.5 w-5 rounded-full bg-white" />
            </button>
          </header>

          <div className="mt-6 grid flex-1 grid-cols-1 items-end gap-5 md:mt-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_1fr] lg:gap-8">
            <aside className="self-start lg:col-start-1 lg:row-start-1" aria-label="Core services">
              <ul className="m-0 grid list-none gap-1 p-0 md:gap-2">
                {services.map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      className="inline-flex min-h-11 items-center text-base leading-snug text-white/90 no-underline md:text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      ↳ {service}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="lg:col-start-1 lg:row-start-2">
              <h1 className="m-0 max-w-full text-4xl leading-tight tracking-tight lg:max-w-[10ch] lg:text-7xl xl:text-8xl">
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

      <section className="min-h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="About section">
        <div className="container mx-auto grid min-h-dvh grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
          <h2 className="text-3xl font-medium leading-tight md:col-start-2 md:col-end-5 md:row-start-1 md:row-end-3 md:text-5xl lg:text-6xl">
            Ha Minh Quan, Quasar. An AI engineer based in Vietnam.
          </h2>

          <p className="whitespace-pre-line text-sm font-medium tracking-wide md:col-start-1 md:col-end-2 md:row-start-4 md:row-end-5 md:text-base">
            CRAFTING END-TO-END
            {'\n'}ARTIFICIAL INTELLIGENCE
            {'\n'}SYSTEMS AND PIPELINES.
          </p>
        </div>
      </section>

      <div
        id="hero-menu-overlay"
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 z-60 bg-[rgba(9,14,12,0.64)] backdrop-blur-[8px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`ml-auto flex h-full w-full max-w-[440px] flex-col border-l border-white/20 bg-[rgba(17,23,20,0.92)] p-5 shadow-[-16px_0_42px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role={isMenuOpen ? 'dialog' : undefined}
          aria-modal={isMenuOpen ? 'true' : undefined}
          aria-label="Main menu"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase tracking-[0.12em] text-white/60">Navigation</span>
            <button
              type="button"
              className="min-h-11 min-w-11 cursor-pointer rounded-full border border-white/35 bg-transparent px-4 py-2 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
            >
              Close
            </button>
          </div>

          <nav aria-label="Main navigation" className="mt-8">
            <ul className="m-0 grid list-none gap-4 p-0">
              {menuItems.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="inline-flex min-h-11 items-center text-[clamp(1.4rem,3vw,2.4rem)] text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}
