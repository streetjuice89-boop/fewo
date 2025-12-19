<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('airbnb_listings', function (Blueprint $table) {
            $table->id();
            $table->string('airbnb_id')->unique();
            $table->string('url');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->string('location')->nullable();
            $table->json('images')->nullable();
            $table->json('amenities')->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->integer('max_guests')->nullable();
            $table->float('rating')->nullable();
            $table->integer('review_count')->default(0);
            $table->json('availability')->nullable();
            $table->enum('sync_status', ['pending', 'synced', 'error'])->default('pending');
            $table->foreignId('property_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('airbnb_listings');
    }
};




