"use client"

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

import { TextReveal } from '@/components/ui/text-reveal';

const aboutCopy = [
  '"Hi! My name is Ha Minh Quan — Quasar. I am an AI engineer, focused on architecture design, operational optimization, and scaling intelligent systems."',
  '"I build end-to-end AI products — from unstructured data processing and multi-agent systems to chatbots and real-world deployment."',
].join('\n');

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["center 70%", "center 30%"],
  });
  const markerLeft = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const markerTop = "calc(100% - 15rem)";
  const markerX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={sectionRef} id="about" className="relative box-border lg:h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8 mt-50" aria-label="About section">
      <div className="container relative mx-auto grid lg:h-full grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
        <TextReveal
          className="mt-8 self-start text-3xl leading-[1] [&_*]:leading-[1] md:col-start-2 md:col-end-6 md:row-start-1 md:row-end-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)] [&>span]:text-gradient-black-gray"
          italicWords={["Ha", "Minh", "Quan", "Quasar"]}
          decorativeDashes
        >
          {aboutCopy}
        </TextReveal>

        <motion.div
          className="absolute z-10 inline-flex items-center gap-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] leading-[1] tracking-[-0.045em] text-gradient-black-gray md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)] [&_*]:leading-[1]"
          style={{ left: markerLeft, top: markerTop, x: markerX }}
        >
          <ArrowUpRight aria-hidden="true" className="h-[0.82em] w-[0.82em] shrink-0 stroke-[1.4] text-black" />
          <span>2002 Vietnamesé</span>
        </motion.div>
      </div>
    </section>
  );
}
