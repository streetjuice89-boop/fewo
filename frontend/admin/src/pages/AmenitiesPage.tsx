import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Trash2, Edit2, Check, X, Package,
  Download, Upload, ChevronDown, ChevronRight, ToggleLeft, ToggleRight,
  Sparkles, Layers, Coffee, Bath, Bed, Wifi, Flame, Car, Shield,
  Users, Briefcase, Accessibility, Grid3X3, List, CheckCircle2, FolderPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { amenitiesApi } from '../lib/api';

interface Amenity {
  id: number;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string;
  active: boolean;
  sort_order: number;
}

interface GroupedAmenities {
  category: string;
  items: Amenity[];
}

const categoryIcons: Record<string, typeof Coffee> = {
  'Küche': Coffee,
  'Badezimmer': Bath,
  'Schlafzimmer': Bed,
  'Internet': Wifi,
  'Unterhaltung': Sparkles,
  'Heizung & Klima': Flame,
  'Waschen': Layers,
  'Outdoor': Sparkles,
  'Parken': Car,
  'Sicherheit': Shield,
  'Familie': Users,
  'Arbeit': Briefcase,
  'Barrierefreiheit': Accessibility,
  'Sonstiges': Package,
};

const categoryColors: Record<string, string> = {
  'Küche': 'from-amber-500 to-orange-600',
  'Badezimmer': 'from-cyan-500 to-blue-600',
  'Schlafzimmer': 'from-indigo-500 to-purple-600',
  'Internet': 'from-green-500 to-emerald-600',
  'Unterhaltung': 'from-pink-500 to-rose-600',
  'Heizung & Klima': 'from-red-500 to-orange-600',
  'Waschen': 'from-sky-500 to-blue-600',
  'Outdoor': 'from-lime-500 to-green-600',
  'Parken': 'from-slate-500 to-gray-600',
  'Sicherheit': 'from-yellow-500 to-amber-600',
  'Familie': 'from-violet-500 to-purple-600',
  'Arbeit': 'from-blue-500 to-indigo-600',
  'Barrierefreiheit': 'from-teal-500 to-cyan-600',
  'Sonstiges': 'from-gray-500 to-slate-600',
};

