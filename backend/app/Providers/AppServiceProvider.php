<?php

namespace App\Providers;

use App\Services\ChatBotService;
use App\Services\AirbnbGrabberService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ChatBotService::class, function ($app) {
            return new ChatBotService();
        });

        $this->app->singleton(AirbnbGrabberService::class, function ($app) {
            return new AirbnbGrabberService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
