import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Users, Euro, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertiesApi } from '../lib/api';

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['properties', { search }],
    queryFn: () => propertiesApi.list({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Unterkunft gelöscht');
    },
    onError: () => toast.error('Löschen fehlgeschlagen'),
  });

  const properties = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl">Unterkünfte</h1>
          <p className="text-warm-gray text-sm">{data?.data?.meta?.total || 0} Unterkünfte</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Neue Unterkunft
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property: any, i: number) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              <div className="aspect-video relative">
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                  alt={property.titleDe}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {property.featured && (
                    <span className="px-2 py-1 text-xs bg-sunset-orange text-navy-deep rounded font-medium">
                      Featured
                    </span>
                  )}
                  {!property.active && (
                    <span className="px-2 py-1 text-xs bg-red-500 text-white rounded font-medium">
                      Inaktiv
                    </span>
                  )}
                </div>
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
                  <div className="flex gap-1">
                    <button className="p-2 text-warm-gray hover:text-pearl hover:bg-navy-light rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Unterkunft wirklich löschen?')) {
                          deleteMutation.mutate(property.id);
                        }
                      }}
                      className="p-2 text-warm-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}



