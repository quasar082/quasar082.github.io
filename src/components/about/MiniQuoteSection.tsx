'use client';

import {useTranslations} from 'next-intl';
import {TextReveal} from '@/components/animations/TextReveal';

export function MiniQuoteSection() {
  const t = useTranslations('About');

  return (
    <section
      className="flex min-h-[40vh] max-h-[50vh] items-center justify-center px-6 md:px-8 lg:px-20"
      style={{
        paddingTop: 'var(--spacing-section-sm)',
        paddingBottom: 'var(--spacing-section-sm)',
      }}
    >
      <div className="mx-auto max-w-[900px] text-center">
        <TextReveal
          as="p"
          type="words"
          stagger={0.04}
          className="font-display text-text-primary"
          style={{
            fontSize: 'var(--text-display-md)',
            fontWeight: 'var(--font-weight-display)',
            lineHeight: '1.2',
          }}
        >
          {t('quote')}
        </TextReveal>
      </div>
    </section>
  );
}
