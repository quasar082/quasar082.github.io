'use client';

import { useEffect, useState } from 'react';
import type { HomeContent } from '@/lib/content/home';
import { AboutSection } from './about-section';
import { ExperienceSection } from './experience-section';
import { ContactSection } from './contact-section';
import { HeroSection } from './hero-section';
import { MenuOverlay } from './menu-overlay';
import { ParallaxImageSection } from './parallax-image-section';
import { ProjectsSection } from './projects-section';
import { SiteHeader } from './site-header';

type HomePageClientProps = {
  content: HomeContent;
};

export function HomePageClient({ content }: HomePageClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(content.menuItems[0]?.href ?? '#home');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const sectionIds = content.menuItems.filter((item) => item.href.startsWith('#')).map((item) => item.href.slice(1));

    const updateScrollState = () => {
      const currentSectionId = sectionIds.findLast((sectionId) => {
        const section = document.getElementById(sectionId);

        return section ? section.getBoundingClientRect().top <= window.innerHeight * 0.35 : false;
      });

      if (currentSectionId) {
        setActiveSection(`#${currentSectionId}`);
      }
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [content.menuItems]);

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

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const nearTop = currentScrollY <= 16;

      const contactSection = document.getElementById('contact');
      const inContactSection = contactSection
        ? contactSection.getBoundingClientRect().top <= window.innerHeight * 0.6 && contactSection.getBoundingClientRect().bottom >= 0
        : false;

      setIsHeaderVisible(nearTop || scrollingUp || isMenuOpen || inContactSection);
      lastScrollY = currentScrollY;
    };

    updateHeaderVisibility();
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeaderVisibility);
    };
  }, [isMenuOpen]);

  return (
    <main className="min-h-dvh overflow-x-clip bg-white">
      <SiteHeader isMenuOpen={isMenuOpen} isVisible={isHeaderVisible} onOpenMenu={() => setIsMenuOpen((open) => !open)} sticky />
      <HeroSection />
      <div aria-hidden="true" className="pointer-events-none relative z-10 -mt-[80px] h-[80px] w-full bg-gradient-to-b from-transparent to-white" />
      <AboutSection paragraphs={content.aboutParagraphs} />
      <ProjectsSection projects={content.projects} />
      <ParallaxImageSection />
      <ExperienceSection experiences={content.experiences} />
      <ContactSection contactSocials={content.contactSocials} />
      <MenuOverlay menuItems={content.menuItems} activeSection={activeSection} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </main>
  );
}
