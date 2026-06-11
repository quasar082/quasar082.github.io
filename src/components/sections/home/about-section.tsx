"use client"

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { TextReveal } from '@/components/ui/text-reveal';

const aboutCopy = [
  '"Hi! My name is Ha Minh Quan — Quasar. I am an AI engineer based in Vietnam, focused on architecture design, operational optimization, and scaling intelligent systems."',
  '"I build end-to-end AI products — from unstructured data processing and multi-agent systems to chatbots and real-world deployment."',
].join('\n');

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["center 58%", "center 42%"],
  });
  const markerLeft = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const markerTop = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const markerX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const markerY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={sectionRef} id="about" className="box-border lg:h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8 mt-50" aria-label="About section">
      <div className="container mx-auto grid lg:h-full grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
        <TextReveal
          className="mt-8 self-start text-3xl leading-[1] [&_*]:leading-[1] md:col-start-2 md:col-end-6 md:row-start-1 md:row-end-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)] [&>span]:text-gradient-black-gray"
          italicWords={["Ha", "Minh", "Quan", "Quasar"]}
          decorativeDashes
        >
          {aboutCopy}
        </TextReveal>

        <div className="relative min-h-28 md:col-start-1 md:col-end-2 md:row-start-4 md:row-end-5 md:min-h-36">
          <motion.div
            className="absolute inline-flex items-center gap-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] leading-[1] tracking-[-0.045em] text-gradient-black-gray md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)] [&_*]:leading-[1]"
            style={{ left: markerLeft, top: markerTop, x: markerX, y: markerY }}
          >
            <span aria-hidden="true" className="relative inline-block h-[0.72em] w-[0.72em] shrink-0">
              <span className="absolute left-[0.08em] top-1/2 h-[0.055em] w-[0.58em] origin-right -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              <span className="absolute right-[0.08em] top-[0.08em] h-[0.35em] w-[0.35em] border-r-[0.055em] border-t-[0.055em] border-current" />
            </span>
            <span>2002</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
