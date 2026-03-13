'use client';

import {useEffect} from 'react';

const SUPPORTED_LOCALES = ['en', 'vi'];
const DEFAULT_LOCALE = 'en';
const STORAGE_KEY = 'preferred-locale';

export default function RootPage() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      window.location.replace(`/${stored}/`);
      return;
    }

    const browserLang = navigator.language.split('-')[0];
    const detected = SUPPORTED_LOCALES.includes(browserLang)
      ? browserLang
      : DEFAULT_LOCALE;

    localStorage.setItem(STORAGE_KEY, detected);
    window.location.replace(`/${detected}/`);
  }, []);

  return (
    <html>
      <body style={{backgroundColor: '#030712', margin: 0}} />
    </html>
  );
}
