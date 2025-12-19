import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useLanguageStore, useTranslation } from '../store/language';
import CookieBanner from './CookieBanner';
import ChatWidget from './ChatWidget';
import FlyingPlane from './FlyingPlane';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                {t('home')}
              </Link>
              <Link to="/properties" className="text-pearl hover:text-sunset-orange transition-colors">
                {t('properties')}
              </Link>
              <Link to="/contact" className="text-pearl hover:text-sunset-orange transition-colors">
                {t('contact')}
              </Link>
            </nav>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 text-pearl hover:text-sunset-orange transition-colors px-3 py-2 rounded-lg hover:bg-navy-light/50"
                >
                  <span className="text-xl">{language === 'de' ? '🇩🇪' : '🇬🇧'}</span>
                  <span className="font-medium">{language.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 bg-navy-medium border border-navy-light rounded-xl overflow-hidden min-w-[140px] shadow-xl z-[100]"
                    >
                      <button 
                        onClick={() => { setLanguage('de'); setLangOpen(false); }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left text-pearl hover:bg-sunset-orange/20 transition-colors ${language === 'de' ? 'bg-sunset-orange/10 text-sunset-orange' : ''}`}
                      >
                        <span className="text-xl">🇩🇪</span> 
                        <span>Deutsch</span>
                      </button>
                      <button 
                        onClick={() => { setLanguage('en'); setLangOpen(false); }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left text-pearl hover:bg-sunset-orange/20 transition-colors ${language === 'en' ? 'bg-sunset-orange/10 text-sunset-orange' : ''}`}
                      >
                        <span className="text-xl">🇬🇧</span> 
                        <span>English</span>
                      </button>
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
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-pearl hover:text-sunset-orange transition-colors">
                    {t('login')}
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-5 py-2 border border-sunset-orange text-sunset-orange rounded-full hover:bg-sunset-orange hover:text-navy-deep transition-all"
                  >
                    {t('register')}
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
                  {t('home')}
                </Link>
                <Link
                  to="/properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-pearl hover:text-sunset-orange"
                >
                  {t('properties')}
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-pearl hover:text-sunset-orange"
                >
                  {t('contact')}
                </Link>
                <hr className="border-navy-light" />
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-pearl"
                    >
                      {t('myAccount')}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block text-pearl"
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-pearl"
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sunset-orange"
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

      {/* Flying Plane Banner - only on homepage */}
      {isHomePage && (
        <div className="fixed top-20 left-0 right-0 z-40">
          <FlyingPlane />
        </div>
      )}

      {/* Main Content */}
      <main className={isHomePage ? 'pt-[50px]' : ''}>
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
                {t('footerDesc')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-pearl mb-4">{t('navigation')}</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li><Link to="/" className="hover:text-sunset-orange transition-colors">{t('home')}</Link></li>
                <li><Link to="/properties" className="hover:text-sunset-orange transition-colors">{t('properties')}</Link></li>
                <li><Link to="/contact" className="hover:text-sunset-orange transition-colors">{t('contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pearl mb-4">{t('legal')}</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li><Link to="/impressum" className="hover:text-sunset-orange transition-colors">{t('imprint')}</Link></li>
                <li><Link to="/datenschutz" className="hover:text-sunset-orange transition-colors">{t('privacy')}</Link></li>
                <li><Link to="/agb" className="hover:text-sunset-orange transition-colors">{t('terms')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pearl mb-4">{t('contact')}</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li>info@voyagenest.com</li>
                <li>+49 123 456 789</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-light mt-8 pt-8 text-center text-sm text-warm-gray">
            © {new Date().getFullYear()} VoyageNest. {t('allRightsReserved')}
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
