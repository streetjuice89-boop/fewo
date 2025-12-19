import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, RefreshCw, Trash2, ExternalLink, Building2, 
  X, ChevronLeft, ChevronRight, MapPin, Users, Bed, Bath,
  Star, Image as ImageIcon, Eye, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { airbnbApi, countriesApi } from '../lib/api';

export default function AirbnbPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [imageIndex, setImageIndex] = useState(0);

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
      setSelectedListing(null);
      toast.success('Gelöscht');
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: ({ id, countryId }: { id: string; countryId: number }) =>
      airbnbApi.createProperty(id, countryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setSelectedListing(null);
      toast.success('Unterkunft erstellt! Sie finden sie unter "Unterkünfte" → "Geplant"');
    },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const listings = data?.data?.data || [];
  const countries = countriesData?.data?.data || [];

  const openListing = (listing: any) => {
    setSelectedListing(listing);
    setImageIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl">Airbnb Grabber</h1>
          <p className="text-warm-gray text-sm">{data?.data?.meta?.total || 0} Inserate importiert</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Inserat hinzufügen
        </button>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-pearl">Airbnb URL hinzufügen</h2>
                <button onClick={() => setShowAdd(false)} className="text-warm-gray hover:text-pearl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); grabMutation.mutate(url); }}>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://airbnb.de/rooms/..."
                  required
                  className="input mb-4"
                />
                <p className="text-xs text-warm-gray mb-4">
                  Unterstützt: airbnb.com, airbnb.de, airbnb.at, airbnb.ch
                </p>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
                    Abbrechen
                  </button>
                  <button type="submit" disabled={grabMutation.isPending} className="btn-primary">
                    {grabMutation.isPending ? 'Wird geladen...' : 'Importieren'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-navy-light flex items-center justify-between">
                <h2 className="text-lg font-semibold text-pearl truncate flex-1">{selectedListing.title}</h2>
                <button onClick={() => setSelectedListing(null)} className="text-warm-gray hover:text-pearl ml-4">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Image Gallery */}
                <div className="relative aspect-video bg-navy-light">
                  {selectedListing.images?.length > 0 ? (
                    <>
                      <img
                        src={selectedListing.images[imageIndex]}
                        alt={`Bild ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedListing.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setImageIndex((i) => (i - 1 + selectedListing.images.length) % selectedListing.images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => setImageIndex((i) => (i + 1) % selectedListing.images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                            {selectedListing.images.map((_: any, i: number) => (
                              <button
                                key={i}
                                onClick={() => setImageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 rounded-full text-white text-sm flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {imageIndex + 1} / {selectedListing.images.length}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-gray">
                      <ImageIcon className="w-16 h-16 opacity-30" />
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {selectedListing.images?.length > 1 && (
                  <div className="p-4 border-b border-navy-light">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedListing.images.map((img: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                            i === imageIndex ? 'border-sunset-orange' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="p-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-navy-light rounded-xl p-4 text-center">
                      <Users className="w-6 h-6 text-sunset-orange mx-auto mb-2" />
                      <p className="text-2xl font-bold text-pearl">{selectedListing.maxGuests || '—'}</p>
                      <p className="text-xs text-warm-gray">Gäste</p>
                    </div>
                    <div className="bg-navy-light rounded-xl p-4 text-center">
                      <Bed className="w-6 h-6 text-sunset-orange mx-auto mb-2" />
                      <p className="text-2xl font-bold text-pearl">{selectedListing.bedrooms || '—'}</p>
                      <p className="text-xs text-warm-gray">Schlafzimmer</p>
                    </div>
                    <div className="bg-navy-light rounded-xl p-4 text-center">
                      <Bath className="w-6 h-6 text-sunset-orange mx-auto mb-2" />
                      <p className="text-2xl font-bold text-pearl">{selectedListing.bathrooms || '—'}</p>
                      <p className="text-xs text-warm-gray">Badezimmer</p>
                    </div>
                    <div className="bg-navy-light rounded-xl p-4 text-center">
                      <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-pearl">{selectedListing.rating || '—'}</p>
                      <p className="text-xs text-warm-gray">{selectedListing.reviewCount || 0} Bewertungen</p>
                    </div>
                  </div>

                  {/* Location & Price */}
                  <div className="flex flex-wrap items-center gap-4">
                    {selectedListing.location && (
                      <div className="flex items-center gap-2 text-warm-gray">
                        <MapPin className="w-5 h-5 text-sunset-orange" />
                        {selectedListing.location}
                      </div>
                    )}
                    {selectedListing.price && (
                      <div className="px-4 py-2 bg-gradient-to-r from-sunset-orange to-sunset-amber text-navy-deep font-bold rounded-full">
                        €{selectedListing.price} / Nacht
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedListing.description && (
                    <div>
                      <h3 className="font-semibold text-pearl mb-2">Beschreibung</h3>
                      <p className="text-warm-gray text-sm leading-relaxed">{selectedListing.description}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  {selectedListing.amenities?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-pearl mb-2">Ausstattung</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedListing.amenities.map((a: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-navy-light rounded-full text-sm text-warm-gray">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Property */}
                  {selectedListing.linkedProperty && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold">Verknüpft mit Unterkunft</span>
                      </div>
                      <p className="text-pearl">{selectedListing.linkedProperty.title}</p>
                    </div>
                  )}

                  {/* Create Property */}
                  {!selectedListing.linkedProperty && (
                    <div className="p-4 bg-navy-light rounded-xl">
                      <h3 className="font-semibold text-pearl mb-3 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-sunset-orange" />
                        Als Unterkunft übernehmen
                      </h3>
                      <p className="text-sm text-warm-gray mb-4">
                        Erstellt eine neue Unterkunft mit allen Daten aus diesem Inserat. 
                        Die Unterkunft wird als "Geplant" gespeichert.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {countries.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => createPropertyMutation.mutate({ id: selectedListing.id, countryId: c.id })}
                            disabled={createPropertyMutation.isPending}
                            className="px-4 py-2 bg-navy-medium border border-navy-light hover:border-sunset-orange rounded-lg text-pearl text-sm transition-colors"
                          >
                            {c.nameDe}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-navy-light flex items-center justify-between">
                <div className="flex gap-2">
                  <a
                    href={selectedListing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Auf Airbnb öffnen
                  </a>
                  <button
                    onClick={() => syncMutation.mutate(selectedListing.id)}
                    disabled={syncMutation.isPending}
                    className="btn-secondary"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Aktualisieren
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Inserat wirklich löschen?')) {
                      deleteMutation.mutate(selectedListing.id);
                    }
                  }}
                  className="btn-danger"
                >
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          <Building2 className="w-16 h-16 text-warm-gray mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-pearl mb-2">Keine Inserate</h2>
          <p className="text-warm-gray mb-4">Fügen Sie Airbnb URLs hinzu, um Inserate zu importieren</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Erstes Inserat hinzufügen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden group cursor-pointer"
              onClick={() => openListing(listing)}
            >
              <div className="aspect-video relative">
                <img
                  src={listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    listing.syncStatus === 'synced' ? 'bg-green-500/90 text-white' :
                    listing.syncStatus === 'error' ? 'bg-red-500/90 text-white' :
                    'bg-yellow-500/90 text-navy-deep'
                  }`}>
                    {listing.syncStatus === 'synced' ? 'Sync OK' :
                     listing.syncStatus === 'error' ? 'Fehler' : 'Ausstehend'}
                  </span>
                </div>
                {listing.images?.length > 1 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {listing.images.length}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-navy-deep text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Details
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-pearl truncate mb-1">{listing.title}</h3>
                <div className="flex items-center gap-2 text-warm-gray text-xs mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{listing.location || '—'}</span>
                </div>
                
                {/* Description preview */}
                {listing.description && (
                  <p className="text-warm-gray text-xs mb-2 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>
                )}

                {/* Amenities count */}
                {listing.amenities?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-sunset-orange/80 mb-2">
                    <span>✓ {listing.amenities.length} Ausstattungsmerkmale</span>
                  </div>
                )}
                
                {listing.linkedProperty ? (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg text-xs text-green-400">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">Verknüpft</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sunset-orange font-bold">
                      {listing.price ? `€${listing.price}` : '—'}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-warm-gray">
                      {listing.maxGuests && <span>{listing.maxGuests} Gäste</span>}
                      {listing.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {listing.rating}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
