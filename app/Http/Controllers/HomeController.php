<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\DCInstallation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Intervention\Image\ImageManagerStatic as Image;

class HomeController extends Controller
{
    public function index()
    {
        // Audit anonymous page view
        if (!Auth::check()) {
            AuditLog::createEntry([
                'action' => 'VIEW',
                'resource_type' => 'System',
                'resource_id' => 'homepage',
                'severity' => 'low',
                'description' => 'Anonymous user viewed homepage',
            ]);
        }

        // Get recent installations for display
        $installations = DCInstallation::latest()
            ->paginate(5);

        // Calculate statistics
        $stats = [
            'total' => DCInstallation::count(),
            'delivered' => DCInstallation::where('delivery_status', 'Delivered')->count(),
            'installed' => DCInstallation::where('installation_status', 'Installed')->count(),
            'pending_delivery' => DCInstallation::where('delivery_status', 'Pending')->count(),
            'pending_installation' => DCInstallation::where('installation_status', 'Pending')->count(),
            'in_progress' => DCInstallation::where('installation_status', 'In Progress')->count(),
            'overdue' => DCInstallation::where('installation_status', 'Pending')
                ->where('delivery_date', '<=', now()->subDays(7))
                ->count(),
            'high_priority' => DCInstallation::where('priority', 'High')->count(),
            'this_week' => DCInstallation::where('created_at', '>=', now()->subWeek())->count(),
        ];

        // Regions and districts for form dropdowns
        $regions = ['Amravati', 'Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Aurangabad'];
        $districts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur'];

        return Inertia::render('welcome', [
            'installations' => $installations,
            'stats' => $stats,
            'regions' => $regions,
            'districts' => $districts,
        ]);
    }

