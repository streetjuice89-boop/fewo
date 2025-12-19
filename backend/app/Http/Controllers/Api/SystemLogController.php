<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class SystemLogController extends Controller
{
    /**
     * List system logs
     */
    public function index(Request $request)
    {
        $query = SystemLog::with('user');

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', 'like', $request->action . '%');
        }

        // Filter by entity type
        if ($request->has('entityType')) {
            $query->where('entity_type', $request->entityType);
        }

        // Filter by user
        if ($request->has('userId')) {
            $query->where('user_id', $request->userId);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $page = $request->get('page', 1);
        $limit = min($request->get('limit', 50), 100);

        $total = $query->count();
        $logs = $query->latest()
                      ->skip(($page - 1) * $limit)
                      ->take($limit)
                      ->get();

        return response()->json([
            'data' => $logs->map(fn($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entityType' => $log->entity_type,
                'entityId' => $log->entity_id,
                'details' => $log->details,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'username' => $log->user->username,
                ] : null,
                'ipAddress' => $log->ip_address,
                'createdAt' => $log->created_at->toISOString(),
            ]),
            'meta' => [
                'total' => $total,
                'page' => (int) $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Get log statistics
     */
    public function statistics()
    {
        $today = SystemLog::whereDate('created_at', today())->count();
        $thisWeek = SystemLog::where('created_at', '>=', now()->startOfWeek())->count();
        $thisMonth = SystemLog::where('created_at', '>=', now()->startOfMonth())->count();

        $byAction = SystemLog::selectRaw('action, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(10)
            ->pluck('count', 'action');

        return response()->json([
            'today' => $today,
            'thisWeek' => $thisWeek,
            'thisMonth' => $thisMonth,
            'byAction' => $byAction,
        ]);
    }
}



