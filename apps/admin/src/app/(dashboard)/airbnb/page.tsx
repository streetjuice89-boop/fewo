'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Download, RefreshCw, Trash2, CheckCircle, XCircle, Clock, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge, Button, Modal, Input, Select, Spinner } from '@voyagenest/ui';
import { airbnbApi, countriesApi } from '@/lib/api';

interface AirbnbImport {
  id: string;
  airbnbUrl: string;
  airbnbId: string;
  syncStatus: string;
  lastSynced?: string;
  createdAt: string;
  property?: {
    id: string;
    titleDe: string;
    images: string[];
  };
}

interface Country {
  id: string;
  nameDe: string;
  flagEmoji: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  synced: <CheckCircle className="h-5 w-5 text-green-400" />,
  pending: <Clock className="h-5 w-5 text-yellow-400" />,
  failed: <XCircle className="h-5 w-5 text-red-400" />,
};

const statusLabels: Record<string, string> = {
  synced: 'Synchronisiert',
  pending: 'Ausstehend',
  failed: 'Fehlgeschlagen',
};

export default function AirbnbPage() {
  const queryClient = useQueryClient();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const { data: imports, isLoading } = useQuery({
    queryKey: ['airbnb-imports'],
    queryFn: () => airbnbApi.getAll() as Promise<{ data: AirbnbImport[] }>,
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countriesApi.getAll() as Promise<Country[]>,
  });

  const { data: stats } = useQuery({
    queryKey: ['airbnb-stats'],
    queryFn: () => airbnbApi.getStatistics() as Promise<{ total: number; synced: number; pending: number; failed: number }>,
  });

  const importMutation = useMutation({
    mutationFn: () => airbnbApi.import(importUrl, selectedCountry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb-imports'] });
      queryClient.invalidateQueries({ queryKey: ['airbnb-stats'] });
      toast.success('Import erfolgreich');
      setShowImportModal(false);
      setImportUrl('');
      setSelectedCountry('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => airbnbApi.sync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb-imports'] });
      toast.success('Sync gestartet');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => airbnbApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airbnb-imports'] });
      queryClient.invalidateQueries({ queryKey: ['airbnb-stats'] });
      toast.success('Import gelöscht');
    },
  });

  const importList = imports?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-pearl">Airbnb Import</h1>
          <p className="text-warm-gray">Importieren Sie Airbnb-Inserate automatisch</p>
        </div>
        <Button leftIcon={<Download className="h-5 w-5" />} onClick={() => setShowImportModal(true)}>
          Neuer Import
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Gesamt', value: stats?.total || 0, color: 'text-pearl' },
          { label: 'Synchronisiert', value: stats?.synced || 0, color: 'text-green-400' },
          { label: 'Ausstehend', value: stats?.pending || 0, color: 'text-yellow-400' },
          { label: 'Fehlgeschlagen', value: stats?.failed || 0, color: 'text-red-400' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-warm-gray">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Import List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-warm-gray border-b border-navy-light bg-navy-light">
                  <th className="p-4 font-medium">Unterkunft</th>
                  <th className="p-4 font-medium">Airbnb ID</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Letzte Sync</th>
                  <th className="p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {importList.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-navy-light/50">
                    <td className="p-4">
                      {item.property ? (
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={item.property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100'}
                              alt={item.property.titleDe}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-pearl">{item.property.titleDe}</span>
                        </div>
                      ) : (
                        <span className="text-warm-gray">Noch nicht erstellt</span>
                      )}
                    </td>
                    <td className="p-4">
                      <a
                        href={item.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ocean hover:text-ocean-light flex items-center gap-1"
                      >
                        {item.airbnbId}
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {statusIcons[item.syncStatus]}
                        <span className="text-pearl">{statusLabels[item.syncStatus]}</span>
                      </div>
                    </td>
                    <td className="p-4 text-warm-gray">
                      {item.lastSynced
                        ? new Date(item.lastSynced).toLocaleString('de-DE')
                        : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => syncMutation.mutate(item.id)}
                          disabled={syncMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Airbnb Inserat importieren">
        <div className="space-y-4">
          <Input
            label="Airbnb URL"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://www.airbnb.com/rooms/12345678"
          />
          <div>
            <label className="block text-sm text-warm-gray mb-2">Land zuweisen</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-navy-light border-none rounded-xl px-4 py-3 text-pearl"
            >
              <option value="">Land auswählen...</option>
              {countries?.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.flagEmoji} {country.nameDe}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => importMutation.mutate()}
              isLoading={importMutation.isPending}
              disabled={!importUrl || !selectedCountry}
            >
              Importieren
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

