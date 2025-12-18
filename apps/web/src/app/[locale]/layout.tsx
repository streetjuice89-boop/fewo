import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

import { locales, Locale } from '@/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CookieBanner } from '@/components/CookieBanner';
import { Providers } from '@/components/providers/Providers';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VoyageNest - Ferienwohnungen',
    template: '%s | VoyageNest',
  },
  description: 'Finden Sie Ihre perfekte Ferienwohnung an den schönsten Orten Europas.',
  keywords: ['Ferienwohnung', 'Urlaub', 'Vacation Rental', 'Holiday Home', 'Europa'],
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatWidget />
            <CookieBanner />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-navy-medium text-pearl border border-navy-light',
                duration: 4000,
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

