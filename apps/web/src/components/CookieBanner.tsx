'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Cookies from 'js-cookie';
import { Button } from '@voyagenest/ui';

export function CookieBanner() {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookie_consent');
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    Cookies.set('cookie_consent', 'all', { expires: 365 });
    setIsVisible(false);
  };

  const acceptEssential = () => {
    Cookies.set('cookie_consent', 'essential', { expires: 365 });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto">
            <div className="bg-navy-medium rounded-2xl border border-navy-light shadow-card-hover p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Icon */}
                <div className="hidden md:flex w-14 h-14 rounded-xl bg-sunset/20 items-center justify-center shrink-0">
                  <Cookie className="h-7 w-7 text-sunset" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-pearl mb-2">
                    {locale === 'de' ? 'Cookie-Einstellungen' : 'Cookie Settings'}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed">
                    {locale === 'de'
                      ? 'Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Einige Cookies sind für die Funktion der Website erforderlich, während andere uns helfen, die Nutzung zu analysieren und zu verbessern.'
                      : 'We use cookies to provide you with the best possible experience on our website. Some cookies are required for the website to function, while others help us analyze and improve usage.'}
                  </p>
                  <Link
                    href={`/${locale}/legal/privacy`}
                    className="text-sunset hover:text-sunset-light text-sm mt-2 inline-block"
                  >
                    {locale === 'de' ? 'Mehr erfahren' : 'Learn more'}
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                  <Button variant="outline" size="sm" onClick={acceptEssential}>
                    {locale === 'de' ? 'Nur essenzielle' : 'Essential only'}
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    {locale === 'de' ? 'Alle akzeptieren' : 'Accept all'}
                  </Button>
                </div>

                {/* Close Button */}
                <button
                  onClick={acceptEssential}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-navy-light transition-colors md:hidden"
                >
                  <X className="h-5 w-5 text-warm-gray" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

