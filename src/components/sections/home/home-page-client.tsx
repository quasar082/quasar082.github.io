'use client';

import { useEffect, useState } from 'react';
import { AboutSection } from './about-section';
import { AchievementSection } from './achievement-section';
import { ContactSection } from './contact-section';
import { HeroSection } from './hero-section';
import { MenuOverlay } from './menu-overlay';
import { ProjectsSection } from './projects-section';

export function HomePageClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <main className="h-dvh overflow-x-clip bg-[#8f9a94]">
      <HeroSection isMenuOpen={isMenuOpen} onOpenMenu={() => setIsMenuOpen(true)} />
      <AboutSection />
      <ProjectsSection />
      <AchievementSection />
      <ContactSection />
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </main>
  );
}
