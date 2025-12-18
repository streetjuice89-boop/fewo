<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AirbnbListing;
use App\Models\Property;
use App\Models\SystemLog;
use App\Services\AirbnbGrabberService;
use Illuminate\Http\Request;

class AirbnbController extends Controller
{
    protected AirbnbGrabberService $grabberService;

    public function __construct(AirbnbGrabberService $grabberService)
    {
        $this->grabberService = $grabberService;
    }

    /**
     * List all Airbnb listings
     */
    public function index(Request $request)
    {
        $query = AirbnbListing::with('property');

        // Filter by sync status
        if ($request->has('status')) {
            $query->where('sync_status', $request->status);
        }

        // Filter by linked/unlinked
        if ($request->has('linked')) {
            if ($request->boolean('linked')) {
                $query->whereNotNull('property_id');
            } else {
                $query->whereNull('property_id');
            }
        }

        $page = $request->get('page', 1);
        $limit = min($request->get('limit', 20), 50);

        $total = $query->count();
        $listings = $query->latest()->skip(($page - 1) * $limit)->take($limit)->get();

        return response()->json([
            'data' => $listings->map(fn($l) => $this->formatListing($l)),
            'meta' => [
                'total' => $total,
                'page' => (int) $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Get single listing
     */
    public function show(string $id)
    {
        $listing = AirbnbListing::with('property')->findOrFail($id);
        
        return response()->json($this->formatListing($listing, true));
    }

    /**
     * Add new Airbnb URL to grab
     */
    public function grab(Request $request)
    {
        $request->validate([
            'url' => 'required|url|regex:/airbnb\.(com|de|at|ch)/i',
        ]);

        // Extract Airbnb ID from URL
        $airbnbId = $this->grabberService->extractAirbnbId($request->url);
        
        if (!$airbnbId) {
            return response()->json([
                'message' => 'Ungültige Airbnb URL',
            ], 422);
        }

        // Check if already exists
        $existing = AirbnbListing::where('airbnb_id', $airbnbId)->first();
        if ($existing) {
            return response()->json([
                'message' => 'Dieses Inserat wurde bereits hinzugefügt',
                'listing' => $this->formatListing($existing),
            ], 422);
        }

        // Create pending listing
        $listing = AirbnbListing::create([
            'airbnb_id' => $airbnbId,
            'url' => $request->url,
            'title' => 'Wird geladen...',
            'sync_status' => 'pending',
        ]);

        // Dispatch job to grab data (would be async in production)
        // For now, we'll do it synchronously
        try {
            $data = $this->grabberService->grabListing($airbnbId);
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
                'review_count' => $data['reviewCount'] ?? 0,
                'sync_status' => 'synced',
                'last_synced_at' => now(),
            ]);
        } catch (\Exception $e) {
            $listing->update([
                'sync_status' => 'error',
            ]);
        }

        SystemLog::log('airbnb.grab', 'AirbnbListing', $listing->id, [
            'url' => $request->url,
        ]);

        return response()->json($this->formatListing($listing->fresh()), 201);
    }

    /**
     * Sync a listing
     */
    public function sync(string $id)
    {
        $listing = AirbnbListing::findOrFail($id);

        try {
            $data = $this->grabberService->grabListing($listing->airbnb_id);
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
                'review_count' => $data['reviewCount'] ?? 0,
                'sync_status' => 'synced',
                'last_synced_at' => now(),
            ]);

            SystemLog::log('airbnb.sync', 'AirbnbListing', $listing->id);

            return response()->json($this->formatListing($listing->fresh()));
        } catch (\Exception $e) {
            $listing->update(['sync_status' => 'error']);
            
            return response()->json([
                'message' => 'Synchronisation fehlgeschlagen: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Link listing to property
     */
    public function link(Request $request, string $id)
    {
        $request->validate([
            'propertyId' => 'required|exists:properties,id',
        ]);

        $listing = AirbnbListing::findOrFail($id);
        $property = Property::findOrFail($request->propertyId);

        // Check if property already has a linked listing
        if ($property->airbnb_id && $property->airbnb_id !== $listing->airbnb_id) {
            return response()->json([
                'message' => 'Diese Unterkunft ist bereits mit einem anderen Airbnb-Inserat verknüpft',
            ], 422);
        }

        $listing->update(['property_id' => $property->id]);
        $property->update(['airbnb_id' => $listing->airbnb_id]);

        SystemLog::log('airbnb.link', 'AirbnbListing', $listing->id, [
            'propertyId' => $property->id,
        ]);

        return response()->json($this->formatListing($listing->fresh()->load('property')));
    }

    /**
     * Unlink listing from property
     */
    public function unlink(string $id)
    {
        $listing = AirbnbListing::findOrFail($id);
        
        if ($listing->property) {
            $listing->property->update(['airbnb_id' => null]);
        }

        $listing->update(['property_id' => null]);

        SystemLog::log('airbnb.unlink', 'AirbnbListing', $listing->id);

        return response()->json($this->formatListing($listing->fresh()));
    }

    /**
     * Delete listing
     */
    public function destroy(string $id)
    {
        $listing = AirbnbListing::findOrFail($id);

        if ($listing->property) {
            $listing->property->update(['airbnb_id' => null]);
        }

        SystemLog::log('airbnb.delete', 'AirbnbListing', $listing->id, [
            'title' => $listing->title,
        ]);

        $listing->delete();

        return response()->json(['message' => 'Inserat gelöscht']);
    }

    /**
     * Create property from listing
     */
    public function createProperty(Request $request, string $id)
    {
        $request->validate([
            'countryId' => 'required|exists:countries,id',
        ]);

        $listing = AirbnbListing::findOrFail($id);

        if ($listing->property_id) {
            return response()->json([
                'message' => 'Dieses Inserat ist bereits mit einer Unterkunft verknüpft',
            ], 422);
        }

        $property = Property::create([
            'title_de' => $listing->title,
            'title_en' => $listing->title,
            'description_de' => $listing->description ?? '',
            'description_en' => $listing->description ?? '',
            'country_id' => $request->countryId,
            'city' => $listing->location ?? 'Unbekannt',
            'address' => $listing->location ?? '',
            'price_per_night' => $listing->price ?? 0,
            'max_guests' => $listing->max_guests ?? 2,
            'bedrooms' => $listing->bedrooms ?? 1,
            'bathrooms' => $listing->bathrooms ?? 1,
            'amenities' => $listing->amenities,
            'images' => $listing->images,
            'airbnb_id' => $listing->airbnb_id,
        ]);

        $listing->update(['property_id' => $property->id]);

        SystemLog::log('airbnb.create_property', 'Property', $property->id, [
            'fromListing' => $listing->id,
        ]);

        return response()->json([
            'property' => [
                'id' => $property->id,
                'titleDe' => $property->title_de,
            ],
            'listing' => $this->formatListing($listing->fresh()),
        ], 201);
    }

    /**
     * Format listing for response
     */
    private function formatListing(AirbnbListing $listing, bool $detailed = false): array
    {
        $data = [
            'id' => $listing->id,
            'airbnbId' => $listing->airbnb_id,
            'url' => $listing->url,
            'title' => $listing->title,
            'price' => $listing->price ? (float) $listing->price : null,
            'currency' => $listing->currency,
            'location' => $listing->location,
            'bedrooms' => $listing->bedrooms,
            'bathrooms' => $listing->bathrooms,
            'maxGuests' => $listing->max_guests,
            'rating' => $listing->rating,
            'reviewCount' => $listing->review_count,
            'syncStatus' => $listing->sync_status,
            'lastSyncedAt' => $listing->last_synced_at?->toISOString(),
            'linkedProperty' => $listing->property ? [
                'id' => $listing->property->id,
                'title' => $listing->property->title_de,
            ] : null,
            'images' => array_slice($listing->images ?? [], 0, 3),
        ];

        if ($detailed) {
            $data['description'] = $listing->description;
            $data['amenities'] = $listing->amenities;
            $data['images'] = $listing->images;
            $data['availability'] = $listing->availability;
        }

        return $data;
    }
}

