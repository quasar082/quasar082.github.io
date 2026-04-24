import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const siteUrl = new URL('https://quasar0802.github.io');

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: 'Quasar Portfolio',
  title: {
    default: 'Quasar | AI Engineer',
    template: '%s | Quasar',
  },
  description:
    'Ha Minh Quan, also known as Quasar, builds advanced AI applications, agent orchestration systems, and automated AI pipelines.',
  authors: [{ name: 'Ha Minh Quan' }],
  creator: 'Ha Minh Quan',
  publisher: 'Quasar',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Quasar Portfolio',
    title: 'Quasar | AI Engineer',
    description:
      'Ha Minh Quan builds advanced AI applications, agent orchestration systems, and automated AI pipelines.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quasar | AI Engineer',
    description:
      'Ha Minh Quan builds advanced AI applications, agent orchestration systems, and automated AI pipelines.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
