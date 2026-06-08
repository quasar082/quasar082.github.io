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
        <div className="flex justify-between items-center w-full ">
          <div className="flex h-full items-end justify-start w-fit leading-none mt-auto">
            <p className="m-0 leading-none text-[clamp(0.85rem,1.35vw,1.1rem)] font-semibold leading-none tracking-[-0.03em] text-gradient-black-gray opacity-45">Scroll</p>
          </div>

          <div className="w-3/5 flex-shrink-0">
          <div className="@container w-full"> 
  
  {/* 2. Thẻ con đổi từ 100cqw thành 16.6cqw, hạ giới hạn max xuống */}
  <p className="text-[clamp(1rem,32.1cqw,100rem)] font-medium whitespace-nowrap  w-fit leading-[0.95] text-gradient-black-gray">
    quasar
  </p>
  
</div>
            {/* <FitHeroText text="quasar" align="right" className="h-[clamp(6.5rem,17vw,14rem)] w-full" /> */}
            <div className="mt-8 ml-auto w-full">
              <p className="m-0 text-left text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-gradient-black-gray">Harness AI.</p>
              <p className="mt-2 m-0 text-left  text-[clamp(1rem,3vw,5rem)] leading-[0.7] tracking-[-0.05em] text-gradient-black-gray">Shape what&apos;s next.</p>
            </div>
          </div>
        </div>
   </div>
    </section>
  );
}
