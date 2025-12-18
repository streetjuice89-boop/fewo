'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '@voyagenest/ui';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(locale === 'de' ? 'Passwörter stimmen nicht überein' : 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error(
        locale === 'de'
          ? 'Passwort muss mindestens 8 Zeichen haben'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      setAuth(response.user as { id: string; email: string; firstName: string; lastName: string; role: string }, response.accessToken);
      toast.success(t('registerSuccess'));
      router.push(`/${locale}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep pt-24 pb-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-pearl mb-2">{t('register')}</h1>
            <p className="text-warm-gray">
              {locale === 'de'
                ? 'Erstellen Sie Ihr VoyageNest-Konto'
                : 'Create your VoyageNest account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('firstName')}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                leftIcon={<User className="h-5 w-5" />}
                placeholder="Max"
                required
              />

              <Input
                label={t('lastName')}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Mustermann"
                required
              />
            </div>

            <Input
              label={t('email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="h-5 w-5" />}
              placeholder="max@beispiel.de"
              required
            />

            <Input
              label={t('phone')}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone className="h-5 w-5" />}
              placeholder="+49 170 1234567"
            />

            <Input
              label={t('password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
              required
            />

            <Input
              label={t('confirmPassword')}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock className="h-5 w-5" />}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {t('register')}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-warm-gray">
              {t('hasAccount')}{' '}
              <Link
                href={`/${locale}/auth/login`}
                className="text-sunset hover:text-sunset-light font-semibold transition-colors"
              >
                {t('login')}
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

