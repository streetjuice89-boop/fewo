'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Globe } from 'lucide-react';
import { Button } from '@voyagenest/ui';
import { useAuthStore } from '@/store/auth';
import { cn } from '@voyagenest/ui';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/properties`, label: t('properties') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  const isActive = (href: string) => pathname === href;

  const otherLocale = locale === 'de' ? 'en' : 'de';
  const localePathname = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-navy-light/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="VoyageNest"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <span className="font-display text-xl font-semibold text-pearl">
                Voyage<span className="text-sunset">Nest</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-ui text-sm font-medium transition-colors link-hover',
                  isActive(link.href) ? 'text-sunset' : 'text-pearl hover:text-sunset'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-navy-light transition-colors"
              >
                <Globe className="h-5 w-5 text-pearl" />
                <span className="hidden sm:inline text-sm font-ui uppercase text-pearl">
                  {locale}
                </span>
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-navy-medium rounded-xl border border-navy-light shadow-card overflow-hidden"
                  >
                    <Link
                      href={localePathname}
                      onClick={() => setLangMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-navy-light transition-colors"
                    >
                      <span className="text-lg">{otherLocale === 'de' ? '🇩🇪' : '🇬🇧'}</span>
                      <span className="font-ui text-sm text-pearl">
                        {otherLocale === 'de' ? 'Deutsch' : 'English'}
                      </span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href={`/${locale}/account`}
                  className="flex items-center gap-2 text-pearl hover:text-sunset transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-ui text-sm">{user.firstName}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button variant="primary" size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-navy-light transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-pearl" />
              ) : (
                <Menu className="h-6 w-6 text-pearl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-medium border-t border-navy-light"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg font-ui text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-navy-light text-sunset'
                      : 'text-pearl hover:bg-navy-light'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-navy-light" />

              {user ? (
                <>
                  <Link
                    href={`/${locale}/account`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-ui text-sm text-pearl hover:bg-navy-light"
                  >
                    {t('myAccount')}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg font-ui text-sm text-pearl hover:bg-navy-light text-left"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/auth/login`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-ui text-sm text-pearl hover:bg-navy-light"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-ui text-sm bg-gradient-sunset text-navy-deep text-center"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

