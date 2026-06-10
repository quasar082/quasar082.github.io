'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

const footerLogo = 'QUASAR';

function getCenterOutOrder(length: number) {
  const centerLeft = Math.floor((length - 1) / 2);
  const centerRight = Math.ceil((length - 1) / 2);
  const order: number[] = [];

  for (let offset = 0; order.length < length; offset += 1) {
    const left = centerLeft - offset;
    const right = centerRight + offset;

    if (left >= 0) {
      order.push(left);
    }

    if (right !== left && right < length) {
      order.push(right);
    }
  }

  return order;
}

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const centerOutOrder = useMemo(() => getCenterOutOrder(footerLogo.length), []);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) {
      return;
    }

    const logoCharacters = gsap.utils.toArray<HTMLElement>(footer.querySelectorAll('[data-footer-logo-character]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(logoCharacters, { yPercent: 0, autoAlpha: 1 });
      return;
    }

    gsap.set(logoCharacters, { yPercent: 110, autoAlpha: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const orderedCharacters = centerOutOrder.map((index) => logoCharacters[index]).filter(Boolean);

          gsap.to(orderedCharacters, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.72,
            ease: 'power3.out',
            stagger: 0.045,
          });

          observer.disconnect();
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 },
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, [centerOutOrder]);

  return (
    <footer ref={footerRef} aria-label="Site footer" className="mt-auto min-h-0">
      <div className="@container w-full">
        <p className="w-fit whitespace-nowrap text-[clamp(1rem,26.2cqw,100rem)] font-medium leading-[0.95] tracking-[-0.04em] text-gradient-black-gray" aria-label={footerLogo}>
          {Array.from(footerLogo).map((character, index) => (
            <span key={`${character}-${index}`} className="inline-flex overflow-hidden align-baseline" aria-hidden="true">
              <span className="inline-flex text-gradient-black-gray" data-footer-logo-character>
                {character}
              </span>
            </span>
          ))}
        </p>
      </div>
      <div className="border-t border-black/35 pt-2">
        <p className="m-0 text-sm tracking-wide text-gradient-black-gray opacity-65">© 2026 Quasar. All rights reserved.</p>
      </div>
    </footer>
  );
}
