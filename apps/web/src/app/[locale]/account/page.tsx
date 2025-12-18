'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Mail, Phone, Settings, ArrowRight } from 'lucide-react';
import { Button, Card, Badge, Spinner, Avatar } from '@voyagenest/ui';
import { bookingsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  property: {
    titleDe: string;
    titleEn: string;
    images: string[];
    country: { nameDe: string; nameEn: string; flagEmoji: string };
  };
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'default',
};

export default function AccountPage() {
  const t = useTranslations('account');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMyBookings(1, 5),
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, router, locale]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep pt-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const bookings = (bookingsData as { data: Booking[] })?.data || [];

  return (
    <div className="min-h-screen bg-navy-deep pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-pearl mb-8">{t('title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div>
            <Card className="p-6">
              <div className="text-center mb-6">
                <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" className="mx-auto mb-4 w-20 h-20" />
                <h2 className="font-display text-xl font-semibold text-pearl">
                  {user.firstName} {user.lastName}
                </h2>
                <Badge variant="info" className="mt-2">
                  {user.role === 'admin' ? 'Administrator' : 'Kunde'}
                </Badge>
              </div>

              <div className="space-y-4 border-t border-navy-light pt-4">
                <div className="flex items-center gap-3 text-warm-gray">
                  <Mail className="h-5 w-5 text-sunset" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href={`/${locale}/account/settings`}>
                  <Button variant="outline" className="w-full" leftIcon={<Settings className="h-5 w-5" />}>
                    {t('settings')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-pearl">{t('bookings')}</h2>
              <Link href={`/${locale}/account/bookings`}>
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {tc('viewAll')}
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-warm-gray mx-auto mb-4" />
                <p className="text-warm-gray mb-4">{t('noBookings')}</p>
                <Link href={`/${locale}/properties`}>
                  <Button>{locale === 'de' ? 'Unterkünfte entdecken' : 'Explore Properties'}</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={booking.property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=200'}
                            alt={locale === 'de' ? booking.property.titleDe : booking.property.titleEn}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-display font-semibold text-pearl">
                                {locale === 'de' ? booking.property.titleDe : booking.property.titleEn}
                              </h3>
                              <p className="text-sm text-warm-gray flex items-center gap-1">
                                {booking.property.country.flagEmoji}
                                {locale === 'de' ? booking.property.country.nameDe : booking.property.country.nameEn}
                              </p>
                            </div>
                            <Badge variant={statusColors[booking.status]}>
                              {t(`bookingStatus.${booking.status}`)}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-warm-gray">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </span>
                            <span className="text-sunset font-semibold">€{booking.totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

