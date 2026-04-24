import type { Metadata } from 'next';
import { HomePageClient } from '@/components/sections/home/home-page-client';

export const metadata: Metadata = {
  title: 'Quasar | AI Engineer',
  description:
    'Ha Minh Quan, also known as Quasar, builds advanced AI applications, agent orchestration systems, and automated AI pipelines.',
  alternates: {
    canonical: '/',
  },
};

export default function RootPage() {
  return <HomePageClient />;
}
