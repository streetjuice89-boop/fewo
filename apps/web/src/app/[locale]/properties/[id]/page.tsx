'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  MapPin, Users, Bed, Bath, Wifi, Car, Waves, Wind, Utensils,
  Tv, Shirt, Flame, ChevronLeft, ChevronRight, Calendar, ArrowLeft
} from 'lucide-react';
import { Button, Badge, Spinner } from '@voyagenest/ui';
import { propertiesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

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
  address: string;
  images: string[];
  amenities: string[];
  country: {
    nameDe: string;
    nameEn: string;
    flagEmoji: string;
  };
  categories: Array<{
    nameDe: string;
    nameEn: string;
  }>;
  bookings: Array<{
    checkIn: string;
    checkOut: string;
  }>;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  pool: <Waves className="h-5 w-5" />,
  aircon: <Wind className="h-5 w-5" />,
  kitchen: <Utensils className="h-5 w-5" />,
  tv: <Tv className="h-5 w-5" />,
  washer: <Shirt className="h-5 w-5" />,
  heating: <Flame className="h-5 w-5" />,
};

const amenityLabels: Record<string, { de: string; en: string }> = {
  wifi: { de: 'WLAN', en: 'WiFi' },
  parking: { de: 'Parkplatz', en: 'Parking' },
  pool: { de: 'Pool', en: 'Pool' },
  aircon: { de: 'Klimaanlage', en: 'Air Conditioning' },
  kitchen: { de: 'Küche', en: 'Kitchen' },
  tv: { de: 'TV', en: 'TV' },
  washer: { de: 'Waschmaschine', en: 'Washer' },
  heating: { de: 'Heizung', en: 'Heating' },
  bbq: { de: 'Grill', en: 'BBQ' },
  garden: { de: 'Garten', en: 'Garden' },
  balcony: { de: 'Balkon', en: 'Balcony' },
  'sea-view': { de: 'Meerblick', en: 'Sea View' },
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('properties');
  const tb = useTranslations('booking');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { user } = useAuthStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', params.id],
    queryFn: () => propertiesApi.getById(params.id) as Promise<Property>,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep pt-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep pt-20">
        <p className="text-warm-gray">{tc('error')}</p>
      </div>
    );
  }

  const title = locale === 'de' ? property.titleDe : property.titleEn;
  const description = locale === 'de' ? property.descriptionDe : property.descriptionEn;
  const countryName = locale === 'de' ? property.country.nameDe : property.country.nameEn;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = nights * property.pricePerNight;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-navy-deep pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href={`/${locale}/properties`}
          className="inline-flex items-center gap-2 text-warm-gray hover:text-sunset mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{locale === 'de' ? 'Zurück zur Übersicht' : 'Back to listings'}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={property.images[currentImageIndex] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200'}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>

              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-navy-deep/80 text-pearl hover:bg-navy-medium transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-navy-deep/80 text-pearl hover:bg-navy-medium transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-sunset' : 'bg-pearl/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-2 text-warm-gray mb-2">
                <span className="text-xl">{property.country.flagEmoji}</span>
                <span>{countryName}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-pearl mb-4">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-warm-gray">
                <MapPin className="h-5 w-5 text-sunset" />
                <span>{property.address}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, value: property.maxGuests, label: tc('guests') },
                { icon: Bed, value: property.bedrooms, label: tc('bedrooms') },
                { icon: Bath, value: property.bathrooms, label: tc('bathrooms') },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-navy-medium rounded-xl p-4 text-center border border-navy-light"
                >
                  <stat.icon className="h-6 w-6 text-sunset mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pearl">{stat.value}</p>
                  <p className="text-sm text-warm-gray">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {t('details.description')}
              </h2>
              <p className="text-warm-gray leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-display text-xl font-semibold text-pearl mb-4">
                {t('details.amenities')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-navy-medium rounded-xl border border-navy-light"
                  >
                    <div className="text-sunset">
                      {amenityIcons[amenity] || <Wifi className="h-5 w-5" />}
                    </div>
                    <span className="text-pearl text-sm">
                      {amenityLabels[amenity]?.[locale as 'de' | 'en'] || amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {property.categories.map((cat, index) => (
                <Badge key={index} variant="info">
                  {locale === 'de' ? cat.nameDe : cat.nameEn}
                </Badge>
              ))}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-navy-medium rounded-2xl p-6 border border-navy-light">
              {/* Price */}
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-sunset">€{property.pricePerNight}</p>
                <p className="text-warm-gray">{tc('perNight')}</p>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-warm-gray mb-2">{tb('selectDates')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-navy-light border-none rounded-xl pl-10 pr-3 py-3 text-pearl text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full bg-navy-light border-none rounded-xl pl-10 pr-3 py-3 text-pearl text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-warm-gray mb-2">{tc('guests')}</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
                  >
                    {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? (locale === 'de' ? 'Gast' : 'Guest') : tc('guests')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="border-t border-navy-light pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-warm-gray">
                    <span>
                      €{property.pricePerNight} x {nights} {tb('nights')}
                    </span>
                    <span>€{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-pearl font-semibold text-lg">
                    <span>{tb('totalPrice')}</span>
                    <span className="text-sunset">€{totalPrice}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              {user ? (
                <Link
                  href={`/${locale}/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                >
                  <Button className="w-full" size="lg" disabled={!checkIn || !checkOut}>
                    {tb('bookNow')}
                  </Button>
                </Link>
              ) : (
                <Link href={`/${locale}/auth/login`}>
                  <Button className="w-full" size="lg">
                    {locale === 'de' ? 'Anmelden zum Buchen' : 'Login to Book'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

