'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge, Button, Modal, Spinner } from '@voyagenest/ui';
import { propertiesApi } from '@/lib/api';

interface Property {
  id: string;
  titleDe: string;
  titleEn: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  isActive: boolean;
  images: string[];
  country: { nameDe: string; flagEmoji: string };
  categories: Array<{ nameDe: string }>;
}

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => propertiesApi.getAll({ isActive: 'all' }) as Promise<{ data: Property[] }>,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      propertiesApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Status aktualisiert');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Unterkunft gelöscht');
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const properties = data?.data || [];
  const filteredProperties = properties.filter((p) =>
    p.titleDe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-pearl">Unterkünfte</h1>
          <p className="text-warm-gray">Verwalten Sie alle Ferienwohnungen</p>
        </div>
        <Link href="/properties/new">
          <Button leftIcon={<Plus className="h-5 w-5" />}>Neue Unterkunft</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen..."
          className="w-full bg-navy-medium border border-navy-light rounded-xl pl-12 pr-4 py-3 text-pearl"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={property.images[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400'}
                  alt={property.titleDe}
                  fill
                  className="object-cover"
                />
                {!property.isActive && (
                  <div className="absolute inset-0 bg-navy-deep/70 flex items-center justify-center">
                    <Badge variant="danger">Inaktiv</Badge>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant="warning" className="bg-sunset text-navy-deep">
                    €{property.pricePerNight}/Nacht
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-pearl">{property.titleDe}</h3>
                    <p className="text-sm text-warm-gray">
                      {property.country.flagEmoji} {property.country.nameDe}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-warm-gray mb-4">
                  <span>{property.maxGuests} Gäste</span>
                  <span>{property.bedrooms} Zimmer</span>
                  <span>{property.bathrooms} Bad</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/properties/${property.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: property.id,
                        isActive: !property.isActive,
                      })
                    }
                  >
                    {property.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-warm-gray" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(property.id)}
                    className="text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Unterkunft löschen"
      >
        <p className="text-warm-gray mb-6">
          Sind Sie sicher, dass Sie diese Unterkunft löschen möchten? Diese Aktion kann nicht
          rückgängig gemacht werden.
        </p>
        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            isLoading={deleteMutation.isPending}
          >
            Löschen
          </Button>
        </div>
      </Modal>
    </div>
  );
}

