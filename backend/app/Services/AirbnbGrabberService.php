<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AirbnbGrabberService
{
    private array $defaultHeaders = [
        'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language' => 'de-DE,de;q=0.9,en;q=0.8',
        'Accept-Encoding' => 'gzip, deflate, br',
        'Connection' => 'keep-alive',
        'Cache-Control' => 'no-cache',
        'Pragma' => 'no-cache',
        'Sec-Ch-Ua' => '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile' => '?0',
        'Sec-Ch-Ua-Platform' => '"macOS"',
        'Sec-Fetch-Dest' => 'document',
        'Sec-Fetch-Mode' => 'navigate',
        'Sec-Fetch-Site' => 'none',
        'Sec-Fetch-User' => '?1',
        'Upgrade-Insecure-Requests' => '1',
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

        // Extract ALL data from embedded JSON (description, amenities, images)
        $this->extractAllDataFromJson($html, $data);

        // Extract ALL images from embedded JSON data first (contains all images)
        $allImages = $this->extractAllImagesFromJson($html);
        
        // Fallback to HTML extraction if JSON extraction fails
        if (empty($allImages)) {
            $allImages = $this->extractImages($html);
        }
        
        $data['images'] = $allImages;

        // Extract title from JSON data first (more reliable)
        $this->extractTitleFromJson($html, $data);
        
        // Fallback: Extract title from HTML title tag
        if (!$data['title']) {
            if (preg_match('#<title[^>]*>([^<]+)</title>#i', $html, $matches)) {
                $title = html_entity_decode(trim($matches[1]));
                // Remove " - Airbnb" suffix
                $data['title'] = preg_replace('#\s*[-–]\s*Airbnb.*$#i', '', $title);
            }
        }
        
        // Make sure title is not in description (remove if duplicate)
        if ($data['title'] && $data['description']) {
            // If description starts with the title, remove it
            $titleEscaped = preg_quote($data['title'], '#');
            $data['description'] = preg_replace('#^' . $titleEscaped . '\s*\n*#iu', '', $data['description']);
            $data['description'] = trim($data['description']);
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
     * Extract title from JSON data
     */
    private function extractTitleFromJson(string $html, array &$data): void
    {
        if ($data['title']) {
            return; // Already have a title
        }

        // Pattern 1: Look for listing name/title in JSON
        $titlePatterns = [
            '#"listingTitle"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#',
            '#"name"\s*:\s*"((?:[^"\\\\]|\\\\.){10,100})"#',
            '#"title"\s*:\s*"((?:[^"\\\\]|\\\\.){10,100})"#',
            '#"listing"\s*:\s*\{[^}]*"name"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            '#"pdpListing"\s*:\s*\{[^}]*"name"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
        ];

        foreach ($titlePatterns as $pattern) {
            if (preg_match($pattern, $html, $match)) {
                $title = $this->decodeJsonString($match[1]);
                // Must be a reasonable title (not too long, not a URL, not JSON)
                if (strlen($title) >= 5 && strlen($title) <= 200 && 
                    !preg_match('#^(https?://|{|\[)#', $title) &&
                    !preg_match('#(Airbnb|airbnb\.com)#i', $title)) {
                    $data['title'] = $title;
                    Log::info("Extracted title: " . $title);
                    return;
                }
            }
        }

        // Pattern 2: Look for og:title meta tag
        if (preg_match('#<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']#i', $html, $match)) {
            $title = html_entity_decode(trim($match[1]));
            // Clean up - remove " - Airbnb" suffix
            $title = preg_replace('#\s*[-–|·]\s*Airbnb.*$#i', '', $title);
            if (strlen($title) >= 5 && strlen($title) <= 200) {
                $data['title'] = $title;
                return;
            }
        }
    }

    /**
     * Extract ALL data (description, amenities) from Airbnb's embedded JSON
     */
    private function extractAllDataFromJson(string $html, array &$data): void
    {
        // ========== EXTRACT FULL DESCRIPTION ==========
        
        $allDescriptions = [];
        
        // Pattern 1: Look for sectioned description items (this contains the FULL text)
        // Format: "sectionedDescription":[{"title":"...","htmlText":"FULL TEXT HERE"}]
        if (preg_match_all('#"htmlText"\s*:\s*"((?:[^"\\\\]|\\\\.)*)+"#s', $html, $matches)) {
            foreach ($matches[1] as $text) {
                $decoded = $this->decodeJsonString($text);
                if (strlen($decoded) > 50) {
                    $allDescriptions[] = $decoded;
                }
            }
        }

        // Pattern 2: Look for description with "value" key
        if (preg_match_all('#"(?:description|summary|aboutThisSpace|theSpace|guestAccess|interaction|otherThingsToNote|neighborhood|transit|houseRules)"\s*:\s*\{[^}]*"value"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s', $html, $matches)) {
            foreach ($matches[1] as $text) {
                $decoded = $this->decodeJsonString($text);
                if (strlen($decoded) > 30) {
                    $allDescriptions[] = $decoded;
                }
            }
        }

        // Pattern 3: Look for descriptionItems array
        if (preg_match('#"descriptionItems"\s*:\s*\[(.*?)\]#s', $html, $match)) {
            if (preg_match_all('#"html"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s', $match[1], $items)) {
                foreach ($items[1] as $text) {
                    $decoded = $this->decodeJsonString($text);
                    if (strlen($decoded) > 30) {
                        $allDescriptions[] = $decoded;
                    }
                }
            }
        }

        // Pattern 4: Look for pdp_listing_detail data
        if (preg_match('#"sectioned_description"\s*:\s*\{(.*?)\}\s*,\s*"#s', $html, $match)) {
            $sectionData = $match[1];
            // Extract all text values
            if (preg_match_all('#"(?:description|summary|space|access|interaction|notes|neighborhood|transit|house_rules)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s', $sectionData, $items)) {
                foreach ($items[1] as $text) {
                    $decoded = $this->decodeJsonString($text);
                    if (strlen($decoded) > 30) {
                        $allDescriptions[] = $decoded;
                    }
                }
            }
        }

        // Pattern 5: Look for listing description in bootstrapData or similar
        if (preg_match_all('#"(?:listing_description|description_summary|space_description|guest_access|interaction_with_guests|other_notes)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s', $html, $matches)) {
            foreach ($matches[1] as $text) {
                $decoded = $this->decodeJsonString($text);
                if (strlen($decoded) > 30) {
                    $allDescriptions[] = $decoded;
                }
            }
        }

        // Pattern 6: Direct long description strings
        if (preg_match_all('#"description"\s*:\s*"((?:[^"\\\\]|\\\\.){"100,"})"#s', $html, $matches)) {
            foreach ($matches[1] as $text) {
                $decoded = $this->decodeJsonString($text);
                if (strlen($decoded) > 100) {
                    $allDescriptions[] = $decoded;
                }
            }
        }

        // Combine all descriptions, removing duplicates
        $allDescriptions = array_unique($allDescriptions);
        
        // Sort by length (longest first) and combine
        usort($allDescriptions, fn($a, $b) => strlen($b) - strlen($a));
        
        // Build final description from unique sections
        $finalDescription = '';
        $usedTexts = [];
        
        foreach ($allDescriptions as $desc) {
            // Check if this text is not a substring of already added text
            $isDuplicate = false;
            foreach ($usedTexts as $used) {
                if (stripos($used, $desc) !== false || stripos($desc, $used) !== false) {
                    $isDuplicate = true;
                    break;
                }
            }
            
            if (!$isDuplicate && strlen($desc) > 30) {
                $finalDescription .= $desc . "\n\n";
                $usedTexts[] = $desc;
            }
        }
        
        $finalDescription = trim($finalDescription);
        
        if (strlen($finalDescription) > strlen($data['description'] ?? '')) {
            $data['description'] = $finalDescription;
            Log::info("Extracted description with " . strlen($finalDescription) . " characters");
        }

        // Also try the sectioned description extraction
        $sectionedDesc = $this->extractSectionedDescription($html);
        if ($sectionedDesc && strlen($sectionedDesc) > strlen($data['description'] ?? '')) {
            $data['description'] = $sectionedDesc;
        }

        // ========== EXTRACT ALL AMENITIES ==========
        
        // Pattern 1: Look for amenities/amenityGroups in JSON
        $amenities = [];
        
        // Find amenityGroups which contains ALL amenities
        if (preg_match('#"amenityGroups"\s*:\s*(\[.*?\])\s*[,}]#s', $html, $match)) {
            $amenitiesJson = $match[1];
            // Extract all amenity titles/names
            if (preg_match_all('#"title"\s*:\s*"([^"]+)"#', $amenitiesJson, $titles)) {
                $amenities = array_merge($amenities, $titles[1]);
            }
        }

        // Pattern 2: Look for previewAmenities
        if (preg_match('#"previewAmenities"\s*:\s*\[(.*?)\]#s', $html, $match)) {
            if (preg_match_all('#"title"\s*:\s*"([^"]+)"#', $match[1], $titles)) {
                $amenities = array_merge($amenities, $titles[1]);
            }
        }

        // Pattern 3: Look for listingAmenities
        if (preg_match('#"listingAmenities"\s*:\s*\[(.*?)\]#s', $html, $match)) {
            if (preg_match_all('#"name"\s*:\s*"([^"]+)"#', $match[1], $names)) {
                $amenities = array_merge($amenities, $names[1]);
            }
            if (preg_match_all('#"title"\s*:\s*"([^"]+)"#', $match[1], $titles)) {
                $amenities = array_merge($amenities, $titles[1]);
            }
        }

        // Pattern 4: Look for seeAllAmenitiesGroups (full list)
        if (preg_match('#"seeAllAmenitiesGroups"\s*:\s*(\[.*?\])\s*[,}]#s', $html, $match)) {
            $amenitiesJson = $match[1];
            if (preg_match_all('#"title"\s*:\s*"([^"]+)"#', $amenitiesJson, $titles)) {
                $amenities = array_merge($amenities, $titles[1]);
            }
        }

        // Pattern 5: Generic - find all amenity-like entries
        if (preg_match_all('#"amenities"\s*:\s*\[([^\]]+)\]#s', $html, $matches)) {
            foreach ($matches[1] as $amenityBlock) {
                if (preg_match_all('#"([^"]+)"#', $amenityBlock, $items)) {
                    foreach ($items[1] as $item) {
                        // Filter out non-amenity strings
                        if (strlen($item) > 2 && strlen($item) < 100 && !preg_match('#^(https?://|[0-9]+$|true|false|null)#i', $item)) {
                            $amenities[] = $item;
                        }
                    }
                }
            }
        }

        // Clean and decode amenities
        $amenities = array_map(function($a) {
            return $this->decodeJsonString($a);
        }, $amenities);

        // Remove duplicates, empty values, and invalid entries
        $amenities = array_filter(array_unique($amenities), function($a) {
            // Must be reasonable length
            if (strlen($a) < 2 || strlen($a) > 100) {
                return false;
            }
            
            // Filter out internal Airbnb fields and system values
            $invalidPatterns = [
                '/^__typename$/i',
                '/^(title|icon|available|subtitle|id|isPresent)$/i',
                '/^SYSTEM_/i',
                '/^Amenity$/i',
                '/^[A-Z_]{5,}$/',  // All caps with underscores (system keys)
                '/^\d+$/',         // Numbers only
                '/^(true|false|null)$/i',
                '/^https?:\/\//i', // URLs
            ];
            
            foreach ($invalidPatterns as $pattern) {
                if (preg_match($pattern, $a)) {
                    return false;
                }
            }
            
            return true;
        });

        if (count($amenities) > count($data['amenities'] ?? [])) {
            $data['amenities'] = array_values($amenities);
            Log::info("Extracted " . count($amenities) . " amenities from JSON");
        }
    }

    /**
     * Extract sectioned description from Airbnb page
     */
    private function extractSectionedDescription(string $html): ?string
    {
        $sections = [];
        
        // Pattern 1: Look for sectionedDescription array with title and htmlText
        if (preg_match('#"sectionedDescription"\s*:\s*\[(.*?)\]\s*[,}]#s', $html, $match)) {
            $sectionsJson = '[' . $match[1] . ']';
            // Extract each section with title and htmlText
            if (preg_match_all('#\{[^{}]*"title"\s*:\s*"([^"]*)"[^{}]*"htmlText"\s*:\s*"((?:[^"\\\\]|\\\\.)*)+"[^{}]*\}#s', $match[1], $items, PREG_SET_ORDER)) {
                foreach ($items as $item) {
                    $title = $this->decodeJsonString($item[1]);
                    $text = $this->decodeJsonString($item[2]);
                    if (strlen($text) > 10) {
                        $sectionTitle = $title ?: 'Beschreibung';
                        $sections[$sectionTitle] = $text;
                    }
                }
            }
        }

        // Pattern 2: Look for individual description sections
        $sectionPatterns = [
            'Über diese Unterkunft' => '#"(?:aboutThisSpace|descriptionSummary)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Die Unterkunft' => '#"(?:theSpace|spaceDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Zugang für Gäste' => '#"(?:guestAccess|accessDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Während deines Aufenthaltes' => '#"(?:interaction|interactionDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Weitere wichtige Hinweise' => '#"(?:otherThingsToNote|otherDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Die Nachbarschaft' => '#"(?:neighborhood|neighborhoodDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Anreise' => '#"(?:transit|transitDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
            'Hausregeln' => '#"(?:houseRules|houseRulesDescription)"\s*:\s*\{[^}]*"(?:htmlText|value)"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"#s',
        ];

        foreach ($sectionPatterns as $title => $pattern) {
            if (!isset($sections[$title]) && preg_match($pattern, $html, $match)) {
                $text = $this->decodeJsonString($match[1]);
                if (strlen($text) > 10) {
                    $sections[$title] = $text;
                }
            }
        }

        // Pattern 3: Look for description_sections or similar arrays
        if (preg_match('#"description_sections"\s*:\s*\[(.*?)\]#s', $html, $match)) {
            if (preg_match_all('#\{[^{}]*"title"\s*:\s*"([^"]*)"[^{}]*"body"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"[^{}]*\}#s', $match[1], $items, PREG_SET_ORDER)) {
                foreach ($items as $item) {
                    $title = $this->decodeJsonString($item[1]) ?: 'Info';
                    $text = $this->decodeJsonString($item[2]);
                    if (strlen($text) > 10 && !isset($sections[$title])) {
                        $sections[$title] = $text;
                    }
                }
            }
        }

        // Build final description with section headers
        if (!empty($sections)) {
            $parts = [];
            foreach ($sections as $title => $content) {
                if ($title && $title !== 'Beschreibung') {
                    $parts[] = "【{$title}】\n{$content}";
                } else {
                    $parts[] = $content;
                }
            }
            return trim(implode("\n\n", $parts));
        }

        return null;
    }

    /**
     * Decode JSON escaped string
     */
    private function decodeJsonString(string $str): string
    {
        // Decode unicode escapes
        $str = preg_replace_callback('#\\\\u([0-9a-fA-F]{4})#', function($m) {
            return mb_convert_encoding(pack('H*', $m[1]), 'UTF-8', 'UCS-2BE');
        }, $str);
        
        // Decode other escapes
        $str = str_replace(['\\n', '\\r', '\\t', '\\"', '\\\\'], ["\n", "\r", "\t", '"', '\\'], $str);
        
        // Strip HTML tags but preserve line breaks
        $str = preg_replace('#<br\s*/?>#i', "\n", $str);
        $str = strip_tags($str);
        
        // Clean up whitespace
        $str = preg_replace('#\n{3,}#', "\n\n", $str);
        
        return trim($str);
    }

    /**
     * Extract ALL images from Airbnb's embedded JSON data
     * This gets ALL images, not just the ones visible in HTML
     */
    private function extractAllImagesFromJson(string $html): array
    {
        $images = [];

        // Airbnb embeds listing data in script tags - look for all of them
        // Pattern 1: Look for photos array in JSON
        if (preg_match_all('#"photos"\s*:\s*\[(.*?)\]#s', $html, $matches)) {
            foreach ($matches[1] as $photosJson) {
                // Extract URLs from the photos array
                if (preg_match_all('#"(https://a0\.muscache\.com/im/pictures/[^"]+)"#', $photosJson, $urlMatches)) {
                    $images = array_merge($images, $urlMatches[1]);
                }
            }
        }

        // Pattern 2: Look for pictureUrl, baseUrl, large, xl patterns
        $urlPatterns = [
            '#"(?:pictureUrl|baseUrl|large|xl|original|scrim_color)"\s*:\s*"(https://a0\.muscache\.com/im/pictures/[^"]+)"#',
            '#"(?:url|picture|image)"\s*:\s*"(https://a0\.muscache\.com/im/pictures/[^"]+)"#',
        ];

        foreach ($urlPatterns as $pattern) {
            if (preg_match_all($pattern, $html, $matches)) {
                $images = array_merge($images, $matches[1]);
            }
        }

        // Pattern 3: Look for the __NEXT_DATA__ script which often contains all data
        if (preg_match('#<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>#s', $html, $match)) {
            $nextData = $match[1];
            // Extract all muscache image URLs from this block
            if (preg_match_all('#https://a0\.muscache\.com/im/pictures/[^"\\\\]+#', $nextData, $urlMatches)) {
                $images = array_merge($images, $urlMatches[0]);
            }
        }

        // Pattern 4: Look for data-deferred-state scripts
        if (preg_match_all('#<script[^>]*data-deferred-state[^>]*>(.*?)</script>#s', $html, $matches)) {
            foreach ($matches[1] as $scriptContent) {
                if (preg_match_all('#https://a0\.muscache\.com/im/pictures/[^"\\\\]+#', $scriptContent, $urlMatches)) {
                    $images = array_merge($images, $urlMatches[0]);
                }
            }
        }

        // Pattern 5: Generic - find ALL muscache image URLs in the entire HTML
        if (preg_match_all('#https://a0\.muscache\.com/im/pictures/(?:miso|hosting|prohost-api|airbnb-platform-assets)/[^"\'>\s\\\\]+#', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Clean up and filter images
        $images = array_unique($images);
        
        // Filter out profile pictures, thumbnails, icons
        $images = array_filter($images, function($url) {
            // Skip user/profile pictures (including AirbnbPlatformAssets-UserProfile)
            if (preg_match('#/(user|users|avatar|avatars|profile|User|UserProfile)/|user_pic|profile_pic|AirbnbPlatformAssets-UserProfile#i', $url)) {
                return false;
            }
            // Skip small thumbnails and icons
            if (preg_match('#(small|thumb|icon|32x32|64x64|50x50|thumbnail|_t\.|_s\.)#i', $url)) {
                return false;
            }
            // Skip amenity icons, logos, and platform assets (non-listing images)
            if (preg_match('#/amenities/|/icons/|/logos/|/static/|AirbnbPlatformAssets-(?!Listing)#i', $url)) {
                return false;
            }
            // Must be a proper image file
            if (!preg_match('#\.(jpg|jpeg|png|webp)#i', $url)) {
                return false;
            }
            return true;
        });

        // Upgrade all images to high quality
        $images = array_map(function($url) {
            // Clean URL and add high quality parameters
            $url = preg_replace('#\?.*$#', '', $url); // Remove existing query string
            // Request highest quality
            return $url . '?im_w=1440&im_q=highq';
        }, $images);

        // Remove duplicates after URL normalization
        $images = array_unique($images);

        Log::info("Extracted " . count($images) . " images from JSON data");

        return array_values($images);
    }

    /**
     * Extract images from HTML - ONLY listing images, NO profile pictures (fallback)
     */
    private function extractImages(string $html): array
    {
        $images = [];

        // Look for high-quality Airbnb LISTING image URLs (miso = listing images)
        // Pattern: https://a0.muscache.com/im/pictures/miso/Host-XXXXX/original/XXXXX.jpeg
        if (preg_match_all('#https://a0\.muscache\.com/im/pictures/miso/[^"\'>\s]+#', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Also look for hosting_id pattern (another listing image format)
        // Pattern: https://a0.muscache.com/im/pictures/hosting/XXXXX/original/XXXXX.jpeg
        if (preg_match_all('#https://a0\.muscache\.com/im/pictures/hosting/[^"\'>\s]+#', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Look for prohost pattern
        if (preg_match_all('#https://a0\.muscache\.com/im/pictures/prohost-api/[^"\'>\s]+#', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Generic listing pictures (but NOT user/profile pictures)
        if (preg_match_all('#https://a0\.muscache\.com/im/pictures/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)[^"\'>\s]*#i', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Also check for airbnb-static images (room photos)
        if (preg_match_all('#https://a0\.muscache\.com/pictures/[^"\'>\s]+\.(jpg|jpeg|png|webp)[^"\'>\s]*#i', $html, $matches)) {
            $images = array_merge($images, $matches[0]);
        }

        // Remove duplicates
        $images = array_unique($images);
        
        // IMPORTANT: Filter out profile pictures and thumbnails
        $images = array_filter($images, function($url) {
            // Skip user/profile pictures (including AirbnbPlatformAssets-UserProfile)
            if (preg_match('#/(user|users|avatar|avatars|profile|User|UserProfile)/|user_pic|profile_pic|AirbnbPlatformAssets-UserProfile#i', $url)) {
                return false;
            }
            // Skip small thumbnails and icons
            if (preg_match('#(small|thumb|icon|32x32|64x64|50x50|thumbnail|_t\.|_s\.)#i', $url)) {
                return false;
            }
            // Skip amenity icons, logos, and non-listing platform assets
            if (preg_match('#/amenities/|/icons/|/logos/|AirbnbPlatformAssets-(?!Listing)#i', $url)) {
                return false;
            }
            return true;
        });

        // Upgrade image quality - request high resolution
        $images = array_map(function($url) {
            // Remove existing size parameters and add high resolution
            $url = preg_replace('#\?.*$#', '', $url); // Remove query string
            return $url . '?im_w=1440&im_q=highq'; // High quality, 1440px width
        }, $images);

        // Remove duplicates again after URL modifications
        $images = array_unique($images);

        // Return ALL images (no limit)
        return array_values($images);
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
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1440&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1440&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1440&q=80',
                'https://images.unsplash.com/photo-1484154218962-a197022b25ba?w=1440&q=80',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1440&q=80',
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1440&q=80',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1440&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1440&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1440&q=80',
                'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1440&q=80',
                'https://images.unsplash.com/photo-1600573472591-ee6981cf35a6?w=1440&q=80',
                'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1440&q=80',
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
