import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, MapPin, Users, Euro, Search, 
  CheckCircle, Clock, EyeOff, Star, Globe, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertiesApi } from '../lib/api';

type StatusTab = 'all' | 'draft' | 'online' | 'offline';

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['properties', { search, status: activeTab === 'all' ? undefined : activeTab, admin: true }],
    queryFn: () => propertiesApi.list({ 
      search: search || undefined, 
      status: activeTab === 'all' ? undefined : activeTab,
      admin: true 
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Unterkunft gelöscht');
    },
    onError: () => toast.error('Löschen fehlgeschlagen'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      propertiesApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Status aktualisiert');
    },
    onError: () => toast.error('Fehler beim Aktualisieren'),
  });

  const properties = data?.data?.data || [];
  const total = data?.data?.meta?.total || 0;

  // Count by status
  const statusCounts = {
    all: total,
    draft: properties.filter((p: any) => p.status === 'draft').length,
    online: properties.filter((p: any) => p.status === 'online').length,
    offline: properties.filter((p: any) => p.status === 'offline').length,
  };

  const tabs: { key: StatusTab; label: string; icon: any; color: string }[] = [
    { key: 'all', label: 'Alle', icon: Globe, color: 'text-pearl' },
    { key: 'draft', label: 'Geplant', icon: Pencil, color: 'text-yellow-400' },
    { key: 'online', label: 'Online', icon: CheckCircle, color: 'text-green-400' },
    { key: 'offline', label: 'Offline', icon: EyeOff, color: 'text-red-400' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Online
          </span>
        );
      case 'offline':
        return (
          <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full font-medium flex items-center gap-1">
            <EyeOff className="w-3 h-3" /> Offline
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Geplant
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl">Unterkünfte</h1>
          <p className="text-warm-gray text-sm">{total} Unterkünfte gesamt</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Neue Unterkunft
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-navy-light pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-sunset-orange text-navy-deep'
                : 'bg-navy-light text-warm-gray hover:text-pearl'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? '' : tab.color}`} />
            {tab.label}
            {tab.key !== 'all' && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-navy-deep/20' : 'bg-navy-medium'
              }`}>
                {statusCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray pointer-events-none" />
        <input
          type="text"
          placeholder="Suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-navy-light" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-navy-light rounded w-2/3" />
                <div className="h-4 bg-navy-light rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="card p-12 text-center">
          <Globe className="w-16 h-16 text-warm-gray mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-pearl mb-2">
            {activeTab === 'draft' ? 'Keine geplanten Unterkünfte' :
             activeTab === 'online' ? 'Keine Online-Unterkünfte' :
             activeTab === 'offline' ? 'Keine Offline-Unterkünfte' :
             'Keine Unterkünfte'}
          </h2>
          <p className="text-warm-gray mb-4">
            {activeTab === 'draft' 
              ? 'Importieren Sie Airbnb-Inserate um neue Unterkünfte zu erstellen'
              : 'Erstellen Sie eine neue Unterkunft oder importieren Sie von Airbnb'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {properties.map((property: any, i: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="card overflow-hidden group"
              >
                <div className="aspect-video relative">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                    alt={property.titleDe}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {property.featured && (
                      <span className="px-2 py-1 text-xs bg-sunset-orange text-navy-deep rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  {property.airbnbId && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-rose-500/80 rounded text-white text-xs">
                      Airbnb
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-warm-gray text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    {property.city}, {property.country?.nameDe}
                  </div>
                  <h3 className="font-medium text-pearl truncate">{property.titleDe}</h3>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs text-warm-gray">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {property.maxGuests}
                      </span>
                      <span className="flex items-center gap-1">
                        <Euro className="w-3 h-3" />
                        {property.pricePerNight}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-navy-light space-y-3">
                    {/* Publish Button */}
                    {property.status !== 'online' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: property.id, status: 'online' })}
                        disabled={updateStatusMutation.isPending}
                        className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Veröffentlichen
                      </button>
                    )}
                    {property.status === 'online' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: property.id, status: 'offline' })}
                        disabled={updateStatusMutation.isPending}
                        className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Offline nehmen
                      </button>
                    )}
                    
                    {/* Edit/Delete */}
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-4 bg-navy-light hover:bg-navy-medium text-pearl rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Bearbeiten
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Unterkunft wirklich löschen?')) {
                            deleteMutation.mutate(property.id);
                          }
                        }}
                        className="py-2 px-4 bg-navy-light hover:bg-red-500/20 text-warm-gray hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
