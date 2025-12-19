<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_de',
        'title_en',
        'description_de',
        'description_en',
        'country_id',
        'city',
        'address',
        'latitude',
        'longitude',
        'price_per_night',
        'max_guests',
        'bedrooms',
        'bathrooms',
        'amenities',
        'images',
        'featured',
        'active',
        'status',
        'airbnb_id',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'featured' => 'boolean',
        'active' => 'boolean',
        'price_per_night' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function airbnbListing()
    {
        return $this->hasOne(AirbnbListing::class);
    }

    public function getTitle(string $locale = 'de'): string
    {
        return $locale === 'en' ? $this->title_en : $this->title_de;
    }

    public function getDescription(string $locale = 'de'): string
    {
        return $locale === 'en' ? $this->description_en : $this->description_de;
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function isAvailable(string $checkIn, string $checkOut): bool
    {
        return !$this->bookings()
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in', '<=', $checkIn)
                          ->where('check_out', '>=', $checkOut);
                    });
            })->exists();
    }
}




