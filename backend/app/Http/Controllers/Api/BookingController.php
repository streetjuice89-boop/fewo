<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * List bookings (filtered by user or all for admin)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Booking::with(['property.country', 'user']);

        // Non-admin users can only see their own bookings
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by property
        if ($request->has('propertyId')) {
            $query->where('property_id', $request->propertyId);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('check_in', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('check_out', '<=', $request->to);
        }

        $page = $request->get('page', 1);
        $limit = min($request->get('limit', 20), 50);

        $total = $query->count();
        $bookings = $query->orderBy('created_at', 'desc')
                         ->skip(($page - 1) * $limit)
                         ->take($limit)
                         ->get();

        return response()->json([
            'data' => $bookings->map(fn($b) => $this->formatBooking($b)),
            'meta' => [
                'total' => $total,
                'page' => (int) $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Get single booking
     */
    public function show(Request $request, string $id)
    {
        $booking = Booking::with(['property.country', 'user'])->findOrFail($id);

        // Check access
        if (!$request->user()->isAdmin() && $booking->user_id !== $request->user()->id) {
            abort(403, 'Keine Berechtigung');
        }

        return response()->json($this->formatBooking($booking));
    }

    /**
     * Create a new booking
     */
    public function store(Request $request)
    {
        $request->validate([
            'propertyId' => 'required|exists:properties,id',
            'checkIn' => 'required|date|after_or_equal:today',
            'checkOut' => 'required|date|after:checkIn',
            'guests' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $property = Property::findOrFail($request->propertyId);

        // Check guest limit
        if ($request->guests > $property->max_guests) {
            return response()->json([
                'message' => "Maximal {$property->max_guests} Gäste erlaubt",
            ], 422);
        }

        // Check availability
        if (!$property->isAvailable($request->checkIn, $request->checkOut)) {
            return response()->json([
                'message' => 'Die Unterkunft ist für diesen Zeitraum nicht verfügbar',
            ], 422);
        }

        // Calculate total price
        $checkIn = \Carbon\Carbon::parse($request->checkIn);
        $checkOut = \Carbon\Carbon::parse($request->checkOut);
        $nights = $checkIn->diffInDays($checkOut);
        $totalPrice = $nights * $property->price_per_night;

        $booking = Booking::create([
            'property_id' => $request->propertyId,
            'user_id' => $request->user()->id,
            'check_in' => $request->checkIn,
            'check_out' => $request->checkOut,
            'guests' => $request->guests,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        SystemLog::log('booking.create', 'Booking', $booking->id, [
            'property' => $property->title_de,
            'totalPrice' => $totalPrice,
        ]);

        return response()->json($this->formatBooking($booking->load(['property.country', 'user'])), 201);
    }

    /**
     * Update booking status (Admin only)
     */
    public function updateStatus(Request $request, string $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $oldStatus = $booking->status;
        $booking->update(['status' => $request->status]);

        SystemLog::log('booking.status_change', 'Booking', $booking->id, [
            'from' => $oldStatus,
            'to' => $request->status,
        ]);

        // Update customer score on completion
        if ($request->status === 'completed' && $oldStatus !== 'completed') {
            $booking->user->increment('customer_score', 10);
        }

        return response()->json($this->formatBooking($booking->fresh()->load(['property.country', 'user'])));
    }

    /**
     * Cancel booking
     */
    public function cancel(Request $request, string $id)
    {
        $booking = Booking::findOrFail($id);

        // Check access
        if (!$request->user()->isAdmin() && $booking->user_id !== $request->user()->id) {
            abort(403, 'Keine Berechtigung');
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Buchung ist bereits storniert'], 422);
        }

        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Abgeschlossene Buchungen können nicht storniert werden'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        SystemLog::log('booking.cancel', 'Booking', $booking->id);

        return response()->json($this->formatBooking($booking->fresh()->load(['property.country', 'user'])));
    }

    /**
     * Format booking for response
     */
    private function formatBooking(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'property' => $booking->property ? [
                'id' => $booking->property->id,
                'titleDe' => $booking->property->title_de,
                'titleEn' => $booking->property->title_en,
                'city' => $booking->property->city,
                'country' => $booking->property->country ? [
                    'nameDe' => $booking->property->country->name_de,
                    'nameEn' => $booking->property->country->name_en,
                ] : null,
                'images' => $booking->property->images ?? [],
            ] : null,
            'user' => $booking->user ? [
                'id' => $booking->user->id,
                'username' => $booking->user->username,
                'firstName' => $booking->user->first_name,
                'lastName' => $booking->user->last_name,
                'email' => $booking->user->email,
            ] : null,
            'checkIn' => $booking->check_in->format('Y-m-d'),
            'checkOut' => $booking->check_out->format('Y-m-d'),
            'nights' => $booking->nights,
            'guests' => $booking->guests,
            'totalPrice' => (float) $booking->total_price,
            'status' => $booking->status,
            'notes' => $booking->notes,
            'createdAt' => $booking->created_at->toISOString(),
        ];
    }
}

