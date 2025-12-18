'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Home,
  CalendarCheck,
  Users,
  DollarSign,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { Card, Badge, Spinner } from '@voyagenest/ui';
import { dashboardApi, chatApi } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface KPIs {
  properties: { total: number; active: number };
  customers: { total: number };
  bookings: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    thisMonthBookings: number;
    lastMonthBookings: number;
    totalRevenue: number;
    thisMonthRevenue: number;
  };
}

interface Booking {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  property: { titleDe: string; images: string[] };
  user: { firstName: string; lastName: string; email: string };
}

interface ChartData {
  month: string;
  count: number;
  revenue: number;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'default',
};

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardApi.getKPIs() as Promise<KPIs>,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: () => dashboardApi.getRecentBookings(5) as Promise<Booking[]>,
  });

  const { data: chartData } = useQuery({
    queryKey: ['chart-data'],
    queryFn: () => dashboardApi.getChartData(6) as Promise<ChartData[]>,
  });

  const { data: activeChatSessions } = useQuery({
    queryKey: ['active-chats'],
    queryFn: () => chatApi.getActiveSessions() as Promise<unknown[]>,
  });

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Gesamtumsatz',
      value: `€${kpis?.bookings.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      trend: kpis?.bookings.thisMonthRevenue || 0,
      trendLabel: 'diesen Monat',
      color: 'text-green-400',
    },
    {
      label: 'Buchungen',
      value: kpis?.bookings.totalBookings || 0,
      icon: CalendarCheck,
      trend: kpis?.bookings.thisMonthBookings || 0,
      trendLabel: 'diesen Monat',
      color: 'text-sunset',
    },
    {
      label: 'Unterkünfte',
      value: kpis?.properties.total || 0,
      icon: Home,
      trend: kpis?.properties.active || 0,
      trendLabel: 'aktiv',
      color: 'text-ocean',
    },
    {
      label: 'Kunden',
      value: kpis?.customers.total || 0,
      icon: Users,
      trend: 0,
      trendLabel: 'registriert',
      color: 'text-sky-blue',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-pearl">Dashboard</h1>
        <p className="text-warm-gray">Willkommen zurück! Hier ist Ihre Übersicht.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-warm-gray mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-pearl">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-navy-light ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={stat.color}>{stat.trend}</span>
                <span className="text-warm-gray">{stat.trendLabel}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-pearl">
              Buchungen & Umsatz
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2D4D" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#142240',
                    border: '1px solid #1A2D4D',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#F8FAFC' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#F5A623"
                  strokeWidth={2}
                  dot={{ fill: '#F5A623' }}
                  name="Buchungen"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  dot={{ fill: '#4ECDC4' }}
                  name="Umsatz (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-pearl mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-navy-light rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <CalendarCheck className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-pearl">Ausstehende Buchungen</span>
              </div>
              <span className="text-xl font-bold text-yellow-400">
                {kpis?.bookings.pendingBookings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-navy-light rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CalendarCheck className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-pearl">Bestätigte Buchungen</span>
              </div>
              <span className="text-xl font-bold text-green-400">
                {kpis?.bookings.confirmedBookings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-navy-light rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-ocean/20">
                  <MessageSquare className="h-5 w-5 text-ocean" />
                </div>
                <span className="text-pearl">Aktive Chats</span>
              </div>
              <span className="text-xl font-bold text-ocean">
                {(activeChatSessions as unknown[])?.length || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-pearl">Letzte Buchungen</h2>
          <Link
            href="/bookings"
            className="flex items-center gap-2 text-sunset hover:text-sunset-light transition-colors"
          >
            Alle ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-warm-gray border-b border-navy-light">
                <th className="pb-4 font-medium">Unterkunft</th>
                <th className="pb-4 font-medium">Kunde</th>
                <th className="pb-4 font-medium">Betrag</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-light">
              {recentBookings?.map((booking) => (
                <tr key={booking.id} className="text-sm">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                        <Image
                          src={booking.property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100'}
                          alt={booking.property.titleDe}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-pearl font-medium">{booking.property.titleDe}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-pearl">
                        {booking.user.firstName} {booking.user.lastName}
                      </p>
                      <p className="text-xs text-warm-gray">{booking.user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 text-pearl font-semibold">€{booking.totalPrice}</td>
                  <td className="py-4">
                    <Badge variant={statusColors[booking.status]}>
                      {booking.status === 'pending' && 'Ausstehend'}
                      {booking.status === 'confirmed' && 'Bestätigt'}
                      {booking.status === 'cancelled' && 'Storniert'}
                      {booking.status === 'completed' && 'Abgeschlossen'}
                    </Badge>
                  </td>
                  <td className="py-4 text-warm-gray">
                    {new Date(booking.createdAt).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

