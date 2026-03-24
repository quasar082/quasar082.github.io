'use client';

import {useRef, useEffect, useCallback} from 'react';
import {gsap, useGSAP} from '@/lib/gsap';
import {useTranslations} from 'next-intl';
import {TransitionLink} from '@/components/transitions/TransitionLink';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  {href: '/' as const, key: 'home'},
  {href: '/#about' as const, key: 'about'},
  {href: '/projects' as const, key: 'projects'},
  {href: '/blog' as const, key: 'blog'},
];

export function MenuOverlay({isOpen, onClose}: MenuOverlayProps) {
  const t = useTranslations('Header');
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const links = container.querySelectorAll('.nav-link');
      const footer = container.querySelector('.overlay-footer');

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const tl = gsap.timeline({paused: true});

      if (prefersReducedMotion) {
        tl.set(container, {clipPath: 'inset(0% 0% 0% 0%)'});
        tl.set(links, {y: 0, opacity: 1});
        if (footer) tl.set(footer, {opacity: 1});
      } else {
        // Step 1: Overlay container clipPath reveal
        tl.to(container, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.5,
          ease: 'power4.inOut',
        });

        // Step 2: Nav links stagger (overlaps step 1 by 0.2s)
        tl.fromTo(
          links,
          {y: 40, opacity: 0},
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.4,
            ease: 'power3.out',
          },
          '-=0.2',
        );

        // Step 3: Footer content fade in (overlaps step 2 by 0.1s)
        if (footer) {
          tl.fromTo(
            footer,
            {opacity: 0},
            {opacity: 1, duration: 0.3, ease: 'power2.out'},
            '-=0.1',
          );
        }
      }

      tlRef.current = tl;
    },
    {scope: containerRef},
  );

  // Play/reverse timeline based on isOpen
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (isOpen) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.4).reverse();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleNavClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[45] bg-surface-base"
      style={{clipPath: 'inset(0% 0% 100% 0%)'}}
      aria-hidden={!isOpen}
    >
      <nav className="flex flex-col justify-center h-full px-6 md:px-16 lg:px-24 pt-16">
        {NAV_LINKS.map(({href, key}) => (
          <TransitionLink
            key={key}
            href={href}
            onClick={handleNavClick}
            className="nav-link block py-4 font-display text-text-primary opacity-0"
            style={{fontSize: 'var(--text-display-md)'}}
          >
            {t(key)}
          </TransitionLink>
        ))}
      </nav>
      <div className="overlay-footer absolute bottom-0 left-0 right-0 px-6 md:px-16 lg:px-24 pb-8 opacity-0">
        <div className="border-t border-border pt-4 flex justify-between items-center">
          <a
            href="mailto:contact@example.com"
            className="font-body text-xs tracking-wider text-text-muted hover:text-text-secondary transition-colors"
          >
            contact@example.com
          </a>
        </div>
      </div>
    </div>
  );
}
