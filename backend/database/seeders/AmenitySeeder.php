<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $amenities = [
            // Küche
            ['name' => 'Küche', 'name_en' => 'Kitchen', 'category' => 'Küche', 'icon' => 'utensils'],
            ['name' => 'Kühlschrank', 'name_en' => 'Refrigerator', 'category' => 'Küche', 'icon' => 'refrigerator'],
            ['name' => 'Geschirrspüler', 'name_en' => 'Dishwasher', 'category' => 'Küche', 'icon' => 'dishwasher'],
            ['name' => 'Herd', 'name_en' => 'Stove', 'category' => 'Küche', 'icon' => 'fire'],
            ['name' => 'Backofen', 'name_en' => 'Oven', 'category' => 'Küche', 'icon' => 'square'],
            ['name' => 'Mikrowelle', 'name_en' => 'Microwave', 'category' => 'Küche', 'icon' => 'microwave'],
            ['name' => 'Kaffeemaschine', 'name_en' => 'Coffee maker', 'category' => 'Küche', 'icon' => 'coffee'],
            ['name' => 'Wasserkocher', 'name_en' => 'Kettle', 'category' => 'Küche', 'icon' => 'kettle'],
            ['name' => 'Toaster', 'name_en' => 'Toaster', 'category' => 'Küche', 'icon' => 'toaster'],
            ['name' => 'Kochutensilien', 'name_en' => 'Cooking basics', 'category' => 'Küche', 'icon' => 'utensils'],
            ['name' => 'Geschirr und Besteck', 'name_en' => 'Dishes and silverware', 'category' => 'Küche', 'icon' => 'utensils'],
            ['name' => 'Weingläser', 'name_en' => 'Wine glasses', 'category' => 'Küche', 'icon' => 'wine-glass'],
            ['name' => 'Mini-Kühlschrank', 'name_en' => 'Mini fridge', 'category' => 'Küche', 'icon' => 'refrigerator'],
            ['name' => 'Gefrierschrank', 'name_en' => 'Freezer', 'category' => 'Küche', 'icon' => 'snowflake'],
            
            // Badezimmer
            ['name' => 'Badewanne', 'name_en' => 'Bathtub', 'category' => 'Badezimmer', 'icon' => 'bath'],
            ['name' => 'Dusche', 'name_en' => 'Shower', 'category' => 'Badezimmer', 'icon' => 'shower'],
            ['name' => 'Haartrockner', 'name_en' => 'Hair dryer', 'category' => 'Badezimmer', 'icon' => 'wind'],
            ['name' => 'Handtücher', 'name_en' => 'Towels', 'category' => 'Badezimmer', 'icon' => 'towel'],
            ['name' => 'Shampoo', 'name_en' => 'Shampoo', 'category' => 'Badezimmer', 'icon' => 'bottle'],
            ['name' => 'Duschgel', 'name_en' => 'Body soap', 'category' => 'Badezimmer', 'icon' => 'bottle'],
            ['name' => 'Conditioner', 'name_en' => 'Conditioner', 'category' => 'Badezimmer', 'icon' => 'bottle'],
            ['name' => 'Bidet', 'name_en' => 'Bidet', 'category' => 'Badezimmer', 'icon' => 'toilet'],
            ['name' => 'Toilettenpapier', 'name_en' => 'Toilet paper', 'category' => 'Badezimmer', 'icon' => 'scroll'],
            
            // Schlafzimmer
            ['name' => 'Bettwäsche', 'name_en' => 'Bed linens', 'category' => 'Schlafzimmer', 'icon' => 'bed'],
            ['name' => 'Kleiderschrank', 'name_en' => 'Wardrobe', 'category' => 'Schlafzimmer', 'icon' => 'archive'],
            ['name' => 'Extra Kissen und Decken', 'name_en' => 'Extra pillows and blankets', 'category' => 'Schlafzimmer', 'icon' => 'pillow'],
            ['name' => 'Verdunkelungsvorhänge', 'name_en' => 'Blackout curtains', 'category' => 'Schlafzimmer', 'icon' => 'curtains'],
            ['name' => 'Kleiderbügel', 'name_en' => 'Hangers', 'category' => 'Schlafzimmer', 'icon' => 'hanger'],
            ['name' => 'Bügeleisen', 'name_en' => 'Iron', 'category' => 'Schlafzimmer', 'icon' => 'iron'],
            ['name' => 'Bügelbrett', 'name_en' => 'Ironing board', 'category' => 'Schlafzimmer', 'icon' => 'rectangle'],
            
            // Internet & Entertainment
            ['name' => 'WLAN', 'name_en' => 'WiFi', 'category' => 'Internet', 'icon' => 'wifi'],
            ['name' => 'Schnelles WLAN', 'name_en' => 'Fast WiFi', 'category' => 'Internet', 'icon' => 'wifi'],
            ['name' => 'Fernseher', 'name_en' => 'TV', 'category' => 'Unterhaltung', 'icon' => 'tv'],
            ['name' => 'Smart-TV', 'name_en' => 'Smart TV', 'category' => 'Unterhaltung', 'icon' => 'tv'],
            ['name' => 'Netflix', 'name_en' => 'Netflix', 'category' => 'Unterhaltung', 'icon' => 'film'],
            ['name' => 'Amazon Prime Video', 'name_en' => 'Amazon Prime Video', 'category' => 'Unterhaltung', 'icon' => 'film'],
            ['name' => 'Disney+', 'name_en' => 'Disney+', 'category' => 'Unterhaltung', 'icon' => 'film'],
            ['name' => 'Kabel-TV', 'name_en' => 'Cable TV', 'category' => 'Unterhaltung', 'icon' => 'tv'],
            ['name' => 'Spielkonsole', 'name_en' => 'Game console', 'category' => 'Unterhaltung', 'icon' => 'gamepad'],
            ['name' => 'Bücher', 'name_en' => 'Books', 'category' => 'Unterhaltung', 'icon' => 'book'],
            ['name' => 'Brettspiele', 'name_en' => 'Board games', 'category' => 'Unterhaltung', 'icon' => 'chess'],
            ['name' => 'Bluetooth-Lautsprecher', 'name_en' => 'Bluetooth speaker', 'category' => 'Unterhaltung', 'icon' => 'speaker'],
            
            // Heizung & Klima
            ['name' => 'Heizung', 'name_en' => 'Heating', 'category' => 'Heizung & Klima', 'icon' => 'thermometer'],
            ['name' => 'Klimaanlage', 'name_en' => 'Air conditioning', 'category' => 'Heizung & Klima', 'icon' => 'snowflake'],
            ['name' => 'Ventilator', 'name_en' => 'Fan', 'category' => 'Heizung & Klima', 'icon' => 'fan'],
            ['name' => 'Kamin', 'name_en' => 'Fireplace', 'category' => 'Heizung & Klima', 'icon' => 'fire'],
            ['name' => 'Fußbodenheizung', 'name_en' => 'Underfloor heating', 'category' => 'Heizung & Klima', 'icon' => 'thermometer'],
            
            // Waschen
            ['name' => 'Waschmaschine', 'name_en' => 'Washing machine', 'category' => 'Waschen', 'icon' => 'washing-machine'],
            ['name' => 'Trockner', 'name_en' => 'Dryer', 'category' => 'Waschen', 'icon' => 'tumble-dryer'],
            ['name' => 'Wäscheständer', 'name_en' => 'Drying rack', 'category' => 'Waschen', 'icon' => 'hanger'],
            ['name' => 'Waschmittel', 'name_en' => 'Laundry detergent', 'category' => 'Waschen', 'icon' => 'bottle'],
            
            // Outdoor
            ['name' => 'Balkon', 'name_en' => 'Balcony', 'category' => 'Outdoor', 'icon' => 'door-open'],
            ['name' => 'Terrasse', 'name_en' => 'Patio', 'category' => 'Outdoor', 'icon' => 'umbrella-beach'],
            ['name' => 'Garten', 'name_en' => 'Garden', 'category' => 'Outdoor', 'icon' => 'tree'],
            ['name' => 'Grill', 'name_en' => 'BBQ grill', 'category' => 'Outdoor', 'icon' => 'fire'],
            ['name' => 'Pool', 'name_en' => 'Pool', 'category' => 'Outdoor', 'icon' => 'swimming-pool'],
            ['name' => 'Whirlpool', 'name_en' => 'Hot tub', 'category' => 'Outdoor', 'icon' => 'hot-tub'],
            ['name' => 'Sauna', 'name_en' => 'Sauna', 'category' => 'Outdoor', 'icon' => 'spa'],
            ['name' => 'Außenmöbel', 'name_en' => 'Outdoor furniture', 'category' => 'Outdoor', 'icon' => 'chair'],
            ['name' => 'Sonnenschirm', 'name_en' => 'Sun umbrella', 'category' => 'Outdoor', 'icon' => 'umbrella'],
            ['name' => 'Fahrräder', 'name_en' => 'Bicycles', 'category' => 'Outdoor', 'icon' => 'bicycle'],
            
            // Parken
            ['name' => 'Kostenloser Parkplatz', 'name_en' => 'Free parking', 'category' => 'Parken', 'icon' => 'car'],
            ['name' => 'Kostenpflichtiger Parkplatz', 'name_en' => 'Paid parking', 'category' => 'Parken', 'icon' => 'car'],
            ['name' => 'Garage', 'name_en' => 'Garage', 'category' => 'Parken', 'icon' => 'warehouse'],
            ['name' => 'Straßenparkplatz', 'name_en' => 'Street parking', 'category' => 'Parken', 'icon' => 'road'],
            ['name' => 'Ladegerät für Elektrofahrzeuge', 'name_en' => 'EV charger', 'category' => 'Parken', 'icon' => 'bolt'],
            
            // Sicherheit
            ['name' => 'Rauchmelder', 'name_en' => 'Smoke alarm', 'category' => 'Sicherheit', 'icon' => 'bell'],
            ['name' => 'Kohlenmonoxid-Melder', 'name_en' => 'Carbon monoxide alarm', 'category' => 'Sicherheit', 'icon' => 'bell'],
            ['name' => 'Erste-Hilfe-Set', 'name_en' => 'First aid kit', 'category' => 'Sicherheit', 'icon' => 'kit-medical'],
            ['name' => 'Feuerlöscher', 'name_en' => 'Fire extinguisher', 'category' => 'Sicherheit', 'icon' => 'fire-extinguisher'],
            ['name' => 'Safe', 'name_en' => 'Safe', 'category' => 'Sicherheit', 'icon' => 'vault'],
            ['name' => 'Schlüsselbox', 'name_en' => 'Lockbox', 'category' => 'Sicherheit', 'icon' => 'key'],
            
            // Familie
            ['name' => 'Kinderbett', 'name_en' => 'Crib', 'category' => 'Familie', 'icon' => 'baby'],
            ['name' => 'Hochstuhl', 'name_en' => 'High chair', 'category' => 'Familie', 'icon' => 'chair'],
            ['name' => 'Wickeltisch', 'name_en' => 'Changing table', 'category' => 'Familie', 'icon' => 'table'],
            ['name' => 'Kindersicherungen', 'name_en' => 'Baby safety gates', 'category' => 'Familie', 'icon' => 'shield'],
            ['name' => 'Kinderspielzeug', 'name_en' => 'Children\'s toys', 'category' => 'Familie', 'icon' => 'puzzle-piece'],
            ['name' => 'Kinderbücher', 'name_en' => 'Children\'s books', 'category' => 'Familie', 'icon' => 'book'],
            
            // Arbeit
            ['name' => 'Arbeitsplatz', 'name_en' => 'Dedicated workspace', 'category' => 'Arbeit', 'icon' => 'desk'],
            ['name' => 'Schreibtisch', 'name_en' => 'Desk', 'category' => 'Arbeit', 'icon' => 'desk'],
            ['name' => 'Bürostuhl', 'name_en' => 'Office chair', 'category' => 'Arbeit', 'icon' => 'chair'],
            
            // Barrierefreiheit
            ['name' => 'Stufenfreier Zugang', 'name_en' => 'Step-free access', 'category' => 'Barrierefreiheit', 'icon' => 'wheelchair'],
            ['name' => 'Aufzug', 'name_en' => 'Elevator', 'category' => 'Barrierefreiheit', 'icon' => 'elevator'],
            ['name' => 'Rollstuhlgerecht', 'name_en' => 'Wheelchair accessible', 'category' => 'Barrierefreiheit', 'icon' => 'wheelchair'],
            ['name' => 'Barrierefreies Bad', 'name_en' => 'Accessible bathroom', 'category' => 'Barrierefreiheit', 'icon' => 'wheelchair'],
            
            // Sonstiges
            ['name' => 'Selbst-Check-in', 'name_en' => 'Self check-in', 'category' => 'Sonstiges', 'icon' => 'key'],
            ['name' => 'Lange Aufenthalte erlaubt', 'name_en' => 'Long term stays allowed', 'category' => 'Sonstiges', 'icon' => 'calendar'],
            ['name' => 'Haustiere erlaubt', 'name_en' => 'Pets allowed', 'category' => 'Sonstiges', 'icon' => 'paw'],
            ['name' => 'Rauchen erlaubt', 'name_en' => 'Smoking allowed', 'category' => 'Sonstiges', 'icon' => 'smoking'],
            ['name' => 'Gepäckaufbewahrung', 'name_en' => 'Luggage storage', 'category' => 'Sonstiges', 'icon' => 'suitcase'],
            ['name' => 'Privateingang', 'name_en' => 'Private entrance', 'category' => 'Sonstiges', 'icon' => 'door-open'],
            ['name' => 'Reinigungsservice', 'name_en' => 'Cleaning service', 'category' => 'Sonstiges', 'icon' => 'broom'],
            ['name' => 'Concierge-Service', 'name_en' => 'Concierge', 'category' => 'Sonstiges', 'icon' => 'user-tie'],
        ];

        foreach ($amenities as $index => $amenity) {
            Amenity::updateOrCreate(
                ['name' => $amenity['name']],
                array_merge($amenity, ['sort_order' => $index])
            );
        }
    }
}
