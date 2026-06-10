'use client';

import { useRef, type ReactNode } from 'react';
import { motion, type MotionValue, useScroll, useTransform } from 'motion/react';

import { SpinningText } from '@/components/ui/spinning-text';

type RevealTokenProps = {
  children: ReactNode;
  progress: MotionValue<number>;
  index: number;
  total: number;
  className?: string;
  decorative?: boolean;
};

function AboutNameDash() {
  return (
    <span className="mx-2 inline-block align-middle text-gradient-black-gray" aria-hidden="true">
      <span className="relative inline-block h-[0.045em] w-[1.85em] align-[0.28em] bg-current after:absolute after:right-0 after:top-1/2 after:h-[0.3em] after:w-[0.3em] after:-translate-y-1/2 after:rotate-45 after:border-r-[0.045em] after:border-t-[0.045em] after:border-current" />
    </span>
  );
}

function RevealToken({ children, progress, index, total, className, decorative = false }: RevealTokenProps) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0, 1]);

  return (
    <span className="relative mx-1 leading-[inherit] lg:mx-1.5">
      <span className={className ? `absolute leading-[inherit] opacity-30 ${className}` : 'absolute leading-[inherit] opacity-30'} aria-hidden={decorative}>
        {children}
      </span>
      <motion.span style={{ opacity }} className={className ? `leading-[inherit] text-inherit ${className}` : 'leading-[inherit] text-inherit'} aria-hidden={decorative}>
        {children}
      </motion.span>
    </span>
  );
}

function AboutRevealText() {
  const revealRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ['start 85%', 'end 55%'],
  });

  const firstLine: Array<{ content: ReactNode; className?: string; decorative?: boolean; srOnlyAfter?: ReactNode }> = [
    { content: '"Hi!' },
    { content: 'My' },
    { content: 'name' },
    { content: 'is' },
    { content: 'Ha', className: 'italic' },
    { content: 'Minh', className: 'italic' },
    { content: 'Quan', className: 'italic' },
    { content: <AboutNameDash />, decorative: true, srOnlyAfter: <span className="sr-only"> — </span> },
    { content: 'Quasar.', className: 'italic' },
    { content: 'I' },
    { content: 'am' },
    { content: 'an' },
    { content: 'AI' },
    { content: 'engineer' },
    { content: 'based' },
    { content: 'in' },
    { content: 'Vietnam,' },
    { content: 'focused' },
    { content: 'on' },
    { content: 'architecture' },
    { content: 'design,' },
    { content: 'operational' },
    { content: 'optimization,' },
    { content: 'and' },
    { content: 'scaling' },
    { content: 'intelligent' },
    { content: 'systems."' },
  ];

  const secondLine = '"I build end-to-end AI products — from unstructured data processing and multi-agent systems to chatbots and real-world deployment."'
    .split(' ')
    .map((word) => ({ content: word }));
  const tokens = [...firstLine, ...secondLine];

  return (
    <div ref={revealRef} className="mt-8 self-start text-3xl leading-[1] md:col-start-2 md:col-end-6 md:row-start-1 md:row-end-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)]">
      <p className="m-0 flex flex-wrap content-start text-gradient-black-gray">
        {firstLine.map((token, index) => (
          <span key={`about-first-${index}`}>
            <RevealToken progress={scrollYProgress} index={index} total={tokens.length} className={token.className} decorative={token.decorative}>
              {token.content}
            </RevealToken>
            {token.srOnlyAfter}
          </span>
        ))}
      </p>
      <p className="m-0 mt-[0.6em] flex flex-wrap content-start text-gradient-black-gray">
        {secondLine.map((token, index) => (
          <RevealToken key={`about-second-${index}`} progress={scrollYProgress} index={firstLine.length + index} total={tokens.length}>
            {token.content}
          </RevealToken>
        ))}
      </p>
    </div>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="box-border lg:h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8 mt-50" aria-label="About section">
      <div className="container mx-auto grid lg:h-full grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
        <AboutRevealText />

        <p className="whitespace-pre-line text-sm tracking-wide text-gradient-black-gray md:col-start-1 md:col-end-2 md:row-start-4 md:row-end-5 md:text-base mt-8">
          CRAFTING END-TO-END
          {'\n'}ARTIFICIAL INTELLIGENCE
          {'\n'}SYSTEMS AND PIPELINES.
        </p>
        <div className="whitespace-pre-line text-sm tracking-wide md:col-start-5 md:col-end-6 md:row-start-4 md:row-end-5 md:text-base ">
          <a
            href="/HaMinhQuan_CV.pdf"
            download
            className="group relative inline-flex h-36 w-36 cursor-pointer items-center justify-center rounded-full text-gradient-black-gray no-underline"
            aria-label="Download CV"
          >
            <SpinningText>Download CV • Download CV•</SpinningText>
            <span className="absolute inset-0 flex cursor-pointer items-center justify-center text-sm font-normal uppercase group-hover:font-medium">
              click
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
