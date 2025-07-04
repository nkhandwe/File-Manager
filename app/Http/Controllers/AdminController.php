<?php

namespace App\Http\Controllers;

use App\Models\DCInstallation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use ZipArchive;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_installations' => DCInstallation::count(),
            'completed' => DCInstallation::where('installation_status', 'Installed')->count(),
            'pending' => DCInstallation::where('installation_status', 'Pending')->count(),
            'in_progress' => DCInstallation::where('installation_status', 'In Progress')->count(),
            'overdue' => DCInstallation::where('installation_status', 'Pending')
                ->where('delivery_date', '<=', now()->subDays(7))
                ->count(),
            'high_priority' => DCInstallation::where('priority', 'High')->count(),
            'this_week' => DCInstallation::where('created_at', '>=', now()->subWeek())->count(),
            'this_month' => DCInstallation::where('created_at', '>=', now()->subMonth())->count(),
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'admin_users' => User::where('user_type', 'Admin')->count(),
            'client_users' => User::where('user_type', 'Client')->count(),
        ];

        $recentInstallations = DCInstallation::latest()->limit(10)->get();

        $overdueInstallations = DCInstallation::where('installation_status', 'Pending')
            ->where('delivery_date', '<=', now()->subDays(7))
            ->limit(5)
            ->get();

        $highPriorityInstallations = DCInstallation::where('priority', 'High')
            ->where('installation_status', '!=', 'Installed')
            ->limit(5)
            ->get();

        // Chart data for analytics
        $statusDistribution = [
            'completed' => DCInstallation::where('installation_status', 'Installed')->count(),
            'pending' => DCInstallation::where('installation_status', 'Pending')->count(),
            'in_progress' => DCInstallation::where('installation_status', 'In Progress')->count(),
        ];

        $regionDistribution = DCInstallation::selectRaw('region_division, COUNT(*) as count')
            ->whereNotNull('region_division')
            ->groupBy('region_division')
            ->pluck('count', 'region_division')
            ->toArray();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentInstallations' => $recentInstallations,
            'overdueInstallations' => $overdueInstallations,
            'highPriorityInstallations' => $highPriorityInstallations,
            'statusDistribution' => $statusDistribution,
            'regionDistribution' => $regionDistribution,
        ]);
    }

    // Installation Management
    public function installations(Request $request)
    {
        $query = DCInstallation::query();

        // Apply filters
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'completed':
                    $query->where('installation_status', 'Installed');
                    break;
                case 'pending':
                    $query->where('installation_status', 'Pending');
                    break;
                case 'in_progress':
                    $query->where('installation_status', 'In Progress');
                    break;
                case 'overdue':
                    $query->where('installation_status', 'Pending')
                        ->where('delivery_date', '<=', now()->subDays(7));
                    break;
            }
        }

        if ($request->filled('region')) {
            $query->where('region_division', $request->region);
        }

        if ($request->filled('district')) {
            $query->where('district', $request->district);
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

        $regions = DCInstallation::distinct()->whereNotNull('region_division')->pluck('region_division');
        $districts = DCInstallation::distinct()->whereNotNull('district')->pluck('district');

        return Inertia::render('Admin/Installations', [
            'installations' => $installations,
            'regions' => $regions,
            'districts' => $districts,
            'filters' => $request->only(['status', 'region', 'district', 'priority', 'search']),
        ]);
    }

    public function createInstallation()
    {
        $regions = ['Amravati', 'Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Aurangabad'];
        $districts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur'];

        return Inertia::render('Admin/CreateInstallation', [
            'regions' => $regions,
            'districts' => $districts,
        ]);
    }

    public function storeInstallation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'region_division' => 'required|string|max:255',
            'location_address' => 'required|string|max:1000',
            'district' => 'required|string|max:255',
            'tahsil' => 'required|string|max:255',
            'pin_code' => 'required|string|size:6',
            'receiver_name' => 'required|string|max:255',
            'contact_no' => 'required|string|size:10',
            'dc_ir_no' => 'nullable|string|max:255',
            'delivery_status' => 'required|in:Delivered,Pending,In Transit',
            'installation_status' => 'required|in:Installed,Pending,In Progress',
            'priority' => 'required|in:High,Medium,Low',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $data = $request->all();
            $data['created_by'] = Auth::user()->name;
            $data['updated_by'] = Auth::user()->name;

            DCInstallation::create($data);

            return redirect()->route('admin.installations')
                ->with('success', 'Installation record created successfully!');
        } catch (\Exception $e) {
            Log::error('Admin installation creation error: ' . $e->getMessage());
            return back()->withInput()
                ->with('error', 'An error occurred while creating the installation record.');
        }
    }

    public function editInstallation(DCInstallation $installation)
    {
        $regions = ['Amravati', 'Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Aurangabad'];
        $districts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur'];

        return Inertia::render('Admin/EditInstallation', [
            'installation' => $installation,
            'regions' => $regions,
            'districts' => $districts,
        ]);
    }

    public function updateInstallation(Request $request, DCInstallation $installation)
    {
        $validator = Validator::make($request->all(), [
            'region_division' => 'required|string|max:255',
            'location_address' => 'required|string|max:1000',
            'district' => 'required|string|max:255',
            'tahsil' => 'required|string|max:255',
            'pin_code' => 'required|string|size:6',
            'receiver_name' => 'required|string|max:255',
            'contact_no' => 'required|string|size:10',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $data = $request->all();
            $data['updated_by'] = Auth::user()->name;

            $installation->update($data);

            return redirect()->route('admin.installations')
                ->with('success', 'Installation record updated successfully!');
        } catch (\Exception $e) {
            Log::error('Admin installation update error: ' . $e->getMessage());
            return back()->withInput()
                ->with('error', 'An error occurred while updating the installation record.');
        }
    }

    public function deleteInstallation(DCInstallation $installation)
    {
        try {
            // Delete associated files if method exists
            if (method_exists($installation, 'deleteAllFiles')) {
                $installation->deleteAllFiles();
            }
            $installation->delete();

            return redirect()->route('admin.installations')
                ->with('success', 'Installation record deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Admin installation deletion error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while deleting the installation record.');
        }
    }

    // User Management
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->filled('type')) {
            $query->where('user_type', $request->type);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } else {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function createUser()
    {
        return Inertia::render('Admin/CreateUser');
    }

    public function storeUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'user_type' => 'required|in:Admin,Client,User',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => $request->user_type,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('admin.users')
                ->with('success', 'User created successfully!');
        } catch (\Exception $e) {
            Log::error('User creation error: ' . $e->getMessage());
            return back()->withInput()
                ->with('error', 'An error occurred while creating the user.');
        }
    }

    public function editUser(User $user)
    {
        return Inertia::render('Admin/EditUser', [
            'user' => $user,
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'user_type' => 'required|in:Admin,Client,User',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'user_type' => $request->user_type,
                'is_active' => $request->boolean('is_active'),
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return redirect()->route('admin.users')
                ->with('success', 'User updated successfully!');
        } catch (\Exception $e) {
            Log::error('User update error: ' . $e->getMessage());
            return back()->withInput()
                ->with('error', 'An error occurred while updating the user.');
        }
    }

    public function deleteUser(User $user)
    {
        try {
            if ($user->id === Auth::id()) {
                return back()->with('error', 'You cannot delete your own account.');
            }

            $user->delete();

            return redirect()->route('admin.users')
                ->with('success', 'User deleted successfully!');
        } catch (\Exception $e) {
            Log::error('User deletion error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while deleting the user.');
        }
    }

    public function toggleUserStatus(User $user)
    {
        try {
            if ($user->id === Auth::id()) {
                return back()->with('error', 'You cannot change your own status.');
            }

            $user->update(['is_active' => !$user->is_active]);

            $status = $user->is_active ? 'activated' : 'deactivated';
            return back()->with('success', "User {$status} successfully!");
        } catch (\Exception $e) {
            Log::error('User status toggle error: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while changing user status.');
        }
    }

    // Reports and Analytics
    public function reports(Request $request)
    {
        $stats = [
            'total' => DCInstallation::count(),
            'completed' => DCInstallation::where('installation_status', 'Installed')->count(),
            'pending' => DCInstallation::where('installation_status', 'Pending')->count(),
            'overdue' => DCInstallation::where('installation_status', 'Pending')
                ->where('delivery_date', '<=', now()->subDays(7))
                ->count(),
            'high_priority' => DCInstallation::where('priority', 'High')->count(),
        ];

        // Monthly installation trends - SQLite compatible
        $monthlyTrends = [];
        for ($month = 1; $month <= 12; $month++) {
            $count = DCInstallation::whereRaw("CAST(strftime('%m', created_at) AS INTEGER) = ?", [$month])
                ->whereYear('created_at', date('Y'))
                ->count();
            $monthlyTrends[$month] = $count;
        }

        // Regional distribution with completion data
        $regionalData = DCInstallation::select('region_division')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN installation_status = "Installed" THEN 1 ELSE 0 END) as completed')
            ->whereNotNull('region_division')
            ->groupBy('region_division')
            ->get();

        // Performance metrics
        $performanceMetrics = [
            'completion_rate' => $stats['total'] > 0 ? round(($stats['completed'] / $stats['total']) * 100, 2) : 0,
            'overdue_rate' => $stats['total'] > 0 ? round(($stats['overdue'] / $stats['total']) * 100, 2) : 0,
            'high_priority_rate' => $stats['total'] > 0 ? round(($stats['high_priority'] / $stats['total']) * 100, 2) : 0,
        ];

        // Recent activity (last 30 days)
        $recentActivity = DCInstallation::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();

        // Status breakdown by region
        $statusByRegion = DCInstallation::select('region_division', 'installation_status')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('region_division')
            ->groupBy('region_division', 'installation_status')
            ->get()
            ->groupBy('region_division');

        return Inertia::render('Admin/Reports', [
            'stats' => $stats,
            'monthlyTrends' => $monthlyTrends,
            'regionalData' => $regionalData,
            'performanceMetrics' => $performanceMetrics,
            'recentActivity' => $recentActivity,
            'statusByRegion' => $statusByRegion,
        ]);
    }

    public function exportReports(Request $request)
    {
        $query = DCInstallation::query();

        // Apply filters
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'completed':
                    $query->where('installation_status', 'Installed');
                    break;
                case 'pending':
                    $query->where('installation_status', 'Pending');
                    break;
                case 'overdue':
                    $query->where('installation_status', 'Pending')
                        ->where('delivery_date', '<=', now()->subDays(7));
                    break;
            }
        }

        if ($request->filled('region')) {
            $query->where('region_division', $request->region);
        }

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [$request->date_from, $request->date_to]);
        }

        $installations = $query->orderBy('created_at', 'desc')->get();

        $filename = 'admin_installations_report_' . date('Y-m-d_H-i-s') . '.csv';

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
                'DC/IR No',
                'Delivery Status',
                'Installation Status',
                'Priority',
                'Assigned Technician',
                'Dispatch Date',
                'Delivery Date',
                'Installation Date',
                'Created By',
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
                    $installation->dc_ir_no,
                    $installation->delivery_status,
                    $installation->installation_status,
                    $installation->priority,
                    $installation->assigned_technician,
                    $installation->dispatch_date ? $installation->dispatch_date->format('Y-m-d') : '',
                    $installation->delivery_date ? $installation->delivery_date->format('Y-m-d') : '',
                    $installation->installation_date ? $installation->installation_date->format('Y-m-d') : '',
                    $installation->created_by,
                    $installation->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function analytics()
    {
        $totalInstallations = DCInstallation::count();
        $completionRate = $totalInstallations > 0
            ? round((DCInstallation::where('installation_status', 'Installed')->count() / $totalInstallations) * 100, 2)
            : 0;

        // Average completion time calculation (SQLite compatible)
        $avgCompletionTime = DCInstallation::whereNotNull('delivery_date')
            ->whereNotNull('installation_date')
            ->selectRaw('AVG(JULIANDAY(installation_date) - JULIANDAY(delivery_date)) as avg_days')
            ->value('avg_days');

        $analytics = [
            'completion_rate' => $completionRate,
            'avg_completion_time' => round($avgCompletionTime ?? 0, 1),
            'overdue_percentage' => $totalInstallations > 0
                ? round((DCInstallation::where('installation_status', 'Pending')
                    ->where('delivery_date', '<=', now()->subDays(7))
                    ->count() / $totalInstallations) * 100, 2)
                : 0,
            'high_priority_percentage' => $totalInstallations > 0
                ? round((DCInstallation::where('priority', 'High')->count() / $totalInstallations) * 100, 2)
                : 0,
        ];

        return Inertia::render('Admin/Analytics', [
            'analytics' => $analytics,
        ]);
    }

    // System Settings
    public function settings()
    {
        return Inertia::render('Admin/Settings');
    }

    public function updateSettings(Request $request)
    {
        // Implement settings update logic
        return back()->with('success', 'Settings updated successfully!');
    }

    // Logs and Audit
    public function logs()
    {
        return Inertia::render('Admin/Logs');
    }

    public function audit()
    {
        return Inertia::render('Admin/Audit');
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
            Log::error('ZIP download error: ' . $e->getMessage());
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
            "DOCUMENT STATUS\n" .
            "===============\n" .
            "Soft Copy DC: " . ($installation->soft_copy_dc ? 'Yes' : 'No') . "\n" .
            "Soft Copy IR: " . ($installation->soft_copy_ir ? 'Yes' : 'No') . "\n" .
            "Original POD Received: " . ($installation->original_pod_received ? 'Yes' : 'No') . "\n" .
            "Original DC Received: " . ($installation->original_dc_received ? 'Yes' : 'No') . "\n" .
            "IR Original Copy Received: " . ($installation->ir_original_copy_received ? 'Yes' : 'No') . "\n\n" .
            "PHOTO/EVIDENCE STATUS\n" .
            "=====================\n" .
            "Back Side Photo Taken: " . ($installation->back_side_photo_taken ? 'Yes' : 'No') . "\n" .
            "OS Installation Photo Taken: " . ($installation->os_installation_photo_taken ? 'Yes' : 'No') . "\n" .
            "Belarc Report Generated: " . ($installation->belarc_report_generated ? 'Yes' : 'No') . "\n\n" .
            "CREATED BY: {$installation->created_by}\n" .
            "CREATED AT: {$installation->created_at->format('Y-m-d H:i:s')}\n" .
            "LAST UPDATED: {$installation->updated_at->format('Y-m-d H:i:s')}\n\n" .
            "Generated on: " . date('Y-m-d H:i:s') . "\n";
    }
}
