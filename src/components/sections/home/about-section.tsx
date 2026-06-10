import { SpinningText } from '@/components/ui/spinning-text';

export function AboutSection() {
  return (
    <section id="about" className="box-border lg:h-dvh bg-white px-4 py-10 text-black sm:px-6 lg:px-8 mt-50" aria-label="About section">
      <div className="container mx-auto grid lg:h-full grid-cols-1 grid-rows-1 gap-6 md:grid-cols-5 md:grid-rows-4">
        <div className="mt-8 self-start text-3xl leading-[1] md:col-start-2 md:col-end-6 md:row-start-1 md:row-end-3 text-[clamp(1.85rem,3.7vmin,2.75rem)] md:text-[clamp(1.85rem,3.7vmin,3.7rem)] lg:text-[clamp(1.85rem,4.6vmin,3.7rem)] xl:text-[clamp(1.85rem,5.4vmin,3.7rem)]">
          <p className="m-0 text-gradient-black-gray">
            &quot;Hi! My name is <em>Ha</em> <em>Minh</em> <em>Quan</em>{' '}
            <span className="mx-2 inline-block align-middle text-gradient-black-gray" aria-hidden="true">
              <span className="relative inline-block h-[0.05em] w-[1.6em] align-[0.28em] bg-current before:absolute before:left-0 before:top-1/2 before:h-[0.28em] before:w-[0.28em] before:-translate-y-1/2 before:rotate-45 before:border-b-[0.05em] before:border-l-[0.05em] before:border-current" />
            </span>
            <span className="sr-only"> — </span>
            <em>Quasar</em>. I am an AI engineer based in Vietnam, focused on architecture design, operational optimization, and scaling intelligent systems.&quot;
          </p>
          <p className="m-0 mt-[0.6em] text-gradient-black-gray">
            &quot;I build end-to-end AI products — from unstructured data processing and multi-agent systems to chatbots and real-world deployment.&quot;
          </p>
        </div>

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
