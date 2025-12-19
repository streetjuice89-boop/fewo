import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, User, Clock } from 'lucide-react';
import { logsApi } from '../lib/api';

export default function LogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => logsApi.list({ limit: 100 }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['logs', 'stats'],
    queryFn: () => logsApi.statistics(),
  });

  const logs = data?.data?.data || [];
  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pearl">System Logs</h1>
        <p className="text-warm-gray text-sm">{data?.data?.meta?.total || 0} Einträge</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-2xl font-bold text-pearl">{stats?.today || 0}</p>
          <p className="text-xs text-warm-gray">Heute</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-pearl">{stats?.thisWeek || 0}</p>
          <p className="text-xs text-warm-gray">Diese Woche</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold text-pearl">{stats?.thisMonth || 0}</p>
          <p className="text-xs text-warm-gray">Diesen Monat</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full">
            <thead className="bg-navy-light sticky top-0">
              <tr>
                <th className="table-header">Aktion</th>
                <th className="table-header">Benutzer</th>
                <th className="table-header">Details</th>
                <th className="table-header">Zeitpunkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-light">
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="table-cell" colSpan={4}>
                      <div className="h-4 bg-navy-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td className="table-cell text-center text-warm-gray" colSpan={4}>
                    Keine Logs gefunden
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-navy-light/50"
                  >
                    <td className="table-cell">
                      <span className="px-2 py-1 bg-navy-light rounded text-xs font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-warm-gray" />
                          <span>@{log.user.username}</span>
                        </div>
                      ) : (
                        <span className="text-warm-gray">System</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {log.entityType && (
                        <span className="text-warm-gray text-xs">
                          {log.entityType} #{log.entityId}
                        </span>
                      )}
                      {log.details && (
                        <pre className="text-xs text-warm-gray mt-1 max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </pre>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 text-warm-gray text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString('de')}
                      </div>
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



