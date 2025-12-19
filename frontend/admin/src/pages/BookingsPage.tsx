import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { bookingsApi } from '../lib/api';

const statusConfig = {
  pending: { icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/10', label: 'Ausstehend' },
  confirmed: { icon: CheckCircle, color: 'text-green-500 bg-green-500/10', label: 'Bestätigt' },
  cancelled: { icon: XCircle, color: 'text-red-500 bg-red-500/10', label: 'Storniert' },
  completed: { icon: Clock, color: 'text-warm-gray bg-navy-light', label: 'Abgeschlossen' },
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', { status: statusFilter }],
    queryFn: () => bookingsApi.list({ status: statusFilter || undefined }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Status aktualisiert');
    },
    onError: () => toast.error('Fehler beim Aktualisieren'),
  });

  const bookings = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl">Buchungen</h1>
          <p className="text-warm-gray text-sm">{data?.data?.meta?.total || 0} Buchungen</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-warm-gray" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="confirmed">Bestätigt</option>
          <option value="cancelled">Storniert</option>
          <option value="completed">Abgeschlossen</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-light">
              <tr>
                <th className="table-header">Buchung</th>
                <th className="table-header">Kunde</th>
                <th className="table-header">Zeitraum</th>
                <th className="table-header">Preis</th>
                <th className="table-header">Status</th>
                <th className="table-header">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-light">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="table-cell" colSpan={6}>
                      <div className="h-4 bg-navy-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td className="table-cell text-center text-warm-gray" colSpan={6}>
                    Keine Buchungen gefunden
                  </td>
                </tr>
              ) : (
                bookings.map((booking: any) => {
                  const status = statusConfig[booking.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-navy-light/50"
                    >
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{booking.property?.titleDe}</p>
                          <p className="text-xs text-warm-gray">{booking.property?.city}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p>{booking.user?.firstName} {booking.user?.lastName}</p>
                          <p className="text-xs text-warm-gray">@{booking.user?.username}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          <p>{format(new Date(booking.checkIn), 'dd. MMM', { locale: de })}</p>
                          <p className="text-warm-gray">bis {format(new Date(booking.checkOut), 'dd. MMM', { locale: de })}</p>
                        </div>
                      </td>
                      <td className="table-cell font-medium">
                        €{booking.totalPrice?.toFixed(2)}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        {booking.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                              className="btn-primary py-1 px-2 text-xs"
                            >
                              Bestätigen
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                              className="btn-danger py-1 px-2 text-xs"
                            >
                              Ablehnen
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                            className="btn-secondary py-1 px-2 text-xs"
                          >
                            Abschließen
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