export default function AmenitiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', name_en: '', category: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmenity, setNewAmenity] = useState({ name: '', name_en: '', category: '', icon: '' });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [bulkNewCategory, setBulkNewCategory] = useState(false);
  const [bulkCategoryName, setBulkCategoryName] = useState('');
  const [bulkImportText, setBulkImportText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['amenities', { showInactive }],
    queryFn: () => amenitiesApi.list({ active_only: !showInactive }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof amenitiesApi.create>[0]) => amenitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Ausstattung erstellt');
      setShowAddModal(false);
      setNewAmenity({ name: '', name_en: '', category: '', icon: '' });
      setShowNewCategory(false);
      setNewCategoryName('');
    },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof amenitiesApi.update>[1] }) =>
      amenitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Ausstattung aktualisiert');
      setEditingId(null);
    },
    onError: () => toast.error('Fehler beim Aktualisieren'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => amenitiesApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => amenitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Ausstattung gelöscht');
    },
    onError: () => toast.error('Fehler beim Löschen'),
  });

  const importMutation = useMutation({
    mutationFn: () => amenitiesApi.importFromListings(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success(res.data.message);
    },
    onError: () => toast.error('Import fehlgeschlagen'),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (amenities: Parameters<typeof amenitiesApi.bulkCreate>[0]) =>
      amenitiesApi.bulkCreate(amenities),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success(res.data.message);
      setShowBulkImport(false);
      setBulkImportText('');
    },
    onError: () => toast.error('Bulk-Import fehlgeschlagen'),
  });

  const amenities: Amenity[] = data?.data?.amenities || [];
  const grouped: GroupedAmenities[] = data?.data?.grouped || [];
  const categories: string[] = data?.data?.categories || [];

  const filteredAmenities = amenities.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.name_en?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGrouped = grouped
    .map((g) => ({
      ...g,
      items: g.items.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.name_en?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0 && (!selectedCategory || g.category === selectedCategory));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const startEdit = (amenity: Amenity) => {
    setEditingId(amenity.id);
    setEditForm({
      name: amenity.name,
      name_en: amenity.name_en || '',
      category: amenity.category,
    });
  };

  const saveEdit = () => {
    if (editingId && editForm.name) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: editForm.name,
          name_en: editForm.name_en || undefined,
          category: editForm.category,
        },
      });
    }
  };

  const handleBulkImport = () => {
    const lines = bulkImportText.split('\n').filter((l) => l.trim());
    const categoryToUse = bulkNewCategory && bulkCategoryName.trim() 
      ? bulkCategoryName.trim() 
      : (selectedCategory || 'Sonstiges');
    const amenities = lines.map((line) => ({
      name: line.trim(),
      category: categoryToUse,
    }));
    if (amenities.length > 0) {
      bulkCreateMutation.mutate(amenities);
      // Reset new category state
      setBulkNewCategory(false);
      setBulkCategoryName('');
    }
  };

  const stats = {
    total: amenities.length,
    active: amenities.filter((a) => a.active).length,
    categories: categories.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pearl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Ausstattungen
          </h1>
          <p className="text-warm-gray mt-1">
            Verwalte alle verfügbaren Ausstattungsmerkmale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Von Inseraten importieren
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Neue Ausstattung
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pearl">{stats.total}</p>
              <p className="text-sm text-warm-gray">Gesamt</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pearl">{stats.active}</p>
              <p className="text-sm text-warm-gray">Aktiv</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pearl">{stats.categories}</p>
              <p className="text-sm text-warm-gray">Kategorien</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
            <input
              type="text"
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="input pl-10 pr-8 appearance-none"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Show Inactive */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              showInactive ? 'bg-amber-500/20 text-amber-400' : 'bg-navy-light text-warm-gray'
            }`}
          >
            {showInactive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Inaktive zeigen
          </button>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-navy-light rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-navy-medium text-pearl' : 'text-warm-gray'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-navy-medium text-pearl' : 'text-warm-gray'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          {filteredGrouped.map((group) => {
            const CategoryIcon = categoryIcons[group.category] || Package;
            const colorClass = categoryColors[group.category] || 'from-gray-500 to-slate-600';
            const isExpanded = expandedCategories.has(group.category);

            return (
              <div key={group.category} className="card overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-navy-light/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-pearl">{group.category}</h3>
                      <p className="text-sm text-warm-gray">{group.items.length} Ausstattungen</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-warm-gray" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-warm-gray" />
                  )}
                </button>

                {/* Category Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 pt-0">
                        {group.items.map((amenity) => (
                          <AmenityCard
                            key={amenity.id}
                            amenity={amenity}
                            isEditing={editingId === amenity.id}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            onEdit={() => startEdit(amenity)}
                            onSave={saveEdit}
                            onCancel={() => setEditingId(null)}
                            onToggle={() => toggleMutation.mutate(amenity.id)}
                            onDelete={() => {
                              if (confirm('Ausstattung wirklich löschen?')) {
                                deleteMutation.mutate(amenity.id);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-light/50">
                <th className="table-header">Name</th>
                <th className="table-header">Englisch</th>
                <th className="table-header">Kategorie</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-light">
              {filteredAmenities.map((amenity) => (
                <tr key={amenity.id} className="hover:bg-navy-light/30 transition">
                  <td className="table-cell font-medium text-pearl">
                    {editingId === amenity.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="input w-full"
                      />
                    ) : (
                      amenity.name
                    )}
                  </td>
                  <td className="table-cell text-warm-gray">
                    {editingId === amenity.id ? (
                      <input
                        type="text"
                        value={editForm.name_en}
                        onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                        className="input w-full"
                      />
                    ) : (
                      amenity.name_en || '-'
                    )}
                  </td>
                  <td className="table-cell">
                    {editingId === amenity.id ? (
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="input"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${categoryColors[amenity.category] || 'from-gray-500 to-slate-600'} text-white`}>
                        {amenity.category}
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => toggleMutation.mutate(amenity.id)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        amenity.active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {amenity.active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === amenity.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1 text-green-400 hover:bg-green-500/20 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(amenity)} className="p-1 text-warm-gray hover:text-pearl hover:bg-navy-light rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Ausstattung wirklich löschen?')) {
                                deleteMutation.mutate(amenity.id);
                              }
                            }}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-pearl mb-4">Neue Ausstattung</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-1">Name (Deutsch)</label>
                  <input
                    type="text"
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                    className="input w-full"
                    placeholder="z.B. Klimaanlage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-1">Name (Englisch)</label>
                  <input
                    type="text"
                    value={newAmenity.name_en}
                    onChange={(e) => setNewAmenity({ ...newAmenity, name_en: e.target.value })}
                    className="input w-full"
                    placeholder="z.B. Air conditioning"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-1">Kategorie</label>
                  {!showNewCategory ? (
                    <div className="space-y-2">
                      <select
                        value={newAmenity.category}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setShowNewCategory(true);
                            setNewAmenity({ ...newAmenity, category: '' });
                          } else {
                            setNewAmenity({ ...newAmenity, category: e.target.value });
                          }
                        }}
                        className="input w-full"
                      >
                        <option value="">Kategorie wählen</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__new__">➕ Neue Kategorie erstellen</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategory(true)}
                        className="flex items-center gap-2 text-sm text-sunset-orange hover:text-sunset-amber transition"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Neue Kategorie hinzufügen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            setNewAmenity({ ...newAmenity, category: e.target.value });
                          }}
                          className="input flex-1"
                          placeholder="Neue Kategorie eingeben..."
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategory(false);
                            setNewCategoryName('');
                            setNewAmenity({ ...newAmenity, category: '' });
                          }}
                          className="btn-secondary px-3"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-warm-gray">
                        Die neue Kategorie wird automatisch erstellt wenn du die Ausstattung speicherst.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }} 
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    if (newAmenity.name && newAmenity.category) {
                      createMutation.mutate({
                        name: newAmenity.name,
                        name_en: newAmenity.name_en || undefined,
                        category: newAmenity.category,
                      });
                    }
                  }}
                  disabled={!newAmenity.name || !newAmenity.category}
                  className="btn-primary"
                >
                  Erstellen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkImport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-pearl mb-4">Bulk Import</h2>
              <p className="text-sm text-warm-gray mb-4">
                Füge mehrere Ausstattungen hinzu (eine pro Zeile)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-1">Kategorie</label>
                  {!bulkNewCategory ? (
                    <div className="space-y-2">
                      <select
                        value={selectedCategory || 'Sonstiges'}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setBulkNewCategory(true);
                            setSelectedCategory(null);
                          } else {
                            setSelectedCategory(e.target.value);
                          }
                        }}
                        className="input w-full"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Sonstiges">Sonstiges</option>
                        <option value="__new__">➕ Neue Kategorie erstellen</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setBulkNewCategory(true)}
                        className="flex items-center gap-2 text-sm text-sunset-orange hover:text-sunset-amber transition"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Neue Kategorie hinzufügen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bulkCategoryName}
                          onChange={(e) => setBulkCategoryName(e.target.value)}
                          className="input flex-1"
                          placeholder="Neue Kategorie eingeben..."
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBulkNewCategory(false);
                            setBulkCategoryName('');
                            setSelectedCategory('Sonstiges');
                          }}
                          className="btn-secondary px-3"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-warm-gray">
                        Die neue Kategorie wird automatisch erstellt.
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-1">Ausstattungen</label>
                  <textarea
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    className="input w-full h-48 resize-none"
                    placeholder="WLAN
