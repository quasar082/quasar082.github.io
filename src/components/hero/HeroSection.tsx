'use client';

import {useTranslations} from 'next-intl';
import {Marquee} from '@/components/hero/Marquee';

export function HeroSection() {
  const t = useTranslations('Hero');

  return (
    <section className="relative flex h-[100dvh] flex-col justify-between overflow-hidden">
      {/* Upper content area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        {/* Photo placeholder */}
        <div className="h-[280px] w-[220px] rounded-lg bg-greige-200 md:h-[350px] md:w-[280px]" />

        {/* Role text */}
        <p
          className="mt-6 font-display font-[300] text-text-primary"
          style={{fontSize: 'var(--text-display-md)'}}
        >
          {t('role')}
        </p>

        {/* Tagline */}
        <p className="mt-3 text-lg text-text-secondary md:text-xl">
          {t('tagline')}
        </p>
      </div>

      {/* Marquee - anchored at bottom of viewport */}
      <div className="pointer-events-none relative z-0 pb-8 md:pb-12">
        <Marquee />
      </div>
    </section>
  );
}
