<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Country;
use App\Models\Property;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['username' => 'beetlejuice'],
            [
                'email' => 'admin@voyagenest.com',
                'first_name' => 'Beetle',
                'last_name' => 'Juice',
                'password' => Hash::make('Makatussin911#'),
                'role' => 'admin',
                'customer_score' => 100,
            ]
        );
        echo "✅ Admin user 'beetlejuice' created\n";

        // Create Countries
        $countries = [
            ['name_de' => 'Deutschland', 'name_en' => 'Germany', 'code' => 'DE', 'image' => 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800'],
            ['name_de' => 'Österreich', 'name_en' => 'Austria', 'code' => 'AT', 'image' => 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800'],
            ['name_de' => 'Schweiz', 'name_en' => 'Switzerland', 'code' => 'CH', 'image' => 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800'],
            ['name_de' => 'Spanien', 'name_en' => 'Spain', 'code' => 'ES', 'image' => 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800'],
            ['name_de' => 'Italien', 'name_en' => 'Italy', 'code' => 'IT', 'image' => 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800'],
            ['name_de' => 'Frankreich', 'name_en' => 'France', 'code' => 'FR', 'image' => 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'],
        ];

        foreach ($countries as $countryData) {
            Country::updateOrCreate(
                ['code' => $countryData['code']],
                $countryData
            );
        }
        echo "✅ Countries created\n";

        // Create Sample Properties
        $germany = Country::where('code', 'DE')->first();
        $spain = Country::where('code', 'ES')->first();
        $italy = Country::where('code', 'IT')->first();

        $properties = [
            [
                'title_de' => 'Moderne Stadtwohnung in Berlin',
                'title_en' => 'Modern City Apartment in Berlin',
                'description_de' => 'Stilvolle 2-Zimmer-Wohnung im Herzen von Berlin-Mitte. Perfekt für Städtereisen mit allen Annehmlichkeiten.',
                'description_en' => 'Stylish 2-room apartment in the heart of Berlin-Mitte. Perfect for city trips with all amenities.',
                'country_id' => $germany->id,
                'city' => 'Berlin',
                'address' => 'Friedrichstraße 123, 10117 Berlin',
                'latitude' => 52.5200,
                'longitude' => 13.4050,
                'price_per_night' => 89.00,
                'max_guests' => 4,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'amenities' => ['WLAN', 'Küche', 'Waschmaschine', 'TV', 'Klimaanlage'],
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                ],
                'featured' => true,
            ],
            [
                'title_de' => 'Strandhaus in Barcelona',
                'title_en' => 'Beach House in Barcelona',
                'description_de' => 'Traumhaftes Apartment direkt am Strand von Barceloneta. Genießen Sie Meerblick und mediterranes Flair.',
                'description_en' => 'Dreamy apartment right on the beach of Barceloneta. Enjoy sea views and Mediterranean flair.',
                'country_id' => $spain->id,
                'city' => 'Barcelona',
                'address' => 'Passeig Maritim 45, 08003 Barcelona',
                'latitude' => 41.3851,
                'longitude' => 2.1734,
                'price_per_night' => 129.00,
                'max_guests' => 6,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'amenities' => ['WLAN', 'Küche', 'Meerblick', 'Balkon', 'Klimaanlage', 'Pool'],
                'images' => [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
                ],
                'featured' => true,
            ],
            [
                'title_de' => 'Romantische Villa in der Toskana',
                'title_en' => 'Romantic Villa in Tuscany',
                'description_de' => 'Authentische toskanische Villa mit Pool und Olivengarten. Ideal für Paare und Familien.',
                'description_en' => 'Authentic Tuscan villa with pool and olive garden. Ideal for couples and families.',
                'country_id' => $italy->id,
                'city' => 'Florenz',
                'address' => 'Via delle Rose 12, 50125 Firenze',
                'latitude' => 43.7696,
                'longitude' => 11.2558,
                'price_per_night' => 199.00,
                'max_guests' => 8,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'amenities' => ['WLAN', 'Küche', 'Pool', 'Garten', 'Parkplatz', 'Grill'],
                'images' => [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                ],
                'featured' => true,
            ],
        ];

        foreach ($properties as $propertyData) {
            Property::updateOrCreate(
                ['title_de' => $propertyData['title_de']],
                $propertyData
            );
        }
        echo "✅ Sample properties created\n";

        echo "\n🎉 Database seeded successfully!\n";
        echo "Admin Login: username='beetlejuice', password='Makatussin911#'\n";
    }
}
