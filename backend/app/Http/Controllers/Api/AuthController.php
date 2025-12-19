<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login with username and password
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Die Anmeldedaten sind ungültig.'],
            ]);
        }

        // Revoke all previous tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        SystemLog::log('user.login', 'User', $user->id);

        return response()->json([
            'accessToken' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users|min:3|max:50',
            'email' => 'nullable|email|unique:users',
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        SystemLog::log('user.register', 'User', $user->id);

        return response()->json([
            'accessToken' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'role' => $user->role,
            ],
        ], 201);
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'phone' => $user->phone,
            'role' => $user->role,
            'customerScore' => $user->customer_score,
            'createdAt' => $user->created_at,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        SystemLog::log('user.logout', 'User', $request->user()->id);

        return response()->json(['message' => 'Erfolgreich abgemeldet']);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'firstName' => 'sometimes|string|max:100',
            'lastName' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update([
            'email' => $request->email ?? $user->email,
            'first_name' => $request->firstName ?? $user->first_name,
            'last_name' => $request->lastName ?? $user->last_name,
            'phone' => $request->phone ?? $user->phone,
        ]);

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'phone' => $user->phone,
            'role' => $user->role,
        ]);
    }
}




