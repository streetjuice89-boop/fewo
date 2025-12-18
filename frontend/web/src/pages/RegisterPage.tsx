import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register(formData);
      const { accessToken, user } = response.data;
      
      setAuth(user, accessToken);
      toast.success('Erfolgreich registriert!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrierung fehlgeschlagen';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <img src="/logo.jpeg" alt="VoyageNest" className="h-16 w-auto rounded-2xl mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-pearl mb-2">
              Konto erstellen
            </h1>
            <p className="text-warm-gray">
              Registrieren Sie sich für exklusive Angebote
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-warm-gray mb-2">Vorname</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Max"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-gray mb-2">Nachname</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mustermann"
                  required
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-gray mb-2">Benutzername</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="maxmustermann"
                  required
                  className="input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-gray mb-2">E-Mail (optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="max@beispiel.de"
                  className="input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-gray mb-2">Telefon (optional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+49 123 456789"
                  className="input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-gray mb-2">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-gray mb-2">Passwort bestätigen</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input pl-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6"
            >
              {isLoading ? (
                <span className="animate-spin w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full" />
              ) : (
                <>
                  Registrieren
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-warm-gray mt-6">
            Bereits registriert?{' '}
            <Link to="/login" className="text-sunset-orange hover:underline">
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