    public function store(Request $request)
    {
        // Validation rules
        $validator = Validator::make($request->all(), [
            // Basic Information
            'sr_no' => 'nullable|string|max:255|unique:dc_installations,sr_no',
            'region_division' => 'required|string|max:255',
            'location_address' => 'required|string|max:1000',
            'district' => 'required|string|max:255',
            'tahsil' => 'required|string|max:255',
            'pin_code' => 'required|string|size:6',
            'receiver_name' => 'required|string|max:255',
            'contact_no' => 'required|string|size:10',
            'contact_no_two' => 'nullable|string|size:10',
            'dc_ir_no' => 'nullable|string|max:255',

            // Dates
            'dispatch_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'installation_date' => 'nullable|date',

            // Delivery Details
            'total_boxes' => 'nullable|integer|min:1',
            'courier_docket_no' => 'nullable|string|max:255',
            'representative_name' => 'nullable|string|max:255',

            // Equipment Details
            'serial_number' => 'nullable|string|max:255',
            'aio_hp_serial' => 'nullable|string|max:255',
            'keyboard_serial' => 'nullable|string|max:255',
            'mouse_serial' => 'nullable|string|max:255',
            'ups_serial' => 'nullable|string|max:255',
            'antivirus' => 'nullable|string|max:255',
            'breakage_notes' => 'nullable|string|max:1000',

            // Installation Details
            'ir_receiver_name' => 'nullable|string|max:255',
            'ir_receiver_designation' => 'nullable|string|max:255',
            'entity_vendor_name' => 'nullable|string|max:255',
            'vendor_contact_number' => 'nullable|string|max:15',
            'charges' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',

            // Status Fields
            'delivery_status' => 'required|in:Delivered,Pending,In Transit',
            'installation_status' => 'required|in:Installed,Pending,In Progress',

            // Updated Equipment Details
            'hp_440_g9_serial' => 'nullable|string|max:255',
            'hp_keyboard_serial' => 'nullable|string|max:255',
            'hp_mouse_serial' => 'nullable|string|max:255',
            'updated_antivirus' => 'nullable|string|max:255',
            'updated_breakage_notes' => 'nullable|string|max:1000',

            // Updated Installation Details
            'updated_ir_receiver_name' => 'nullable|string|max:255',
            'updated_ir_receiver_designation' => 'nullable|string|max:255',
            'updated_installation_date' => 'nullable|date',
            'updated_remarks' => 'nullable|string|max:1000',
            'hostname' => 'nullable|string|max:255',
            'updated_entity_vendor' => 'nullable|string|max:255',
            'updated_contact_number' => 'nullable|string|max:15',

            // Priority and Assignment
            'priority' => 'required|in:High,Medium,Low',
            'assigned_technician' => 'nullable|string|max:255',
            'internal_notes' => 'nullable|string|max:2000',

            // Document Status (boolean fields)
            'soft_copy_dc' => 'boolean',
            'soft_copy_ir' => 'boolean',
            'original_pod_received' => 'boolean',
            'original_dc_received' => 'boolean',
            'ir_original_copy_received' => 'boolean',
            'back_side_photo_taken' => 'boolean',
            'os_installation_photo_taken' => 'boolean',
            'belarc_report_generated' => 'boolean',

            // File validation rules
            'delivery_report_file' => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:10240', // 10MB
            'installation_report_file' => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:10240',
            'belarc_report_file' => 'nullable|file|mimes:pdf|max:10240',
            'back_side_photo_file' => 'nullable|file|mimes:jpeg,jpg,png|max:10240',
            'os_installation_photo_file' => 'nullable|file|mimes:jpeg,jpg,png|max:10240',
            'keyboard_photo_file' => 'nullable|file|mimes:jpeg,jpg,png|max:10240',
            'mouse_photo_file' => 'nullable|file|mimes:jpeg,jpg,png|max:10240',
            'screenshot_file' => 'nullable|file|mimes:jpeg,jpg,png|max:10240',
            'evidence_file' => 'nullable|file|mimes:jpeg,jpg,png,pdf,doc,docx|max:10240',
        ]);

        if ($validator->fails()) {
            // Audit validation failure
            AuditLog::createEntry([
                'action' => 'CREATE_FAILED',
                'resource_type' => 'DCInstallation',
                'resource_id' => 'validation_failed',
                'severity' => 'low',
                'description' => 'DC Installation creation failed due to validation errors',
                'metadata' => [
                    'errors' => $validator->errors()->toArray(),
                    'input_data' => $request->only(['region_division', 'district', 'receiver_name']),
                ],
            ]);

            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Please check the form for errors and try again.');
        }

        try {
            // Prepare data for insertion
            $data = $request->only([
                'sr_no',
                'region_division',
                'location_address',
                'district',
                'tahsil',
                'pin_code',
                'receiver_name',
                'contact_no',
                'contact_no_two',
                'dc_ir_no',
                'dispatch_date',
                'delivery_date',
                'installation_date',
                'total_boxes',
                'courier_docket_no',
                'representative_name',
                'serial_number',
                'aio_hp_serial',
                'keyboard_serial',
                'mouse_serial',
                'ups_serial',
                'antivirus',
                'breakage_notes',
                'ir_receiver_name',
                'ir_receiver_designation',
                'entity_vendor_name',
                'vendor_contact_number',
                'charges',
                'remarks',
                'delivery_status',
                'installation_status',
                'hp_440_g9_serial',
                'hp_keyboard_serial',
                'hp_mouse_serial',
                'updated_antivirus',
                'updated_breakage_notes',
                'updated_ir_receiver_name',
                'updated_ir_receiver_designation',
                'updated_installation_date',
                'updated_remarks',
                'hostname',
                'updated_entity_vendor',
                'updated_contact_number',
                'priority',
                'assigned_technician',
                'internal_notes'
            ]);

            // Handle boolean fields
            $booleanFields = [
                'soft_copy_dc',
                'soft_copy_ir',
                'original_pod_received',
                'original_dc_received',
                'ir_original_copy_received',
                'back_side_photo_taken',
                'os_installation_photo_taken',
                'belarc_report_generated'
            ];

            foreach ($booleanFields as $field) {
                $data[$field] = $request->boolean($field);
            }

            // Generate SR number if not provided
            if (empty($data['sr_no'])) {
                $data['sr_no'] = $this->generateSrNo();
            }

            // Create installation first to get the ID and SR number
            $installation = DCInstallation::create($data);

            // Handle file uploads with compression and organized storage
            $this->handleFileUploads($request, $installation);

            // Add tracking fields
            $installation->update([
                'created_by' => Auth::user()->name ?? 'System',
                'updated_by' => Auth::user()->name ?? 'System',
            ]);

            // The audit log for creation is automatically handled by the Auditable trait

            return redirect()
                ->back()
                ->with('success', 'Installation record created successfully! SR No: ' . $installation->sr_no);
        } catch (\Exception $e) {
            Log::error('DC Installation creation error: ' . $e->getMessage());

            // Audit creation failure
            AuditLog::createEntry([
                'action' => 'CREATE_FAILED',
                'resource_type' => 'DCInstallation',
                'resource_id' => 'system_error',
                'severity' => 'high',
                'description' => 'DC Installation creation failed due to system error',
                'metadata' => [
                    'error' => $e->getMessage(),
                    'input_data' => $request->only(['region_division', 'district', 'receiver_name']),
                ],
            ]);

            return back()
                ->withInput()
                ->with('error', 'An error occurred while creating the installation record. Please try again.');
        }
    }

