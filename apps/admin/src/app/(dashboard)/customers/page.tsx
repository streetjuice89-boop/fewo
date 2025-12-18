'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Star, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge, Button, Modal, Input, Avatar, Spinner } from '@voyagenest/ui';
import { usersApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  customerScore: number;
  createdAt: string;
  _count: { bookings: number };
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newScore, setNewScore] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => usersApi.getAll({ role: 'customer' }) as Promise<{ data: User[] }>,
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({ id, score }: { id: string; score: number }) =>
      usersApi.updateScore(id, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Score aktualisiert');
      setSelectedUser(null);
    },
  });

  const customers = data?.data || [];
  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-pearl">Kunden</h1>
        <p className="text-warm-gray">Verwalten Sie alle Kundenkonten</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nach Name oder E-Mail suchen..."
          className="w-full bg-navy-medium border border-navy-light rounded-xl pl-12 pr-4 py-3 text-pearl"
        />
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
                  <th className="p-4 font-medium">Kunde</th>
                  <th className="p-4 font-medium">Kontakt</th>
                  <th className="p-4 font-medium">Buchungen</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Registriert</th>
                  <th className="p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="text-sm hover:bg-navy-light/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${customer.firstName} ${customer.lastName}`}
                          size="md"
                        />
                        <div>
                          <p className="text-pearl font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-pearl flex items-center gap-2">
                          <Mail className="h-4 w-4 text-warm-gray" />
                          {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-warm-gray flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-pearl">{customer._count.bookings}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Star
                          className={`h-5 w-5 ${
                            customer.customerScore >= 75
                              ? 'text-yellow-400'
                              : customer.customerScore >= 50
                              ? 'text-ocean'
                              : 'text-warm-gray'
                          }`}
                          fill={customer.customerScore >= 50 ? 'currentColor' : 'none'}
                        />
                        <span className="text-pearl font-medium">{customer.customerScore}</span>
                      </div>
                    </td>
                    <td className="p-4 text-warm-gray">
                      {new Date(customer.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(customer);
                          setNewScore(customer.customerScore);
                        }}
                      >
                        Score bearbeiten
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Score Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Kunden-Score bearbeiten"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar
                name={`${selectedUser.firstName} ${selectedUser.lastName}`}
                size="lg"
              />
              <div>
                <p className="text-pearl font-semibold">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-warm-gray text-sm">{selectedUser.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-warm-gray mb-2">
                Kunden-Score (0-100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-warm-gray mt-1">
                <span>0</span>
                <span className="text-sunset font-bold text-lg">{newScore}</span>
                <span>100</span>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                Abbrechen
              </Button>
              <Button
                onClick={() =>
                  updateScoreMutation.mutate({ id: selectedUser.id, score: newScore })
                }
                isLoading={updateScoreMutation.isPending}
              >
                Speichern
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

