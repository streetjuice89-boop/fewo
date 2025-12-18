<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use App\Models\ChatSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        // Basic counts
        $totalProperties = Property::count();
        $activeProperties = Property::active()->count();
        $totalBookings = Booking::count();
        $totalCustomers = User::where('role', 'customer')->count();

        // Booking stats
        $pendingBookings = Booking::pending()->count();
        $confirmedBookings = Booking::confirmed()->count();
        $upcomingBookings = Booking::confirmed()->upcoming()->count();

        // Revenue stats
        $totalRevenue = Booking::where('status', 'completed')->sum('total_price');
        $monthlyRevenue = Booking::where('status', 'completed')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total_price');

        // Chat stats
        $activeChats = ChatSession::active()->count();
        $waitingChats = ChatSession::waiting()->count();

        return response()->json([
            'properties' => [
                'total' => $totalProperties,
                'active' => $activeProperties,
            ],
            'bookings' => [
                'total' => $totalBookings,
                'pending' => $pendingBookings,
                'confirmed' => $confirmedBookings,
                'upcoming' => $upcomingBookings,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'newThisMonth' => User::where('role', 'customer')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count(),
            ],
            'revenue' => [
                'total' => (float) $totalRevenue,
                'monthly' => (float) $monthlyRevenue,
            ],
            'chat' => [
                'active' => $activeChats,
                'waiting' => $waitingChats,
            ],
        ]);
    }

    /**
     * Get recent activity
     */
    public function recentActivity()
    {
        $recentBookings = Booking::with(['property', 'user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'type' => 'booking',
                'id' => $b->id,
                'title' => "Neue Buchung: {$b->property->title_de}",
                'user' => $b->user->full_name,
                'status' => $b->status,
                'date' => $b->created_at->toISOString(),
            ]);

        $recentUsers = User::where('role', 'customer')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($u) => [
                'type' => 'user',
                'id' => $u->id,
                'title' => "Neuer Kunde: {$u->full_name}",
                'user' => $u->username,
                'date' => $u->created_at->toISOString(),
            ]);

        $activities = $recentBookings->merge($recentUsers)
            ->sortByDesc('date')
            ->take(10)
            ->values();

        return response()->json(['data' => $activities]);
    }

    /**
     * Get booking chart data
     */
    public function bookingChart(Request $request)
    {
        $days = min($request->get('days', 30), 90);
        $startDate = now()->subDays($days)->startOfDay();

        $bookings = Booking::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill in missing dates
        $data = [];
        $current = $startDate->copy();
        while ($current <= now()) {
            $dateStr = $current->format('Y-m-d');
            $found = $bookings->firstWhere('date', $dateStr);
            
            $data[] = [
                'date' => $dateStr,
                'bookings' => $found ? $found->count : 0,
                'revenue' => $found ? (float) $found->revenue : 0,
            ];
            
            $current->addDay();
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Get top properties
     */
    public function topProperties()
    {
        $properties = Property::withCount(['bookings' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }])
            ->withSum(['bookings as revenue' => function ($q) {
                $q->where('status', 'completed');
            }], 'total_price')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'title' => $p->title_de,
                'city' => $p->city,
                'bookings' => $p->bookings_count,
                'revenue' => (float) ($p->revenue ?? 0),
                'image' => $p->images[0] ?? null,
            ]);

        return response()->json(['data' => $properties]);
    }
}

