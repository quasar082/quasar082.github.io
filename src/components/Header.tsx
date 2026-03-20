'use client';

import {useState, useCallback} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {TransitionLink} from '@/components/transitions/TransitionLink';
import {MagneticHover} from '@/components/animations/MagneticHover';
import {MenuOverlay} from './MenuOverlay';

export function Header() {
  const t = useTranslations('Header');
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = useCallback(() => {
    const next = locale === 'en' ? 'vi' : 'en';
    localStorage.setItem('preferred-locale', next);
    router.replace(pathname, {locale: next});
  }, [locale, router, pathname]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex h-16 items-center justify-between px-6 md:px-8 pointer-events-auto">
          {/* Left: Brand mark */}
          <MagneticHover strength={10}>
            <TransitionLink
              href="/"
              className="font-display text-lg tracking-wider uppercase text-text-primary"
            >
              Quasar
            </TransitionLink>
          </MagneticHover>

          {/* Right: 3 buttons */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* 1. Language toggle */}
            <MagneticHover>
              <button
                onClick={toggleLocale}
                className="text-sm uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                aria-label={t('switchLang')}
              >
                {locale === 'en' ? 'VI' : 'EN'}
              </button>
            </MagneticHover>

            {/* 2. Let's Talk mailto */}
            <MagneticHover>
              <a
                href="mailto:contact@example.com"
                className="text-sm uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Send email"
              >
                {t('letsTalk')}
              </a>
            </MagneticHover>

            {/* 3. Menu toggle */}
            <MagneticHover>
              <button
                onClick={toggleMenu}
                className="text-sm uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? t('close') : t('menu')}
              </button>
            </MagneticHover>
          </div>
        </div>
      </header>

      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
