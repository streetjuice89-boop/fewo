<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AirbnbGrabberService
{
    /**
     * Extract Airbnb ID from URL
     */
    public function extractAirbnbId(string $url): ?string
    {
        // Match patterns like /rooms/12345678 or /h/room-name
        if (preg_match('/\/rooms\/(\d+)/', $url, $matches)) {
            return $matches[1];
        }
        
        // Match plus listings
        if (preg_match('/\/plus\/(\d+)/', $url, $matches)) {
            return 'plus_' . $matches[1];
        }

        return null;
    }

    /**
     * Grab listing data from Airbnb
     * 
     * Note: This is a placeholder implementation.
     * In production, you would use a proper scraping service or API.
     */
    public function grabListing(string $airbnbId): array
    {
        // In production, this would make actual API calls or use a scraping service
        // For now, we return mock data to demonstrate the functionality
        
        Log::info("Grabbing Airbnb listing: {$airbnbId}");

        // Simulate API delay
        usleep(500000); // 0.5 seconds

        // Return mock data structure
        // In production, replace with actual scraping logic
        return [
            'title' => "Gemütliche Ferienwohnung #{$airbnbId}",
            'description' => "Eine wunderschöne Unterkunft mit allem Komfort. Ideal für Ihren nächsten Urlaub. Die Wohnung verfügt über eine voll ausgestattete Küche, WLAN und einen schönen Ausblick.",
            'price' => rand(50, 300),
            'currency' => 'EUR',
            'location' => 'Berlin, Deutschland',
            'images' => [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            ],
            'amenities' => ['WLAN', 'Küche', 'Waschmaschine', 'Klimaanlage', 'Heizung', 'TV'],
            'bedrooms' => rand(1, 4),
            'bathrooms' => rand(1, 2),
            'maxGuests' => rand(2, 8),
            'rating' => round(rand(40, 50) / 10, 1),
            'reviewCount' => rand(10, 500),
        ];
    }

    /**
     * Sync all listings that need updating
     */
    public function syncAll(): array
    {
        $results = [
            'synced' => 0,
            'errors' => 0,
        ];

        $listings = \App\Models\AirbnbListing::where(function ($q) {
            $q->where('sync_status', 'pending')
              ->orWhere('last_synced_at', '<', now()->subDay());
        })->get();

        foreach ($listings as $listing) {
            try {
                $data = $this->grabListing($listing->airbnb_id);
                $listing->update([
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'price' => $data['price'],
                    'location' => $data['location'],
                    'images' => $data['images'],
                    'amenities' => $data['amenities'],
                    'bedrooms' => $data['bedrooms'],
                    'bathrooms' => $data['bathrooms'],
                    'max_guests' => $data['maxGuests'],
                    'rating' => $data['rating'],
                    'review_count' => $data['reviewCount'],
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                ]);
                $results['synced']++;
            } catch (\Exception $e) {
                Log::error("Failed to sync listing {$listing->id}: " . $e->getMessage());
                $listing->update(['sync_status' => 'error']);
                $results['errors']++;
            }
        }

        return $results;
    }
}

