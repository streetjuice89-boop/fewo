'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Users, Bed, Bath, Search, Filter, X } from 'lucide-react';
import { Button, Card, Badge, Input, Select, Spinner } from '@voyagenest/ui';
import { propertiesApi, countriesApi, categoriesApi } from '@/lib/api';

interface Property {
  id: string;
  titleDe: string;
  titleEn: string;
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

interface Country {
  id: string;
  nameDe: string;
  nameEn: string;
}

interface Category {
  id: string;
  nameDe: string;
  nameEn: string;
}

export default function PropertiesPage() {
  const t = useTranslations('properties');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [filters, setFilters] = useState({
    search: '',
    countryId: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    minGuests: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.countryId) params.countryId = filters.countryId;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minGuests) params.minGuests = filters.minGuests;
      return propertiesApi.getAll(params);
    },
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.getAll() as Promise<Country[]>,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll() as Promise<Category[]>,
  });

  const properties = (propertiesData as { data: Property[] })?.data || [];

  const clearFilters = () => {
    setFilters({
      search: '',
      countryId: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      minGuests: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="min-h-screen bg-navy-deep pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-pearl mb-2">
            {t('title')}
          </h1>
          <p className="text-warm-gray">{t('subtitle')}</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={locale === 'de' ? 'Suchen...' : 'Search...'}
                className="w-full bg-navy-medium border border-navy-light rounded-xl pl-12 pr-4 py-3 text-pearl placeholder:text-warm-gray focus:ring-2 focus:ring-sunset focus:border-transparent"
              />
            </div>
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-5 w-5" />}
            >
              {tc('filter')}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-navy-medium rounded-xl p-6 border border-navy-light"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-warm-gray mb-2">{t('filters.country')}</label>
                  <select
                    value={filters.countryId}
                    onChange={(e) => setFilters({ ...filters, countryId: e.target.value })}
                    className="w-full bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
                  >
                    <option value="">{t('filters.allCountries')}</option>
                    {countries?.map((country) => (
                      <option key={country.id} value={country.id}>
                        {locale === 'de' ? country.nameDe : country.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-warm-gray mb-2">{t('filters.category')}</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                    className="w-full bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
                  >
                    <option value="">{t('filters.allCategories')}</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {locale === 'de' ? category.nameDe : category.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-warm-gray mb-2">{t('filters.priceRange')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="Min"
                      className="w-1/2 bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="Max"
                      className="w-1/2 bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-warm-gray mb-2">{t('filters.minGuests')}</label>
                  <input
                    type="number"
                    value={filters.minGuests}
                    onChange={(e) => setFilters({ ...filters, minGuests: e.target.value })}
                    min="1"
                    className="w-full bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X className="h-4 w-4" />}>
                    {tc('reset')}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-warm-gray text-lg">{t('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/${locale}/properties/${property.id}`}>
                  <Card hover className="h-full group cursor-pointer">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'}
                        alt={locale === 'de' ? property.titleDe : property.titleEn}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="property-image-overlay" />
                      <div className="absolute top-4 right-4">
                        <Badge variant="warning" className="bg-sunset text-navy-deep font-semibold">
                          €{property.pricePerNight} {tc('perNight')}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <span className="text-2xl">{property.country.flagEmoji}</span>
                        <span className="text-pearl text-sm">
                          {locale === 'de' ? property.country.nameDe : property.country.nameEn}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-pearl mb-2 group-hover:text-sunset transition-colors">
                        {locale === 'de' ? property.titleDe : property.titleEn}
                      </h3>
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
      </div>
    </div>
  );
}

