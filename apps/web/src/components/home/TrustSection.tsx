'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, Clock, HeadphonesIcon, Award, CreditCard, Heart } from 'lucide-react';

const features = {
  de: [
    {
      icon: Shield,
      title: 'Sichere Buchung',
      description: 'SSL-verschlüsselte Zahlungen und Datenschutz nach DSGVO',
    },
    {
      icon: Clock,
      title: 'Schnelle Bestätigung',
      description: 'Erhalten Sie Ihre Buchungsbestätigung innerhalb von Minuten',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Unser Team ist rund um die Uhr für Sie erreichbar',
    },
    {
      icon: Award,
      title: 'Geprüfte Qualität',
      description: 'Alle Unterkünfte werden sorgfältig von uns ausgewählt',
    },
    {
      icon: CreditCard,
      title: 'Flexible Zahlung',
      description: 'Verschiedene Zahlungsmethoden für Ihren Komfort',
    },
    {
      icon: Heart,
      title: 'Zufriedenheitsgarantie',
      description: 'Ihre Zufriedenheit ist unsere oberste Priorität',
    },
  ],
  en: [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'SSL-encrypted payments and GDPR-compliant data protection',
    },
    {
      icon: Clock,
      title: 'Fast Confirmation',
      description: 'Receive your booking confirmation within minutes',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Our team is available around the clock for you',
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'All accommodations are carefully selected by us',
    },
    {
      icon: CreditCard,
      title: 'Flexible Payment',
      description: 'Various payment methods for your convenience',
    },
    {
      icon: Heart,
      title: 'Satisfaction Guarantee',
      description: 'Your satisfaction is our top priority',
    },
  ],
};

export function TrustSection() {
  const locale = useLocale();
  const featureList = features[locale as keyof typeof features] || features.en;

  return (
    <section className="py-20 bg-navy-medium">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl font-bold text-pearl mb-4"
          >
            {locale === 'de' ? 'Warum VoyageNest?' : 'Why VoyageNest?'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray max-w-2xl mx-auto"
          >
            {locale === 'de'
              ? 'Vertrauen Sie auf unsere Erfahrung und Expertise für Ihren perfekten Urlaub'
              : 'Trust our experience and expertise for your perfect vacation'}
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-navy-light/50 border border-navy-light hover:border-sunset/50 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-sunset flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-navy-deep" />
              </div>
              <h3 className="font-display text-xl font-semibold text-pearl mb-2">
                {feature.title}
              </h3>
              <p className="text-warm-gray">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

