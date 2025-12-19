import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Users, Search, Filter, X } from 'lucide-react';
import { propertiesApi, countriesApi } from '../lib/api';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    countryId: searchParams.get('countryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    guests: searchParams.get('guests') || '',
    bedrooms: searchParams.get('bedrooms') || '',
  });

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.list(
      Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    ),
  });

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.list(),
  });

  const properties = propertiesData?.data?.data || [];
  const countries = countriesData?.data?.data || [];
  const meta = propertiesData?.data?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      countryId: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
      bedrooms: '',
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-pearl mb-2">
            Unterkünfte
          </h1>
          <p className="text-warm-gray">
            {meta?.total || 0} Unterkünfte gefunden
          </p>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray pointer-events-none" />
              <input
                type="text"
                placeholder="Stadt oder Unterkunft suchen..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-12"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button type="submit" className="btn-primary">
              Suchen
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-6 card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-pearl">Filter</h3>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-warm-gray hover:text-pearl text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Zurücksetzen
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-warm-gray mb-2">Land</label>
                  <select
                    value={filters.countryId}
                    onChange={(e) => setFilters({ ...filters, countryId: e.target.value })}
                    className="input"
                  >
                    <option value="">Alle Länder</option>
                    {countries.map((country: any) => (
                      <option key={country.id} value={country.id}>
                        {country.nameDe}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-2">Min. Preis</label>
                  <input
                    type="number"
                    placeholder="€ Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-2">Max. Preis</label>
                  <input
                    type="number"
                    placeholder="€ Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-2">Gäste</label>
                  <input
                    type="number"
                    placeholder="Min. Gäste"
                    value={filters.guests}
                    onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray mb-2">Schlafzimmer</label>
                  <input
                    type="number"
                    placeholder="Min. Schlafzimmer"
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </form>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-navy-light" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-navy-light rounded w-1/2" />
                  <div className="h-5 bg-navy-light rounded w-3/4" />
                  <div className="h-4 bg-navy-light rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-navy-medium mx-auto mb-6 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-warm-gray" />
            </div>
            <h2 className="text-2xl font-semibold text-pearl mb-2">
              Keine Unterkünfte gefunden
            </h2>
            <p className="text-warm-gray mb-6">
              Versuchen Sie andere Suchkriterien
            </p>
            <button onClick={clearFilters} className="btn-primary">
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: any, i: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/properties/${property.id}`} className="card group block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
                      alt={property.titleDe}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-warm-gray text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      {property.city}, {property.country?.nameDe}
                    </div>
                    <h3 className="font-semibold text-pearl text-lg mb-2 group-hover:text-sunset-orange transition-colors">
                      {property.titleDe}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-warm-gray">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {property.maxGuests}
                        </span>
                        <span>{property.bedrooms} Schlafzimmer</span>
                      </div>
                      <div className="text-sunset-orange font-semibold">
                        €{property.pricePerNight}<span className="text-warm-gray text-sm font-normal">/Nacht</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




