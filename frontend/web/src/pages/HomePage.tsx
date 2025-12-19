import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Shield, Clock, Heart, ChevronRight } from 'lucide-react';
import { propertiesApi, countriesApi } from '../lib/api';
import { getFlag } from '../store/language';

export default function HomePage() {
  const navigate = useNavigate();
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
              Rent. Relax. Explore.
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-pearl mb-8 leading-tight">
              Finden Sie Ihr perfektes<br />
              <span className="text-sunset-orange">Urlaubszuhause</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-gray mb-14 max-w-3xl mx-auto leading-relaxed">
              Entdecken Sie handverlesene Ferienwohnungen an den schönsten Orten Europas
            </p>

            {/* Search Bar - Larger and more prominent */}
            <form onSubmit={handleSearch} className="bg-navy-medium/90 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-navy-light/50 max-w-5xl mx-auto shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-warm-gray text-sm md:text-base mb-3 text-left font-medium">Wohin soll die Reise gehen?</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-warm-gray" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Mallorca, Barcelona..."
                      className="w-full pl-12 pr-4 py-4 bg-navy-light border border-navy-light rounded-xl text-pearl text-lg placeholder:text-warm-gray focus:outline-none focus:ring-2 focus:ring-sunset-orange transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-warm-gray text-sm md:text-base mb-3 text-left font-medium">Anreise</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-warm-gray" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-navy-light border border-navy-light rounded-xl text-pearl text-lg focus:outline-none focus:ring-2 focus:ring-sunset-orange transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-warm-gray text-sm md:text-base mb-3 text-left font-medium">Abreise</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-warm-gray" />
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
                    Suchen
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
                <p className="text-warm-gray text-base md:text-lg">Unterkünfte</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-sunset-orange mb-2">8</p>
                <p className="text-warm-gray text-base md:text-lg">Länder</p>
              </motion.div>
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-sunset-orange mb-2">10k+</p>
                <p className="text-warm-gray text-base md:text-lg">Zufriedene Gäste</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Trust Section */}
      <section className="py-24 bg-navy-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sunset-orange uppercase tracking-wider text-sm mb-3">Warum VoyageNest?</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
              Ihr Vertrauen ist unser Versprechen
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: 'Sicher buchen', text: 'Verschlüsselte Zahlungen & umfassender Datenschutz für Ihre Daten' },
              { icon: Clock, title: '24/7 Support', text: 'Unser Team ist jederzeit für Sie erreichbar – per Chat, E-Mail oder Telefon' },
              { icon: Heart, title: 'Handverlesen', text: 'Nur geprüfte Premium-Unterkünfte mit höchsten Qualitätsstandards' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-navy-light/30 rounded-2xl p-8 border border-navy-light/50 hover:border-sunset-orange/30 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-orange to-sunset-amber flex items-center justify-center mb-6 shadow-lg shadow-sunset-orange/20">
                  <item.icon className="w-8 h-8 text-navy-deep" />
                </div>
                <h3 className="font-semibold text-pearl text-xl mb-3">{item.title}</h3>
                <p className="text-warm-gray leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
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
                <p className="text-sunset-orange uppercase tracking-wider text-sm mb-2">Unsere Empfehlungen</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
                  Beliebte Unterkünfte
                </h2>
              </div>
              <Link to="/properties" className="hidden md:flex items-center gap-2 text-sunset-orange hover:underline">
                Alle ansehen
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
                        alt={property.titleDe}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 px-4 py-2 bg-navy-deep/90 backdrop-blur-sm rounded-full text-pearl font-semibold shadow-lg">
                        €{property.pricePerNight}/Nacht
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-warm-gray text-sm mb-3">
                        <MapPin className="w-4 h-4 text-sunset-orange" />
                        {property.city}, {property.country?.nameDe}
                      </div>
                      <h3 className="font-semibold text-pearl text-xl mb-3 group-hover:text-sunset-orange transition-colors line-clamp-2">
                        {property.titleDe}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-warm-gray">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {property.maxGuests} Gäste
                        </span>
                        <span>{property.bedrooms} Schlafzimmer</span>
                        <span>{property.bathrooms} Bad</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12 md:hidden">
              <Link to="/properties" className="btn-primary">
                Alle Unterkünfte
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
              <p className="text-sunset-orange uppercase tracking-wider text-sm mb-2">Reiseziele</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
                Entdecken Sie Europa
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
                      alt={country.nameDe}
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
                        {country.nameDe}
                      </h3>
                      <p className="text-warm-gray text-sm">{country.propertiesCount || 0} Unterkünfte</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl mb-4">
                Bereit für Ihr nächstes Abenteuer?
              </h2>
              <p className="text-warm-gray mb-8 max-w-xl mx-auto">
                Registrieren Sie sich jetzt und erhalten Sie exklusive Angebote und Rabatte für Ihre nächste Reise.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-sunset-orange hover:bg-sunset-amber text-navy-deep font-semibold rounded-xl transition-colors">
                Jetzt registrieren
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
