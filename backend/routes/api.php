<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\AirbnbController;
use App\Http\Controllers\Api\SystemLogController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Public Property Routes
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/featured', [PropertyController::class, 'featured']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);
Route::get('/properties/{id}/availability', [PropertyController::class, 'checkAvailability']);

// Public Country Routes
Route::get('/countries', [CountryController::class, 'index']);
Route::get('/countries/{id}', [CountryController::class, 'show']);

// Protected Routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Chat
    Route::get('/chat/sessions', [ChatController::class, 'sessions']);
    Route::post('/chat/sessions', [ChatController::class, 'createSession']);
    Route::get('/chat/sessions/{sessionId}/messages', [ChatController::class, 'messages']);
    Route::post('/chat/sessions/{sessionId}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chat/sessions/{sessionId}/close', [ChatController::class, 'closeSession']);

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        
        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/activity', [DashboardController::class, 'recentActivity']);
        Route::get('/dashboard/chart', [DashboardController::class, 'bookingChart']);
        Route::get('/dashboard/top-properties', [DashboardController::class, 'topProperties']);

        // Properties Management
        Route::post('/properties', [PropertyController::class, 'store']);
        Route::put('/properties/{id}', [PropertyController::class, 'update']);
        Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);

        // Countries Management
        Route::post('/countries', [CountryController::class, 'store']);
        Route::put('/countries/{id}', [CountryController::class, 'update']);
        Route::delete('/countries/{id}', [CountryController::class, 'destroy']);

        // Bookings Management
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

        // Users Management
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/statistics', [UserController::class, 'statistics']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::patch('/users/{id}/score', [UserController::class, 'updateScore']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Chat Management
        Route::post('/chat/sessions/{sessionId}/takeover', [ChatController::class, 'takeOver']);

        // Airbnb Management
        Route::get('/airbnb', [AirbnbController::class, 'index']);
        Route::get('/airbnb/{id}', [AirbnbController::class, 'show']);
        Route::post('/airbnb/grab', [AirbnbController::class, 'grab']);
        Route::post('/airbnb/{id}/sync', [AirbnbController::class, 'sync']);
        Route::post('/airbnb/{id}/link', [AirbnbController::class, 'link']);
        Route::post('/airbnb/{id}/unlink', [AirbnbController::class, 'unlink']);
        Route::post('/airbnb/{id}/create-property', [AirbnbController::class, 'createProperty']);
        Route::delete('/airbnb/{id}', [AirbnbController::class, 'destroy']);

        // System Logs
        Route::get('/logs', [SystemLogController::class, 'index']);
        Route::get('/logs/statistics', [SystemLogController::class, 'statistics']);
    });
});

