<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AmenityController extends Controller
{
    /**
     * Get all amenities grouped by category
     */
    public function index(Request $request): JsonResponse
    {
        $query = Amenity::query();
        
        if ($request->boolean('active_only', false)) {
            $query->active();
        }
        
        if ($request->has('category')) {
            $query->byCategory($request->get('category'));
        }
        
        $amenities = $query->ordered()->get();
        
        // Group by category
        $grouped = $amenities->groupBy('category')->map(function ($items, $category) {
            return [
                'category' => $category,
                'items' => $items->values(),
            ];
        })->values();
        
        return response()->json([
            'amenities' => $amenities,
            'grouped' => $grouped,
            'categories' => $amenities->pluck('category')->unique()->values(),
            'total' => $amenities->count(),
        ]);
    }

    /**
     * Store a new amenity
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:amenities,name',
            'name_en' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:50',
            'category' => 'required|string|max:50',
            'active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $amenity = Amenity::create($validated);
        
        SystemLog::log('amenity.created', 'Amenity', $amenity->id, [
            'name' => $amenity->name,
            'category' => $amenity->category,
        ]);

        return response()->json($amenity, 201);
    }

    /**
     * Store multiple amenities at once (bulk import)
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amenities' => 'required|array|min:1',
            'amenities.*.name' => 'required|string|max:100',
            'amenities.*.name_en' => 'nullable|string|max:100',
            'amenities.*.icon' => 'nullable|string|max:50',
            'amenities.*.category' => 'required|string|max:50',
            'amenities.*.active' => 'boolean',
            'amenities.*.sort_order' => 'integer|min:0',
        ]);

        $created = [];
        $skipped = [];

        foreach ($validated['amenities'] as $data) {
            $existing = Amenity::where('name', $data['name'])->first();
            if ($existing) {
                $skipped[] = $data['name'];
                continue;
            }
            $created[] = Amenity::create($data);
        }

        SystemLog::log('amenity.bulk_created', null, null, [
            'created_count' => count($created),
            'skipped_count' => count($skipped),
        ]);

        return response()->json([
            'created' => $created,
            'skipped' => $skipped,
            'message' => count($created) . ' Ausstattungen erstellt, ' . count($skipped) . ' übersprungen (bereits vorhanden)',
        ]);
    }

    /**
     * Update an amenity
     */
    public function update(Request $request, Amenity $amenity): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100|unique:amenities,name,' . $amenity->id,
            'name_en' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:50',
            'category' => 'sometimes|string|max:50',
            'active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $amenity->update($validated);
        
        SystemLog::log('amenity.updated', 'Amenity', $amenity->id);

        return response()->json($amenity);
    }

    /**
     * Delete an amenity
     */
    public function destroy(Amenity $amenity): JsonResponse
    {
        $name = $amenity->name;
        $amenity->delete();
        
        SystemLog::log('amenity.deleted', 'Amenity', null, ['name' => $name]);

        return response()->json(['message' => 'Ausstattung gelöscht']);
    }

    /**
     * Get all unique categories
     */
    public function categories(): JsonResponse
    {
        $categories = Amenity::distinct()->pluck('category')->sort()->values();
        
        return response()->json($categories);
    }

    /**
     * Toggle active status
     */
    public function toggleActive(Amenity $amenity): JsonResponse
    {
        $amenity->update(['active' => !$amenity->active]);
        
        return response()->json($amenity);
    }

    /**
     * Import amenities from Airbnb listings
     */
    public function importFromListings(): JsonResponse
    {
        // Get all unique amenities from existing Airbnb listings
        $listings = \App\Models\AirbnbListing::whereNotNull('amenities')->get();
        
        $allAmenities = collect();
        foreach ($listings as $listing) {
            if (is_array($listing->amenities)) {
                $allAmenities = $allAmenities->merge($listing->amenities);
            }
        }
        
        $uniqueAmenities = $allAmenities
            ->map(fn($a) => trim($a))
            ->filter(fn($a) => !empty($a) && strlen($a) > 2)
            ->filter(fn($a) => !str_starts_with($a, '__typename') && !str_starts_with($a, 'SYSTEM_'))
            ->unique()
            ->values();
        
        $created = [];
        $skipped = [];
        
        foreach ($uniqueAmenities as $name) {
            $existing = Amenity::where('name', $name)->first();
            if ($existing) {
                $skipped[] = $name;
                continue;
            }
            
            // Auto-categorize based on common patterns
            $category = $this->autoDetectCategory($name);
            
            $created[] = Amenity::create([
                'name' => $name,
                'category' => $category,
                'active' => true,
            ]);
        }
        
        SystemLog::log('amenity.imported_from_listings', null, null, [
            'created_count' => count($created),
            'skipped_count' => count($skipped),
        ]);
        
        return response()->json([
            'created' => $created,
            'skipped' => $skipped,
            'message' => count($created) . ' Ausstattungen importiert, ' . count($skipped) . ' übersprungen',
        ]);
    }

    /**
     * Auto-detect category based on amenity name
     */
    private function autoDetectCategory(string $name): string
    {
        $name = strtolower($name);
        
        $categories = [
            'Küche' => ['küche', 'herd', 'backofen', 'mikrowelle', 'geschirrspüler', 'kühlschrank', 'kaffee', 'toaster', 'wasserkocher', 'geschirr', 'kochutensilien'],
            'Badezimmer' => ['bad', 'dusche', 'badewanne', 'toilette', 'wc', 'handtuch', 'haartrockner', 'föhn', 'shampoo', 'seife'],
            'Schlafzimmer' => ['bett', 'schlafzimmer', 'bettwäsche', 'kissen', 'matratze', 'kleiderschrank', 'bügel'],
            'Unterhaltung' => ['tv', 'fernseher', 'netflix', 'streaming', 'spielkonsole', 'bücher', 'spiele'],
            'Internet' => ['wlan', 'wifi', 'internet', 'lan'],
            'Heizung & Klima' => ['heizung', 'klima', 'klimaanlage', 'ventilator', 'kamin'],
            'Waschen' => ['waschmaschine', 'trockner', 'wäsche', 'bügeleisen'],
            'Outdoor' => ['garten', 'terrasse', 'balkon', 'grill', 'pool', 'fahrrad', 'parkplatz'],
            'Sicherheit' => ['rauchmelder', 'feuer', 'erste-hilfe', 'notfall', 'safe', 'tresor', 'kohlenmonoxid'],
            'Familie' => ['kind', 'baby', 'hochstuhl', 'wickel', 'spielzeug'],
            'Arbeit' => ['arbeitsplatz', 'schreibtisch', 'büro', 'laptop'],
            'Barrierefreiheit' => ['barrierefrei', 'rollstuhl', 'aufzug', 'lift'],
        ];
        
        foreach ($categories as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($name, $keyword)) {
                    return $category;
                }
            }
        }
        
        return 'Sonstiges';
    }
}
