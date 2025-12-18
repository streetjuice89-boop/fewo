import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Check, ArrowLeft } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { propertiesApi, bookingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function BookingPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '1');
  
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);

  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertiesApi.get(propertyId!),
    enabled: !!propertyId,
  });

  const bookingMutation = useMutation({
    mutationFn: (data: { propertyId: number; checkIn: string; checkOut: string; guests: number; notes?: string }) =>
      bookingsApi.create(data),
    onSuccess: () => {
      toast.success('Buchung erfolgreich!');
      navigate('/account');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Buchung fehlgeschlagen');
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: `/booking/${propertyId}` }} />;
  }

  if (!checkIn || !checkOut) {
    return <Navigate to={`/properties/${propertyId}`} />;
  }

  const property = propertyData?.data;
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const totalPrice = property ? nights * property.pricePerNight : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Bitte akzeptieren Sie die AGB');
      return;
    }

    bookingMutation.mutate({
      propertyId: parseInt(propertyId!),
      checkIn,
      checkOut,
      guests,
      notes: notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sunset-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return <Navigate to="/properties" />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-warm-gray hover:text-pearl mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </button>

        <h1 className="font-display text-3xl font-bold text-pearl mb-8">
          Buchung bestätigen
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="card p-6">
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'}
                  alt={property.titleDe}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold text-pearl">{property.titleDe}</h2>
                <div className="flex items-center gap-2 text-warm-gray text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  {property.city}, {property.country?.nameDe}
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-navy-light pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-gray">
                  <Calendar className="w-5 h-5" />
                  Anreise
                </div>
                <span className="text-pearl font-medium">
                  {format(new Date(checkIn), 'dd. MMMM yyyy', { locale: de })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-gray">
                  <Calendar className="w-5 h-5" />
                  Abreise
                </div>
                <span className="text-pearl font-medium">
                  {format(new Date(checkOut), 'dd. MMMM yyyy', { locale: de })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-gray">
                  <Users className="w-5 h-5" />
                  Gäste
                </div>
                <span className="text-pearl font-medium">{guests}</span>
              </div>
            </div>

            <div className="border-t border-navy-light mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-warm-gray">
                <span>€{property.pricePerNight} x {nights} Nächte</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-pearl font-semibold text-xl pt-2 border-t border-navy-light">
                <span>Gesamt</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-xl font-semibold text-pearl mb-6">Ihre Daten</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-navy-light rounded-xl p-4">
                <p className="text-sm text-warm-gray mb-2">Buchung für</p>
                <p className="text-pearl font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                {user?.email && (
                  <p className="text-warm-gray text-sm">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-warm-gray mb-2">
                  Anmerkungen (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Besondere Wünsche oder Hinweise..."
                  rows={4}
                  className="input resize-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-navy-light bg-navy-light text-sunset-orange focus:ring-sunset-orange"
                />
                <span className="text-sm text-warm-gray">
                  Ich akzeptiere die{' '}
                  <a href="#" className="text-sunset-orange hover:underline">AGB</a>
                  {' '}und{' '}
                  <a href="#" className="text-sunset-orange hover:underline">Datenschutzbestimmungen</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed || bookingMutation.isPending}
                className="btn-primary w-full"
              >
                {bookingMutation.isPending ? (
                  <span className="animate-spin w-5 h-5 border-2 border-navy-deep border-t-transparent rounded-full" />
                ) : (
                  <>
                    Jetzt buchen
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-warm-gray text-center">
                Sie werden nach der Buchung per E-Mail benachrichtigt.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

