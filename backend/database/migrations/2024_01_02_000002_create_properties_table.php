<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title_de');
            $table->string('title_en');
            $table->text('description_de');
            $table->text('description_en');
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->string('city');
            $table->string('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('price_per_night', 10, 2);
            $table->integer('max_guests');
            $table->integer('bedrooms');
            $table->integer('bathrooms');
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('active')->default(true);
            $table->string('airbnb_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};




