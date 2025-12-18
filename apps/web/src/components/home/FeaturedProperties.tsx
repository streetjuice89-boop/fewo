'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Users, Bed, Bath, ArrowRight } from 'lucide-react';
import { Button, Card, Badge, Spinner } from '@voyagenest/ui';
import { propertiesApi } from '@/lib/api';

interface Property {
  id: string;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  country: {
    nameDe: string;
    nameEn: string;
    flagEmoji: string;
  };
  categories: Array<{
    nameDe: string;
    nameEn: string;
  }>;
}

export function FeaturedProperties() {
  const t = useTranslations('properties');
  const tc = useTranslations('common');
  const locale = useLocale();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertiesApi.getFeatured(6) as Promise<Property[]>,
  });

  const getLocalizedTitle = (property: Property) =>
    locale === 'de' ? property.titleDe : property.titleEn;

  const getLocalizedCountry = (property: Property) =>
    locale === 'de' ? property.country.nameDe : property.country.nameEn;

  return (
    <section className="py-20 bg-navy-deep">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl font-bold text-pearl mb-4"
          >
            {t('featured')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties?.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/${locale}/properties/${property.id}`}>
                  <Card hover className="h-full group cursor-pointer">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'}
                        alt={getLocalizedTitle(property)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="property-image-overlay" />

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge variant="warning" className="bg-sunset text-navy-deep font-semibold">
                          €{property.pricePerNight} {tc('perNight')}
                        </Badge>
                      </div>

                      {/* Country */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <span className="text-2xl">{property.country.flagEmoji}</span>
                        <span className="text-pearl text-sm font-ui">
                          {getLocalizedCountry(property)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-pearl mb-2 group-hover:text-sunset transition-colors">
                        {getLocalizedTitle(property)}
                      </h3>

                      {/* Features */}
                      <div className="flex flex-wrap gap-4 text-warm-gray text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{property.maxGuests}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2">
                        {property.categories?.slice(0, 2).map((cat, i) => (
                          <Badge key={i} variant="default" className="text-xs">
                            {locale === 'de' ? cat.nameDe : cat.nameEn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href={`/${locale}/properties`}>
            <Button variant="outline" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              {tc('viewAll')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

