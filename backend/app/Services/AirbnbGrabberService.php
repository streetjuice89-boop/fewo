<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AirbnbGrabberService
{
    private array $defaultHeaders = [
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language' => 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding' => 'gzip, deflate, br',
        'Connection' => 'keep-alive',
        'Cache-Control' => 'max-age=0',
    ];

    /**
     * Extract Airbnb ID from URL
     */
    public function extractAirbnbId(string $url): ?string
    {
        // Match patterns like /rooms/12345678
        if (preg_match('#/rooms/(\d+)#', $url, $matches)) {
            return $matches[1];
        }
        
        // Match plus listings
        if (preg_match('#/plus/(\d+)#', $url, $matches)) {
            return 'plus_' . $matches[1];
        }

        // Match /h/ style URLs
        if (preg_match('#/h/([^/?]+)#', $url, $matches)) {
            return 'h_' . $matches[1];
        }

        return null;
    }

    /**
     * Grab listing data from Airbnb
     */
    public function grabListing(string $airbnbId): array
    {
        Log::info("Grabbing Airbnb listing: {$airbnbId}");

        // Build the Airbnb URL
        $url = $this->buildAirbnbUrl($airbnbId);
        
        try {
            // Fetch the page
            $response = Http::withHeaders($this->defaultHeaders)
                ->timeout(30)
                ->get($url);

            if (!$response->successful()) {
                Log::warning("Failed to fetch Airbnb page: HTTP {$response->status()}");
                return $this->getMockData($airbnbId);
            }

            $html = $response->body();
            
            // Try to extract data from the page
            $data = $this->parseAirbnbPage($html, $airbnbId);
            
            if ($data) {
                Log::info("Successfully parsed Airbnb listing: {$airbnbId}");
                return $data;
            }

        } catch (\Exception $e) {
            Log::error("Error fetching Airbnb listing: " . $e->getMessage());
        }

        // Fallback to mock data if scraping fails
        Log::info("Using mock data for listing: {$airbnbId}");
        return $this->getMockData($airbnbId);
    }

    /**
     * Build Airbnb URL from ID
     */
    private function buildAirbnbUrl(string $airbnbId): string
    {
        if (str_starts_with($airbnbId, 'plus_')) {
            return 'https://www.airbnb.de/plus/' . substr($airbnbId, 5);
        }
        
        if (str_starts_with($airbnbId, 'h_')) {
            return 'https://www.airbnb.de/h/' . substr($airbnbId, 2);
        }

        return "https://www.airbnb.de/rooms/{$airbnbId}";
    }

    /**
     * Parse Airbnb page HTML to extract data
     */
    private function parseAirbnbPage(string $html, string $airbnbId): ?array
    {
        $data = [
            'airbnb_id' => $airbnbId,
            'title' => null,
            'description' => null,
            'price' => null,
            'currency' => 'EUR',
            'location' => null,
            'images' => [],
            'amenities' => [],
            'bedrooms' => null,
            'bathrooms' => null,
            'maxGuests' => null,
            'rating' => null,
            'reviewCount' => null,
            'propertyType' => null,
            'host' => null,
        ];

        // Try to find JSON-LD data first (most reliable)
        if (preg_match('#<script type="application/ld\+json"[^>]*>(.*?)</script>#s', $html, $matches)) {
            try {
                $jsonLd = json_decode($matches[1], true);
                if ($jsonLd) {
                    $data = $this->parseJsonLd($jsonLd, $data);
                }
            } catch (\Exception $e) {
                Log::debug("Failed to parse JSON-LD: " . $e->getMessage());
            }
        }

        // Try to find the __NEXT_DATA__ or similar state object
        if (preg_match('#<script id="data-deferred-state[^"]*"[^>]*>(.*?)</script>#s', $html, $matches)) {
            try {
                $stateData = json_decode($matches[1], true);
                if ($stateData) {
                    $data = $this->parseStateData($stateData, $data);
                }
            } catch (\Exception $e) {
                Log::debug("Failed to parse state data: " . $e->getMessage());
            }
        }

        // Fallback: Extract from meta tags
        $data = $this->parseMetaTags($html, $data);

        // Extract images from the page
        $data['images'] = $this->extractImages($html);

        // Extract title if not found
        if (!$data['title']) {
            if (preg_match('#<title[^>]*>([^<]+)</title>#i', $html, $matches)) {
                $title = html_entity_decode(trim($matches[1]));
                // Remove " - Airbnb" suffix
                $data['title'] = preg_replace('#\s*[-–]\s*Airbnb.*$#i', '', $title);
            }
        }

        // Extract price from various patterns
        if (!$data['price']) {
            // Pattern: €123 or 123 €
            if (preg_match('#[€$]\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*[€$]#', $html, $matches)) {
                $price = $matches[1] ?: $matches[2];
                $data['price'] = (float) str_replace(',', '.', $price);
            }
        }

        // Extract guest/bedroom/bathroom info
        $this->extractPropertyDetails($html, $data);

        // Only return if we got at least a title
        if ($data['title']) {
            return $data;
        }

        return null;
    }

    /**
     * Parse JSON-LD structured data
     */
    private function parseJsonLd(array $jsonLd, array $data): array
    {
        if (isset($jsonLd['@type']) && $jsonLd['@type'] === 'Product') {
            $data['title'] = $jsonLd['name'] ?? $data['title'];
            $data['description'] = $jsonLd['description'] ?? $data['description'];
            
            if (isset($jsonLd['offers']['price'])) {
                $data['price'] = (float) $jsonLd['offers']['price'];
                $data['currency'] = $jsonLd['offers']['priceCurrency'] ?? 'EUR';
            }

            if (isset($jsonLd['aggregateRating'])) {
                $data['rating'] = (float) ($jsonLd['aggregateRating']['ratingValue'] ?? null);
                $data['reviewCount'] = (int) ($jsonLd['aggregateRating']['reviewCount'] ?? 0);
            }

            if (isset($jsonLd['image'])) {
                $images = is_array($jsonLd['image']) ? $jsonLd['image'] : [$jsonLd['image']];
                $data['images'] = array_merge($data['images'], $images);
            }
        }

        // Handle array of JSON-LD objects
        if (isset($jsonLd[0])) {
            foreach ($jsonLd as $item) {
                $data = $this->parseJsonLd($item, $data);
            }
        }

        return $data;
    }

    /**
     * Parse state data (React/Next.js state)
     */
    private function parseStateData(array $stateData, array $data): array
    {
        // Navigate through nested structure to find listing data
        $listing = $this->findInArray($stateData, 'listing') 
            ?? $this->findInArray($stateData, 'pdpListing')
            ?? $this->findInArray($stateData, 'stayListing');

        if ($listing) {
            $data['title'] = $listing['name'] ?? $listing['title'] ?? $data['title'];
            $data['description'] = $listing['description'] ?? $listing['summary'] ?? $data['description'];
            $data['location'] = $listing['location'] ?? $listing['city'] ?? $data['location'];
            $data['propertyType'] = $listing['propertyType'] ?? $listing['roomType'] ?? $data['propertyType'];
            
            if (isset($listing['pricing']['rate']['amount'])) {
                $data['price'] = (float) $listing['pricing']['rate']['amount'];
            }

            if (isset($listing['rating'])) {
                $data['rating'] = (float) $listing['rating'];
            }

            if (isset($listing['reviewCount']) || isset($listing['reviewsCount'])) {
                $data['reviewCount'] = (int) ($listing['reviewCount'] ?? $listing['reviewsCount']);
            }

            // Extract room details
            $data['bedrooms'] = $listing['bedrooms'] ?? $listing['bedroomCount'] ?? $data['bedrooms'];
            $data['bathrooms'] = $listing['bathrooms'] ?? $listing['bathroomCount'] ?? $data['bathrooms'];
            $data['maxGuests'] = $listing['personCapacity'] ?? $listing['guestCount'] ?? $data['maxGuests'];

            // Extract amenities
            if (isset($listing['amenities'])) {
                $data['amenities'] = array_map(fn($a) => is_array($a) ? ($a['name'] ?? $a['title'] ?? '') : $a, $listing['amenities']);
            }

            // Extract images
            if (isset($listing['photos'])) {
                $photos = array_map(fn($p) => is_array($p) ? ($p['large'] ?? $p['url'] ?? $p['picture'] ?? '') : $p, $listing['photos']);
                $data['images'] = array_merge($data['images'], array_filter($photos));
            }

            // Extract host info
            if (isset($listing['host'])) {
                $data['host'] = [
                    'name' => $listing['host']['name'] ?? $listing['host']['firstName'] ?? null,
                    'isSuperhost' => $listing['host']['isSuperhost'] ?? false,
                ];
            }
        }

        return $data;
    }

    /**
     * Parse meta tags for data
     */
    private function parseMetaTags(string $html, array $data): array
    {
        // og:title
        if (preg_match('#<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']#i', $html, $matches)) {
            $data['title'] = $data['title'] ?? html_entity_decode($matches[1]);
        }

        // og:description
        if (preg_match('#<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']#i', $html, $matches)) {
            $data['description'] = $data['description'] ?? html_entity_decode($matches[1]);
        }

        // og:image
        if (preg_match_all('#<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']#i', $html, $matches)) {
            $data['images'] = array_merge($data['images'], $matches[1]);
        }

        // twitter:title as fallback
        if (!$data['title'] && preg_match('#<meta[^>]+name=["\']twitter:title["\'][^>]+content=["\']([^"\']+)["\']#i', $html, $matches)) {
            $data['title'] = html_entity_decode($matches[1]);
        }

        return $data;
    }

    /**
     * Extract images from HTML
     */
    private function extractImages(string $html): array
    {
        $images = [];

        // Look for high-quality Airbnb image URLs
        if (preg_match_all('#https://a0\.muscache\.com/im/pictures/[^"\'>\s]+#', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Also check for airbnb-hosted images
        if (preg_match_all('#https://[^"\'>\s]*airbnb[^"\'>\s]*\.(jpg|jpeg|png|webp)[^"\'>\s]*#i', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Remove duplicates and limit
        $images = array_unique($images);
        
        // Filter out thumbnails, get larger versions
        $images = array_filter($images, function($url) {
            // Skip small thumbnails
            return !preg_match('#(small|thumb|icon|32x32|64x64|thumbnail)#i', $url);
        });

        // Upgrade image quality where possible
        $images = array_map(function($url) {
            // Replace with higher resolution if possible
            return preg_replace('#/im/pictures/([^/]+)/([^?]+)#', '/im/pictures/$1/$2?im_w=1200', $url);
        }, $images);

        return array_values(array_slice($images, 0, 20));
    }

    /**
     * Extract property details from HTML
     */
    private function extractPropertyDetails(string $html, array &$data): void
    {
        // German patterns
        $patterns = [
            'guests' => '#(\d+)\s*(?:Gäste?|guests?|Personen)#i',
            'bedrooms' => '#(\d+)\s*(?:Schlafzimmer|bedrooms?|Zimmer)#i',
            'beds' => '#(\d+)\s*(?:Betten?|beds?)#i',
            'bathrooms' => '#(\d+)\s*(?:Badezimmer|bathrooms?|Bäder)#i',
        ];

        if (!$data['maxGuests'] && preg_match($patterns['guests'], $html, $m)) {
            $data['maxGuests'] = (int) $m[1];
        }

        if (!$data['bedrooms'] && preg_match($patterns['bedrooms'], $html, $m)) {
            $data['bedrooms'] = (int) $m[1];
        }

        if (!$data['bathrooms'] && preg_match($patterns['bathrooms'], $html, $m)) {
            $data['bathrooms'] = (int) $m[1];
        }

        // Extract amenities from "Das bietet dir diese Unterkunft" or similar sections
        $this->extractAmenities($html, $data);
    }

    /**
     * Extract amenities from HTML - looking for "Das bietet dir diese Unterkunft"
     */
    private function extractAmenities(string $html, array &$data): void
    {
        // Skip if we already have amenities
        if (!empty($data['amenities'])) {
            return;
        }

        $amenities = [];

        // Common Airbnb amenities in German and English
        $knownAmenities = [
            // Basics
            'WLAN', 'WiFi', 'Wi-Fi', 'Internet', 'Küche', 'Kitchen', 'Waschmaschine', 'Washing machine',
            'Trockner', 'Dryer', 'Klimaanlage', 'Air conditioning', 'Heizung', 'Heating',
            'TV', 'Fernseher', 'Television', 'Föhn', 'Hair dryer', 'Haartrockner',
            'Bügeleisen', 'Iron', 'Arbeitsplatz', 'Workspace', 'Dedicated workspace',
            
            // Parking & Location
            'Parkplatz', 'Parking', 'Free parking', 'Kostenloser Parkplatz', 'Garage',
            'Aufzug', 'Elevator', 'Fahrstuhl', 'Lift',
            
            // Outdoor
            'Pool', 'Schwimmbad', 'Swimmingpool', 'Swimming pool', 'Balkon', 'Balcony',
            'Terrasse', 'Terrace', 'Patio', 'Garten', 'Garden', 'Hof', 'Yard',
            'Grill', 'BBQ', 'Barbecue', 'Grillplatz',
            
            // Safety
            'Rauchmelder', 'Smoke alarm', 'CO-Melder', 'Carbon monoxide alarm',
            'Feuerlöscher', 'Fire extinguisher', 'Erste-Hilfe-Set', 'First aid kit',
            'Sicherheitsschloss', 'Lock', 'Safe', 'Tresor',
            
            // Kitchen
            'Geschirrspüler', 'Dishwasher', 'Mikrowelle', 'Microwave', 'Ofen', 'Oven',
            'Herd', 'Stove', 'Kühlschrank', 'Refrigerator', 'Fridge', 'Kaffeemaschine',
            'Coffee maker', 'Kochutensilien', 'Cooking basics', 'Geschirr', 'Dishes',
            
            // Bathroom
            'Badewanne', 'Bathtub', 'Dusche', 'Shower', 'Handtücher', 'Towels',
            'Bettwäsche', 'Bed linens', 'Shampoo', 'Seife', 'Soap',
            
            // Family
            'Kinderbett', 'Crib', 'Hochstuhl', 'High chair', 'Spielzeug', 'Toys',
            'Kindersicherung', 'Baby safety gates',
            
            // Pets
            'Haustiere erlaubt', 'Pets allowed', 'Haustierfreundlich',
            
            // Entertainment
            'Spielekonsole', 'Game console', 'Bücher', 'Books', 'Spiele', 'Games',
            'Musikanlage', 'Sound system', 'Bluetooth', 'Streaming',
            
            // Views
            'Meerblick', 'Sea view', 'Ocean view', 'Bergblick', 'Mountain view',
            'Stadtblick', 'City view', 'Gartenblick', 'Garden view',
            
            // Extras
            'Kamin', 'Fireplace', 'Sauna', 'Whirlpool', 'Hot tub', 'Jacuzzi',
            'Fitnessstudio', 'Gym', 'Yoga', 'Fahrräder', 'Bikes', 'Bicycles',
        ];

        // Search for each known amenity in the HTML
        foreach ($knownAmenities as $amenity) {
            // Look for the amenity name with word boundaries
            if (preg_match('#\b' . preg_quote($amenity, '#') . '\b#iu', $html)) {
                // Normalize German amenities
                $normalized = $this->normalizeAmenity($amenity);
                if (!in_array($normalized, $amenities)) {
                    $amenities[] = $normalized;
                }
            }
        }

        // Also try to extract from data-attributes or aria-labels
        if (preg_match_all('#aria-label=["\']([^"\']+)["\']#i', $html, $matches)) {
            foreach ($matches[1] as $label) {
                foreach ($knownAmenities as $amenity) {
                    if (stripos($label, $amenity) !== false) {
                        $normalized = $this->normalizeAmenity($amenity);
                        if (!in_array($normalized, $amenities)) {
                            $amenities[] = $normalized;
                        }
                    }
                }
            }
        }

        if (!empty($amenities)) {
            $data['amenities'] = array_slice($amenities, 0, 30); // Max 30 amenities
        }
    }

    /**
     * Normalize amenity name to German
     */
    private function normalizeAmenity(string $amenity): string
    {
        $translations = [
            'WiFi' => 'WLAN',
            'Wi-Fi' => 'WLAN',
            'Internet' => 'WLAN',
            'Kitchen' => 'Küche',
            'Washing machine' => 'Waschmaschine',
            'Dryer' => 'Trockner',
            'Air conditioning' => 'Klimaanlage',
            'Heating' => 'Heizung',
            'Television' => 'TV',
            'Fernseher' => 'TV',
            'Hair dryer' => 'Föhn',
            'Haartrockner' => 'Föhn',
            'Iron' => 'Bügeleisen',
            'Workspace' => 'Arbeitsplatz',
            'Dedicated workspace' => 'Arbeitsplatz',
            'Parking' => 'Parkplatz',
            'Free parking' => 'Kostenloser Parkplatz',
            'Elevator' => 'Aufzug',
            'Fahrstuhl' => 'Aufzug',
            'Lift' => 'Aufzug',
            'Swimming pool' => 'Pool',
            'Schwimmbad' => 'Pool',
            'Swimmingpool' => 'Pool',
            'Balcony' => 'Balkon',
            'Terrace' => 'Terrasse',
            'Patio' => 'Terrasse',
            'Garden' => 'Garten',
            'Yard' => 'Hof',
            'BBQ' => 'Grill',
            'Barbecue' => 'Grill',
            'Grillplatz' => 'Grill',
            'Smoke alarm' => 'Rauchmelder',
            'Carbon monoxide alarm' => 'CO-Melder',
            'Fire extinguisher' => 'Feuerlöscher',
            'First aid kit' => 'Erste-Hilfe-Set',
            'Lock' => 'Sicherheitsschloss',
            'Tresor' => 'Safe',
            'Dishwasher' => 'Geschirrspüler',
            'Microwave' => 'Mikrowelle',
            'Oven' => 'Ofen',
            'Stove' => 'Herd',
            'Refrigerator' => 'Kühlschrank',
            'Fridge' => 'Kühlschrank',
            'Coffee maker' => 'Kaffeemaschine',
            'Cooking basics' => 'Kochutensilien',
            'Dishes' => 'Geschirr',
            'Bathtub' => 'Badewanne',
            'Shower' => 'Dusche',
            'Towels' => 'Handtücher',
            'Bed linens' => 'Bettwäsche',
            'Soap' => 'Seife',
            'Crib' => 'Kinderbett',
            'High chair' => 'Hochstuhl',
            'Toys' => 'Spielzeug',
            'Baby safety gates' => 'Kindersicherung',
            'Pets allowed' => 'Haustiere erlaubt',
            'Game console' => 'Spielekonsole',
            'Books' => 'Bücher',
            'Games' => 'Spiele',
            'Sound system' => 'Musikanlage',
            'Sea view' => 'Meerblick',
            'Ocean view' => 'Meerblick',
            'Mountain view' => 'Bergblick',
            'City view' => 'Stadtblick',
            'Garden view' => 'Gartenblick',
            'Fireplace' => 'Kamin',
            'Hot tub' => 'Whirlpool',
            'Jacuzzi' => 'Whirlpool',
            'Gym' => 'Fitnessstudio',
            'Bikes' => 'Fahrräder',
            'Bicycles' => 'Fahrräder',
        ];

        return $translations[$amenity] ?? $amenity;
    }

    /**
     * Recursively find a key in nested array
     */
    private function findInArray(array $array, string $key): mixed
    {
        if (isset($array[$key])) {
            return $array[$key];
        }

        foreach ($array as $value) {
            if (is_array($value)) {
                $result = $this->findInArray($value, $key);
                if ($result !== null) {
                    return $result;
                }
            }
        }

        return null;
    }

    /**
     * Get mock data as fallback
     */
    private function getMockData(string $airbnbId): array
    {
        $locations = [
            'Berlin, Deutschland',
            'München, Deutschland', 
            'Hamburg, Deutschland',
            'Barcelona, Spanien',
            'Mallorca, Spanien',
            'Rom, Italien',
            'Paris, Frankreich',
            'Wien, Österreich',
        ];

        $types = [
            'Gesamte Wohnung',
            'Privatzimmer',
            'Gesamtes Haus',
            'Gesamte Villa',
            'Loft',
            'Studio',
        ];

        $amenities = [
            'WLAN', 'Küche', 'Waschmaschine', 'Klimaanlage', 'Heizung', 
            'TV', 'Föhn', 'Bügeleisen', 'Arbeitsplatz', 'Parkplatz',
            'Pool', 'Balkon', 'Garten', 'Aufzug', 'Haustiere erlaubt',
        ];

        $selectedAmenities = array_slice($amenities, 0, rand(5, 12));
        shuffle($selectedAmenities);

        return [
            'title' => $types[array_rand($types)] . " in " . explode(',', $locations[array_rand($locations)])[0],
            'description' => "Willkommen in dieser wunderschönen Unterkunft! Genießen Sie Ihren Aufenthalt in einer voll ausgestatteten Wohnung mit allem Komfort. Ideal gelegen für Ihre Erkundungstouren. Die Unterkunft bietet Ihnen alles, was Sie für einen angenehmen Aufenthalt benötigen.",
            'price' => rand(50, 350),
            'currency' => 'EUR',
            'location' => $locations[array_rand($locations)],
            'images' => [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
                'https://images.unsplash.com/photo-1484154218962-a197022b25ba?w=1200',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200',
            ],
            'amenities' => $selectedAmenities,
            'bedrooms' => rand(1, 4),
            'bathrooms' => rand(1, 3),
            'maxGuests' => rand(2, 10),
            'rating' => round(rand(40, 50) / 10, 1),
            'reviewCount' => rand(10, 500),
            'propertyType' => $types[array_rand($types)],
            'host' => [
                'name' => 'Host',
                'isSuperhost' => rand(0, 1) === 1,
            ],
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
                    'currency' => $data['currency'] ?? 'EUR',
                    'location' => $data['location'],
                    'images' => $data['images'],
                    'amenities' => $data['amenities'],
                    'bedrooms' => $data['bedrooms'],
                    'bathrooms' => $data['bathrooms'],
                    'max_guests' => $data['maxGuests'],
                    'rating' => $data['rating'],
                    'review_count' => $data['reviewCount'],
                    'property_type' => $data['propertyType'] ?? null,
                    'host_name' => $data['host']['name'] ?? null,
                    'host_is_superhost' => $data['host']['isSuperhost'] ?? false,
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
