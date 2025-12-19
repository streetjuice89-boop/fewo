import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Star, Calendar, Mail, Phone } from 'lucide-react';
import { usersApi } from '../lib/api';

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, role: 'customer' }],
    queryFn: () => usersApi.list({ search: search || undefined, role: 'customer' }),
  });

  const users = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl">Kunden</h1>
          <p className="text-warm-gray text-sm">{data?.data?.meta?.total || 0} Kunden</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray pointer-events-none" />
        <input
          type="text"
          placeholder="Namen oder E-Mail suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-light">
              <tr>
                <th className="table-header">Kunde</th>
                <th className="table-header">Kontakt</th>
                <th className="table-header">Buchungen</th>
                <th className="table-header">Score</th>
                <th className="table-header">Registriert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-light">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="table-cell" colSpan={5}>
                      <div className="h-4 bg-navy-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td className="table-cell text-center text-warm-gray" colSpan={5}>
                    Keine Kunden gefunden
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-navy-light/50"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunset-orange to-sunset-amber flex items-center justify-center text-navy-deep font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-warm-gray">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {user.email && (
                          <p className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-warm-gray" />
                            {user.email}
                          </p>
                        )}
                        {user.phone && (
                          <p className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-warm-gray" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-warm-gray" />
                        {user.bookingsCount}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1 text-sunset-orange">
                        <Star className="w-4 h-4" />
                        {user.customerScore}
                      </span>
                    </td>
                    <td className="table-cell text-warm-gray">
                      {new Date(user.createdAt).toLocaleDateString('de')}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




