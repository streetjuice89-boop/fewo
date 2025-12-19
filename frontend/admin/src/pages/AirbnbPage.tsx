import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, RefreshCw, Trash2, ExternalLink, Building2, 
  X, ChevronLeft, ChevronRight, MapPin, Users, Bed, Bath,
  Star, Image as ImageIcon, Eye, ArrowRight, Edit3, Save, 
  PlusCircle, Search, Filter, Grid, List, Copy, Check,
  AlertCircle, CheckCircle2, Clock, Euro, Home, Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { airbnbApi, countriesApi, amenitiesApi } from '../lib/api';

export default function AirbnbPage() {
  const queryClient = useQueryClient();
  
  // UI State
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: 0,
    amenities: [] as string[],
    bulkAmenities: '',
  });

  // Initialize edit form when listing is selected
  useEffect(() => {
    if (selectedListing) {
      setEditForm({
        title: selectedListing.title || '',
        description: selectedListing.description || '',
        price: selectedListing.price || 0,
        location: selectedListing.location || '',
        bedrooms: selectedListing.bedrooms || 0,
        bathrooms: selectedListing.bathrooms || 0,
        maxGuests: selectedListing.maxGuests || 0,
        amenities: selectedListing.amenities || [],
        bulkAmenities: '',
      });
      setIsEditing(false);
      setImageIndex(0);
    }
  }, [selectedListing]);

  const { data, isLoading } = useQuery({
    queryKey: ['airbnb'],
    queryFn: () => airbnbApi.list(),
  });

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.list(),
  });

  // Fetch available amenities from database
  const { data: amenitiesData } = useQuery({
    queryKey: ['amenities-active'],
    queryFn: () => amenitiesApi.list({ active_only: true }),
  });

  const grabMutation = useMutation({
    mutationFn: (url: string) => airbnbApi.grab(url),
    onSuccess: (response) => {
      setUrl('');
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      toast.success('Inserat hinzugefügt');
      // Open the newly created listing
      if (response.data) {
        setSelectedListing(response.data);
      }
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Fehler beim Import'),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => airbnbApi.sync(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      if (selectedListing && response.data) {
        setSelectedListing(response.data);
      }
      toast.success('Daten aktualisiert');
    },
    onError: () => toast.error('Aktualisierung fehlgeschlagen'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => airbnbApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      setSelectedListing(null);
      toast.success('Inserat gelöscht');
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: ({ id, countryId }: { id: string; countryId: number }) =>
      airbnbApi.createProperty(id, countryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setSelectedListing(null);
      toast.success('Unterkunft erstellt! → Unterkünfte → Geplant');
    },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      airbnbApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['airbnb'] });
      setSelectedListing(response.data);
      setIsEditing(false);
      toast.success('Gespeichert');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const handleSaveEdit = () => {
    if (!selectedListing) return;
    
    updateMutation.mutate({
      id: selectedListing.id,
      data: {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        location: editForm.location,
        bedrooms: editForm.bedrooms,
        bathrooms: editForm.bathrooms,
        maxGuests: editForm.maxGuests,
        amenities: editForm.amenities,
      },
    });
  };

  const addAmenity = (amenity: string) => {
    const trimmed = amenity.trim();
    if (trimmed && !editForm.amenities.includes(trimmed)) {
      setEditForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
    }
  };

  const addBulkAmenities = () => {
    // Split by newline, comma, or semicolon
    const items = editForm.bulkAmenities
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !editForm.amenities.includes(s));
    
    if (items.length > 0) {
      setEditForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, ...items],
        bulkAmenities: '',
      }));
      toast.success(`${items.length} Ausstattungsmerkmale hinzugefügt`);
    }
  };

  const removeAmenity = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  // Check if listing has complete data
  const isComplete = (listing: any) => {
    return listing.title && 
           listing.description && 
           listing.price > 0 && 
           listing.amenities?.length > 0 &&
           listing.images?.length > 0;
  };

  const listings = data?.data?.data || [];
  const countries = countriesData?.data?.data || [];

  // Filter and search listings
  const filteredListings = listings.filter((listing: any) => {
    const matchesSearch = !searchQuery || 
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'complete' && isComplete(listing)) ||
      (filterStatus === 'incomplete' && !isComplete(listing));
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: listings.length,
    complete: listings.filter(isComplete).length,
    incomplete: listings.filter((l: any) => !isComplete(l)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            Airbnb Grabber
          </h1>
          <p className="text-warm-gray text-sm mt-1">
            Importiere und verwalte Airbnb-Inserate
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Inserat importieren
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-pearl">{stats.total}</p>
            <p className="text-sm text-warm-gray">Inserate gesamt</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-pearl">{stats.complete}</p>
            <p className="text-sm text-warm-gray">Vollständig</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-pearl">{stats.incomplete}</p>
            <p className="text-sm text-warm-gray">Unvollständig</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Titel oder Ort..."
              className="input pl-10 w-full"
            />
          </div>
          
          {/* Filter */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input"
            >
              <option value="all">Alle Inserate</option>
              <option value="complete">Vollständig</option>
              <option value="incomplete">Unvollständig</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-navy-light">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-sunset-orange text-navy-deep' : 'bg-navy-light text-warm-gray hover:text-pearl'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-sunset-orange text-navy-deep' : 'bg-navy-light text-warm-gray hover:text-pearl'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-pearl">Inserat importieren</h2>
                    <p className="text-sm text-warm-gray">Airbnb-URL einfügen</p>
                  </div>
                </div>
                <button onClick={() => setShowAdd(false)} className="text-warm-gray hover:text-pearl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); grabMutation.mutate(url); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pearl mb-2">Airbnb URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://airbnb.de/rooms/123456789"
                      required
                      className="input w-full"
                    />
                  </div>
                  
                  <div className="p-4 bg-navy-light rounded-xl">
                    <h4 className="text-sm font-medium text-pearl mb-2">Hinweis</h4>
                    <p className="text-xs text-warm-gray">
                      Aufgrund von Airbnb-Beschränkungen werden nur Basis-Daten automatisch importiert. 
                      Beschreibung und Ausstattung können danach manuell eingefügt werden.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
                      Abbrechen
                    </button>
                    <button type="submit" disabled={grabMutation.isPending} className="btn-primary">
                      {grabMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Importiere...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Importieren
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {showFullscreenImage && selectedListing?.images?.length > 0 && (
          <div 
            className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
            onClick={() => setShowFullscreenImage(false)}
          >
            <button 
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
              onClick={() => setShowFullscreenImage(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedListing.images[imageIndex]}
              alt={`Bild ${imageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            {selectedListing.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + selectedListing.images.length) % selectedListing.images.length); }}
                  className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i + 1) % selectedListing.images.length); }}
                  className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white">
              {imageIndex + 1} / {selectedListing.images.length}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card w-full max-w-6xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-navy-light">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="input w-full text-xl font-semibold"
                        placeholder="Titel eingeben..."
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-pearl">{selectedListing.title || 'Kein Titel'}</h2>
                    )}
                    
                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {/* Airbnb ID */}
                      <span className="text-xs text-warm-gray bg-navy-light px-2 py-1 rounded font-mono">
                        ID: {selectedListing.airbnbId}
                      </span>
                      
                      {/* Status badges */}
                      {isComplete(selectedListing) ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Vollständig
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Unvollständig
                        </span>
                      )}
                      
                      {selectedListing.linkedProperty && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Verknüpft
                        </span>
                      )}
                      
                      {/* Rating */}
                      {selectedListing.rating && (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {selectedListing.rating} ({selectedListing.reviewCount || 0})
                        </span>
                      )}
                      
                      {/* Last Synced */}
                      {selectedListing.lastSyncedAt && (
                        <span className="text-xs text-warm-gray flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Sync: {new Date(selectedListing.lastSyncedAt).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="btn-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                        Bearbeiten
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={handleSaveEdit}
                          disabled={updateMutation.isPending}
                          className="btn-primary"
                        >
                          <Save className="w-4 h-4" />
                          {updateMutation.isPending ? 'Speichert...' : 'Speichern'}
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              title: selectedListing.title || '',
                              description: selectedListing.description || '',
                              price: selectedListing.price || 0,
                              location: selectedListing.location || '',
                              bedrooms: selectedListing.bedrooms || 0,
                              bathrooms: selectedListing.bathrooms || 0,
                              maxGuests: selectedListing.maxGuests || 0,
                              amenities: selectedListing.amenities || [],
                              bulkAmenities: '',
                            });
                          }}
                          className="btn-secondary"
                        >
                          Abbrechen
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelectedListing(null)} className="p-2 text-warm-gray hover:text-pearl rounded-lg hover:bg-navy-light">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Data Completeness Checklist */}
                {!isComplete(selectedListing) && !isEditing && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-400 font-medium mb-2">Fehlende Daten:</p>
                    <div className="flex flex-wrap gap-2">
                      {!selectedListing.title && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Titel</span>}
                      {!selectedListing.description && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Beschreibung</span>}
                      {!selectedListing.price && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Preis</span>}
                      {(!selectedListing.amenities || selectedListing.amenities.length === 0) && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Ausstattung</span>}
                      {(!selectedListing.images || selectedListing.images.length === 0) && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Bilder</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                {/* Left Column - Images (3/5) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Main Image */}
                  <div 
                    className="relative aspect-[16/10] bg-navy-light rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => selectedListing.images?.length > 0 && setShowFullscreenImage(true)}
                  >
                    {selectedListing.images?.length > 0 ? (
                      <>
                        <img
                          src={selectedListing.images[imageIndex]}
                          alt={`Bild ${imageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                        {selectedListing.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i - 1 + selectedListing.images.length) % selectedListing.images.length); }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setImageIndex((i) => (i + 1) % selectedListing.images.length); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </>
                        )}
                        <div className="absolute top-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span className="font-medium">{imageIndex + 1}</span>
                          <span className="text-white/60">/ {selectedListing.images.length}</span>
                        </div>
                        <div className="absolute bottom-4 left-4 text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                          Klicken für Vollbild
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-warm-gray">
                        <ImageIcon className="w-20 h-20 opacity-30 mb-3" />
                        <p className="text-lg">Keine Bilder vorhanden</p>
                        <p className="text-sm text-warm-gray/60 mt-1">Bilder werden beim Sync geladen</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedListing.images?.length > 1 && (
                    <div className="grid grid-cols-8 gap-2">
                      {selectedListing.images.map((img: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            i === imageIndex ? 'border-sunset-orange ring-2 ring-sunset-orange/30' : 'border-transparent hover:border-warm-gray/50'
                          }`}
                        >
                          <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-navy-light rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-pearl text-lg">Beschreibung</h3>
                      {!selectedListing.description && !isEditing && (
                        <span className="text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">Fehlt</span>
                      )}
                      {selectedListing.description && !isEditing && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedListing.description);
                            toast.success('Beschreibung kopiert');
                          }}
                          className="text-xs text-warm-gray hover:text-pearl flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Kopieren
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="input w-full h-48 resize-y text-sm"
                        placeholder="Beschreibung von Airbnb hier einfügen...&#10;&#10;Tipp: Öffne die Airbnb-Seite, kopiere die vollständige Beschreibung und füge sie hier ein."
                      />
                    ) : selectedListing.description ? (
                      <p className="text-warm-gray text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {selectedListing.description}
                      </p>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-warm-gray/50 text-sm mb-3">
                          Keine Beschreibung vorhanden
                        </p>
                        <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                          <Edit3 className="w-4 h-4" /> Jetzt hinzufügen
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details (2/5) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Quick Stats */}
                  <div className="bg-navy-light rounded-xl p-5">
                    <h3 className="font-semibold text-pearl mb-4">Eckdaten</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {isEditing ? (
                        <>
                          <div>
                            <label className="text-xs text-warm-gray block mb-1">Max. Gäste</label>
                            <input
                              type="number"
                              min="1"
                              value={editForm.maxGuests}
                              onChange={(e) => setEditForm(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 0 }))}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-warm-gray block mb-1">Schlafzimmer</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.bedrooms}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-warm-gray block mb-1">Badezimmer</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.bathrooms}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-warm-gray block mb-1">Preis €/Nacht</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.price}
                              onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                              className="input w-full"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 p-3 bg-navy-medium rounded-lg">
                            <Users className="w-5 h-5 text-sunset-orange" />
                            <div>
                              <p className="text-lg font-bold text-pearl">{selectedListing.maxGuests || '—'}</p>
                              <p className="text-xs text-warm-gray">Gäste</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-navy-medium rounded-lg">
                            <Bed className="w-5 h-5 text-sunset-orange" />
                            <div>
                              <p className="text-lg font-bold text-pearl">{selectedListing.bedrooms || '—'}</p>
                              <p className="text-xs text-warm-gray">Schlafzimmer</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-navy-medium rounded-lg">
                            <Bath className="w-5 h-5 text-sunset-orange" />
                            <div>
                              <p className="text-lg font-bold text-pearl">{selectedListing.bathrooms || '—'}</p>
                              <p className="text-xs text-warm-gray">Badezimmer</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-navy-medium rounded-lg">
                            <Euro className="w-5 h-5 text-sunset-orange" />
                            <div>
                              <p className="text-lg font-bold text-pearl">{selectedListing.price ? `€${selectedListing.price}` : '—'}</p>
                              <p className="text-xs text-warm-gray">pro Nacht</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-navy-light rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-sunset-orange" />
                      <h3 className="font-semibold text-pearl">Standort</h3>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="input w-full"
                        placeholder="z.B. Paris, Frankreich"
                      />
                    ) : (
                      <p className="text-warm-gray">{selectedListing.location || 'Nicht angegeben'}</p>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="bg-navy-light rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-pearl">
                        Ausstattung
                        <span className="text-warm-gray font-normal ml-2">
                          ({isEditing ? editForm.amenities.length : (selectedListing.amenities?.length || 0)})
                        </span>
                      </h3>
                      {(!selectedListing.amenities || selectedListing.amenities.length === 0) && !isEditing && (
                        <span className="text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">Fehlt</span>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        {/* Bulk Add */}
                        <div>
                          <label className="text-xs text-warm-gray block mb-2">
                            Mehrere auf einmal hinzufügen (Komma, Semikolon oder Zeilenumbruch)
                          </label>
                          <textarea
                            value={editForm.bulkAmenities}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bulkAmenities: e.target.value }))}
                            className="input w-full h-24 resize-none text-sm"
                            placeholder="WLAN, Küche, Waschmaschine, TV..."
                          />
                          <button
                            type="button"
                            onClick={addBulkAmenities}
                            disabled={!editForm.bulkAmenities.trim()}
                            className="btn-primary w-full mt-2"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Hinzufügen
                          </button>
                        </div>
                        
                        {/* Available Amenities from Database */}
                        <div>
                          <label className="text-xs text-warm-gray block mb-2">
                            Aus Ausstattungen-Katalog hinzufügen:
                          </label>
                          {amenitiesData?.data?.grouped?.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                              {amenitiesData.data.grouped.map((group: { category: string; items: { id: number; name: string }[] }) => (
                                <div key={group.category}>
                                  <p className="text-xs text-sunset-orange font-medium mb-1">{group.category}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {group.items.map((amenity) => (
                                      <button
                                        key={amenity.id}
                                        type="button"
                                        onClick={() => addAmenity(amenity.name)}
                                        disabled={editForm.amenities.includes(amenity.name)}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                          editForm.amenities.includes(amenity.name) 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-navy-medium text-warm-gray hover:bg-sunset-orange/20 hover:text-sunset-orange'
                                        }`}
                                      >
                                        {editForm.amenities.includes(amenity.name) ? <Check className="w-3 h-3 inline mr-1" /> : '+'} {amenity.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-warm-gray/50 text-sm mb-2">Keine Ausstattungen im Katalog</p>
                              <a href="/amenities" className="text-xs text-sunset-orange hover:underline">
                                → Ausstattungen verwalten
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {/* Current Amenities */}
                        {editForm.amenities.length > 0 && (
                          <div>
                            <label className="text-xs text-warm-gray block mb-2">Aktuelle ({editForm.amenities.length}):</label>
                            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                              {editForm.amenities.map((a, i) => (
                                <span 
                                  key={i} 
                                  className="px-2 py-1 bg-navy-medium rounded text-xs text-warm-gray flex items-center gap-1 group hover:bg-red-500/20"
                                >
                                  {a}
                                  <button 
                                    onClick={() => removeAmenity(i)}
                                    className="text-warm-gray/50 hover:text-red-400"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : selectedListing.amenities?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {selectedListing.amenities.map((a: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-navy-medium rounded text-xs text-warm-gray">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-warm-gray/50 text-sm mb-3">Keine Ausstattung</p>
                        <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                          <Edit3 className="w-4 h-4" /> Hinzufügen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Create Property / Linked Property */}
                  {!selectedListing.linkedProperty ? (
                    <div className="bg-gradient-to-br from-sunset-orange/20 to-sunset-amber/10 rounded-xl p-5 border border-sunset-orange/30">
                      <h3 className="font-semibold text-pearl mb-2 flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-sunset-orange" />
                        Als Unterkunft übernehmen
                      </h3>
                      <p className="text-sm text-warm-gray mb-4">
                        Land auswählen:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {countries.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => createPropertyMutation.mutate({ id: selectedListing.id, countryId: c.id })}
                            disabled={createPropertyMutation.isPending}
                            className="px-3 py-2 bg-navy-deep border border-navy-light hover:border-sunset-orange hover:bg-sunset-orange/10 rounded-lg text-pearl text-sm transition-all"
                          >
                            {c.nameDe}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Verknüpft</span>
                      </div>
                      <p className="text-pearl text-sm">{selectedListing.linkedProperty.title}</p>
                      <a href={`/properties`} className="text-xs text-green-400 hover:underline mt-2 inline-block">
                        → Zur Unterkunft
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-navy-light flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
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
                    {syncMutation.isPending ? 'Lädt...' : 'Neu laden'}
                  </button>
                  <button
                    onClick={() => {
                      const text = `${selectedListing.title}\n${selectedListing.location}\n€${selectedListing.price}/Nacht\n${selectedListing.url}`;
                      navigator.clipboard.writeText(text);
                      toast.success('Inserat-Info kopiert');
                    }}
                    className="btn-secondary"
                  >
                    <Copy className="w-4 h-4" />
                    Kopieren
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Inserat wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
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
          </div>
        )}
      </AnimatePresence>

      {/* Listings */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
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
      ) : filteredListings.length === 0 ? (
        <div className="card p-12 text-center">
          {listings.length === 0 ? (
            <>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5A5F]/20 to-[#FF385C]/10 flex items-center justify-center mx-auto mb-4">
                <Home className="w-10 h-10 text-[#FF5A5F]" />
              </div>
              <h2 className="text-xl font-semibold text-pearl mb-2">Keine Inserate</h2>
              <p className="text-warm-gray mb-4">Importiere dein erstes Airbnb-Inserat</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Inserat importieren
              </button>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-warm-gray mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-pearl mb-2">Keine Treffer</h2>
              <p className="text-warm-gray">Passe deine Suche oder Filter an</p>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card overflow-hidden group cursor-pointer hover:border-sunset-orange/50 transition-colors"
              onClick={() => setSelectedListing(listing)}
            >
              <div className="aspect-video relative">
                <img
                  src={listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Status badges */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {isComplete(listing) ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500/90 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/90 text-navy-deep flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                    </span>
                  )}
                </div>
                
                {listing.images?.length > 1 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {listing.images.length}
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-navy-deep text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Öffnen
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-pearl truncate mb-1">{listing.title || 'Kein Titel'}</h3>
                <div className="flex items-center gap-2 text-warm-gray text-xs mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{listing.location || '—'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sunset-orange font-bold">
                    {listing.price ? `€${listing.price}` : '—'}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-warm-gray">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {listing.maxGuests || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {listing.bedrooms || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredListings.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="card p-4 flex items-center gap-4 cursor-pointer hover:border-sunset-orange/50 transition-colors"
              onClick={() => setSelectedListing(listing)}
            >
              <img
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200'}
                alt={listing.title}
                className="w-20 h-14 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-pearl truncate">{listing.title || 'Kein Titel'}</h3>
                <p className="text-sm text-warm-gray truncate">{listing.location || '—'}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-sunset-orange font-bold">{listing.price ? `€${listing.price}` : '—'}</span>
                <span className="text-warm-gray">{listing.images?.length || 0} Bilder</span>
                <span className="text-warm-gray">{listing.amenities?.length || 0} Ausstattung</span>
                {isComplete(listing) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
