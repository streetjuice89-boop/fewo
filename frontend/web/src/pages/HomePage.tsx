import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Shield, Clock, Heart, ChevronRight } from 'lucide-react';
import { propertiesApi, countriesApi } from '../lib/api';

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
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy-deep/60 to-navy-deep" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sunset-orange uppercase tracking-[0.3em] text-sm mb-6">
              Rent. Relax. Explore.
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-pearl mb-6 leading-tight">
              Finden Sie Ihr perfektes<br />
              <span className="text-sunset-orange">Urlaubszuhause</span>
            </h1>
            <p className="text-lg text-warm-gray mb-10 max-w-2xl mx-auto">
              Entdecken Sie handverlesene Ferienwohnungen an den schönsten Orten Europas
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-navy-medium/80 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-navy-light max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-warm-gray text-sm mb-2 text-left">Wohin soll die Reise gehen?</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Mallorca, Barcelona..."
                      className="w-full pl-10 pr-4 py-3 bg-navy-light border border-navy-light rounded-xl text-pearl placeholder:text-warm-gray focus:outline-none focus:ring-2 focus:ring-sunset-orange"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-warm-gray text-sm mb-2 text-left">Anreise</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-navy-light border border-navy-light rounded-xl text-pearl focus:outline-none focus:ring-2 focus:ring-sunset-orange"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-warm-gray text-sm mb-2 text-left">Abreise</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn}
                      className="w-full pl-10 pr-4 py-3 bg-navy-light border border-navy-light rounded-xl text-pearl focus:outline-none focus:ring-2 focus:ring-sunset-orange"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-sunset-orange hover:bg-sunset-amber text-navy-deep font-semibold rounded-xl transition-colors"
                  >
                    Suchen
                  </button>
                </div>
              </div>
            </form>

            {/* Stats */}
            <div className="flex justify-center gap-12 md:gap-20 mt-12">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-sunset-orange">500+</p>
                <p className="text-warm-gray text-sm">Unterkünfte</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-sunset-orange">8</p>
                <p className="text-warm-gray text-sm">Länder</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-sunset-orange">10k+</p>
                <p className="text-warm-gray text-sm">Zufriedene Gäste</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-warm-gray rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-sunset-orange rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-navy-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Sicher buchen', text: 'Verschlüsselte Zahlungen & umfassender Datenschutz' },
              { icon: Clock, title: '24/7 Support', text: 'Unser Team ist jederzeit für Sie erreichbar' },
              { icon: Heart, title: 'Handverlesen', text: 'Nur geprüfte Premium-Unterkünfte' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-sunset-orange/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-7 h-7 text-sunset-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-pearl text-lg mb-1">{item.title}</h3>
                  <p className="text-warm-gray">{item.text}</p>
                </div>
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
                >
                  <Link to={`/properties/${property.id}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
                        alt={property.titleDe}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-navy-deep/80 backdrop-blur-sm rounded-full text-pearl text-sm">
                        €{property.pricePerNight}/Nacht
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-warm-gray text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      {property.city}, {property.country?.nameDe}
                    </div>
                    <h3 className="font-semibold text-pearl text-lg mb-2 group-hover:text-sunset-orange transition-colors">
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {countries.slice(0, 6).map((country: any, i: number) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/properties?countryId=${country.id}`}
                    className="group block aspect-[3/4] rounded-2xl overflow-hidden relative"
                  >
                    <img
                      src={country.image || 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400'}
                      alt={country.nameDe}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-semibold text-pearl text-lg">{country.nameDe}</h3>
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
