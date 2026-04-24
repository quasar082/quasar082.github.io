import { SpinningText } from '@/components/ui/spinning-text';
import { TextReveal } from '@/components/ui/text-reveal';

export function AboutSection() {
  return (
    <section className="box-border h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8" aria-label="About section">
      <div className="container mx-auto grid h-full grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
        <h2 className="text-4xl mt-8 leading-tight md:col-start-2 md:col-end-6 md:row-start-1 md:row-end-3 md:text-5xl lg:text-6xl xl:text-6xl">
          <TextReveal italicWords={["ha", "minh", "quan", "quasar"]}>
            Hi! My name is Ha Minh Quan a.k.a Quasar. An AI engineer based in Vietnam. I focus on architecture design, operational optimization, and scaling intelligent systems - from large-scale unstructured data processing, multi-agent systems, and chatbots to real-world deployment.
          </TextReveal>
        </h2>

        <p className="whitespace-pre-line text-sm tracking-wide md:col-start-1 md:col-end-2 md:row-start-4 md:row-end-5 md:text-base mt-8">
          CRAFTING END-TO-END
          {'\n'}ARTIFICIAL INTELLIGENCE
          {'\n'}SYSTEMS AND PIPELINES.
        </p>
        <div className="whitespace-pre-line text-sm tracking-wide md:col-start-5 md:col-end-6 md:row-start-4 md:row-end-5 md:text-base ">
          <a
            href="/HaMinhQuan_CV.pdf"
            download
            className="group relative inline-flex h-36 w-36 cursor-pointer items-center justify-center rounded-full text-black no-underline"
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
