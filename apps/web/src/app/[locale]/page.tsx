import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { CountriesSection } from '@/components/home/CountriesSection';
import { TrustSection } from '@/components/home/TrustSection';
import { CTASection } from '@/components/home/CTASection';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'hero' });

  return {
    title: 'VoyageNest - ' + t('title'),
    description: t('subtitle'),
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProperties />
      <CountriesSection />
      <TrustSection />
      <CTASection />
    </>
  );
}

