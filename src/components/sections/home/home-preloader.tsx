'use client';

import { useEffect, useRef, useState } from 'react';

type HomePreloaderProps = {
  heroImagePath: string;
};

export function HomePreloader({ heroImagePath }: HomePreloaderProps) {
  const inlineImageRef = useRef<HTMLDivElement | null>(null);
  const fixedImageRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayoutState = () => {
      setIsMobile(window.innerWidth < 640);

      const inlineImage = inlineImageRef.current;
      const fixedImage = fixedImageRef.current;
      if (!inlineImage || !fixedImage) return;

      const rect = inlineImage.getBoundingClientRect();
      fixedImage.style.setProperty('--image-start-left', `${rect.left}px`);
      fixedImage.style.setProperty('--image-start-top', `${rect.top}px`);
      fixedImage.style.setProperty('--image-start-width', `${rect.width}px`);
      fixedImage.style.setProperty('--image-start-height', `${rect.height}px`);
      fixedImage.style.setProperty('--image-ready-opacity', '1');
    };

    updateLayoutState();
    const measureExpandedSlot = window.setTimeout(updateLayoutState, 2050);
    window.addEventListener('resize', updateLayoutState);
    document.fonts?.ready.then(updateLayoutState).catch(updateLayoutState);

    return () => {
      window.clearTimeout(measureExpandedSlot);
      window.removeEventListener('resize', updateLayoutState);
    };
  }, []);


  return (
    <div className="pointer-events-auto fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-white text-[#111] [animation:home-preloader-exit_520ms_ease-in-out_3100ms_forwards] motion-reduce:hidden" aria-hidden="true">
      <span className="sr-only">QUASAR PORTFOLIO</span>

      <div className="relative flex h-screen w-screen items-center justify-center px-6 [--image-scale:0.16] [--title-size:3dvw] sm:[--image-scale:0.13] sm:[--title-size:1.8dvw] lg:[--image-scale:0.15] lg:[--title-size:1.35dvw] xl:[--image-scale:0.17] xl:[--title-size:2.8dvw] 2xl:[--image-scale:0.2] 2xl:[--title-size:3.4dvw]">
        <div className={isMobile ? 'absolute inset-0 z-30 grid place-items-center whitespace-nowrap text-[length:var(--title-size)] font-normal leading-none tracking-[-0.04em] text-[#111] opacity-0 [animation:home-preloader-title_2.7s_cubic-bezier(0.76,0,0.24,1)_forwards]' : 'absolute inset-0 z-30 grid place-items-center whitespace-nowrap text-[length:var(--title-size)] font-normal leading-none tracking-[-0.04em] text-[#111] opacity-0 [animation:home-preloader-title_2.7s_cubic-bezier(0.76,0,0.24,1)_forwards]'}>
          {isMobile ? (
            <div className="inline-flex gap-[0.18em] [animation:home-preloader-mobile-title_2.7s_cubic-bezier(0.76,0,0.24,1)_forwards]">
              <span>QUASAR</span>
              <span>PORTFOLIO</span>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_0_auto] items-center justify-center gap-x-[0.18em] [animation:home-preloader-split-grid_2.7s_cubic-bezier(0.76,0,0.24,1)_forwards]">
              <span className="justify-self-end">QUASAR</span>
              <div
                ref={inlineImageRef}
                className="h-[calc(100dvh*var(--image-scale))] w-[calc(100dvw*var(--image-scale))] overflow-hidden opacity-0 shadow-2xl [grid-column:2] [animation:home-preloader-inline-image_3s_cubic-bezier(0.76,0,0.24,1)_forwards]"
              >
                {/* Native img keeps parity with the existing static-export hero asset path. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImagePath} alt="" decoding="async" className="h-full w-full object-cover" />
              </div>
              <span className="justify-self-start">PORTFOLIO</span>
            </div>
          )}
        </div>

        <div
          ref={fixedImageRef}
          className={isMobile ? 'relative z-20 h-screen w-screen overflow-hidden opacity-0 shadow-2xl [transform:translateZ(0)_scale(var(--image-scale))] [transform-origin:center] [will-change:transform,opacity] [animation:home-preloader-image_3s_cubic-bezier(0.76,0,0.24,1)_forwards]' : 'fixed z-20 overflow-hidden opacity-0 shadow-2xl [will-change:top,left,width,height,opacity] [animation:home-preloader-fixed-image_3s_cubic-bezier(0.76,0,0.24,1)_forwards]'}
        >
          {/* Native img keeps parity with the existing static-export hero asset path. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImagePath} alt="" decoding="async" className="h-full w-full object-cover" />
        </div>
      </div>

      <style jsx>{`
        @keyframes home-preloader-title {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          18%,
          78% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes home-preloader-split-grid {
          0%,
          34% {
            column-gap: 0.18em;
            grid-template-columns: auto 0 auto;
          }
          58%,
          100% {
            column-gap: clamp(0.5rem, 1dvw, 1rem);
            grid-template-columns: auto calc(100dvw * var(--image-scale)) auto;
          }
        }

        @keyframes home-preloader-mobile-title {
          0%,
          34% {
            transform: translateY(0);
          }
          58%,
          100% {
            transform: translateY(calc(var(--image-scale) * 100vh * 0.5 + 1.5rem));
          }
        }


        @keyframes home-preloader-image {
          0%,
          36% {
            opacity: 0;
            transform: translateZ(0) scale(var(--image-scale));
          }
          54%,
          68% {
            opacity: 1;
            transform: translateZ(0) scale(var(--image-scale));
          }
          100% {
            opacity: 1;
            transform: translateZ(0) scale(1);
          }
        }

        @keyframes home-preloader-inline-image {
          0%,
          36% {
            opacity: 0;
          }
          54%,
          70% {
            opacity: 1;
          }
          72%,
          100% {
            opacity: 0;
          }
        }

        @keyframes home-preloader-fixed-image {
          0%,
          68% {
            left: var(--image-start-left, 0);
            top: var(--image-start-top, 0);
            width: var(--image-start-width, 100vw);
            height: var(--image-start-height, 100vh);
            opacity: 0;
            transform: translateZ(0);
          }
          69%,
          72% {
            left: var(--image-start-left, 0);
            top: var(--image-start-top, 0);
            width: var(--image-start-width, 100vw);
            height: var(--image-start-height, 100vh);
            opacity: var(--image-ready-opacity, 0);
            transform: translateZ(0);
          }
          100% {
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            opacity: 1;
            transform: translateZ(0);
          }
        }

        @keyframes home-preloader-exit {
          0% {
            opacity: 1;
            visibility: visible;
          }
          99% {
            opacity: 0;
            visibility: visible;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
