<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->enum('status', ['draft', 'online', 'offline'])->default('draft')->after('active');
        });
        
        // Update existing properties based on active flag
        DB::table('properties')->where('active', true)->update(['status' => 'online']);
        DB::table('properties')->where('active', false)->update(['status' => 'draft']);
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
