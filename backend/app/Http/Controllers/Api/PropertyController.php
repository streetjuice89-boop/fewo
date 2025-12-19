<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PropertyController extends Controller
{
    /**
     * List all properties with filters
     */
    public function index(Request $request)
    {
        $cacheKey = 'properties_' . md5(serialize($request->all()));
        
        return Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Property::with('country');
            
            // For public API, only show online properties by default
            if (!$request->has('status') && !$request->has('admin')) {
                $query->where('status', 'online');
            }
            
            // Filter by status (admin)
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by country
            if ($request->has('countryId')) {
                $query->where('country_id', $request->countryId);
            }

            // Filter by price range
            if ($request->has('minPrice')) {
                $query->where('price_per_night', '>=', $request->minPrice);
            }
            if ($request->has('maxPrice')) {
                $query->where('price_per_night', '<=', $request->maxPrice);
            }

            // Filter by guests
            if ($request->has('guests')) {
                $query->where('max_guests', '>=', $request->guests);
            }

            // Filter by bedrooms
            if ($request->has('bedrooms')) {
                $query->where('bedrooms', '>=', $request->bedrooms);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title_de', 'like', "%{$search}%")
                      ->orWhere('title_en', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
                });
            }

            // Pagination
            $page = $request->get('page', 1);
            $limit = min($request->get('limit', 12), 50);

            $total = $query->count();
            $properties = $query->orderBy('featured', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->skip(($page - 1) * $limit)
                               ->take($limit)
                               ->get();

            return response()->json([
                'data' => $properties->map(fn($p) => $this->formatProperty($p)),
                'meta' => [
                    'total' => $total,
                    'page' => (int) $page,
                    'limit' => $limit,
                    'totalPages' => ceil($total / $limit),
                ],
            ]);
        });
    }

    /**
     * Get single property
     */
    public function show(string $id)
    {
        $property = Cache::remember("property_{$id}", 300, function () use ($id) {
            return Property::with(['country', 'bookings' => function ($q) {
                $q->where('status', '!=', 'cancelled')
                  ->where('check_out', '>=', now())
                  ->select('id', 'property_id', 'check_in', 'check_out');
            }])->findOrFail($id);
        });

        return response()->json($this->formatProperty($property, true));
    }

    /**
     * Get featured properties
     */
    public function featured(Request $request)
    {
        $limit = min($request->get('limit', 6), 12);

        $properties = Cache::remember("properties_featured_{$limit}", 300, function () use ($limit) {
            return Property::with('country')
                ->active()
                ->featured()
                ->limit($limit)
                ->get();
        });

        return response()->json([
            'data' => $properties->map(fn($p) => $this->formatProperty($p)),
        ]);
    }

    /**
     * Create property (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'titleDe' => 'required|string|max:255',
            'titleEn' => 'required|string|max:255',
            'descriptionDe' => 'required|string',
            'descriptionEn' => 'required|string',
            'countryId' => 'required|exists:countries,id',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'pricePerNight' => 'required|numeric|min:0',
            'maxGuests' => 'required|integer|min:1',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'amenities' => 'nullable|array',
            'images' => 'nullable|array',
            'featured' => 'boolean',
        ]);

        $property = Property::create([
            'title_de' => $request->titleDe,
            'title_en' => $request->titleEn,
            'description_de' => $request->descriptionDe,
            'description_en' => $request->descriptionEn,
            'country_id' => $request->countryId,
            'city' => $request->city,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'price_per_night' => $request->pricePerNight,
            'max_guests' => $request->maxGuests,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'amenities' => $request->amenities,
            'images' => $request->images,
            'featured' => $request->featured ?? false,
            'status' => $request->status ?? 'draft',
        ]);

        Cache::forget('properties_featured_6');
        
        SystemLog::log('property.create', 'Property', $property->id);

        return response()->json($this->formatProperty($property), 201);
    }

    /**
     * Update property (Admin only)
     */
    public function update(Request $request, string $id)
    {
        $property = Property::findOrFail($id);

        $request->validate([
            'titleDe' => 'sometimes|string|max:255',
            'titleEn' => 'sometimes|string|max:255',
            'descriptionDe' => 'sometimes|string',
            'descriptionEn' => 'sometimes|string',
            'countryId' => 'sometimes|exists:countries,id',
            'city' => 'sometimes|string|max:100',
            'address' => 'sometimes|string|max:255',
            'pricePerNight' => 'sometimes|numeric|min:0',
            'maxGuests' => 'sometimes|integer|min:1',
            'bedrooms' => 'sometimes|integer|min:0',
            'bathrooms' => 'sometimes|integer|min:0',
            'amenities' => 'nullable|array',
            'images' => 'nullable|array',
            'featured' => 'boolean',
            'active' => 'boolean',
            'status' => 'sometimes|in:draft,online,offline',
        ]);

        $property->update([
            'title_de' => $request->titleDe ?? $property->title_de,
            'title_en' => $request->titleEn ?? $property->title_en,
            'description_de' => $request->descriptionDe ?? $property->description_de,
            'description_en' => $request->descriptionEn ?? $property->description_en,
            'country_id' => $request->countryId ?? $property->country_id,
            'city' => $request->city ?? $property->city,
            'address' => $request->address ?? $property->address,
            'latitude' => $request->latitude ?? $property->latitude,
            'longitude' => $request->longitude ?? $property->longitude,
            'price_per_night' => $request->pricePerNight ?? $property->price_per_night,
            'max_guests' => $request->maxGuests ?? $property->max_guests,
            'bedrooms' => $request->bedrooms ?? $property->bedrooms,
            'bathrooms' => $request->bathrooms ?? $property->bathrooms,
            'amenities' => $request->amenities ?? $property->amenities,
            'images' => $request->images ?? $property->images,
            'featured' => $request->featured ?? $property->featured,
            'active' => $request->active ?? $property->active,
            'status' => $request->status ?? $property->status,
        ]);

        Cache::forget("property_{$id}");
        Cache::forget('properties_featured_6');

        SystemLog::log('property.update', 'Property', $property->id);

        return response()->json($this->formatProperty($property->fresh()));
    }

    /**
     * Delete property (Admin only)
     */
    public function destroy(string $id)
    {
        $property = Property::findOrFail($id);
        
        SystemLog::log('property.delete', 'Property', $property->id, [
            'title' => $property->title_de
        ]);

        $property->delete();

        Cache::forget("property_{$id}");
        Cache::forget('properties_featured_6');

        return response()->json(['message' => 'Property gelöscht']);
    }

    /**
     * Check availability
     */
    public function checkAvailability(Request $request, string $id)
    {
        $request->validate([
            'checkIn' => 'required|date|after_or_equal:today',
            'checkOut' => 'required|date|after:checkIn',
        ]);

        $property = Property::findOrFail($id);
        $available = $property->isAvailable($request->checkIn, $request->checkOut);

        return response()->json([
            'available' => $available,
            'propertyId' => $id,
            'checkIn' => $request->checkIn,
            'checkOut' => $request->checkOut,
        ]);
    }

    /**
     * Format property for response
     */
    private function formatProperty(Property $property, bool $detailed = false): array
    {
        $data = [
            'id' => $property->id,
            'titleDe' => $property->title_de,
            'titleEn' => $property->title_en,
            'descriptionDe' => $property->description_de,
            'descriptionEn' => $property->description_en,
            'country' => $property->country ? [
                'id' => $property->country->id,
                'nameDe' => $property->country->name_de,
                'nameEn' => $property->country->name_en,
                'code' => $property->country->code,
            ] : null,
            'city' => $property->city,
            'address' => $property->address,
            'pricePerNight' => (float) $property->price_per_night,
            'maxGuests' => $property->max_guests,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'amenities' => $property->amenities ?? [],
            'images' => $property->images ?? [],
            'featured' => $property->featured,
            'active' => $property->active,
            'status' => $property->status ?? 'draft',
            'airbnbId' => $property->airbnb_id,
        ];

        if ($detailed) {
            $data['latitude'] = $property->latitude;
            $data['longitude'] = $property->longitude;
            $data['bookedDates'] = $property->bookings?->flatMap(function ($b) {
                $dates = [];
                $current = $b->check_in->copy();
                while ($current < $b->check_out) {
                    $dates[] = $current->format('Y-m-d');
                    $current->addDay();
                }
                return $dates;
            })->unique()->values() ?? [];
        }

        return $data;
    }
}




