<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Services\ChatBotService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected ChatBotService $botService;

    public function __construct(ChatBotService $botService)
    {
        $this->botService = $botService;
    }

    /**
     * List chat sessions (Admin: all, User: own)
     */
    public function sessions(Request $request)
    {
        $user = $request->user();
        
        $query = ChatSession::with(['user', 'admin', 'messages' => function ($q) {
            $q->latest()->limit(1);
        }]);

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query->latest()->get()->map(fn($s) => [
            'id' => $s->id,
            'user' => $s->user ? [
                'id' => $s->user->id,
                'username' => $s->user->username,
                'fullName' => $s->user->full_name,
            ] : null,
            'admin' => $s->admin ? [
                'id' => $s->admin->id,
                'username' => $s->admin->username,
            ] : null,
            'status' => $s->status,
            'lastMessage' => $s->messages->first()?->content,
            'unreadCount' => $s->messages()->unread()->where('user_id', '!=', $user->id)->count(),
            'createdAt' => $s->created_at->toISOString(),
            'updatedAt' => $s->updated_at->toISOString(),
        ]);

        return response()->json(['data' => $sessions]);
    }

    /**
     * Create new chat session
     */
    public function createSession(Request $request)
    {
        $session = ChatSession::create([
            'user_id' => $request->user()->id,
            'status' => 'active',
        ]);

        // Send welcome message from bot
        $welcomeMessage = ChatMessage::create([
            'session_id' => $session->id,
            'content' => 'Willkommen beim VoyageNest Support! Wie kann ich Ihnen helfen?',
            'is_bot' => true,
        ]);

        return response()->json([
            'id' => $session->id,
            'status' => $session->status,
            'messages' => [[
                'id' => $welcomeMessage->id,
                'content' => $welcomeMessage->content,
                'isBot' => true,
                'createdAt' => $welcomeMessage->created_at->toISOString(),
            ]],
        ], 201);
    }

    /**
     * Get messages for a session
     */
    public function messages(Request $request, string $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        // Check access
        if (!$request->user()->isAdmin() && $session->user_id !== $request->user()->id) {
            abort(403, 'Keine Berechtigung');
        }

        // Mark messages as read
        $session->messages()
            ->where('user_id', '!=', $request->user()->id)
            ->update(['is_read' => true]);

        $messages = $session->messages()
            ->with('user')
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'content' => $m->content,
                'isBot' => $m->is_bot,
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'username' => $m->user->username,
                    'isAdmin' => $m->user->isAdmin(),
                ] : null,
                'createdAt' => $m->created_at->toISOString(),
            ]);

        return response()->json([
            'session' => [
                'id' => $session->id,
                'status' => $session->status,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, string $sessionId)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $session = ChatSession::findOrFail($sessionId);
        $user = $request->user();

        // Check access
        if (!$user->isAdmin() && $session->user_id !== $user->id) {
            abort(403, 'Keine Berechtigung');
        }

        // Create user message
        $message = ChatMessage::create([
            'session_id' => $session->id,
            'user_id' => $user->id,
            'content' => $request->content,
            'is_bot' => false,
        ]);

        $response = [
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'isBot' => false,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'isAdmin' => $user->isAdmin(),
                ],
                'createdAt' => $message->created_at->toISOString(),
            ],
        ];

        // If user is not admin and no admin assigned, get bot response
        if (!$user->isAdmin() && !$session->admin_id) {
            $botResponse = $this->botService->getResponse($request->content);
            
            $botMessage = ChatMessage::create([
                'session_id' => $session->id,
                'content' => $botResponse['message'],
                'is_bot' => true,
            ]);

            $response['botResponse'] = [
                'id' => $botMessage->id,
                'content' => $botMessage->content,
                'isBot' => true,
                'createdAt' => $botMessage->created_at->toISOString(),
            ];

            // If bot can't help, mark session as waiting for admin
            if ($botResponse['needsHuman']) {
                $session->update(['status' => 'waiting']);
                $response['sessionStatus'] = 'waiting';
            }
        }

        return response()->json($response);
    }

    /**
     * Admin takes over a chat session
     */
    public function takeOver(Request $request, string $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);
        
        $session->update([
            'admin_id' => $request->user()->id,
            'status' => 'active',
        ]);

        // Send system message
        ChatMessage::create([
            'session_id' => $session->id,
            'content' => 'Ein Mitarbeiter hat den Chat übernommen.',
            'is_bot' => true,
        ]);

        return response()->json([
            'id' => $session->id,
            'status' => 'active',
            'adminId' => $request->user()->id,
        ]);
    }

    /**
     * Close a chat session
     */
    public function closeSession(Request $request, string $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        $session->update(['status' => 'closed']);

        ChatMessage::create([
            'session_id' => $session->id,
            'content' => 'Der Chat wurde beendet. Vielen Dank!',
            'is_bot' => true,
        ]);

        return response()->json([
            'id' => $session->id,
            'status' => 'closed',
        ]);
    }
}



