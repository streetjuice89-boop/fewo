import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Link2, Unlink, Trash2, ExternalLink, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { airbnbApi, countriesApi } from '../lib/api';

export default function AirbnbPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['airbnb'],
    queryFn: () => airbnbApi.list(),
  });

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.list(),
  });

  const grabMutation = useMutation({
    mutationFn: (url: string) => airbnbApi.grab(url),
    onSuccess: () => {
      setUrl('');
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      toast.success('Inserat hinzugefügt');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Fehler'),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => airbnbApi.sync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      toast.success('Synchronisiert');
    },
    onError: () => toast.error('Sync fehlgeschlagen'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => airbnbApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      toast.success('Gelöscht');
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: ({ id, countryId }: { id: string; countryId: number }) =>
      airbnbApi.createProperty(id, countryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Unterkunft erstellt');
    },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const listings = data?.data?.data || [];
  const countries = countriesData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl">Airbnb Grabber</h1>
          <p className="text-warm-gray text-sm">{data?.data?.meta?.total || 0} Inserate</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Inserat hinzufügen
        </button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-pearl mb-4">Airbnb URL hinzufügen</h2>
            <form onSubmit={(e) => { e.preventDefault(); grabMutation.mutate(url); }}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://airbnb.de/rooms/..."
                required
                className="input mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
                  Abbrechen
                </button>
                <button type="submit" disabled={grabMutation.isPending} className="btn-primary">
                  {grabMutation.isPending ? 'Wird geladen...' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-navy-light" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-navy-light rounded w-3/4" />
                <div className="h-4 bg-navy-light rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 text-center">
          <Link2 className="w-16 h-16 text-warm-gray mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-pearl mb-2">Keine Inserate</h2>
          <p className="text-warm-gray mb-4">Fügen Sie Airbnb URLs hinzu, um Inserate zu importieren</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Erstes Inserat hinzufügen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              <div className="aspect-video relative">
                <img
                  src={listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    listing.syncStatus === 'synced' ? 'bg-green-500/90 text-white' :
                    listing.syncStatus === 'error' ? 'bg-red-500/90 text-white' :
                    'bg-yellow-500/90 text-navy-deep'
                  }`}>
                    {listing.syncStatus === 'synced' ? 'Sync OK' :
                     listing.syncStatus === 'error' ? 'Fehler' : 'Ausstehend'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-pearl truncate mb-1">{listing.title}</h3>
                <p className="text-sm text-warm-gray mb-2">{listing.location}</p>
                
                {listing.linkedProperty ? (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg mb-3">
                    <Building2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500 truncate">
                      Verknüpft: {listing.linkedProperty.title}
                    </span>
                  </div>
                ) : (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        createPropertyMutation.mutate({ 
                          id: listing.id, 
                          countryId: parseInt(e.target.value) 
                        });
                      }
                    }}
                    className="input text-xs mb-3"
                    defaultValue=""
                  >
                    <option value="">Als Unterkunft erstellen...</option>
                    {countries.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nameDe}</option>
                    ))}
                  </select>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sunset-orange font-medium">
                    {listing.price ? `€${listing.price}` : '—'}
                  </span>
                  <div className="flex gap-1">
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-warm-gray hover:text-pearl hover:bg-navy-light rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => syncMutation.mutate(listing.id)}
                      disabled={syncMutation.isPending}
                      className="p-2 text-warm-gray hover:text-pearl hover:bg-navy-light rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Inserat wirklich löschen?')) {
                          deleteMutation.mutate(listing.id);
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



