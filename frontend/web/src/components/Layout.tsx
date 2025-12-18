import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import CookieBanner from './CookieBanner';
import ChatWidget from './ChatWidget';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy-deep/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="VoyageNest" className="h-10 w-auto rounded-lg" />
              <span className="font-display text-xl text-pearl">
                Voyage<span className="text-sunset-orange">Nest</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-pearl hover:text-sunset-orange transition-colors">
                Startseite
              </Link>
              <Link to="/properties" className="text-pearl hover:text-sunset-orange transition-colors">
                Ferienwohnungen
              </Link>
              <Link to="/contact" className="text-pearl hover:text-sunset-orange transition-colors">
                Kontakt
              </Link>
            </nav>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 text-pearl hover:text-sunset-orange transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  DE
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 bg-navy-medium border border-navy-light rounded-lg overflow-hidden"
                    >
                      <button className="block w-full px-4 py-2 text-left text-pearl hover:bg-navy-light">DE</button>
                      <button className="block w-full px-4 py-2 text-left text-pearl hover:bg-navy-light">EN</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated ? (
                <>
                  <Link to="/account" className="text-pearl hover:text-sunset-orange transition-colors">
                    {user?.firstName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-pearl hover:text-sunset-orange transition-colors"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-pearl hover:text-sunset-orange transition-colors">
                    Anmelden
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-5 py-2 border border-sunset-orange text-sunset-orange rounded-full hover:bg-sunset-orange hover:text-navy-deep transition-all"
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-pearl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
              <nav className="px-4 py-4 space-y-3">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-pearl hover:text-sunset-orange"
                >
                  Startseite
                </Link>
                <Link
                  to="/properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-pearl hover:text-sunset-orange"
                >
                  Ferienwohnungen
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-pearl hover:text-sunset-orange"
                >
                  Kontakt
                </Link>
                <hr className="border-navy-light" />
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-pearl"
                    >
                      Mein Konto
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block text-pearl"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-pearl"
                    >
                      Anmelden
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sunset-orange"
                    >
                      Registrieren
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-medium border-t border-navy-light mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="VoyageNest" className="h-10 w-auto rounded-lg" />
                <span className="font-display text-xl text-pearl">
                  Voyage<span className="text-sunset-orange">Nest</span>
                </span>
              </div>
              <p className="text-warm-gray text-sm">
                Entdecken Sie einzigartige Unterkünfte für Ihren perfekten Urlaub.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-pearl mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li><Link to="/" className="hover:text-sunset-orange transition-colors">Startseite</Link></li>
                <li><Link to="/properties" className="hover:text-sunset-orange transition-colors">Ferienwohnungen</Link></li>
                <li><Link to="/contact" className="hover:text-sunset-orange transition-colors">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pearl mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li><Link to="/impressum" className="hover:text-sunset-orange transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:text-sunset-orange transition-colors">Datenschutz</Link></li>
                <li><Link to="/agb" className="hover:text-sunset-orange transition-colors">AGB</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pearl mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li>info@voyagenest.com</li>
                <li>+49 123 456 789</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-light mt-8 pt-8 text-center text-sm text-warm-gray">
            © {new Date().getFullYear()} VoyageNest. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
