'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Filter, Check, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge, Button, Modal, Spinner } from '@voyagenest/ui';
import { bookingsApi } from '@/lib/api';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
  property: {
    titleDe: string;
    images: string[];
    country: { nameDe: string; flagEmoji: string };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'default',
};

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  cancelled: 'Storniert',
  completed: 'Abgeschlossen',
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      return bookingsApi.getAll(params) as Promise<{ data: Booking[] }>;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Status aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bookings = data?.data || [];
  const filteredBookings = bookings.filter(
    (b) =>
      b.property.titleDe.toLowerCase().includes(search.toLowerCase()) ||
      b.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      b.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      b.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-pearl">Buchungen</h1>
        <p className="text-warm-gray">Verwalten Sie alle Buchungen</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full bg-navy-medium border border-navy-light rounded-xl pl-12 pr-4 py-3 text-pearl"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-navy-medium border border-navy-light rounded-xl px-4 py-3 text-pearl"
        >
          <option value="">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="confirmed">Bestätigt</option>
          <option value="cancelled">Storniert</option>
          <option value="completed">Abgeschlossen</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-warm-gray border-b border-navy-light bg-navy-light">
                  <th className="p-4 font-medium">Unterkunft</th>
                  <th className="p-4 font-medium">Kunde</th>
                  <th className="p-4 font-medium">Zeitraum</th>
                  <th className="p-4 font-medium">Gäste</th>
                  <th className="p-4 font-medium">Betrag</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="text-sm hover:bg-navy-light/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={booking.property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100'}
                            alt={booking.property.titleDe}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-pearl font-medium">{booking.property.titleDe}</p>
                          <p className="text-xs text-warm-gray">
                            {booking.property.country.flagEmoji} {booking.property.country.nameDe}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-pearl">
                        {booking.user.firstName} {booking.user.lastName}
                      </p>
                      <p className="text-xs text-warm-gray">{booking.user.email}</p>
                    </td>
                    <td className="p-4 text-pearl">
                      {new Date(booking.checkIn).toLocaleDateString('de-DE')} -{' '}
                      {new Date(booking.checkOut).toLocaleDateString('de-DE')}
                    </td>
                    <td className="p-4 text-pearl">{booking.guests}</td>
                    <td className="p-4 text-sunset font-semibold">€{booking.totalPrice}</td>
                    <td className="p-4">
                      <Badge variant={statusColors[booking.status]}>
                        {statusLabels[booking.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: booking.id,
                                  status: 'confirmed',
                                })
                              }
                              className="text-green-400 hover:text-green-300"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: booking.id,
                                  status: 'cancelled',
                                })
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Buchungsdetails"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-warm-gray">Unterkunft</p>
                <p className="text-pearl font-medium">{selectedBooking.property.titleDe}</p>
              </div>
              <div>
                <p className="text-sm text-warm-gray">Kunde</p>
                <p className="text-pearl font-medium">
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                </p>
                <p className="text-sm text-warm-gray">{selectedBooking.user.email}</p>
                {selectedBooking.user.phone && (
                  <p className="text-sm text-warm-gray">{selectedBooking.user.phone}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-warm-gray">Zeitraum</p>
                <p className="text-pearl">
                  {new Date(selectedBooking.checkIn).toLocaleDateString('de-DE')} -{' '}
                  {new Date(selectedBooking.checkOut).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-warm-gray">Gäste</p>
                <p className="text-pearl">{selectedBooking.guests}</p>
              </div>
              <div>
                <p className="text-sm text-warm-gray">Gesamtbetrag</p>
                <p className="text-sunset font-bold text-xl">€{selectedBooking.totalPrice}</p>
              </div>
              <div>
                <p className="text-sm text-warm-gray">Status</p>
                <Badge variant={statusColors[selectedBooking.status]}>
                  {statusLabels[selectedBooking.status]}
                </Badge>
              </div>
            </div>
            {selectedBooking.notes && (
              <div>
                <p className="text-sm text-warm-gray">Anmerkungen</p>
                <p className="text-pearl bg-navy-light p-4 rounded-xl mt-2">
                  {selectedBooking.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

