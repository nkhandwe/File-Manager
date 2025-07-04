<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password page.
     */
    public function show(): Response
    {
        return Inertia::render('auth/confirm-password');
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! Auth::guard('web')->validate([
            'email' => $user->email,
            'password' => $request->password,
        ])) {
            // Audit failed password confirmation
            AuditLog::createEntry([
                'action' => 'PASSWORD_CONFIRM_FAILED',
                'resource_type' => 'User',
                'resource_id' => $user->id,
                'severity' => 'medium',
                'description' => "Failed password confirmation for user: {$user->name}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        // Audit successful password confirmation
        AuditLog::createEntry([
            'action' => 'PASSWORD_CONFIRMED',
            'resource_type' => 'User',
            'resource_id' => $user->id,
            'severity' => 'low',
            'description' => "Password confirmed for user: {$user->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $request->session()->put('auth.password_confirmed_at', time());

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
