'use client';

import { useEffect, useState } from 'react';
import type { HomeContent } from '@/lib/content/home';
import { AboutSection } from './about-section';
import { AchievementSection } from './achievement-section';
import { ContactSection } from './contact-section';
import { HeroSection } from './hero-section';
import { MenuOverlay } from './menu-overlay';
import { ProjectsSection } from './projects-section';
import { SiteHeader } from './site-header';

type HomePageClientProps = {
  content: HomeContent;
};

export function HomePageClient({ content }: HomePageClientProps) {
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
      <SiteHeader isMenuOpen={isMenuOpen} onOpenMenu={() => setIsMenuOpen(true)} sticky />
      <HeroSection heroImagePath={content.heroImagePath} services={content.services} socialLinks={content.socialLinks} />
      <AboutSection />
      <ProjectsSection projects={content.projects} />
      <AchievementSection achievements={content.achievements} />
      <ContactSection contactSocials={content.contactSocials} />
      <MenuOverlay menuItems={content.menuItems} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </main>
  );
}
