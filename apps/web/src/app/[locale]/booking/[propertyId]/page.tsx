'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, Users, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Textarea, Spinner } from '@voyagenest/ui';
import { propertiesApi, bookingsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Property {
  id: string;
  titleDe: string;
  titleEn: string;
  pricePerNight: number;
  images: string[];
  country: { nameDe: string; nameEn: string; flagEmoji: string };
}

export default function BookingPage({ params }: { params: { propertyId: string } }) {
  const t = useTranslations('booking');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', params.propertyId],
    queryFn: () => propertiesApi.getById(params.propertyId) as Promise<Property>,
  });

  const createBookingMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        propertyId: params.propertyId,
        checkIn,
        checkOut,
        guests,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      setStep(3);
      toast.success(t('success'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, router, locale]);

  if (!user || isLoading) {
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
  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = nights * property.pricePerNight;

  const handleSubmit = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      createBookingMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          href={`/${locale}/properties/${params.propertyId}`}
          className="inline-flex items-center gap-2 text-warm-gray hover:text-sunset mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{locale === 'de' ? 'Zurück zur Unterkunft' : 'Back to property'}</span>
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-sunset text-navy-deep'
                    : 'bg-navy-light text-warm-gray'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 ${
                    step > s ? 'bg-sunset' : 'bg-navy-light'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 3 ? (
          /* Success Step */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-pearl mb-4">{t('success')}</h1>
            <p className="text-warm-gray mb-8 max-w-md mx-auto">{t('successMessage')}</p>
            <div className="flex gap-4 justify-center">
              <Link href={`/${locale}/account/bookings`}>
                <Button>{locale === 'de' ? 'Meine Buchungen' : 'My Bookings'}</Button>
              </Link>
              <Link href={`/${locale}/properties`}>
                <Button variant="outline">
                  {locale === 'de' ? 'Weitere Unterkünfte' : 'More Properties'}
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {step === 1 ? (
                  /* Step 1: Dates & Guests */
                  <div>
                    <h2 className="font-display text-xl font-semibold text-pearl mb-6">
                      {t('selectDates')}
                    </h2>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-warm-gray mb-2">
                            {locale === 'de' ? 'Anreise' : 'Check-in'}
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                            <input
                              type="date"
                              value={checkIn}
                              onChange={(e) => setCheckIn(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full bg-navy-light border-none rounded-xl pl-10 pr-4 py-3 text-pearl"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-warm-gray mb-2">
                            {locale === 'de' ? 'Abreise' : 'Check-out'}
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                            <input
                              type="date"
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              min={checkIn || new Date().toISOString().split('T')[0]}
                              className="w-full bg-navy-light border-none rounded-xl pl-10 pr-4 py-3 text-pearl"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-warm-gray mb-2">{tc('guests')}</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                          <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full bg-navy-light border-none rounded-xl pl-10 pr-4 py-3 text-pearl appearance-none"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Gast' : 'Gäste'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Confirm & Notes */
                  <div>
                    <h2 className="font-display text-xl font-semibold text-pearl mb-6">
                      {t('confirmBooking')}
                    </h2>

                    <div className="space-y-6">
                      <div className="bg-navy-light rounded-xl p-4">
                        <h3 className="font-semibold text-pearl mb-3">{t('guestInfo')}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-warm-gray">Name:</span>
                            <p className="text-pearl">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                          <div>
                            <span className="text-warm-gray">Email:</span>
                            <p className="text-pearl">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Textarea
                          label={t('notes')}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t('notesPlaceholder')}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  {step === 2 && (
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      {locale === 'de' ? 'Zurück' : 'Back'}
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmit}
                    disabled={!checkIn || !checkOut || createBookingMutation.isPending}
                    isLoading={createBookingMutation.isPending}
                    className={step === 1 ? 'ml-auto' : ''}
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    {step === 1 ? (locale === 'de' ? 'Weiter' : 'Continue') : t('confirmBooking')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div>
              <Card className="p-6 sticky top-28">
                <div className="flex gap-4 mb-6">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=200'}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-warm-gray">
                      {property.country.flagEmoji}{' '}
                      {locale === 'de' ? property.country.nameDe : property.country.nameEn}
                    </p>
                    <h3 className="font-display font-semibold text-pearl">{title}</h3>
                  </div>
                </div>

                <div className="border-t border-navy-light pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">
                      {locale === 'de' ? 'Anreise' : 'Check-in'}
                    </span>
                    <span className="text-pearl">{checkIn || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">
                      {locale === 'de' ? 'Abreise' : 'Check-out'}
                    </span>
                    <span className="text-pearl">{checkOut || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">{tc('guests')}</span>
                    <span className="text-pearl">{guests}</span>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="border-t border-navy-light pt-4 mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">
                        €{property.pricePerNight} x {nights} {t('nights')}
                      </span>
                      <span className="text-pearl">€{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-pearl">{t('totalPrice')}</span>
                      <span className="text-sunset">€{totalPrice}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

