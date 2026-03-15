'use client';

import {useTranslations} from 'next-intl';
import {TextReveal} from '@/components/animations/TextReveal';

export function AboutSection() {
  const t = useTranslations('About');

  return (
    <section className="px-6 py-section md:px-8">
      <div className="mx-auto max-w-[800px]">
        <TextReveal
          as="h2"
          type="words"
          className="font-display text-text-primary"
          style={{
            fontSize: 'var(--text-display-md)',
            fontWeight: 'var(--font-weight-display)',
          }}
        >
          {t('heading')}
        </TextReveal>
        <div className="mt-12 space-y-6">
          <TextReveal
            as="p"
            type="lines"
            stagger={0.05}
            className="text-lg leading-relaxed text-text-secondary"
          >
            {t('story1')}
          </TextReveal>
          <TextReveal
            as="p"
            type="lines"
            stagger={0.05}
            className="text-lg leading-relaxed text-text-secondary"
          >
            {t('story2')}
          </TextReveal>
          <TextReveal
            as="p"
            type="lines"
            stagger={0.05}
            className="text-lg leading-relaxed text-text-secondary"
          >
            {t('expertise')}
          </TextReveal>
        </div>
      </div>
    </section>
  );
}
