import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { User, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { bookingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth';

const statusConfig = {
  pending: { icon: AlertCircle, color: 'text-yellow-500', label: 'Ausstehend' },
  confirmed: { icon: CheckCircle, color: 'text-ocean-teal', label: 'Bestätigt' },
  cancelled: { icon: XCircle, color: 'text-red-500', label: 'Storniert' },
  completed: { icon: CheckCircle, color: 'text-warm-gray', label: 'Abgeschlossen' },
};

export default function AccountPage() {
  const { isAuthenticated, user } = useAuthStore();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.list(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const bookings = bookingsData?.data?.data || [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sunset-orange to-sunset-amber flex items-center justify-center">
              <User className="w-8 h-8 text-navy-deep" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-pearl">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-warm-gray">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-xl font-semibold text-pearl mb-4">Meine Buchungen</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-32 h-24 bg-navy-light rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-navy-light rounded w-1/3" />
                      <div className="h-4 bg-navy-light rounded w-1/2" />
                      <div className="h-4 bg-navy-light rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar className="w-16 h-16 text-warm-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-pearl mb-2">
                Noch keine Buchungen
              </h3>
              <p className="text-warm-gray">
                Entdecken Sie unsere Unterkünfte und buchen Sie Ihren nächsten Urlaub!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any, i: number) => {
                const status = statusConfig[booking.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-40 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={booking.property?.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'}
                          alt={booking.property?.titleDe}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-pearl text-lg">
                              {booking.property?.titleDe}
                            </h3>
                            <div className="flex items-center gap-2 text-warm-gray text-sm mt-1">
                              <MapPin className="w-4 h-4" />
                              {booking.property?.city}, {booking.property?.country?.nameDe}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-warm-gray">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(booking.checkIn), 'dd. MMM', { locale: de })} - {format(new Date(booking.checkOut), 'dd. MMM yyyy', { locale: de })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.nights} Nächte
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {booking.guests} Gäste
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-light">
                          <span className="text-2xl font-bold text-pearl">
                            €{booking.totalPrice?.toFixed(2)}
                          </span>
                          {booking.status === 'pending' && (
                            <button className="text-red-400 hover:text-red-300 text-sm">
                              Stornieren
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

