import { menuItems } from './data';

type MenuOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  return (
    <div
      id="hero-menu-overlay"
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-60 bg-[rgba(9,14,12,0.64)] backdrop-blur-[8px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`ml-auto flex h-full w-full max-w-[440px] flex-col border-l border-white/20 bg-[rgba(17,23,20,0.92)] p-5 shadow-[-16px_0_42px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-label="Main menu"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm uppercase tracking-[0.12em] text-white/60">Navigation</span>
          <button
            type="button"
            className="min-h-11 min-w-11 cursor-pointer rounded-full border border-white/35 bg-transparent px-4 py-2 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
            aria-label="Close menu"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <nav aria-label="Main navigation" className="mt-8">
          <ul className="m-0 grid list-none gap-4 p-0">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-[clamp(1.4rem,3vw,2.4rem)] text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  onClick={onClose}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
