import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Calendar, Users, Euro, Clock, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../lib/api';

export default function DashboardPage() {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: chartData } = useQuery({
    queryKey: ['dashboard', 'chart'],
    queryFn: () => dashboardApi.chart(30),
  });

  const { data: activityData } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApi.activity(),
  });

  const stats = statsData?.data;
  const chart = chartData?.data?.data || [];
  const activities = activityData?.data?.data || [];

  const statCards = [
    { label: 'Unterkünfte', value: stats?.properties?.total || 0, icon: Building2, color: 'from-blue-500 to-blue-600' },
    { label: 'Buchungen', value: stats?.bookings?.total || 0, icon: Calendar, color: 'from-green-500 to-green-600' },
    { label: 'Kunden', value: stats?.customers?.total || 0, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Umsatz', value: `€${(stats?.revenue?.total || 0).toLocaleString()}`, icon: Euro, color: 'from-sunset-orange to-sunset-amber' },
    { label: 'Ausstehend', value: stats?.bookings?.pending || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Aktive Chats', value: stats?.chat?.active || 0, icon: MessageSquare, color: 'from-ocean-teal to-sky-blue' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pearl">Dashboard</h1>
        <p className="text-warm-gray text-sm">Übersicht aller wichtigen Kennzahlen</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-pearl">{stat.value}</p>
            <p className="text-xs text-warm-gray">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-pearl mb-4">Buchungen (30 Tage)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3B5B" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8" 
                  fontSize={12}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('de', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#142240', 
                    border: '1px solid #2A3B5B',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#F5A623" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h2 className="font-semibold text-pearl mb-4">Letzte Aktivitäten</h2>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-warm-gray text-sm">Keine Aktivitäten</p>
            ) : (
              activities.slice(0, 8).map((activity: any, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    activity.type === 'booking' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-pearl truncate">{activity.title}</p>
                    <p className="text-warm-gray text-xs">
                      {new Date(activity.date).toLocaleString('de')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




