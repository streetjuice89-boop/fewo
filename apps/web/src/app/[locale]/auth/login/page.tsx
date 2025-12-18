'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '@voyagenest/ui';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      setAuth(response.user as { id: string; email: string; firstName: string; lastName: string; role: string }, response.accessToken);
      toast.success(t('loginSuccess'));
      router.push(`/${locale}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep pt-20 pb-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-pearl mb-2">{t('login')}</h1>
            <p className="text-warm-gray">
              {locale === 'de'
                ? 'Willkommen zurück bei VoyageNest'
                : 'Welcome back to VoyageNest'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-5 w-5" />}
              placeholder="max@beispiel.de"
              required
            />

            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-end">
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-sm text-sunset hover:text-sunset-light transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {t('login')}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-warm-gray">
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/auth/register`}
                className="text-sunset hover:text-sunset-light font-semibold transition-colors"
              >
                {t('register')}
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-navy-light rounded-xl">
            <p className="text-sm text-warm-gray text-center mb-2">Demo-Login:</p>
            <p className="text-xs text-pearl text-center">
              kunde@test.de / customer123
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

