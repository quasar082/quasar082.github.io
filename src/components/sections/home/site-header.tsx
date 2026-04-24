type SiteHeaderProps = {
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  sticky?: boolean;
};

export function SiteHeader({ isMenuOpen, onOpenMenu, sticky = false }: SiteHeaderProps) {
  return (
    <header className={`${sticky ? 'fixed inset-x-0 top-0 z-40 px-4 py-4 sm:px-6 lg:px-8' : 'relative z-10'} text-white`}>
      <div className="container mx-auto flex items-center justify-between">
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
      </div>
    </header>
  );
}
