'use client';

import {useState, useCallback, useRef} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {TransitionLink} from '@/components/transitions/TransitionLink';
import {PillButton} from './header/PillButton';
import {DropdownMenu} from './header/DropdownMenu';
import {useHeaderScroll} from './header/useHeaderScroll';

export function Header() {
  const t = useTranslations('Header');
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const toggleLocale = useCallback(() => {
    const next = locale === 'en' ? 'vi' : 'en';
    localStorage.setItem('preferred-locale', next);
    try {
      router.replace(pathname, {locale: next});
    } catch {
      window.location.href = `/${next}${pathname}`;
    }
  }, [locale, router, pathname]);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useHeaderScroll({
    headerRef,
    menuOpen,
    onScrollClose: closeMenu,
  });

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-auto">
        {/* Left: Logo */}
        <TransitionLink
          href="/"
          className="font-body text-[24px] font-medium uppercase tracking-[0.1em] transition-colors duration-200"
          style={{color: 'var(--greige-900)'}}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--greige-700)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--greige-900)';
          }}
        >
          QUASAR
        </TransitionLink>

        {/* Right: Actions */}
        <div ref={actionsRef} className="flex items-center gap-2">
          {/* Language Toggle - circle */}
          <button
            onClick={toggleLocale}
            className="flex items-center justify-center w-10 h-10 rounded-full text-[15px] font-medium uppercase tracking-[0.08em] font-body cursor-pointer select-none transition-colors duration-300"
            style={{backgroundColor: 'var(--warm-white-overlay)', color: 'var(--greige-900)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--greige-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--warm-white-overlay)';
            }}
            aria-label={t('switchLang')}
            type="button"
            suppressHydrationWarning
          >
            {locale === 'en' ? 'VI' : 'EN'}
          </button>

          {/* LET'S TALK - dark pill, hidden on mobile */}
          <PillButton
            label={t('letsTalk')}
            variant="dark"
            href="mailto:haminhquan12c7@gmail.com"
            dots="single"
            ariaLabel="Send email"
            hidden={true}
          />

          {/* MENU/CLOSE - light pill */}
          <PillButton
            label={menuOpen ? t('close') : t('menu')}
            variant="light"
            onClick={toggleMenu}
            dots="double"
            dotsRotated={menuOpen}
            ariaLabel={menuOpen ? 'Close menu' : 'Open menu'}
            ariaExpanded={menuOpen}
            ariaControls="header-dropdown"
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      <DropdownMenu isOpen={menuOpen} onClose={closeMenu} actionsRef={actionsRef} />
    </header>
  );
}
