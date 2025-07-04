<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    /**
     * Boot the auditable trait for a model.
     */
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->auditCreate();
        });

        static::updated(function ($model) {
            $model->auditUpdate();
        });

        static::deleted(function ($model) {
            $model->auditDelete();
        });
    }

    /**
     * Log creation of model
     */
    protected function auditCreate()
    {
        if (!$this->shouldAudit('create')) {
            return;
        }

        AuditLog::logCreate(
            $this->getResourceType(),
            $this->getAuditIdentifier(),
            $this->getAuditableAttributes(),
            $this->getAuditDescription('created'),
            $this->getAuditSeverity('create')
        );
    }

    /**
     * Log update of model
     */
    protected function auditUpdate()
    {
        if (!$this->shouldAudit('update')) {
            return;
        }

        $changedAttributes = $this->getChangedAuditableAttributes();

        if (empty($changedAttributes['old']) && empty($changedAttributes['new'])) {
            return; // No auditable changes
        }

        AuditLog::logUpdate(
            $this->getResourceType(),
            $this->getAuditIdentifier(),
            $changedAttributes['old'],
            $changedAttributes['new'],
            $this->getAuditDescription('updated'),
            $this->getAuditSeverity('update')
        );
    }

    /**
     * Log deletion of model
     */
    protected function auditDelete()
    {
        if (!$this->shouldAudit('delete')) {
            return;
        }

        AuditLog::logDelete(
            $this->getResourceType(),
            $this->getAuditIdentifier(),
            $this->getAuditableAttributes(),
            $this->getAuditDescription('deleted'),
            $this->getAuditSeverity('delete')
        );
    }

    /**
     * Get the resource type for audit logging
     */
    protected function getResourceType(): string
    {
        return class_basename($this);
    }

    /**
     * Get the identifier for audit logging
     */
    protected function getAuditIdentifier(): string
    {
        // Check if model has sr_no field (like DCInstallation)
        if (isset($this->attributes['sr_no'])) {
            return $this->attributes['sr_no'];
        }

        return (string) $this->getKey();
    }

    /**
     * Get auditable attributes
     */
    protected function getAuditableAttributes(): array
    {
        $attributes = $this->getAttributes();

        // Remove sensitive or unnecessary fields
        $excluded = array_merge(
            ['id', 'created_at', 'updated_at', 'deleted_at'],
            $this->getAuditExclude()
        );

        return array_diff_key($attributes, array_flip($excluded));
    }

    /**
     * Get changed auditable attributes
     */
    protected function getChangedAuditableAttributes(): array
    {
        $changes = $this->getChanges();
        $original = $this->getOriginal();

        $excluded = array_merge(
            ['id', 'created_at', 'updated_at', 'deleted_at'],
            $this->getAuditExclude()
        );

        $auditableChanges = array_diff_key($changes, array_flip($excluded));
        $auditableOriginal = array_intersect_key($original, $auditableChanges);

        return [
            'old' => $auditableOriginal,
            'new' => $auditableChanges,
        ];
    }

    /**
     * Get fields to exclude from audit
     */
    protected function getAuditExclude(): array
    {
        return property_exists($this, 'auditExclude') ? $this->auditExclude : [];
    }

    /**
     * Check if action should be audited
     */
    protected function shouldAudit(string $action): bool
    {
        if (!Auth::check()) {
            return false; // Don't audit system actions
        }

        $auditActions = property_exists($this, 'auditActions')
            ? $this->auditActions
            : ['create', 'update', 'delete'];

        return in_array($action, $auditActions);
    }

    /**
     * Get audit description
     */
    protected function getAuditDescription(string $action): string
    {
        $resourceType = $this->getResourceType();
        $identifier = $this->getAuditIdentifier();

        return ucfirst($action) . " {$resourceType} #{$identifier}";
    }

    /**
     * Get audit severity based on action
     */
    protected function getAuditSeverity(string $action): string
    {
        $severityMap = property_exists($this, 'auditSeverity')
            ? $this->auditSeverity
            : [
                'create' => 'low',
                'update' => 'low',
                'delete' => 'high',
            ];

        return $severityMap[$action] ?? 'low';
    }

    /**
     * Manually log view action
     */
    public function auditView(string $description = null): void
    {
        if (!Auth::check()) {
            return;
        }

        AuditLog::logView(
            $this->getResourceType(),
            $this->getAuditIdentifier(),
            $description ?: $this->getAuditDescription('viewed')
        );
    }

    /**
     * Manually log download action
     */
    public function auditDownload(string $description = null): void
    {
        if (!Auth::check()) {
            return;
        }

        AuditLog::logDownload(
            $this->getResourceType(),
            $this->getAuditIdentifier(),
            $description ?: $this->getAuditDescription('downloaded')
        );
    }
}
