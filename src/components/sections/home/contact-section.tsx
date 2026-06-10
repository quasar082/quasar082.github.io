'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TextReveal } from '@/components/ui/text-reveal';
import type { ContactSocial } from '@/lib/content/home';
import { SiteFooter } from './site-footer';

type ContactSectionProps = {
  contactSocials: ContactSocial[];
};

type ContactRevealTextProps = {
  text: string;
  className?: string;
};

function ContactRevealText({ text, className }: ContactRevealTextProps) {
  return (
    <span className={className} aria-label={text} data-contact-reveal>
      {text.split(' ').map((word, wordIndex, words) => (
        <span key={`${word}-${wordIndex}`} className="inline-flex whitespace-nowrap" aria-hidden="true">
          {Array.from(word).map((character, characterIndex) => (
            <span key={`${character}-${characterIndex}`} className="inline-flex overflow-hidden align-baseline">
              <span className="inline-flex text-gradient-black-gray" data-contact-character>
                {character}
              </span>
            </span>
          ))}
          {wordIndex < words.length - 1 ? <span className="whitespace-pre"> </span> : null}
        </span>
      ))}
    </span>
  );
}

export function ContactSection({ contactSocials }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;

    const updateContactOverlay = () => {
      frame = 0;
      const start = section.offsetTop - window.innerHeight;
      const end = section.offsetTop;
      const distance = end - start || 1;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));

      gsap.set(section, { yPercent: (1 - progress) * 100 });
    };

    const requestOverlayUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateContactOverlay);
    };

    updateContactOverlay();
    window.addEventListener('scroll', requestOverlayUpdate, { passive: true });
    window.addEventListener('resize', requestOverlayUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener('scroll', requestOverlayUpdate);
      window.removeEventListener('resize', requestOverlayUpdate);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const revealBlocks = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-contact-reveal]'));
    const allCharacters = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-contact-character]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(allCharacters, { yPercent: 0, autoAlpha: 1 });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(allCharacters, { yPercent: 110, autoAlpha: 0 });
    }, section);

    const revealedBlocks = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || revealedBlocks.has(entry.target)) {
            return;
          }

          revealedBlocks.add(entry.target);
          const characters = gsap.utils.toArray<HTMLElement>(entry.target.querySelectorAll('[data-contact-character]'));

          gsap.to(characters, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.68,
            ease: 'power3.out',
            stagger: 0.018,
          });

          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.25 },
    );

    revealBlocks.forEach((block) => observer.observe(block));

    return () => {
      observer.disconnect();
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative z-20 -mt-[100vh] box-border flex h-dvh min-h-0 flex-col overflow-hidden bg-[#e9e9e9] px-4 pt-10 pb-2 text-black sm:px-6 lg:px-8" aria-label="Contact section">
      <div className="container mx-auto flex min-h-0 flex-1 flex-col pt-8 [@media(min-height:900px)]:pt-15">
        <div className="grid shrink-0 grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-6 lg:col-span-1">
            <h2 className="m-0 w-full max-w-none text-[clamp(2rem,2vmin,3rem)] leading-[0.95] tracking-tight md:text-[clamp(2rem,4vmin,3rem)] xl:text-[clamp(2rem,5vmin,3rem)]">
              <TextReveal className="[&>span]:text-gradient-black-gray">WE WOULD LOVE TO HEAR FROM YOU. LET&apos;S WORK — TOGETHER.</TextReveal>
            </h2>
            <a
              href="mailto:haminhquan12c7@gmail.com"
              className="w-fit rounded-full bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white no-underline"
            >
              Contact us
            </a>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-x-1 gap-y-8 2xl:gap-x-3">
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-gradient-black-gray xl:text-sm">
                  <ContactRevealText text="Social" />
                </p>
                <ul className="mt-1 m-0 grid list-none p-0">
                  {contactSocials.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        className="relative inline-block pb-1 text-base leading-tight text-gradient-black-gray opacity-55 no-underline transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-black/35 before:absolute before:bottom-0 before:left-0 before:h-px before:w-8 before:bg-[#e9e9e9] before:transition-transform before:duration-500 hover:opacity-80 hover:before:translate-x-[calc(100%-2rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black 2xl:text-2xl"
                      >
                        <ContactRevealText text={social.label} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid content-start gap-8">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-gradient-black-gray xl:text-sm">
                    <ContactRevealText text="Contact" />
                  </p>
                  <a
                    href="tel:0376316144"
                    className="relative mt-1 inline-block pb-1 text-base leading-tight text-gradient-black-gray opacity-55 no-underline transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-black/35 before:absolute before:bottom-0 before:left-0 before:h-px before:w-8 before:bg-[#e9e9e9] before:transition-transform before:duration-500 hover:opacity-80 hover:before:translate-x-[calc(100%-2rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black 2xl:text-2xl"
                  >
                    <ContactRevealText text="0376316144" />
                  </a>
                </div>

                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-gradient-black-gray xl:text-sm">
                    <ContactRevealText text="Address" />
                  </p>
                  <p className="relative mt-1 inline-block pb-1 text-base leading-tight text-gradient-black-gray opacity-55 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-black/35 before:absolute before:bottom-0 before:left-0 before:h-px before:w-8 before:bg-[#e9e9e9] before:transition-transform before:duration-500 hover:before:translate-x-[calc(100%-2rem)] 2xl:text-2xl">
                    <ContactRevealText text="Thu Duc, HCM" />
                  </p>
                </div>
              </div>

              <div className="col-span-2">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-gradient-black-gray xl:text-sm">
                  <ContactRevealText text="Email" />
                </p>
                <a
                  href="mailto:haminhquan12c7@gmail.com"
                  className="relative mt-1 inline-block break-all pb-1 text-base leading-tight text-gradient-black-gray opacity-55 no-underline transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-black/35 before:absolute before:bottom-0 before:left-0 before:h-px before:w-8 before:bg-[#e9e9e9] before:transition-transform before:duration-500 hover:opacity-80 hover:before:translate-x-[calc(100%-2rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black 2xl:text-2xl"
                >
                  <ContactRevealText text="haminhquan12c7@gmail.com" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </section>
  );
}
