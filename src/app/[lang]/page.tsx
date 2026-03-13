'use client';

import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-balance font-display text-4xl font-medium text-text-primary sm:text-5xl">
          {t('welcome')}
        </h1>
        <p className="text-pretty mt-4 font-body text-lg text-text-secondary">
          {t('subtitle')}
        </p>
      </div>
    </main>
  );
}
