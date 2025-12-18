'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '@voyagenest/ui';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
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
      const user = response.user as { id: string; email: string; firstName: string; lastName: string; role: string };

      if (user.role !== 'admin') {
        toast.error('Nur Administratoren haben Zugang');
        setIsLoading(false);
        return;
      }

      setAuth(user, response.accessToken);
      toast.success('Erfolgreich angemeldet');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-sunset mb-4">
              <Shield className="h-8 w-8 text-navy-deep" />
            </div>
            <h1 className="font-display text-2xl font-bold text-pearl mb-2">Admin Panel</h1>
            <p className="text-warm-gray">VoyageNest Verwaltung</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-5 w-5" />}
              placeholder="admin@voyagenest.com"
              required
            />

            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Anmelden
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-navy-light rounded-xl">
            <p className="text-sm text-warm-gray text-center mb-2">Demo-Admin:</p>
            <p className="text-xs text-pearl text-center">admin@voyagenest.com / admin123</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

