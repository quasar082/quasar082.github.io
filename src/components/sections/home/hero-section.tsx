'use client';

const heroVideoPath = '/hero/DNA 3D Animation by Tridimensi on Dribbble.mp4';

export function HeroSection() {
  return (
    <section id="home" data-home-hero-image className="relative h-dvh overflow-hidden px-4 pt-24 text-black sm:px-6 lg:px-8 flex flex-col" aria-label="Hero section">
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

      <div className="container relative z-10 mx-auto mt-auto pb-15 [@media(min-height:900px)]:pb-25">
        <div className="flex flex-col md:flex-row  justify-between items-center w-full ">
          <div className="flex h-full w-fit items-end justify-end leading-none md:justify-start mt-auto">
            <div className="flex items-center gap-3 opacity-45">
              <span
                className="h-[clamp(0.42rem,0.72vw,0.62rem)] w-[clamp(2.8rem,6vw,5.6rem)] rounded-full bg-[linear-gradient(90deg,rgba(20,20,20,0.96),rgba(20,20,20,0.72)_48%,rgba(20,20,20,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_18px_rgba(0,0,0,0.18)]"
                aria-hidden="true"
              />
              <p className="m-0 text-[clamp(0.85rem,1.35vw,1.1rem)] font-semibold leading-none tracking-[-0.03em] text-gradient-black-gray">Scroll</p>
            </div>
          </div>

          <div className="w-4/5 md:w-3/5 flex-shrink-0">
          <div className="@container w-full">

  <p className="text-[clamp(1rem,32.1cqw,100rem)] md:text-[clamp(1rem,32.1cqw,100rem)] font-medium whitespace-nowrap  w-fit leading-[0.95] text-gradient-black-gray">
    quasar
  </p>

</div>
            {/* <FitHeroText text="quasar" align="right" className="h-[clamp(6.5rem,17vw,14rem)] w-full" /> */}
            <div className="mt-8 ml-auto w-full">
              <p className="m-0 text-left text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-gradient-black-gray">Harness AI</p>
              <p className="mt-2 m-0 text-left  text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-gradient-black-gray">Shape what&apos;s next.</p>
            </div>
          </div>
        </div>
   </div>
    </section>
  );
}
