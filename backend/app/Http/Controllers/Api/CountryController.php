<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CountryController extends Controller
{
    /**
     * List all countries
     */
    public function index(Request $request)
    {
        $query = Country::withCount(['properties' => function ($q) {
            $q->active();
        }]);

        if ($request->boolean('activeOnly', true)) {
            $query->active();
        }

        $countries = Cache::remember('countries_list', 3600, function () use ($query) {
            return $query->orderBy('name_de')->get();
        });

        return response()->json([
            'data' => $countries->map(fn($c) => [
                'id' => $c->id,
                'nameDe' => $c->name_de,
                'nameEn' => $c->name_en,
                'code' => $c->code,
                'image' => $c->image,
                'active' => $c->active,
                'propertiesCount' => $c->properties_count,
            ]),
        ]);
    }

    /**
     * Get single country
     */
    public function show(string $id)
    {
        $country = Country::withCount(['properties' => fn($q) => $q->active()])
            ->findOrFail($id);

        return response()->json([
            'id' => $country->id,
            'nameDe' => $country->name_de,
            'nameEn' => $country->name_en,
            'code' => $country->code,
            'image' => $country->image,
            'active' => $country->active,
            'propertiesCount' => $country->properties_count,
        ]);
    }

    /**
     * Create country (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'nameDe' => 'required|string|max:100',
            'nameEn' => 'required|string|max:100',
            'code' => 'required|string|size:2|unique:countries',
            'image' => 'nullable|string|url',
        ]);

        $country = Country::create([
            'name_de' => $request->nameDe,
            'name_en' => $request->nameEn,
            'code' => strtoupper($request->code),
            'image' => $request->image,
        ]);

        Cache::forget('countries_list');

        SystemLog::log('country.create', 'Country', $country->id);

        return response()->json([
            'id' => $country->id,
            'nameDe' => $country->name_de,
            'nameEn' => $country->name_en,
            'code' => $country->code,
            'image' => $country->image,
            'active' => $country->active,
        ], 201);
    }

    /**
     * Update country (Admin only)
     */
    public function update(Request $request, string $id)
    {
        $country = Country::findOrFail($id);

        $request->validate([
            'nameDe' => 'sometimes|string|max:100',
            'nameEn' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|size:2|unique:countries,code,' . $country->id,
            'image' => 'nullable|string|url',
            'active' => 'boolean',
        ]);

        $country->update([
            'name_de' => $request->nameDe ?? $country->name_de,
            'name_en' => $request->nameEn ?? $country->name_en,
            'code' => strtoupper($request->code ?? $country->code),
            'image' => $request->image ?? $country->image,
            'active' => $request->active ?? $country->active,
        ]);

        Cache::forget('countries_list');

        SystemLog::log('country.update', 'Country', $country->id);

        return response()->json([
            'id' => $country->id,
            'nameDe' => $country->name_de,
            'nameEn' => $country->name_en,
            'code' => $country->code,
            'image' => $country->image,
            'active' => $country->active,
        ]);
    }

    /**
     * Delete country (Admin only)
     */
    public function destroy(string $id)
    {
        $country = Country::findOrFail($id);

        // Check if country has properties
        if ($country->properties()->exists()) {
            return response()->json([
                'message' => 'Land kann nicht gelöscht werden, da noch Unterkünfte zugeordnet sind',
            ], 422);
        }

        SystemLog::log('country.delete', 'Country', $country->id, [
            'name' => $country->name_de,
        ]);

        $country->delete();
        Cache::forget('countries_list');

        return response()->json(['message' => 'Land gelöscht']);
    }
}

