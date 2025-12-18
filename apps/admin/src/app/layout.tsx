import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoyageNest Admin',
  description: 'Admin Panel für VoyageNest Ferienwohnungs-Plattform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-navy-medium text-pearl border border-navy-light',
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

