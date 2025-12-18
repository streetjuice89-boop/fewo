'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  const footerLinks = {
    company: [
      { label: t('aboutUs'), href: `/${locale}/about` },
      { label: t('contact'), href: `/${locale}/contact` },
    ],
    legal: [
      { label: t('privacy'), href: `/${locale}/legal/privacy` },
      { label: t('terms'), href: `/${locale}/legal/terms` },
      { label: t('imprint'), href: `/${locale}/legal/imprint` },
    ],
    support: [
      { label: t('faq'), href: `/${locale}/faq` },
      { label: t('helpCenter'), href: `/${locale}/help` },
    ],
  };

  return (
    <footer className="bg-navy-medium border-t border-navy-light">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.jpeg"
                alt="VoyageNest"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <span className="font-display text-xl font-semibold text-pearl">
                  Voyage<span className="text-sunset">Nest</span>
                </span>
                <p className="text-xs text-warm-gray font-ui">RENT. RELAX. EXPLORE.</p>
              </div>
            </Link>
            <p className="text-warm-gray text-sm leading-relaxed mb-6">
              {locale === 'de'
                ? 'Ihr Partner für einzigartige Ferienwohnungen an den schönsten Orten Europas.'
                : 'Your partner for unique vacation rentals in Europe\'s most beautiful locations.'}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-navy-light hover:bg-sunset hover:text-navy-deep transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-navy-light hover:bg-sunset hover:text-navy-deep transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-navy-light hover:bg-sunset hover:text-navy-deep transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-pearl mb-4">{t('company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-gray hover:text-sunset transition-colors text-sm font-ui"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-pearl mb-4">{t('legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-gray hover:text-sunset transition-colors text-sm font-ui"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-pearl mb-4">
              {locale === 'de' ? 'Kontakt' : 'Contact'}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-sunset shrink-0 mt-0.5" />
                <span className="text-warm-gray text-sm">
                  VoyageNest GmbH
                  <br />
                  Musterstraße 123
                  <br />
                  10115 Berlin, Germany
                </span>
              </li>
              <li>
                <a
                  href="mailto:info@voyagenest.com"
                  className="flex items-center gap-3 text-warm-gray hover:text-sunset transition-colors text-sm"
                >
                  <Mail className="h-5 w-5 text-sunset" />
                  info@voyagenest.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+49123456789"
                  className="flex items-center gap-3 text-warm-gray hover:text-sunset transition-colors text-sm"
                >
                  <Phone className="h-5 w-5 text-sunset" />
                  +49 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-navy-light flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-warm-gray text-sm font-ui">{t('copyright')}</p>
          <div className="flex items-center gap-4">
            <span className="text-warm-gray text-sm">🇩🇪 Made in Germany</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

