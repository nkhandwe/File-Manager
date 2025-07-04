<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ClientController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public welcome page with form
Route::get('/', [HomeController::class, 'index'])->name('home');

// DC Installation routes
Route::prefix('dc-installations')->name('dc-installations.')->group(function () {
    // Public view route
    Route::get('/{installation}', [HomeController::class, 'show'])->name('show');

    // Shareable link route (requires login)
    Route::get('/shared/{token}', [HomeController::class, 'viewShared'])->name('shared');

    // Download file route (public access for viewing files)
    Route::get('/{installation}/download/{fileType}', [HomeController::class, 'downloadFile'])
        ->name('download')
        ->where('fileType', 'delivery_report_file|installation_report_file|belarc_report_file|back_side_photo_file|os_installation_photo_file|keyboard_photo_file|mouse_photo_file|screenshot_file|evidence_file');

    // Form submission route (anyone can submit)
    Route::post('/', [HomeController::class, 'store'])->name('store');

    // Protected routes (require authentication)
    Route::middleware('auth')->group(function () {
        // Routes accessible by all authenticated users
        Route::get('/api/search', [HomeController::class, 'search'])->name('api.search');

        // Routes for Admin and Client only
        Route::middleware(['role:Admin,Client'])->group(function () {
            Route::put('/{installation}', [HomeController::class, 'update'])->name('update');
            Route::get('/api/stats', [HomeController::class, 'getStats'])->name('api.stats');
            Route::get('/api/by-status', [HomeController::class, 'getInstallationsByStatus'])->name('api.by-status');
            Route::get('/api/export', [HomeController::class, 'exportInstallations'])->name('api.export');

            // Generate shareable link
            Route::post('/{installation}/share', [HomeController::class, 'generateShareableLink'])->name('generate-share');

            // File download routes for authenticated users
            Route::get('/{installation}/download-all', [ClientController::class, 'downloadInstallationFiles'])->name('download-all');
            Route::post('/download-bulk', [ClientController::class, 'downloadBulkFiles'])->name('download-bulk');
        });

        // Admin only routes
        Route::middleware(['role:Admin'])->group(function () {
            Route::delete('/{installation}', [HomeController::class, 'destroy'])->name('destroy');
            Route::get('/{installation}/admin-download-all', [AdminController::class, 'downloadInstallationFiles'])->name('admin-download-all');
        });
    });
});

// Regular User Dashboard (accessible by all authenticated users)
Route::get('/dashboard', [HomeController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Client Dashboard and Routes
Route::middleware(['auth', 'verified', 'role:Client,Admin'])->prefix('client')->name('client.')->group(function () {
    Route::get('/dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
    Route::get('/installations', [ClientController::class, 'installations'])->name('installations');
    Route::get('/reports', [ClientController::class, 'reports'])->name('reports');
    Route::get('/profile', [ClientController::class, 'profile'])->name('profile');

    // File management routes
    Route::get('/installations/{installation}/download/{fileType}', [ClientController::class, 'downloadFile'])
        ->name('download-file')
        ->where('fileType', 'delivery_report_file|installation_report_file|belarc_report_file|back_side_photo_file|os_installation_photo_file|keyboard_photo_file|mouse_photo_file|screenshot_file|evidence_file');

    Route::get('/installations/{installation}/download-all', [ClientController::class, 'downloadInstallationFiles'])
        ->name('download-installation-files');

    Route::post('/installations/download-bulk', [ClientController::class, 'downloadBulkFiles'])
        ->name('download-bulk-files');

    Route::get('/export', [ClientController::class, 'exportInstallations'])->name('export');
});

// Admin Dashboard and Routes (Admin only)
Route::middleware(['auth', 'verified', 'role:Admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    // Installation Management
    Route::get('/installations', [AdminController::class, 'installations'])->name('installations');
    Route::get('/installations/create', [AdminController::class, 'createInstallation'])->name('installations.create');
    Route::post('/installations', [AdminController::class, 'storeInstallation'])->name('installations.store');
    Route::get('/installations/{installation}/edit', [AdminController::class, 'editInstallation'])->name('installations.edit');
    Route::put('/installations/{installation}', [AdminController::class, 'updateInstallation'])->name('installations.update');
    Route::delete('/installations/{installation}', [AdminController::class, 'deleteInstallation'])->name('installations.delete');

    // Admin file downloads
    Route::get('/installations/{installation}/download-all', [AdminController::class, 'downloadInstallationFiles'])
        ->name('download-installation-files');

    // User Management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/users/create', [AdminController::class, 'createUser'])->name('users.create');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::get('/users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
    Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.delete');
    Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');

    // Reports and Analytics
    Route::get('/reports', [AdminController::class, 'reports'])->name('reports');
    Route::get('/reports/export', [AdminController::class, 'exportReports'])->name('reports.export');
    Route::get('/analytics', [AdminController::class, 'analytics'])->name('analytics');

    // System Settings
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::put('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');

    // Logs and Audit
    Route::get('/logs', [AdminController::class, 'logs'])->name('logs');
    Route::get('/audit', [AdminController::class, 'audit'])->name('audit');
    Route::get('/audit/export', [AdminController::class, 'exportAudit'])->name('audit.export');
    Route::delete('/audit/clear', [AdminController::class, 'clearAuditLogs'])->name('audit.clear');
    Route::get('/audit/stats', [AdminController::class, 'getAuditStats'])->name('audit.stats');
});

require __DIR__ . '/auth.php';
