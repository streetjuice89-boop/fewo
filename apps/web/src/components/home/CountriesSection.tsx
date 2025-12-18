'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { countriesApi } from '@/lib/api';

interface Country {
  id: string;
  nameDe: string;
  nameEn: string;
  code: string;
  flagEmoji: string;
  _count: {
    properties: number;
  };
}

const countryImages: Record<string, string> = {
  ES: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600',
  IT: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600',
  GR: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600',
  PT: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600',
  HR: 'https://images.unsplash.com/photo-1555990538-1e7e8234ed7e?w=600',
  FR: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
  DE: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600',
  AT: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600',
};

export function CountriesSection() {
  const locale = useLocale();

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.getAll() as Promise<Country[]>,
  });

  const getLocalizedName = (country: Country) =>
    locale === 'de' ? country.nameDe : country.nameEn;

  return (
    <section className="py-20 bg-gradient-navy">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl font-bold text-pearl mb-4"
          >
            {locale === 'de' ? 'Entdecken Sie unsere Destinationen' : 'Discover Our Destinations'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray max-w-2xl mx-auto"
          >
            {locale === 'de'
              ? 'Von sonnigen Stränden bis zu malerischen Bergdörfern - finden Sie Ihr perfektes Reiseziel'
              : 'From sunny beaches to picturesque mountain villages - find your perfect destination'}
          </motion.p>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {countries?.slice(0, 8).map((country, index) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/${locale}/properties?countryId=${country.id}`}>
                <div className="group relative h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${countryImages[country.code] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600'})`,
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl md:text-3xl">{country.flagEmoji}</span>
                      <h3 className="font-display text-lg md:text-xl font-semibold text-pearl group-hover:text-sunset transition-colors">
                        {getLocalizedName(country)}
                      </h3>
                    </div>
                    <p className="text-sm text-warm-gray">
                      {country._count.properties}{' '}
                      {locale === 'de' ? 'Unterkünfte' : 'Properties'}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-sunset p-2 rounded-full">
                      <ArrowRight className="h-4 w-4 text-navy-deep" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

