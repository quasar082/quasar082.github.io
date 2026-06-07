'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const heroVideoPath = '/hero/DNA 3D Animation by Tridimensi on Dribbble.mp4';

type FitHeroTextProps = {
  text: string;
  align?: 'left' | 'right';
  className?: string;
  maxFontSize?: number;
};

function FitHeroText({ text, align = 'left', className, maxFontSize }: FitHeroTextProps) {
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
      let high = maxFontSize ?? 520;
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
  }, [maxFontSize, text]);

  return (
    <div ref={parentRef} className={`relative w-full ${className ?? ''}`}>
      <p
        ref={textRef}
        className={`absolute bottom-0 m-0 block max-w-full whitespace-nowrap font-semibold leading-[0.95] tracking-[-0.05em] text-black ${
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
    <section id="home" data-home-hero-image className="relative h-dvh overflow-hidden px-4 pt-24 text-black sm:px-6 lg:px-8 " aria-label="Hero section">
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

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-center pt-[clamp(5rem,calc(30rem-10vw),30rem)]">
        <div className="flex justify-between items-center w-full ">
          <div className="flex h-full items-end justify-start w-fit ">
            <p className="m-0 text-[clamp(0.85rem,1.35vw,1.1rem)] font-semibold leading-none tracking-[-0.03em] text-black/45">Scroll</p>
          </div>

          <div className="w-3/4 flex-shrink-0">
          <div className="@container w-full"> 
  
  {/* 2. Thẻ con đổi từ 100cqw thành 16.6cqw, hạ giới hạn max xuống */}
  <p className="text-[clamp(1rem,33cqw,100rem)] font-semibold whitespace-nowrap  w-fit leading-[0.95]">
    quasar
  </p>
  
</div>
            {/* <FitHeroText text="quasar" align="right" className="h-[clamp(6.5rem,17vw,14rem)] w-full" /> */}
            <div className="mt-8 ml-auto w-full">
              <p className="m-0 text-left text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-black">Harness AI.</p>
              <p className="mt-2 m-0 text-left  text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-black">Shape what&apos;s next.</p>
            </div>
          </div>
        </div>
   </div>
    </section>
  );
}
