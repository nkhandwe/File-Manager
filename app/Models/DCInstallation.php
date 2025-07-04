<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use App\Traits\Auditable;

class DCInstallation extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $table = 'dc_installations';

    protected $fillable = [
        // Basic Information
        'sr_no',
        'region_division',
        'location_address',
        'district',
        'tahsil',
        'pin_code',
        'receiver_name',
        'contact_no',
        'dc_ir_no',

        // Dates
        'dispatch_date',
        'delivery_date',
        'installation_date',

        // Delivery Details
        'total_boxes',
        'courier_docket_no',
        'representative_name',

        // Equipment Details
        'aio_hp_serial',
        'keyboard_serial',
        'mouse_serial',
        'ups_serial',
        'antivirus',
        'breakage_notes',

        // Installation Details
        'ir_receiver_name',
        'ir_receiver_designation',
        'entity_vendor_name',
        'vendor_contact_number',
        'charges',
        'remarks',

        // Status Fields
        'delivery_status',
        'installation_status',

        // Document Status
        'soft_copy_dc',
        'soft_copy_ir',
        'original_pod_received',
        'original_dc_received',
        'ir_original_copy_received',

        // Photo/Evidence Status
        'back_side_photo_taken',
        'os_installation_photo_taken',
        'belarc_report_generated',

        // Updated Equipment Details
        'hp_440_g9_serial',
        'hp_keyboard_serial',
        'hp_mouse_serial',
        'updated_antivirus',
        'updated_breakage_notes',

        // Updated Installation Details
        'updated_ir_receiver_name',
        'updated_ir_receiver_designation',
        'updated_installation_date',
        'updated_remarks',
        'hostname',
        'updated_entity_vendor',
        'updated_contact_number',

        // File Upload Fields
        'delivery_report_file',
        'installation_report_file',
        'belarc_report_file',
        'back_side_photo_file',
        'os_installation_photo_file',
        'keyboard_photo_file',
        'mouse_photo_file',
        'screenshot_file',
        'evidence_file',
        'additional_documents',

        // Priority and Assignment
        'priority',
        'assigned_technician',
        'internal_notes',

        // Tracking
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'dispatch_date' => 'date',
        'delivery_date' => 'date',
        'installation_date' => 'date',
        'updated_installation_date' => 'date',
        'soft_copy_dc' => 'boolean',
        'soft_copy_ir' => 'boolean',
        'original_pod_received' => 'boolean',
        'original_dc_received' => 'boolean',
        'ir_original_copy_received' => 'boolean',
        'back_side_photo_taken' => 'boolean',
        'os_installation_photo_taken' => 'boolean',
        'belarc_report_generated' => 'boolean',
        'is_active' => 'boolean',
        'charges' => 'decimal:2',
        'additional_documents' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Audit Configuration
    protected $auditExclude = [
        'created_by',
        'updated_by',
    ];

    protected $auditSeverity = [
        'create' => 'low',
        'update' => 'low',
        'delete' => 'high',
    ];

    // SCOPES FOR REPORT FILTRATION
    public function scopeDelivered($query)
    {
        return $query->where('delivery_status', 'Delivered');
    }

    public function scopePendingDelivery($query)
    {
        return $query->where('delivery_status', 'Pending');
    }

    public function scopeInTransit($query)
    {
        return $query->where('delivery_status', 'In Transit');
    }

    public function scopeInstalled($query)
    {
        return $query->where('installation_status', 'Installed');
    }

    public function scopePendingInstallation($query)
    {
        return $query->where('installation_status', 'Pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('installation_status', 'In Progress');
    }

    public function scopeByRegion($query, $region)
    {
        return $query->where('region_division', 'like', '%' . $region . '%');
    }

    public function scopeByDistrict($query, $district)
    {
        return $query->where('district', 'like', '%' . $district . '%');
    }

    public function scopeByTahsil($query, $tahsil)
    {
        return $query->where('tahsil', 'like', '%' . $tahsil . '%');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeWithFiles($query)
    {
        return $query->where(function ($q) {
            $q->whereNotNull('delivery_report_file')
                ->orWhereNotNull('installation_report_file')
                ->orWhereNotNull('belarc_report_file')
                ->orWhereNotNull('back_side_photo_file')
                ->orWhereNotNull('os_installation_photo_file')
                ->orWhereNotNull('keyboard_photo_file')
                ->orWhereNotNull('mouse_photo_file')
                ->orWhereNotNull('screenshot_file')
                ->orWhereNotNull('evidence_file');
        });
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', 'High');
    }

    public function scopeMediumPriority($query)
    {
        return $query->where('priority', 'Medium');
    }

    public function scopeLowPriority($query)
    {
        return $query->where('priority', 'Low');
    }

    public function scopeOverdue($query)
    {
        return $query->where('installation_status', 'Pending')
            ->where('delivery_date', '<=', now()->subDays(7));
    }

    public function scopeCompletedDocuments($query)
    {
        return $query->where('soft_copy_dc', true)
            ->where('soft_copy_ir', true)
            ->where('original_pod_received', true);
    }

    public function scopeByTechnician($query, $technician)
    {
        return $query->where('assigned_technician', 'like', '%' . $technician . '%');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeByDeliveryDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('delivery_date', [$startDate, $endDate]);
    }

    public function scopeByInstallationDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('installation_date', [$startDate, $endDate]);
    }

    public function scopeWithAllDocuments($query)
    {
        return $query->where('soft_copy_dc', true)
            ->where('soft_copy_ir', true)
            ->where('original_pod_received', true)
            ->where('original_dc_received', true)
            ->where('ir_original_copy_received', true);
    }

    public function scopeWithAllPhotos($query)
    {
        return $query->where('back_side_photo_taken', true)
            ->where('os_installation_photo_taken', true)
            ->where('belarc_report_generated', true);
    }

    public function scopeCompleted($query)
    {
        return $query->where('delivery_status', 'Delivered')
            ->where('installation_status', 'Installed');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // ACCESSORS
    public function getDeliveryReportUrlAttribute()
    {
        return $this->delivery_report_file ? Storage::url($this->delivery_report_file) : null;
    }

    public function getInstallationReportUrlAttribute()
    {
        return $this->installation_report_file ? Storage::url($this->installation_report_file) : null;
    }

    public function getBelarcReportUrlAttribute()
    {
        return $this->belarc_report_file ? Storage::url($this->belarc_report_file) : null;
    }

    public function getBackSidePhotoUrlAttribute()
    {
        return $this->back_side_photo_file ? Storage::url($this->back_side_photo_file) : null;
    }

    public function getOsInstallationPhotoUrlAttribute()
    {
        return $this->os_installation_photo_file ? Storage::url($this->os_installation_photo_file) : null;
    }

    public function getKeyboardPhotoUrlAttribute()
    {
        return $this->keyboard_photo_file ? Storage::url($this->keyboard_photo_file) : null;
    }

    public function getMousePhotoUrlAttribute()
    {
        return $this->mouse_photo_file ? Storage::url($this->mouse_photo_file) : null;
    }

    public function getScreenshotUrlAttribute()
    {
        return $this->screenshot_file ? Storage::url($this->screenshot_file) : null;
    }

    public function getEvidenceFileUrlAttribute()
    {
        return $this->evidence_file ? Storage::url($this->evidence_file) : null;
    }

    public function getStatusBadgeAttribute()
    {
        $delivery = $this->delivery_status;
        $installation = $this->installation_status;

        if ($delivery === 'Delivered' && $installation === 'Installed') {
            return ['text' => 'Completed', 'class' => 'success'];
        } elseif ($delivery === 'Delivered' && $installation === 'Pending') {
            return ['text' => 'Ready for Installation', 'class' => 'warning'];
        } elseif ($delivery === 'Pending') {
            return ['text' => 'Pending Delivery', 'class' => 'danger'];
        } elseif ($delivery === 'In Transit') {
            return ['text' => 'In Transit', 'class' => 'info'];
        } elseif ($installation === 'In Progress') {
            return ['text' => 'Installation in Progress', 'class' => 'info'];
        }

        return ['text' => 'Unknown Status', 'class' => 'secondary'];
    }

    public function getCompletionPercentageAttribute()
    {
        $totalSteps = 10;
        $completedSteps = 0;

        // Check delivery
        if ($this->delivery_status === 'Delivered') $completedSteps++;

        // Check installation
        if ($this->installation_status === 'Installed') $completedSteps++;

        // Check documents
        if ($this->soft_copy_dc) $completedSteps++;
        if ($this->soft_copy_ir) $completedSteps++;
        if ($this->original_pod_received) $completedSteps++;
        if ($this->original_dc_received) $completedSteps++;
        if ($this->ir_original_copy_received) $completedSteps++;

        // Check photos/evidence
        if ($this->back_side_photo_taken) $completedSteps++;
        if ($this->os_installation_photo_taken) $completedSteps++;
        if ($this->belarc_report_generated) $completedSteps++;

        return round(($completedSteps / $totalSteps) * 100);
    }

    public function getAllFilesAttribute()
    {
        return collect([
            'delivery_report' => $this->delivery_report_url,
            'installation_report' => $this->installation_report_url,
            'belarc_report' => $this->belarc_report_url,
            'back_side_photo' => $this->back_side_photo_url,
            'os_installation_photo' => $this->os_installation_photo_url,
            'keyboard_photo' => $this->keyboard_photo_url,
            'mouse_photo' => $this->mouse_photo_url,
            'screenshot' => $this->screenshot_url,
            'evidence' => $this->evidence_file_url,
        ])->filter();
    }

    public function getIsOverdueAttribute()
    {
        return $this->installation_status === 'Pending' &&
            $this->delivery_date &&
            $this->delivery_date->addDays(7)->isPast();
    }

    public function getDaysUntilDueAttribute()
    {
        if (!$this->delivery_date || $this->installation_status === 'Installed') {
            return null;
        }

        $dueDate = $this->delivery_date->addDays(7);
        return now()->diffInDays($dueDate, false);
    }

    // HELPER METHODS
    public function deleteAllFiles()
    {
        $files = [
            $this->delivery_report_file,
            $this->installation_report_file,
            $this->belarc_report_file,
            $this->back_side_photo_file,
            $this->os_installation_photo_file,
            $this->keyboard_photo_file,
            $this->mouse_photo_file,
            $this->screenshot_file,
            $this->evidence_file,
        ];

        foreach ($files as $file) {
            if ($file && Storage::exists($file)) {
                Storage::delete($file);
            }
        }
    }

    public function markAsDelivered($deliveryDate = null)
    {
        $this->update([
            'delivery_status' => 'Delivered',
            'delivery_date' => $deliveryDate ?? now(),
        ]);
    }

    public function markAsInstalled($installationDate = null)
    {
        $this->update([
            'installation_status' => 'Installed',
            'installation_date' => $installationDate ?? now(),
        ]);
    }

    public function assignTechnician($technician)
    {
        $this->update(['assigned_technician' => $technician]);
    }

    public function updatePriority($priority)
    {
        $this->update(['priority' => $priority]);
    }

    // Boot method to handle model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->sr_no) {
                $model->sr_no = static::generateSrNo();
            }
        });

        static::deleting(function ($model) {
            $model->deleteAllFiles();
        });
    }

    public static function generateSrNo()
    {
        $lastRecord = static::withTrashed()->orderBy('id', 'desc')->first();
        $lastNumber = $lastRecord ? (int) str_replace(['DC-', '-IN'], '', $lastRecord->sr_no) : 0;

        return 'DC-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT) . '-IN';
    }

    // AUDIT METHODS

    /**
     * Override the audit identifier to use sr_no
     */
    protected function getAuditIdentifier(): string
    {
        return $this->sr_no ?: (string) $this->getKey();
    }

    /**
     * Get custom audit description based on the action
     */
    protected function getAuditDescription(string $action): string
    {
        $statusInfo = '';
        if (isset($this->attributes['installation_status'])) {
            $statusInfo = " (Status: {$this->attributes['installation_status']})";
        }

        return ucfirst($action) . " DC Installation #{$this->getAuditIdentifier()}{$statusInfo}";
    }

    /**
     * Override audit severity for specific actions
     */
    protected function getAuditSeverity(string $action): string
    {
        // High priority installations get higher severity
        if (isset($this->attributes['priority']) && $this->attributes['priority'] === 'High') {
            return $action === 'delete' ? 'critical' : 'medium';
        }

        return parent::getAuditSeverity($action);
    }

    /**
     * Check if significant changes occurred for audit
     */
    protected function shouldAudit(string $action): bool
    {
        if (!parent::shouldAudit($action)) {
            return false;
        }

        // For updates, only audit if important fields changed
        if ($action === 'update') {
            $importantFields = [
                'installation_status',
                'delivery_status',
                'priority',
                'assigned_technician',
                'installation_date',
                'delivery_date',
                'receiver_name',
                'location_address',
                'district',
                'region_division',
            ];

            $changedFields = array_keys($this->getChanges());
            $importantChanges = array_intersect($changedFields, $importantFields);

            return !empty($importantChanges);
        }

        return true;
    }

    /**
     * Manually audit file downloads
     */
    public function auditFileDownload(string $fileType, string $fileName = null): void
    {
        $description = "Downloaded {$fileType}" . ($fileName ? " ({$fileName})" : '') . " for DC Installation #{$this->getAuditIdentifier()}";

        AuditLog::logDownload(
            'DCInstallation',
            $this->getAuditIdentifier(),
            $description
        );
    }

    /**
     * Manually audit bulk file downloads
     */
    public function auditBulkDownload(): void
    {
        AuditLog::logDownload(
            'DCInstallation',
            $this->getAuditIdentifier(),
            "Downloaded all files for DC Installation #{$this->getAuditIdentifier()}"
        );
    }

    /**
     * Manually audit when installation is viewed
     */
    public function auditView(string $description = null): void
    {
        parent::auditView($description ?: "Viewed DC Installation #{$this->getAuditIdentifier()}");
    }

    /**
     * Manually audit shareable link generation
     */
    public function auditShareLinkGenerated(): void
    {
        AuditLog::createEntry([
            'action' => 'SHARE',
            'resource_type' => 'DCInstallation',
            'resource_id' => $this->getAuditIdentifier(),
            'severity' => 'medium',
            'description' => "Generated shareable link for DC Installation #{$this->getAuditIdentifier()}",
        ]);
    }

    // RELATIONSHIPS (if needed)
    // public function user()
    // {
    //     return $this->belongsTo(User::class, 'created_by');
    // }
}
