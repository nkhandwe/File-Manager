<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\Auditable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Audit Configuration
    protected $auditExclude = [
        'password',
        'remember_token',
        'email_verified_at',
    ];

    protected $auditSeverity = [
        'create' => 'medium',
        'update' => 'low',
        'delete' => 'high',
    ];

    // SCOPES
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('user_type', $type);
    }

    public function scopeAdmins($query)
    {
        return $query->where('user_type', 'Admin');
    }

    public function scopeClients($query)
    {
        return $query->where('user_type', 'Client');
    }

    public function scopeRegularUsers($query)
    {
        return $query->where('user_type', 'User');
    }

    // HELPER METHODS
    public function isAdmin(): bool
    {
        return $this->user_type === 'Admin';
    }

    public function isClient(): bool
    {
        return $this->user_type === 'Client';
    }

    public function isUser(): bool
    {
        return $this->user_type === 'User';
    }

    public function hasRole(string $role): bool
    {
        return $this->user_type === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->user_type, $roles);
    }

    public function activate(): void
    {
        $oldStatus = $this->is_active;
        $this->update(['is_active' => true]);

        // Audit status change
        $this->auditStatusChange($oldStatus, true);
    }

    public function deactivate(): void
    {
        $oldStatus = $this->is_active;
        $this->update(['is_active' => false]);

        // Audit status change
        $this->auditStatusChange($oldStatus, false);
    }

    public function toggleStatus(): void
    {
        $oldStatus = $this->is_active;
        $newStatus = !$this->is_active;
        $this->update(['is_active' => $newStatus]);

        // Audit status change
        $this->auditStatusChange($oldStatus, $newStatus);
    }

    // ACCESSORS
    public function getStatusBadgeAttribute()
    {
        return $this->is_active
            ? ['text' => 'Active', 'class' => 'success']
            : ['text' => 'Inactive', 'class' => 'danger'];
    }

    public function getRoleColorAttribute()
    {
        return match ($this->user_type) {
            'Admin' => 'red',
            'Client' => 'blue',
            'User' => 'green',
            default => 'gray',
        };
    }

    // RELATIONSHIPS
    public function dcInstallations()
    {
        return $this->hasMany(DCInstallation::class, 'created_by', 'id');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    // AUDIT METHODS

    /**
     * Get custom audit description
     */
    protected function getAuditDescription(string $action): string
    {
        return ucfirst($action) . " user: {$this->name} ({$this->email})";
    }

    /**
     * Override audit severity for admin users
     */
    protected function getAuditSeverity(string $action): string
    {
        // Admin user changes get higher severity
        if ($this->user_type === 'Admin') {
            return $action === 'delete' ? 'critical' : 'high';
        }

        return parent::getAuditSeverity($action);
    }

    /**
     * Check if user changes should be audited
     */
    protected function shouldAudit(string $action): bool
    {
        if (!parent::shouldAudit($action)) {
            return false;
        }

        // For updates, only audit important field changes
        if ($action === 'update') {
            $importantFields = [
                'name',
                'email',
                'user_type',
                'is_active',
            ];

            $changedFields = array_keys($this->getChanges());
            $importantChanges = array_intersect($changedFields, $importantFields);

            return !empty($importantChanges);
        }

        return true;
    }

    /**
     * Audit user status changes
     */
    public function auditStatusChange(bool $oldStatus, bool $newStatus): void
    {
        $status = $newStatus ? 'activated' : 'deactivated';

        AuditLog::createEntry([
            'action' => 'UPDATE',
            'resource_type' => 'User',
            'resource_id' => $this->id,
            'old_values' => ['is_active' => $oldStatus],
            'new_values' => ['is_active' => $newStatus],
            'severity' => 'medium',
            'description' => "User {$this->name} was {$status}",
        ]);
    }

    /**
     * Audit password changes
     */
    public function auditPasswordChange(): void
    {
        AuditLog::createEntry([
            'action' => 'UPDATE',
            'resource_type' => 'User',
            'resource_id' => $this->id,
            'severity' => 'medium',
            'description' => "Password changed for user: {$this->name}",
        ]);
    }

    /**
     * Audit role/type changes
     */
    public function auditRoleChange(string $oldRole, string $newRole): void
    {
        AuditLog::createEntry([
            'action' => 'UPDATE',
            'resource_type' => 'User',
            'resource_id' => $this->id,
            'old_values' => ['user_type' => $oldRole],
            'new_values' => ['user_type' => $newRole],
            'severity' => 'high',
            'description' => "User role changed from {$oldRole} to {$newRole} for: {$this->name}",
        ]);
    }

    /**
     * Audit login attempts
     */
    public function auditLogin(string $ipAddress = null, string $userAgent = null): void
    {
        AuditLog::createEntry([
            'action' => 'LOGIN',
            'resource_type' => 'User',
            'resource_id' => $this->id,
            'severity' => 'low',
            'description' => "User {$this->name} logged in successfully",
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Audit logout
     */
    public function auditLogout(): void
    {
        AuditLog::createEntry([
            'action' => 'LOGOUT',
            'resource_type' => 'User',
            'resource_id' => $this->id,
            'severity' => 'low',
            'description' => "User {$this->name} logged out",
        ]);
    }

    /**
     * Audit failed login attempts
     */
    public static function auditFailedLogin(string $email, string $ipAddress = null, string $userAgent = null): void
    {
        AuditLog::createEntry([
            'action' => 'LOGIN_FAILED',
            'resource_type' => 'User',
            'resource_id' => $email,
            'severity' => 'medium',
            'description' => "Failed login attempt for email: {$email}",
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }
}
