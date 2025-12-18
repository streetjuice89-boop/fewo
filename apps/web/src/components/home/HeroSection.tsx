'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Calendar, Users } from 'lucide-react';
import { Button, Input } from '@voyagenest/ui';

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    router.push(`/${locale}/properties?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&q=80)',
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sunset/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sunset font-ui text-sm tracking-[0.3em] mb-6"
          >
            RENT. RELAX. EXPLORE.
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-pearl mb-6 leading-tight"
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-lg sm:text-xl text-warm-gray mb-12 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-navy-medium/90 backdrop-blur-lg rounded-2xl p-6 shadow-card-hover border border-navy-light"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-sm text-warm-gray mb-2 font-ui">
                  {t('searchPlaceholder')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Mallorca, Barcelona..."
                    className="w-full bg-navy-light border-none rounded-xl pl-10 pr-4 py-3 text-pearl placeholder:text-warm-gray focus:ring-2 focus:ring-sunset"
                  />
                </div>
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-sm text-warm-gray mb-2 font-ui">{t('checkIn')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-navy-light border-none rounded-xl pl-10 pr-4 py-3 text-pearl focus:ring-2 focus:ring-sunset"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-sm text-warm-gray mb-2 font-ui">{t('checkOut')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-navy-light border-none rounded-xl pl-10 pr-4 py-3 text-pearl focus:ring-2 focus:ring-sunset"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div>
                <Button onClick={handleSearch} className="w-full" size="lg">
                  {t('searchButton')}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {[
              { value: '500+', label: locale === 'de' ? 'Unterkünfte' : 'Properties' },
              { value: '8', label: locale === 'de' ? 'Länder' : 'Countries' },
              { value: '10k+', label: locale === 'de' ? 'Zufriedene Gäste' : 'Happy Guests' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-display text-3xl font-bold text-sunset">{stat.value}</p>
                <p className="text-sm text-warm-gray font-ui">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-pearl/50 rounded-full flex justify-center"
        >
          <motion.div className="w-1 h-2 bg-pearl/50 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
}

