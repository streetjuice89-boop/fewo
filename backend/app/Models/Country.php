<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_de',
        'name_en',
        'code',
        'image',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function getName(string $locale = 'de'): string
    {
        return $locale === 'en' ? $this->name_en : $this->name_de;
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}