Klimaanlage
Waschmaschine
..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkNewCategory(false);
                    setBulkCategoryName('');
                  }} 
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={!bulkImportText.trim() || (bulkNewCategory && !bulkCategoryName.trim())}
                  className="btn-primary"
                >
                  {bulkImportText.split('\n').filter((l) => l.trim()).length} Importieren
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AmenityCardProps {
  amenity: Amenity;
  isEditing: boolean;
  editForm: { name: string; name_en: string; category: string };
  setEditForm: (form: { name: string; name_en: string; category: string }) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function AmenityCard({
  amenity,
  isEditing,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onCancel,
  onToggle,
  onDelete,
}: AmenityCardProps) {
  if (isEditing) {
    return (
      <div className="bg-navy-light rounded-lg p-3 space-y-2">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="input w-full text-sm"
          placeholder="Name"
        />
        <input
          type="text"
          value={editForm.name_en}
          onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
          className="input w-full text-sm"
          placeholder="Englisch"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
          <button onClick={onSave} className="p-1 text-green-400 hover:bg-green-500/20 rounded">
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={`group relative bg-navy-light rounded-lg p-3 hover:bg-navy-light/80 transition cursor-pointer ${
        !amenity.active ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-pearl text-sm truncate">{amenity.name}</p>
          {amenity.name_en && (
            <p className="text-xs text-warm-gray truncate">{amenity.name_en}</p>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute inset-0 bg-navy-medium/95 rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button onClick={onEdit} className="p-2 text-warm-gray hover:text-pearl hover:bg-navy-light rounded-lg">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onToggle} className={`p-2 rounded-lg ${amenity.active ? 'text-amber-400 hover:bg-amber-500/20' : 'text-green-400 hover:bg-green-500/20'}`}>
          {amenity.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
        <button onClick={onDelete} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