    private function handleFileUploads(Request $request, DCInstallation $installation)
    {
        $fileFields = [
            'delivery_report_file',
            'installation_report_file',
            'belarc_report_file',
            'back_side_photo_file',
            'os_installation_photo_file',
            'keyboard_photo_file',
            'mouse_photo_file',
            'screenshot_file',
            'evidence_file'
        ];

        // Create directory for this installation
        $installationDir = 'dc-installations/' . $installation->sr_no;
        $uploadedFiles = [];

        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();

                // Create unique filename
                $filename = $originalName . '_' . time() . '.' . $extension;
                $filePath = $installationDir . '/' . $filename;

                try {
                    // Handle image compression
                    if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png'])) {
                        $this->compressAndStoreImage($file, $filePath);
                    } else {
                        // Store PDF and other files normally
                        $file->storeAs($installationDir, $filename, 'public');
                    }

                    // Update installation record with file path
                    $installation->update([$field => $filePath]);
                    $uploadedFiles[] = $field;
                } catch (\Exception $e) {
                    Log::error("File upload error for {$field}: " . $e->getMessage());
                }
            }
        }

        // Audit file uploads
        if (!empty($uploadedFiles)) {
            AuditLog::createEntry([
                'action' => 'UPLOAD',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'low',
                'description' => "Uploaded " . count($uploadedFiles) . " files for DC Installation #{$installation->getAuditIdentifier()}",
                'metadata' => [
                    'uploaded_files' => $uploadedFiles,
                ],
            ]);
        }
    }

    private function compressAndStoreImage($file, $filePath)
    {
        // Read the image
        $image = Image::make($file);

        // Get original dimensions
        $width = $image->width();
        $height = $image->height();

        // Resize if too large (max 1920px width)
        if ($width > 1920) {
            $image->resize(1920, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        // Compress based on file type
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $image->encode('jpg', 85);
                break;
            case 'png':
                // For PNG, reduce quality by converting to JPG if file is large
                $fileSize = $file->getSize();
                if ($fileSize > 2048000) { // 2MB
                    $image->encode('jpg', 85);
                    $filePath = str_replace('.png', '.jpg', $filePath);
                } else {
                    $image->encode('png');
                }
                break;
        }

        // Save to storage
        Storage::disk('public')->put($filePath, $image->stream());
    }

    public function show(DCInstallation $installation)
    {
        // Check if user has access to view this installation
        $user = Auth::user();

        // Allow access if user is Admin, Client, or the creator
        if (!$user || (!in_array($user->user_type, ['Admin', 'Client']) && $installation->created_by !== $user->name)) {
            // For guests or unauthorized users, redirect to login
            if (!$user) {
                // Audit unauthorized access attempt
                AuditLog::createEntry([
                    'action' => 'VIEW_UNAUTHORIZED',
                    'resource_type' => 'DCInstallation',
                    'resource_id' => $installation->getAuditIdentifier(),
                    'severity' => 'medium',
                    'description' => "Unauthorized access attempt to DC Installation #{$installation->getAuditIdentifier()}",
                ]);

                return redirect()->route('login')->with('message', 'Please login to view installation details.');
            }

            // Audit forbidden access attempt
            AuditLog::createEntry([
                'action' => 'VIEW_FORBIDDEN',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'medium',
                'description' => "Forbidden access attempt to DC Installation #{$installation->getAuditIdentifier()} by user: {$user->name}",
            ]);

            abort(403, 'You do not have permission to view this installation.');
        }

        // Audit the view action (automatically handled by the model's auditView method)
        $installation->auditView();

        return Inertia::render('DCInstallation/Show', [
            'installation' => $installation,
            'canEdit' => $user && in_array($user->user_type, ['Admin', 'Client']),
            'canDownload' => $user && in_array($user->user_type, ['Admin', 'Client']),
        ]);
    }

    public function update(Request $request, DCInstallation $installation)
    {
        // Check permissions
        $user = Auth::user();
        if (!$user || !in_array($user->user_type, ['Admin', 'Client'])) {
            // Audit unauthorized update attempt
            AuditLog::createEntry([
                'action' => 'UPDATE_UNAUTHORIZED',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'high',
                'description' => "Unauthorized update attempt to DC Installation #{$installation->getAuditIdentifier()}",
            ]);

            abort(403, 'You do not have permission to update installations.');
        }

        // Similar validation rules as store method
        $validator = Validator::make($request->all(), [
            'region_division' => 'required|string|max:255',
            'location_address' => 'required|string|max:1000',
            'district' => 'required|string|max:255',
            'tahsil' => 'required|string|max:255',
            'pin_code' => 'required|string|size:6',
            'receiver_name' => 'required|string|max:255',
            'contact_no' => 'required|string|size:10',
            'contact_no_two' => 'nullable|string|size:10',
            'dc_ir_no' => 'nullable|string|max:255',
            'dispatch_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'installation_date' => 'nullable|date',
            'total_boxes' => 'nullable|integer|min:1',
            'courier_docket_no' => 'nullable|string|max:255',
            'representative_name' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'aio_hp_serial' => 'nullable|string|max:255',
            'keyboard_serial' => 'nullable|string|max:255',
            'mouse_serial' => 'nullable|string|max:255',
            'ups_serial' => 'nullable|string|max:255',
            'antivirus' => 'nullable|string|max:255',
            'breakage_notes' => 'nullable|string|max:1000',
            'ir_receiver_name' => 'nullable|string|max:255',
            'ir_receiver_designation' => 'nullable|string|max:255',
            'entity_vendor_name' => 'nullable|string|max:255',
            'vendor_contact_number' => 'nullable|string|max:15',
            'charges' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',
            'delivery_status' => 'required|in:Delivered,Pending,In Transit',
            'installation_status' => 'required|in:Installed,Pending,In Progress',
            'hp_440_g9_serial' => 'nullable|string|max:255',
            'hp_keyboard_serial' => 'nullable|string|max:255',
            'hp_mouse_serial' => 'nullable|string|max:255',
            'updated_antivirus' => 'nullable|string|max:255',
            'updated_breakage_notes' => 'nullable|string|max:1000',
            'updated_ir_receiver_name' => 'nullable|string|max:255',
            'updated_ir_receiver_designation' => 'nullable|string|max:255',
            'updated_installation_date' => 'nullable|date',
            'updated_remarks' => 'nullable|string|max:1000',
            'hostname' => 'nullable|string|max:255',
            'updated_entity_vendor' => 'nullable|string|max:255',
            'updated_contact_number' => 'nullable|string|max:15',
            'priority' => 'required|in:High,Medium,Low',
            'assigned_technician' => 'nullable|string|max:255',
            'internal_notes' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            // Audit validation failure for update
            AuditLog::createEntry([
                'action' => 'UPDATE_FAILED',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'low',
                'description' => "DC Installation update failed due to validation errors for #{$installation->getAuditIdentifier()}",
                'metadata' => [
                    'errors' => $validator->errors()->toArray(),
                ],
            ]);

            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Please check the form for errors and try again.');
        }

        try {
            $data = $request->only([
                'region_division',
                'location_address',
                'district',
                'tahsil',
                'pin_code',
                'receiver_name',
                'contact_no',
                'contact_no_two',
                'dc_ir_no',
                'dispatch_date',
                'delivery_date',
                'installation_date',
                'total_boxes',
                'courier_docket_no',
                'representative_name',
                'serial_number',
                'aio_hp_serial',
                'keyboard_serial',
                'mouse_serial',
                'ups_serial',
                'antivirus',
                'breakage_notes',
                'ir_receiver_name',
                'ir_receiver_designation',
                'entity_vendor_name',
                'vendor_contact_number',
                'charges',
                'remarks',
                'delivery_status',
                'installation_status',
                'hp_440_g9_serial',
                'hp_keyboard_serial',
                'hp_mouse_serial',
                'updated_antivirus',
                'updated_breakage_notes',
                'updated_ir_receiver_name',
                'updated_ir_receiver_designation',
                'updated_installation_date',
                'updated_remarks',
                'hostname',
                'updated_entity_vendor',
                'updated_contact_number',
                'priority',
                'assigned_technician',
                'internal_notes'
            ]);

            // Handle boolean fields
            $booleanFields = [
                'soft_copy_dc',
                'soft_copy_ir',
                'original_pod_received',
                'original_dc_received',
                'ir_original_copy_received',
                'back_side_photo_taken',
                'os_installation_photo_taken',
                'belarc_report_generated'
            ];

            foreach ($booleanFields as $field) {
                $data[$field] = $request->boolean($field);
            }

            // Handle file uploads
            $this->handleFileUploads($request, $installation);

            // Update tracking field
            $data['updated_by'] = $user->name;

            // Update the installation record (audit log automatically handled by Auditable trait)
            $installation->update($data);

            return redirect()
                ->back()
                ->with('success', 'Installation record updated successfully!');
        } catch (\Exception $e) {
            Log::error('DC Installation update error: ' . $e->getMessage());

            // Audit update failure
            AuditLog::createEntry([
                'action' => 'UPDATE_FAILED',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'high',
                'description' => "DC Installation update failed due to system error for #{$installation->getAuditIdentifier()}",
                'metadata' => [
                    'error' => $e->getMessage(),
                ],
            ]);

            return back()
                ->withInput()
                ->with('error', 'An error occurred while updating the installation record. Please try again.');
        }
    }

    public function destroy(DCInstallation $installation)
    {
        // Only admins can delete
        $user = Auth::user();
        if (!$user || $user->user_type !== 'Admin') {
            // Audit unauthorized delete attempt
            AuditLog::createEntry([
                'action' => 'DELETE_UNAUTHORIZED',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'high',
                'description' => "Unauthorized delete attempt for DC Installation #{$installation->getAuditIdentifier()}",
            ]);

            abort(403, 'You do not have permission to delete installations.');
        }

        try {
            // Delete associated files before deleting the record
            $installation->deleteAllFiles();

            // Soft delete the installation record (audit log automatically handled by Auditable trait)
            $installation->delete();

            return redirect()
                ->back()
                ->with('success', 'Installation record deleted successfully!');
        } catch (\Exception $e) {
            Log::error('DC Installation deletion error: ' . $e->getMessage());

            // Audit deletion failure
            AuditLog::createEntry([
                'action' => 'DELETE_FAILED',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'high',
                'description' => "DC Installation deletion failed due to system error for #{$installation->getAuditIdentifier()}",
                'metadata' => [
                    'error' => $e->getMessage(),
                ],
            ]);

            return back()
                ->with('error', 'An error occurred while deleting the installation record. Please try again.');
        }
    }

    public function downloadFile(DCInstallation $installation, $fileType)
    {
        $allowedTypes = [
            'delivery_report_file',
            'installation_report_file',
            'belarc_report_file',
            'back_side_photo_file',
            'os_installation_photo_file',
            'keyboard_photo_file',
            'mouse_photo_file',
            'screenshot_file',
            'evidence_file',
        ];

        if (!in_array($fileType, $allowedTypes)) {
            // Audit invalid file type access
            AuditLog::createEntry([
                'action' => 'DOWNLOAD_INVALID',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'medium',
                'description' => "Invalid file type download attempt: {$fileType} for DC Installation #{$installation->getAuditIdentifier()}",
            ]);

            abort(404, 'File type not allowed');
        }

        $filePath = $installation->$fileType;

        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            // Audit file not found
            AuditLog::createEntry([
                'action' => 'DOWNLOAD_NOT_FOUND',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'low',
                'description' => "File not found for download: {$fileType} for DC Installation #{$installation->getAuditIdentifier()}",
            ]);

            abort(404, 'File not found');
        }

        // Audit the download action
        $installation->auditFileDownload($fileType, basename($filePath));

        return Storage::disk('public')->download($filePath);
    }

    public function generateShareableLink(DCInstallation $installation)
    {
        // Only admins and clients can generate shareable links
        $user = Auth::user();
        if (!$user || !in_array($user->user_type, ['Admin', 'Client'])) {
            // Audit unauthorized share link generation
            AuditLog::createEntry([
                'action' => 'SHARE_UNAUTHORIZED',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'medium',
                'description' => "Unauthorized shareable link generation attempt for DC Installation #{$installation->getAuditIdentifier()}",
            ]);

            abort(403, 'You do not have permission to generate shareable links.');
        }

        // Generate a unique token for this installation
        $token = base64_encode($installation->id . ':' . $installation->sr_no . ':' . time());

        // Store the token in cache for 24 hours
        cache(["share_token:{$token}" => $installation->id], now()->addHours(24));

        // Audit the share link generation
        $installation->auditShareLinkGenerated();

        $shareableUrl = route('dc-installations.shared', ['token' => $token]);

        return response()->json([
            'shareable_url' => $shareableUrl,
            'expires_at' => now()->addHours(24)->toISOString(),
        ]);
    }

    public function viewShared($token)
    {
        $installationId = cache("share_token:{$token}");

        if (!$installationId) {
            // Audit invalid/expired token access
            AuditLog::createEntry([
                'action' => 'SHARE_ACCESS_INVALID',
                'resource_type' => 'System',
                'resource_id' => 'shared_link',
                'severity' => 'medium',
                'description' => "Invalid or expired share link access attempt",
                'metadata' => [
                    'token' => substr($token, 0, 10) . '...', // Partial token for security
                ],
            ]);

            return redirect()->route('login')->with('error', 'Invalid or expired share link. Please login to access.');
        }

        $installation = DCInstallation::find($installationId);

        if (!$installation) {
            // Audit installation not found
            AuditLog::createEntry([
                'action' => 'SHARE_ACCESS_NOT_FOUND',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installationId,
                'severity' => 'medium',
                'description' => "Shared link access to non-existent installation: {$installationId}",
            ]);

            abort(404, 'Installation not found.');
        }

        // Check if user is logged in
        if (!Auth::check()) {
            // Store the intended URL and redirect to login
            session(['intended_share_url' => request()->url()]);
            return redirect()->route('login')->with('message', 'Please login to view installation details.');
        }

        $user = Auth::user();

        // Only allow clients and admins to view shared installations
        if (!in_array($user->user_type, ['Admin', 'Client'])) {
            // Audit forbidden shared access
            AuditLog::createEntry([
                'action' => 'SHARE_ACCESS_FORBIDDEN',
                'resource_type' => 'DCInstallation',
                'resource_id' => $installation->getAuditIdentifier(),
                'severity' => 'medium',
                'description' => "Forbidden shared link access to DC Installation #{$installation->getAuditIdentifier()} by user: {$user->name}",
            ]);

            abort(403, 'You do not have permission to view this installation.');
        }

        // Audit successful shared link access
        AuditLog::createEntry([
            'action' => 'SHARE_ACCESS',
            'resource_type' => 'DCInstallation',
            'resource_id' => $installation->getAuditIdentifier(),
            'severity' => 'low',
            'description' => "Shared link access to DC Installation #{$installation->getAuditIdentifier()} by user: {$user->name}",
        ]);

        return Inertia::render('DCInstallation/Show', [
            'installation' => $installation,
            'canEdit' => $user->user_type === 'Admin',
            'canDownload' => true,
            'isSharedView' => true,
        ]);
    }

    /**
     * Generate a unique serial number for DC installation
     */
    private function generateSrNo()
    {
        $year = date('Y');
        $lastRecord = DCInstallation::withTrashed()
            ->where('sr_no', 'like', "DC-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastRecord) {
            // Extract the number from the last SR number
            $lastNumber = (int) str_replace(["DC-{$year}-"], '', $lastRecord->sr_no);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return "DC-{$year}-" . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    // API methods for dashboard widgets
    public function getInstallationsByStatus(Request $request)
    {
        $status = $request->input('status', 'all');
        $query = DCInstallation::query();

        switch ($status) {
            case 'completed':
                $query->where('delivery_status', 'Delivered')
                    ->where('installation_status', 'Installed');
                break;
            case 'in_progress':
                $query->where('installation_status', 'In Progress');
                break;
            case 'pending':
                $query->where(function ($q) {
                    $q->where('delivery_status', 'Pending')
                        ->orWhere('installation_status', 'Pending');
                });
                break;
            case 'overdue':
                $query->where('installation_status', 'Pending')
                    ->where('delivery_date', '<=', now()->subDays(7));
                break;
        }

        $installations = $query->latest()->paginate(10);

        // Audit API access
        AuditLog::createEntry([
            'action' => 'API_ACCESS',
            'resource_type' => 'System',
            'resource_id' => 'installations_by_status',
            'severity' => 'low',
            'description' => "API access to installations by status: {$status}",
        ]);

        return response()->json($installations);
    }

    public function getStats()
    {
        $stats = [
            'total' => DCInstallation::count(),
            'delivered' => DCInstallation::where('delivery_status', 'Delivered')->count(),
            'installed' => DCInstallation::where('installation_status', 'Installed')->count(),
            'pending_delivery' => DCInstallation::where('delivery_status', 'Pending')->count(),
            'pending_installation' => DCInstallation::where('installation_status', 'Pending')->count(),
            'in_progress' => DCInstallation::where('installation_status', 'In Progress')->count(),
            'overdue' => DCInstallation::where('installation_status', 'Pending')
                ->where('delivery_date', '<=', now()->subDays(7))
                ->count(),
            'high_priority' => DCInstallation::where('priority', 'High')->count(),
            'this_week' => DCInstallation::where('created_at', '>=', now()->subWeek())->count(),
            'this_month' => DCInstallation::where('created_at', '>=', now()->subMonth())->count(),
            'completion_rate' => DCInstallation::count() > 0
                ? round((DCInstallation::where('installation_status', 'Installed')->count() / DCInstallation::count()) * 100, 2)
                : 0,
        ];

        // Audit stats access
        AuditLog::createEntry([
            'action' => 'API_ACCESS',
            'resource_type' => 'System',
            'resource_id' => 'stats',
            'severity' => 'low',
            'description' => 'API access to installation statistics',
        ]);

        return response()->json($stats);
    }

    public function exportInstallations(Request $request)
    {
        $query = DCInstallation::query();

        // Apply filters if provided
        $filters = [];
        if ($request->has('status') && $request->status !== 'all') {
            $filters['status'] = $request->status;
            switch ($request->status) {
                case 'completed':
                    $query->where('delivery_status', 'Delivered')
                        ->where('installation_status', 'Installed');
                    break;
                case 'in_progress':
                    $query->where('installation_status', 'In Progress');
                    break;
                case 'pending':
                    $query->where(function ($q) {
                        $q->where('delivery_status', 'Pending')
                            ->orWhere('installation_status', 'Pending');
                    });
                    break;
            }
        }

        if ($request->has('region') && $request->region) {
            $filters['region'] = $request->region;
            $query->where('region_division', $request->region);
        }

        if ($request->has('district') && $request->district) {
            $filters['district'] = $request->district;
            $query->where('district', $request->district);
        }

        $installations = $query->orderBy('created_at', 'desc')->get();

        // Audit export action
        AuditLog::createEntry([
            'action' => 'EXPORT',
            'resource_type' => 'DCInstallation',
            'resource_id' => 'bulk_export',
            'severity' => 'medium',
            'description' => "Exported {$installations->count()} DC installations to CSV",
            'metadata' => [
                'filters' => $filters,
                'export_count' => $installations->count(),
            ],
        ]);

        $filename = 'dc_installations_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($installations) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'SR No',
                'Region/Division',
                'District',
                'Tahsil',
                'PIN Code',
                'Receiver Name',
                'Contact No',
                'DC/IR No',
                'Location Address',
                'Dispatch Date',
                'Delivery Date',
                'Installation Date',
                'Delivery Status',
                'Installation Status',
                'Priority',
                'Assigned Technician',
                'Created At'
            ]);

            // CSV data
            foreach ($installations as $installation) {
                fputcsv($file, [
                    $installation->sr_no,
                    $installation->region_division,
                    $installation->district,
                    $installation->tahsil,
                    $installation->pin_code,
                    $installation->receiver_name,
                    $installation->contact_no,
                    $installation->dc_ir_no,
                    $installation->location_address,
                    $installation->dispatch_date ? $installation->dispatch_date->format('Y-m-d') : '',
                    $installation->delivery_date ? $installation->delivery_date->format('Y-m-d') : '',
                    $installation->installation_date ? $installation->installation_date->format('Y-m-d') : '',
                    $installation->delivery_status,
                    $installation->installation_status,
                    $installation->priority,
                    $installation->assigned_technician,
                    $installation->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function search(Request $request)
    {
        $searchTerm = $request->input('search', '');
        $status = $request->input('status', 'all');
        $region = $request->input('region', '');
        $district = $request->input('district', '');

        $query = DCInstallation::query();

        // Apply search term
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('sr_no', 'like', "%{$searchTerm}%")
                    ->orWhere('receiver_name', 'like', "%{$searchTerm}%")
                    ->orWhere('location_address', 'like', "%{$searchTerm}%")
                    ->orWhere('district', 'like', "%{$searchTerm}%")
                    ->orWhere('tahsil', 'like', "%{$searchTerm}%")
                    ->orWhere('dc_ir_no', 'like', "%{$searchTerm}%");
            });
        }

        // Apply filters
        if ($status !== 'all') {
            switch ($status) {
                case 'completed':
                    $query->where('delivery_status', 'Delivered')
                        ->where('installation_status', 'Installed');
                    break;
                case 'in_progress':
                    $query->where('installation_status', 'In Progress');
                    break;
                case 'pending':
                    $query->where(function ($q) {
                        $q->where('delivery_status', 'Pending')
                            ->orWhere('installation_status', 'Pending');
                    });
                    break;
                case 'overdue':
                    $query->where('installation_status', 'Pending')
                        ->where('delivery_date', '<=', now()->subDays(7));
                    break;
            }
        }

        if ($region) {
            $query->where('region_division', $region);
        }

        if ($district) {
            $query->where('district', $district);
        }

        $installations = $query->latest()->paginate(10);

        // Audit search action
        AuditLog::createEntry([
            'action' => 'SEARCH',
            'resource_type' => 'DCInstallation',
            'resource_id' => 'search_query',
            'severity' => 'low',
            'description' => "Searched installations with term: '{$searchTerm}'",
            'metadata' => [
                'search_term' => $searchTerm,
                'filters' => [
                    'status' => $status,
                    'region' => $region,
                    'district' => $district,
                ],
                'results_count' => $installations->total(),
            ],
        ]);

        return response()->json($installations);
    }
}
