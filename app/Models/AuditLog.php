<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'user_type',
        'action',
        'resource_type',
        'resource_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'url',
        'method',
        'severity',
        'description',
        'metadata',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by action
     */
    public function scopeByAction($query, $action)
    {
        if ($action && $action !== 'all') {
            return $query->where('action', $action);
        }
        return $query;
    }

    /**
     * Scope to filter by resource type
     */
    public function scopeByResource($query, $resource)
    {
        if ($resource && $resource !== 'all') {
            return $query->where('resource_type', $resource);
        }
        return $query;
    }

    /**
     * Scope to filter by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        if ($severity && $severity !== 'all') {
            return $query->where('severity', $severity);
        }
        return $query;
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, $userId)
    {
        if ($userId && $userId !== 'all') {
            return $query->where('user_id', $userId);
        }
        return $query;
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $dateFrom, $dateTo)
    {
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }
        return $query;
    }

    /**
     * Scope to search in description and resource_id
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('resource_id', 'like', "%{$search}%")
                    ->orWhere('user_name', 'like', "%{$search}%")
                    ->orWhere('user_email', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Create audit log entry
     */
    public static function createEntry(array $data): self
    {
        $user = Auth::user();
        $request = request();

        return self::create(array_merge([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'user_type' => $user?->user_type,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'url' => $request?->fullUrl(),
            'method' => $request?->method(),
            'severity' => 'low',
        ], $data));
    }

    /**
     * Log a create action
     */
    public static function logCreate(string $resourceType, $resourceId, array $newValues, string $description = null, string $severity = 'low'): self
    {
        return self::createEntry([
            'action' => 'CREATE',
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'new_values' => $newValues,
            'severity' => $severity,
            'description' => $description ?: "Created {$resourceType} #{$resourceId}",
        ]);
    }

    /**
     * Log an update action
     */
    public static function logUpdate(string $resourceType, $resourceId, array $oldValues, array $newValues, string $description = null, string $severity = 'low'): self
    {
        return self::createEntry([
            'action' => 'UPDATE',
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'severity' => $severity,
            'description' => $description ?: "Updated {$resourceType} #{$resourceId}",
        ]);
    }

    /**
     * Log a delete action
     */
    public static function logDelete(string $resourceType, $resourceId, array $oldValues, string $description = null, string $severity = 'high'): self
    {
        return self::createEntry([
            'action' => 'DELETE',
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'old_values' => $oldValues,
            'severity' => $severity,
            'description' => $description ?: "Deleted {$resourceType} #{$resourceId}",
        ]);
    }

    /**
     * Log a view action
     */
    public static function logView(string $resourceType, $resourceId, string $description = null): self
    {
        return self::createEntry([
            'action' => 'VIEW',
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'severity' => 'low',
            'description' => $description ?: "Viewed {$resourceType} #{$resourceId}",
        ]);
    }

    /**
     * Log a download action
     */
    public static function logDownload(string $resourceType, $resourceId, string $description = null): self
    {
        return self::createEntry([
            'action' => 'DOWNLOAD',
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'severity' => 'medium',
            'description' => $description ?: "Downloaded files for {$resourceType} #{$resourceId}",
        ]);
    }

    /**
     * Log a login action
     */
    public static function logLogin(string $description = null): self
    {
        return self::createEntry([
            'action' => 'LOGIN',
            'resource_type' => 'User',
            'resource_id' => Auth::id(),
            'severity' => 'low',
            'description' => $description ?: 'User logged in',
        ]);
    }

    /**
     * Log a logout action
     */
    public static function logLogout(string $description = null): self
    {
        return self::createEntry([
            'action' => 'LOGOUT',
            'resource_type' => 'User',
            'resource_id' => Auth::id(),
            'severity' => 'low',
            'description' => $description ?: 'User logged out',
        ]);
    }
}
