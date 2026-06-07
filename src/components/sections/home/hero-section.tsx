'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const heroVideoPath = '/hero/DNA 3D Animation by Tridimensi on Dribbble.mp4';

type FitHeroTextProps = {
  text: string;
  align?: 'left' | 'right';
  className?: string;
};

function FitHeroText({ text, align = 'left', className }: FitHeroTextProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [scaleY, setScaleY] = useState(1);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const parent = parentRef.current;
    const el = textRef.current;

    if (!parent || !el) return;

    const fit = () => {
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      if (!parentWidth || !parentHeight) return;

      let low = 16;
      let high = 520;
      let best = 16;

      for (let i = 0; i < 24; i += 1) {
        const mid = (low + high) / 2;
        el.style.fontSize = `${mid}px`;
        el.style.transform = 'scaleY(1)';

        if (el.scrollWidth <= parentWidth) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      el.style.fontSize = `${best}px`;
      const textHeight = el.scrollHeight;
      const nextScaleY = textHeight ? parentHeight / textHeight : 1;

      setFontSize(Math.floor(best * 100) / 100);
      setScaleY(Math.floor(nextScaleY * 1000) / 1000);
      setReady(true);
    };

    const observer = new ResizeObserver(fit);
    observer.observe(parent);

    document.fonts?.ready.then(fit).catch(fit);
    fit();

    return () => observer.disconnect();
  }, [text]);

  return (
    <div ref={parentRef} className={`relative w-full overflow-hidden ${className ?? ''}`}>
      <p
        ref={textRef}
        className={`absolute bottom-0 m-0 block max-w-full whitespace-nowrap font-semibold leading-[0.8] tracking-[-0.05em] text-black ${
          align === 'right' ? 'right-0 origin-bottom-right text-right' : 'left-0 origin-bottom-left text-left'
        }`}
        style={{
          fontSize,
          transform: `scaleY(${scaleY})`,
          visibility: ready ? 'visible' : 'hidden',
        }}
      >
        {text}
      </p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="home" data-home-hero-image className="relative h-dvh overflow-hidden px-4 pb-10 pt-24 text-black sm:px-6 sm:pb-10 lg:px-8 lg:pb-8" aria-label="Hero section">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideoPath}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-end">
        <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto_auto]">
          <FitHeroText text="quasar" align="right" className="ml-auto row-start-2 h-[clamp(8rem,22vw,18rem)] w-full max-w-[78rem]" />

          <div className="row-start-3 mt-4 grid grid-cols-[auto_1fr] items-end gap-x-8 md:mt-6 md:gap-x-14">
            <p className="m-0 self-end text-[clamp(1rem,2vw,1.4rem)] font-semibold leading-none tracking-[-0.03em] text-black/45">Scroll</p>
            <div className="min-w-0 max-w-[48rem]">
              <FitHeroText text="Harness AI." className="h-[clamp(2rem,4.8vw,4.6rem)]" />
              <FitHeroText text="Shape what's next." className="mt-1 h-[clamp(2rem,4.8vw,4.6rem)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
