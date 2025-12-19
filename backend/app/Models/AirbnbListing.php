<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AirbnbListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'airbnb_id',
        'url',
        'title',
        'description',
        'price',
        'currency',
        'location',
        'images',
        'amenities',
        'bedrooms',
        'bathrooms',
        'max_guests',
        'rating',
        'review_count',
        'availability',
        'sync_status',
        'property_id',
        'last_synced_at',
    ];

    protected $casts = [
        'images' => 'array',
        'amenities' => 'array',
        'availability' => 'array',
        'price' => 'decimal:2',
        'last_synced_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function scopePending($query)
    {
        return $query->where('sync_status', 'pending');
    }

    public function scopeSynced($query)
    {
        return $query->where('sync_status', 'synced');
    }

    public function needsSync(): bool
    {
        return $this->last_synced_at === null || 
               $this->last_synced_at->diffInHours(now()) > 24;
    }
}



