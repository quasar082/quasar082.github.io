import { SpinningText } from '@/components/ui/spinning-text';
import { TextReveal } from '@/components/ui/text-reveal';

type AboutSectionProps = {
  paragraphs: string[];
};

export function AboutSection({ paragraphs }: AboutSectionProps) {
  return (
    <section id="about" className="box-border lg:h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8 mt-50" aria-label="About section">
      <div className="container mx-auto grid lg:h-full grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
        <TextReveal
          className="mt-8 self-start text-3xl leading-[1] [&_*]:leading-[1] md:col-start-2 md:col-end-6 md:row-start-1 md:row-end-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)] [&>span]:text-gradient-black-gray"
          italicWords={["Ha", "Minh", "Quan", "Quasar"]}
        >
          {paragraphs.map((paragraph) => `"${paragraph}"`).join('\n')}
        </TextReveal>

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
