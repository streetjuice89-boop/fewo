<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List all users (Admin only)
     */
    public function index(Request $request)
    {
        $query = User::withCount('bookings');

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $page = $request->get('page', 1);
        $limit = min($request->get('limit', 20), 50);

        $total = $query->count();
        $users = $query->skip(($page - 1) * $limit)
                       ->take($limit)
                       ->get();

        return response()->json([
            'data' => $users->map(fn($u) => $this->formatUser($u)),
            'meta' => [
                'total' => $total,
                'page' => (int) $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Get single user (Admin only)
     */
    public function show(string $id)
    {
        $user = User::withCount('bookings')->findOrFail($id);
        
        return response()->json($this->formatUser($user, true));
    }

    /**
     * Update user (Admin only)
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'firstName' => 'sometimes|string|max:100',
            'lastName' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:20',
            'role' => 'sometimes|in:admin,customer',
            'customerScore' => 'sometimes|integer|min:0',
        ]);

        $user->update([
            'email' => $request->email ?? $user->email,
            'first_name' => $request->firstName ?? $user->first_name,
            'last_name' => $request->lastName ?? $user->last_name,
            'phone' => $request->phone ?? $user->phone,
            'role' => $request->role ?? $user->role,
            'customer_score' => $request->customerScore ?? $user->customer_score,
        ]);

        SystemLog::log('user.update', 'User', $user->id);

        return response()->json($this->formatUser($user->fresh()));
    }

    /**
     * Update user score (Admin only)
     */
    public function updateScore(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'score' => 'required|integer',
        ]);

        $oldScore = $user->customer_score;
        $user->update(['customer_score' => $request->score]);

        SystemLog::log('user.score_update', 'User', $user->id, [
            'from' => $oldScore,
            'to' => $request->score,
        ]);

        return response()->json($this->formatUser($user->fresh()));
    }

    /**
     * Delete user (Admin only)
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Du kannst dich nicht selbst löschen'], 422);
        }

        SystemLog::log('user.delete', 'User', $user->id, [
            'username' => $user->username,
        ]);

        $user->delete();

        return response()->json(['message' => 'Benutzer gelöscht']);
    }

    /**
     * Get user statistics (Admin only)
     */
    public function statistics()
    {
        $totalUsers = User::count();
        $customers = User::where('role', 'customer')->count();
        $admins = User::where('role', 'admin')->count();
        $newThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
        $avgScore = User::where('role', 'customer')->avg('customer_score') ?? 0;

        return response()->json([
            'total' => $totalUsers,
            'customers' => $customers,
            'admins' => $admins,
            'newThisMonth' => $newThisMonth,
            'averageScore' => round($avgScore, 1),
        ]);
    }

    /**
     * Format user for response
     */
    private function formatUser(User $user, bool $detailed = false): array
    {
        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'phone' => $user->phone,
            'role' => $user->role,
            'customerScore' => $user->customer_score,
            'bookingsCount' => $user->bookings_count ?? 0,
            'createdAt' => $user->created_at->toISOString(),
        ];

        if ($detailed) {
            $data['bookings'] = $user->bookings()
                ->with('property')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($b) => [
                    'id' => $b->id,
                    'property' => $b->property->title_de ?? null,
                    'checkIn' => $b->check_in->format('Y-m-d'),
                    'status' => $b->status,
                ]);
        }

        return $data;
    }
}



