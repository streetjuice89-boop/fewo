import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(username, password);
      const { accessToken, user } = response.data;
      
      if (user.role !== 'admin') {
        toast.error('Nur Administratoren haben Zugang');
        setIsLoading(false);
        return;
      }

      setAuth(user, accessToken);
      toast.success('Erfolgreich angemeldet');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Anmeldung fehlgeschlagen');
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
        <div className="card p-8">
          <div className="text-center mb-8">
            <img src="/logo.jpeg" alt="VoyageNest" className="h-16 w-auto rounded-2xl mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-pearl mb-2">Admin Panel</h1>
            <p className="text-warm-gray">VoyageNest Verwaltung</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm text-warm-gray mb-2">
                Benutzername
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="beetlejuice"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-warm-gray mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <span className="animate-spin w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full" />
              ) : (
                <>
                  Anmelden
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

