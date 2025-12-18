'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@voyagenest/ui';

export function CTASection() {
  const locale = useLocale();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-navy-deep/90" />

      {/* Decorative */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sunset/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ocean/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-sunset/20 text-sunset px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-ui">
              {locale === 'de' ? 'Sonderangebote verfügbar' : 'Special offers available'}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-pearl mb-6"
          >
            {locale === 'de'
              ? 'Bereit für Ihren Traumurlaub?'
              : 'Ready for Your Dream Vacation?'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-warm-gray text-lg mb-8 max-w-2xl mx-auto"
          >
            {locale === 'de'
              ? 'Entdecken Sie unsere exklusiven Ferienwohnungen und buchen Sie noch heute Ihr unvergessliches Urlaubserlebnis.'
              : 'Discover our exclusive vacation rentals and book your unforgettable holiday experience today.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={`/${locale}/properties`}>
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                {locale === 'de' ? 'Unterkünfte entdecken' : 'Explore Properties'}
              </Button>
            </Link>
            <Link href={`/${locale}/contact`}>
              <Button variant="outline" size="lg">
                {locale === 'de' ? 'Kontaktieren Sie uns' : 'Contact Us'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

