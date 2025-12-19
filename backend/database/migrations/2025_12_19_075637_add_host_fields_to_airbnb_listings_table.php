<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('airbnb_listings', function (Blueprint $table) {
            $table->string('property_type')->nullable()->after('review_count');
            $table->string('host_name')->nullable()->after('property_type');
            $table->boolean('host_is_superhost')->default(false)->after('host_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('airbnb_listings', function (Blueprint $table) {
            $table->dropColumn(['property_type', 'host_name', 'host_is_superhost']);
        });
    }
};
