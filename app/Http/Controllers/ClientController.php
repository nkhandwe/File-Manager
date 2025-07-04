<?php

namespace App\Http\Controllers;

use App\Models\DCInstallation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class ClientController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_installations' => DCInstallation::count(),
            'completed' => DCInstallation::completed()->count(),
            'pending' => DCInstallation::where('installation_status', 'Pending')->count(),
            'in_progress' => DCInstallation::where('installation_status', 'In Progress')->count(),
            'overdue' => DCInstallation::overdue()->count(),
            'high_priority' => DCInstallation::highPriority()->count(),
            'this_week' => DCInstallation::recent(7)->count(),
            'this_month' => DCInstallation::recent(30)->count(),
        ];

        $recentInstallations = DCInstallation::latest()->limit(8)->get();
        $overdueInstallations = DCInstallation::overdue()->limit(5)->get();

        // Chart data for client dashboard
        $statusDistribution = [
            'completed' => DCInstallation::completed()->count(),
            'pending' => DCInstallation::where('installation_status', 'Pending')->count(),
            'in_progress' => DCInstallation::where('installation_status', 'In Progress')->count(),
        ];

        $regionDistribution = DCInstallation::selectRaw('region_division, COUNT(*) as count')
            ->groupBy('region_division')
            ->pluck('count', 'region_division')
            ->toArray();

        return Inertia::render('Client/Dashboard', [
            'stats' => $stats,
            'recentInstallations' => $recentInstallations,
            'overdueInstallations' => $overdueInstallations,
            'statusDistribution' => $statusDistribution,
            'regionDistribution' => $regionDistribution,
        ]);
    }

    public function installations(Request $request)
    {
        $query = DCInstallation::query();

        // Apply filters
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'completed':
                    $query->completed();
                    break;
                case 'pending':
                    $query->where('installation_status', 'Pending');
                    break;
                case 'in_progress':
                    $query->where('installation_status', 'In Progress');
                    break;
                case 'overdue':
                    $query->overdue();
                    break;
            }
        }

        if ($request->filled('region')) {
            $query->byRegion($request->region);
        }

        if ($request->filled('district')) {
            $query->byDistrict($request->district);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sr_no', 'like', "%{$search}%")
                    ->orWhere('receiver_name', 'like', "%{$search}%")
                    ->orWhere('location_address', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%");
            });
        }

        $installations = $query->latest()->paginate(15);

        $regions = DCInstallation::distinct()->pluck('region_division');
        $districts = DCInstallation::distinct()->pluck('district');

        return Inertia::render('Client/Installations', [
            'installations' => $installations,
            'regions' => $regions,
            'districts' => $districts,
            'filters' => $request->only(['status', 'region', 'district', 'priority', 'search']),
        ]);
    }

    public function reports(Request $request)
    {
        $stats = [
            'total' => DCInstallation::count(),
            'completed' => DCInstallation::completed()->count(),
            'pending' => DCInstallation::where('installation_status', 'Pending')->count(),
            'overdue' => DCInstallation::overdue()->count(),
            'high_priority' => DCInstallation::highPriority()->count(),
            'with_files' => DCInstallation::withFiles()->count(),
        ];

        // Monthly installation trends
        $monthlyTrends = DCInstallation::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        // Regional distribution with completion rates
        $regionalData = DCInstallation::selectRaw('region_division, COUNT(*) as total, 
            SUM(CASE WHEN installation_status = "Installed" THEN 1 ELSE 0 END) as completed')
            ->groupBy('region_division')
            ->get();

        // Priority distribution
        $priorityData = DCInstallation::selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        return Inertia::render('Client/Reports', [
            'stats' => $stats,
            'monthlyTrends' => $monthlyTrends,
            'regionalData' => $regionalData,
            'priorityData' => $priorityData,
        ]);
    }

    public function profile()
    {
        $user = Auth::user();

        // Get user's activity stats if they created installations
        $userStats = [
            'installations_created' => DCInstallation::where('created_by', $user->name)->count(),
            'recent_activity' => DCInstallation::where('created_by', $user->name)
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return Inertia::render('Client/Profile', [
            'user' => $user,
            'userStats' => $userStats,
        ]);
    }

    // Download individual file
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
            abort(404, 'File type not allowed');
        }

        $filePath = $installation->$fileType;

        if (!$filePath || !Storage::disk('public')->exists($filePath)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($filePath);
    }

    // Download all files for an installation as ZIP
    public function downloadInstallationFiles(DCInstallation $installation)
    {
        try {
            $zip = new ZipArchive();
            $zipFileName = "DC_{$installation->sr_no}_files_" . date('Y-m-d_H-i-s') . '.zip';
            $zipPath = storage_path('app/temp/' . $zipFileName);

            // Create temp directory if it doesn't exist
            if (!file_exists(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
                // File fields to include
                $fileFields = [
                    'delivery_report_file' => 'Delivery_Report',
                    'installation_report_file' => 'Installation_Report',
                    'belarc_report_file' => 'Belarc_Report',
                    'back_side_photo_file' => 'Back_Side_Photo',
                    'os_installation_photo_file' => 'OS_Installation_Photo',
                    'keyboard_photo_file' => 'Keyboard_Photo',
                    'mouse_photo_file' => 'Mouse_Photo',
                    'screenshot_file' => 'Screenshot',
                    'evidence_file' => 'Evidence_File',
                ];

                $fileCount = 0;
                foreach ($fileFields as $field => $label) {
                    if ($installation->$field && Storage::disk('public')->exists($installation->$field)) {
                        $filePath = Storage::disk('public')->path($installation->$field);
                        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
                        $zip->addFile($filePath, "{$label}.{$extension}");
                        $fileCount++;
                    }
                }

                // Add summary file
                $summary = $this->generateInstallationSummary($installation);
                $zip->addFromString('Installation_Summary.txt', $summary);

                $zip->close();

                if ($fileCount > 0) {
                    return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
                } else {
                    // Clean up empty zip file
                    unlink($zipPath);
                    return back()->with('error', 'No files found for this installation.');
                }
            }

            return back()->with('error', 'Failed to create ZIP file.');
        } catch (\Exception $e) {
            Log::error('Client ZIP download error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while creating the ZIP file.');
        }
    }

    // Download all files for multiple installations as ZIP
    public function downloadBulkFiles(Request $request)
    {
        $installationIds = $request->input('installation_ids', []);

        if (empty($installationIds)) {
            return back()->with('error', 'No installations selected.');
        }

        try {
            $installations = DCInstallation::whereIn('id', $installationIds)->get();

            if ($installations->isEmpty()) {
                return back()->with('error', 'No valid installations found.');
            }

            $zip = new ZipArchive();
            $zipFileName = "DC_Bulk_Files_" . date('Y-m-d_H-i-s') . '.zip';
            $zipPath = storage_path('app/temp/' . $zipFileName);

            // Create temp directory if it doesn't exist
            if (!file_exists(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
                $fileFields = [
                    'delivery_report_file' => 'Delivery_Report',
                    'installation_report_file' => 'Installation_Report',
                    'belarc_report_file' => 'Belarc_Report',
                    'back_side_photo_file' => 'Back_Side_Photo',
                    'os_installation_photo_file' => 'OS_Installation_Photo',
                    'keyboard_photo_file' => 'Keyboard_Photo',
                    'mouse_photo_file' => 'Mouse_Photo',
                    'screenshot_file' => 'Screenshot',
                    'evidence_file' => 'Evidence_File',
                ];

                $totalFiles = 0;
                foreach ($installations as $installation) {
                    $folderName = "DC_{$installation->sr_no}";
                    $zip->addEmptyDir($folderName);

                    $installationFiles = 0;
                    foreach ($fileFields as $field => $label) {
                        if ($installation->$field && Storage::disk('public')->exists($installation->$field)) {
                            $filePath = Storage::disk('public')->path($installation->$field);
                            $extension = pathinfo($filePath, PATHINFO_EXTENSION);
                            $zip->addFile($filePath, "{$folderName}/{$label}.{$extension}");
                            $installationFiles++;
                            $totalFiles++;
                        }
                    }

                    // Add summary for each installation
                    if ($installationFiles > 0) {
                        $summary = $this->generateInstallationSummary($installation);
                        $zip->addFromString("{$folderName}/Installation_Summary.txt", $summary);
                    }
                }

                // Add bulk summary
                $bulkSummary = $this->generateBulkSummary($installations);
                $zip->addFromString('Bulk_Download_Summary.txt', $bulkSummary);

                $zip->close();

                if ($totalFiles > 0) {
                    return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
                } else {
                    unlink($zipPath);
                    return back()->with('error', 'No files found for the selected installations.');
                }
            }

            return back()->with('error', 'Failed to create ZIP file.');
        } catch (\Exception $e) {
            Log::error('Bulk ZIP download error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while creating the ZIP file.');
        }
    }

    private function generateInstallationSummary(DCInstallation $installation): string
    {
        return "DC INSTALLATION SUMMARY\n" .
            "========================\n\n" .
            "SR No: {$installation->sr_no}\n" .
            "Region/Division: {$installation->region_division}\n" .
            "District: {$installation->district}\n" .
            "Tahsil: {$installation->tahsil}\n" .
            "PIN Code: {$installation->pin_code}\n" .
            "Receiver Name: {$installation->receiver_name}\n" .
            "Contact No: {$installation->contact_no}\n" .
            "Location Address: {$installation->location_address}\n" .
            "DC/IR No: {$installation->dc_ir_no}\n\n" .
            "STATUS INFORMATION\n" .
            "==================\n" .
            "Delivery Status: {$installation->delivery_status}\n" .
            "Installation Status: {$installation->installation_status}\n" .
            "Priority: {$installation->priority}\n" .
            "Assigned Technician: {$installation->assigned_technician}\n\n" .
            "EQUIPMENT DETAILS\n" .
            "=================\n" .
            "AIO-HP Serial: {$installation->aio_hp_serial}\n" .
            "Keyboard Serial: {$installation->keyboard_serial}\n" .
            "Mouse Serial: {$installation->mouse_serial}\n" .
            "UPS Serial: {$installation->ups_serial}\n" .
            "Hostname: {$installation->hostname}\n\n" .
            "DATES\n" .
            "=====\n" .
            "Dispatch Date: " . ($installation->dispatch_date ? $installation->dispatch_date->format('Y-m-d') : 'N/A') . "\n" .
            "Delivery Date: " . ($installation->delivery_date ? $installation->delivery_date->format('Y-m-d') : 'N/A') . "\n" .
            "Installation Date: " . ($installation->installation_date ? $installation->installation_date->format('Y-m-d') : 'N/A') . "\n\n" .
            "COMPLETION PERCENTAGE: {$installation->completion_percentage}%\n" .
            "CREATED BY: {$installation->created_by}\n" .
            "CREATED AT: {$installation->created_at->format('Y-m-d H:i:s')}\n\n";
    }

    private function generateBulkSummary($installations): string
    {
        $totalCount = $installations->count();
        $completedCount = $installations->where('installation_status', 'Installed')->count();
        $pendingCount = $installations->where('installation_status', 'Pending')->count();
        $inProgressCount = $installations->where('installation_status', 'In Progress')->count();

        $summary = "BULK DOWNLOAD SUMMARY\n" .
            "=====================\n\n" .
            "Total Installations: {$totalCount}\n" .
            "Completed: {$completedCount}\n" .
            "Pending: {$pendingCount}\n" .
            "In Progress: {$inProgressCount}\n\n" .
            "INSTALLATIONS INCLUDED:\n" .
            "======================\n";

        foreach ($installations as $installation) {
            $summary .= "- {$installation->sr_no} ({$installation->receiver_name}) - {$installation->installation_status}\n";
        }

        $summary .= "\nDownloaded by: " . Auth::user()->name . "\n";
        $summary .= "Downloaded at: " . date('Y-m-d H:i:s') . "\n";

        return $summary;
    }

    // Export installations data to CSV (Client view)
    public function exportInstallations(Request $request)
    {
        $query = DCInstallation::query();

        // Apply filters if provided
        if ($request->has('status') && $request->status !== 'all') {
            switch ($request->status) {
                case 'completed':
                    $query->completed();
                    break;
                case 'in_progress':
                    $query->where('installation_status', 'In Progress');
                    break;
                case 'pending':
                    $query->where('installation_status', 'Pending');
                    break;
                case 'overdue':
                    $query->overdue();
                    break;
            }
        }

        if ($request->has('region') && $request->region) {
            $query->byRegion($request->region);
        }

        if ($request->has('district') && $request->district) {
            $query->byDistrict($request->district);
        }

        $installations = $query->orderBy('created_at', 'desc')->get();

        $filename = 'dc_installations_client_export_' . date('Y-m-d_H-i-s') . '.csv';

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
                'Location Address',
                'Delivery Status',
                'Installation Status',
                'Priority',
                'Completion %',
                'Delivery Date',
                'Installation Date',
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
                    $installation->location_address,
                    $installation->delivery_status,
                    $installation->installation_status,
                    $installation->priority,
                    $installation->completion_percentage . '%',
                    $installation->delivery_date ? $installation->delivery_date->format('Y-m-d') : '',
                    $installation->installation_date ? $installation->installation_date->format('Y-m-d') : '',
                    $installation->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
