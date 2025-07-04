<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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
        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function toggleStatus(): void
    {
        $this->update(['is_active' => !$this->is_active]);
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
}
