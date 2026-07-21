'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HomeContent } from '@/lib/content/home';
import { AboutSection } from './about-section';
import { ExperienceContactTransition } from './experience-contact-transition';
import { HeroSection } from './hero-section';
import { HomePreloader } from './home-preloader';
import { MenuOverlay } from './menu-overlay';
import { ParallaxVideoSection } from './parallax-video-section';
import { ProjectsSection } from './projects-section';
import { SiteHeader } from './site-header';

type HomePageClientProps = {
  content: HomeContent;
};

export function HomePageClient({ content }: HomePageClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(content.menuItems[0]?.href ?? '#home');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderInverted, setIsHeaderInverted] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [shouldPlayHeroIntro, setShouldPlayHeroIntro] = useState(false);
  const startHeroIntro = useCallback(() => setShouldPlayHeroIntro(true), []);
  const completeIntro = useCallback(() => setIsIntroComplete(true), []);

  useEffect(() => {
    const sections = content.menuItems
      .filter((item) => item.href.startsWith('#'))
      .map((item) => {
        const id = item.href.slice(1);

        return { id, element: document.getElementById(id) };
      })
      .filter((section): section is { id: string; element: HTMLElement } => Boolean(section.element));
    let frame = 0;

    const updateScrollState = () => {
      frame = 0;
      const currentSection = sections.findLast(({ element }) => element.getBoundingClientRect().top <= window.innerHeight * 0.35);

      if (currentSection) {
        setActiveSection((currentActiveSection) => {
          const nextActiveSection = `#${currentSection.id}`;

          return currentActiveSection === nextActiveSection ? currentActiveSection : nextActiveSection;
        });
      }
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateScrollState);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
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
    const parallaxSection = document.getElementById('parallax-video');

    if (!parallaxSection) {
      return;
    }

    let frame = 0;

    const updateHeaderTone = () => {
      frame = 0;
      const { top, bottom } = parallaxSection.getBoundingClientRect();
      const headerProbeY = 32;
      const nextIsHeaderInverted = top <= headerProbeY && bottom >= headerProbeY;

      setIsHeaderInverted((currentIsHeaderInverted) => (currentIsHeaderInverted === nextIsHeaderInverted ? currentIsHeaderInverted : nextIsHeaderInverted));
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateHeaderTone);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastScrollY = window.scrollY;
    const contactSection = document.getElementById('contact');

    const updateHeaderVisibility = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const nearTop = currentScrollY <= 16;
      const contactRect = contactSection?.getBoundingClientRect();
      const inContactSection = contactRect ? contactRect.top <= window.innerHeight * 0.6 && contactRect.bottom >= 0 : false;
      const nextIsHeaderVisible = nearTop || scrollingUp || isMenuOpen || inContactSection;

      setIsHeaderVisible((currentIsHeaderVisible) => (currentIsHeaderVisible === nextIsHeaderVisible ? currentIsHeaderVisible : nextIsHeaderVisible));
      lastScrollY = currentScrollY;
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateHeaderVisibility);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [isMenuOpen]);

  return (
    <main className="min-h-dvh overflow-x-clip bg-white">
      {!isIntroComplete ? <HomePreloader onComplete={completeIntro} onExitStart={startHeroIntro} /> : null}
      <SiteHeader isInverted={isHeaderInverted} isMenuOpen={isMenuOpen} isVisible={isHeaderVisible} onOpenMenu={() => setIsMenuOpen((open) => !open)} playIntro={shouldPlayHeroIntro} sticky />
      <HeroSection playIntro={shouldPlayHeroIntro} />
      <div aria-hidden="true" className="pointer-events-none relative z-10 -mt-[80px] h-[80px] w-full bg-gradient-to-b from-transparent to-white" />
      <AboutSection />
      <ProjectsSection projects={content.projects} />
      <ParallaxVideoSection />
      <ExperienceContactTransition experiences={content.experiences} contactSocials={content.contactSocials} />
      <MenuOverlay menuItems={content.menuItems} activeSection={activeSection} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </main>
  );
}
