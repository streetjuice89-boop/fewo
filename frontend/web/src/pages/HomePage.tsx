import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ArrowRight, Shield, Clock, Heart, ChevronRight, BadgeCheck, CreditCard, MessageCircle, Star, RefreshCw } from 'lucide-react';
import { propertiesApi, countriesApi } from '../lib/api';
import { getFlag, useLanguageStore, useTranslation } from '../store/language';

export default function HomePage() {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const { data: featuredData } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertiesApi.featured(6),
  });

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.list(),
  });

  const featured = featuredData?.data?.data || [];
  const countries = countriesData?.data?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[120vh] flex items-center justify-center pt-32 pb-20">
        {/* Background Image - High Resolution */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/50 to-navy-deep" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sunset-orange uppercase tracking-[0.4em] text-base md:text-lg mb-8 font-medium">
              {t('heroTagline')}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-pearl mb-8 leading-tight">
              {t('heroTitle')}<br />
              <span className="text-sunset-orange">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-gray mb-14 max-w-3xl mx-auto leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Search Bar - Larger and more prominent */}
            <form onSubmit={handleSearch} className="bg-navy-medium/90 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-navy-light/50 max-w-5xl mx-auto shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-warm-gray text-sm md:text-base mb-3 text-left font-medium">{t('searchPlaceholder')}</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-warm-gray pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchDestination')}
                      className="w-full pl-12 pr-4 py-4 bg-navy-light border border-navy-light rounded-xl text-pearl text-lg placeholder:text-warm-gray focus:outline-none focus:ring-2 focus:ring-sunset-orange transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-warm-gray text-sm md:text-base mb-3 text-left font-medium">{t('checkIn')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-warm-gray pointer-events-none" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-navy-light border border-navy-light rounded-xl text-pearl text-lg focus:outline-none focus:ring-2 focus:ring-sunset-orange transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-warm-gray text-sm md:text-base mb-3 text-left font-medium">{t('checkOut')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-warm-gray pointer-events-none" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn}
                      className="w-full pl-12 pr-4 py-4 bg-navy-light border border-navy-light rounded-xl text-pearl text-lg focus:outline-none focus:ring-2 focus:ring-sunset-orange transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-4 px-8 bg-gradient-to-r from-sunset-orange to-sunset-amber hover:from-sunset-amber hover:to-sunset-orange text-navy-deep font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    {t('search')}
                  </button>
                </div>
              </div>
            </form>

            {/* Stats - Larger and more prominent */}
            <div className="flex justify-center gap-16 md:gap-24 lg:gap-32 mt-16">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-sunset-orange mb-2">500+</p>
                <p className="text-warm-gray text-base md:text-lg">{t('accommodations')}</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-sunset-orange mb-2">8</p>
                <p className="text-warm-gray text-base md:text-lg">{t('countries')}</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-sunset-orange mb-2">10k+</p>
                <p className="text-warm-gray text-base md:text-lg">{t('happyGuests')}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Trust Section */}
      <section className="py-28 bg-gradient-to-b from-navy-medium via-navy-deep to-navy-medium relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sunset-orange rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sunset-amber rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 bg-sunset-orange/10 border border-sunset-orange/30 rounded-full text-sunset-orange text-sm font-medium mb-6">
              {t('whyVoyageNest')}
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-pearl mb-6">
              {t('trustQuality')}
            </h2>
            <p className="text-warm-gray text-lg md:text-xl max-w-2xl mx-auto">
              {t('trustSubtitle')}
            </p>
          </motion.div>

          {/* Main Trust Cards - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Secure Booking - Featured Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-sunset-orange/20 to-sunset-amber/10 rounded-3xl p-8 md:p-10 border border-sunset-orange/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-sunset-orange/10 rounded-full blur-2xl group-hover:bg-sunset-orange/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-orange to-sunset-amber flex items-center justify-center mb-6 shadow-xl shadow-sunset-orange/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-pearl mb-4">{t('secureBooking')}</h3>
                <p className="text-warm-gray text-lg leading-relaxed mb-6">{t('secureBookingDesc')}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sunset-orange" /> SSL 256-bit
                  </span>
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-green-400" /> DSGVO
                  </span>
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" /> PCI DSS
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 24/7 Support - Featured Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-3xl p-8 md:p-10 border border-blue-500/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-pearl mb-4">{t('support247')}</h3>
                <p className="text-warm-gray text-lg leading-relaxed mb-6">{t('support247Desc')}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl">🇩🇪 Deutsch</span>
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl">🇬🇧 English</span>
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl">🇪🇸 Español</span>
                  <span className="px-3 py-1.5 bg-navy-deep/50 rounded-full text-sm text-pearl">🇫🇷 Français</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Secondary Trust Cards - 4 Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, titleKey: 'handpicked' as const, textKey: 'handpickedDesc' as const, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
              { icon: BadgeCheck, titleKey: 'bestPrice' as const, textKey: 'bestPriceDesc' as const, color: 'from-emerald-500 to-green-400', shadow: 'shadow-emerald-500/20' },
              { icon: RefreshCw, titleKey: 'flexibleCancel' as const, textKey: 'flexibleCancelDesc' as const, color: 'from-violet-500 to-purple-400', shadow: 'shadow-violet-500/20' },
              { icon: Star, titleKey: 'verifiedReviews' as const, textKey: 'verifiedReviewsDesc' as const, color: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-500/20' },
            ].map((item, i) => (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-navy-light/40 backdrop-blur-sm rounded-2xl p-6 border border-navy-light/50 hover:border-white/20 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 ${item.shadow} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-pearl text-lg mb-3 group-hover:text-sunset-orange transition-colors">{t(item.titleKey)}</h3>
                <p className="text-warm-gray text-sm leading-relaxed">{t(item.textKey)}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['🇩🇪', '🇪🇸', '🇮🇹', '🇫🇷', '🇵🇹'].map((flag, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-navy-light flex items-center justify-center text-lg border-2 border-navy-medium">
                    {flag}
                  </span>
                ))}
              </div>
              <span className="text-warm-gray text-sm">8+ {t('countries')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-warm-gray text-sm">4.9/5 (2.500+ Reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-warm-gray text-sm">
              <BadgeCheck className="w-5 h-5 text-green-400" />
              <span>Trusted by 10,000+ travelers</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <p className="text-sunset-orange uppercase tracking-wider text-sm mb-2">{t('ourRecommendations')}</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
                  {t('popularAccommodations')}
                </h2>
              </div>
              <Link to="/properties" className="hidden md:flex items-center gap-2 text-sunset-orange hover:underline">
                {t('viewAll')}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((property: any, i: number) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link to={`/properties/${property.id}`} className="block bg-navy-medium rounded-2xl overflow-hidden border border-navy-light/30 hover:border-sunset-orange/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-sunset-orange/10">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
                        alt={language === 'en' ? property.titleEn : property.titleDe}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 px-4 py-2 bg-navy-deep/90 backdrop-blur-sm rounded-full text-pearl font-semibold shadow-lg">
                        €{property.pricePerNight}{t('perNight')}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-warm-gray text-sm mb-3">
                        <MapPin className="w-4 h-4 text-sunset-orange" />
                        {property.city}, {language === 'en' ? property.country?.nameEn : property.country?.nameDe}
                      </div>
                      <h3 className="font-semibold text-pearl text-xl mb-3 group-hover:text-sunset-orange transition-colors line-clamp-2">
                        {language === 'en' ? property.titleEn : property.titleDe}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-warm-gray">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {property.maxGuests} {t('guests')}
                        </span>
                        <span>{property.bedrooms} {t('bedrooms')}</span>
                        <span>{property.bathrooms} {t('bathroom')}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12 md:hidden">
              <Link to="/properties" className="btn-primary">
                {t('allProperties')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Countries Section */}
      {countries.length > 0 && (
        <section className="py-20 bg-navy-medium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-sunset-orange uppercase tracking-wider text-sm mb-2">{t('destinations')}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
                {t('discoverEurope')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {countries.slice(0, 6).map((country: any, i: number) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to={`/properties?countryId=${country.id}`}
                    className="group block aspect-[3/4] rounded-2xl overflow-hidden relative shadow-lg hover:shadow-2xl hover:shadow-sunset-orange/20 transition-shadow duration-300"
                  >
                    <img
                      src={country.image || 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400'}
                      alt={language === 'en' ? country.nameEn : country.nameDe}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/30 to-transparent group-hover:from-navy-deep/90 transition-all duration-300" />
                    {/* Country Flag */}
                    <div className="absolute top-3 right-3 text-2xl drop-shadow-lg">
                      {getFlag(country.code)}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-semibold text-pearl text-lg group-hover:text-sunset-orange transition-colors flex items-center gap-2">
                        {language === 'en' ? country.nameEn : country.nameDe}
                      </h3>
                      <p className="text-warm-gray text-sm">{country.propertiesCount || 0} {t('accommodations')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Full Width */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* High-Resolution Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=2400&q=90)',
          }}
        />
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/40" />
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative Element */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-pearl text-sm">
                <span className="w-2 h-2 bg-sunset-orange rounded-full animate-pulse" />
                Über 10.000 zufriedene Gäste
              </span>
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-pearl mb-6 leading-tight">
              {t('readyForAdventure')}
            </h2>
            <p className="text-warm-gray text-lg md:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('ctaSubtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-sunset-orange to-sunset-amber hover:from-sunset-amber hover:to-sunset-orange text-navy-deep font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-sunset-orange/30 hover:shadow-sunset-orange/50 hover:scale-105"
              >
                {t('registerNow')}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/properties" 
                className="inline-flex items-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-pearl font-semibold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                {t('viewAll')}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-warm-gray text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Sichere Zahlung
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-400" />
                Verifizierte Unterkünfte
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-sunset-orange" />
                24/7 Support
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-deep to-transparent" />
      </section>
    </div>
  );
}
