<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            $request->authenticate();

            $request->session()->regenerate();

            // Get the authenticated user
            $user = Auth::user();

            // Check if user is active
            if (!$user->is_active) {
                // Audit failed login due to inactive account
                AuditLog::createEntry([
                    'action' => 'LOGIN_FAILED',
                    'resource_type' => 'User',
                    'resource_id' => $user->id,
                    'severity' => 'medium',
                    'description' => "Login attempt blocked - account inactive: {$user->name} ({$user->email})",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                Auth::logout();
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been deactivated. Please contact administrator.',
                ]);
            }

            // Audit successful login
            $user->auditLogin($request->ip(), $request->userAgent());

            // Redirect based on user type
            $redirectRoute = $this->getRedirectRouteByUserType($user->user_type);

            return redirect()->intended($redirectRoute);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Audit failed login attempt
            $email = $request->input('email');
            if ($email) {
                User::auditFailedLogin($email, $request->ip(), $request->userAgent());
            }
            
            throw $e;
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Audit logout before actually logging out
        if ($user) {
            $user->auditLogout();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Get redirect route based on user type
     */
    private function getRedirectRouteByUserType(string $userType): string
    {
        return match ($userType) {
            'Admin' => route('admin.dashboard'),
            'Client' => route('client.dashboard'),
            'User' => route('dashboard'),
            default => route('dashboard'),
        };
    }
}

// ConfirmablePasswordController with audit logging
