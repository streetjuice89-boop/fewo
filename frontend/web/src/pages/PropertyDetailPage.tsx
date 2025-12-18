import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Users, Bed, Bath, Check, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { propertiesApi } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.get(id!),
    enabled: !!id,
  });

  const property = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sunset-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-pearl mb-4">Unterkunft nicht gefunden</h1>
          <Link to="/properties" className="btn-primary">
            Zurück zu den Unterkünften
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200'
  ];

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = nights * property.pricePerNight;

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    navigate(`/booking/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-warm-gray hover:text-pearl mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zu den Unterkünften
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-8">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                alt={property.titleDe}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-deep/80 flex items-center justify-center text-pearl hover:bg-navy-medium transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-deep/80 flex items-center justify-center text-pearl hover:bg-navy-medium transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentImage ? 'bg-sunset-orange' : 'bg-pearl/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Property Info */}
            <div className="card p-6 mb-8">
              <div className="flex items-center gap-2 text-warm-gray text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {property.city}, {property.country?.nameDe}
              </div>
              <h1 className="font-display text-3xl font-bold text-pearl mb-4">
                {property.titleDe}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-warm-gray">
                  <Users className="w-5 h-5" />
                  <span>{property.maxGuests} Gäste</span>
                </div>
                <div className="flex items-center gap-2 text-warm-gray">
                  <Bed className="w-5 h-5" />
                  <span>{property.bedrooms} Schlafzimmer</span>
                </div>
                <div className="flex items-center gap-2 text-warm-gray">
                  <Bath className="w-5 h-5" />
                  <span>{property.bathrooms} Bäder</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-warm-gray whitespace-pre-line">
                  {property.descriptionDe}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-pearl mb-4">Ausstattung</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2 text-warm-gray">
                      <Check className="w-5 h-5 text-ocean-teal" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="text-3xl font-bold text-pearl mb-2">
                €{property.pricePerNight}
                <span className="text-lg font-normal text-warm-gray">/Nacht</span>
              </div>

              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-warm-gray mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Anreise
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Abreise
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-warm-gray mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Gäste
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="input"
                  >
                    {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Gast' : 'Gäste'}
                      </option>
                    ))}
                  </select>
                </div>

                {nights > 0 && (
                  <div className="border-t border-navy-light pt-4 space-y-2">
                    <div className="flex justify-between text-warm-gray">
                      <span>€{property.pricePerNight} x {nights} Nächte</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-pearl font-semibold text-lg pt-2 border-t border-navy-light">
                      <span>Gesamt</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!checkIn || !checkOut || nights <= 0}
                  className="btn-primary w-full"
                >
                  {isAuthenticated ? 'Jetzt buchen' : 'Anmelden zum Buchen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

