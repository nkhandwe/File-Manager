import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Edit,
    Eye,
    FileImage,
    FileText,
    MapPin,
    Monitor,
    Package,
    Phone,
    Share,
    User,
} from 'lucide-react';

interface Installation {
    id: number;
    sr_no: string;
    region_division: string;
    district: string;
    tahsil: string;
    pin_code: string;
    receiver_name: string;
    contact_no: string;
    contact_no_two?: string;
    location_address: string;
    dc_ir_no?: string;
    dispatch_date?: string;
    delivery_date?: string;
    installation_date?: string;
    delivery_status: string;
    installation_status: string;
    priority: string;
    assigned_technician?: string;
    completion_percentage: number;
    created_at: string;
    created_by?: string;

    // Equipment details
    serial_number?: string;
    aio_hp_serial?: string;
    keyboard_serial?: string;
    mouse_serial?: string;
    ups_serial?: string;
    hostname?: string;
    antivirus?: string;

    // Document status
    soft_copy_dc: boolean;
    soft_copy_ir: boolean;
    original_pod_received: boolean;
    original_dc_received: boolean;
    ir_original_copy_received: boolean;
    back_side_photo_taken: boolean;
    os_installation_photo_taken: boolean;
    belarc_report_generated: boolean;

    // File URLs
    delivery_report_url?: string;
    installation_report_url?: string;
    belarc_report_url?: string;
    back_side_photo_url?: string;
    os_installation_photo_url?: string;
    keyboard_photo_url?: string;
    mouse_photo_url?: string;
    screenshot_url?: string;
    evidence_file_url?: string;

    remarks?: string;
    internal_notes?: string;
}

interface Props {
    installation: Installation;
    canEdit?: boolean;
    canDownload?: boolean;
    isSharedView?: boolean;
}

export default function DCInstallationShow({ installation, canEdit = false, canDownload = false, isSharedView = false }: Props) {
    const breadcrumbs: BreadcrumbItem[] = isSharedView
        ? [{ title: 'Shared Installation View' }]
        : [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Installation Details' }];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Installed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'Delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'In Transit':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'Low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const generateShareableLink = async () => {
        try {
            const response = await fetch(`/dc-installations/${installation.id}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                navigator.clipboard.writeText(data.shareable_url);
                alert('Shareable link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error generating shareable link:', error);
            alert('Failed to generate shareable link');
        }
    };

    const fileItems = [
        { label: 'Delivery Report', url: installation.delivery_report_url, key: 'delivery_report_file' },
        { label: 'Installation Report', url: installation.installation_report_url, key: 'installation_report_file' },
        { label: 'Belarc Report', url: installation.belarc_report_url, key: 'belarc_report_file' },
        { label: 'Back Side Photo', url: installation.back_side_photo_url, key: 'back_side_photo_file' },
        { label: 'OS Installation Photo', url: installation.os_installation_photo_url, key: 'os_installation_photo_file' },
        { label: 'Keyboard Photo', url: installation.keyboard_photo_url, key: 'keyboard_photo_file' },
        { label: 'Mouse Photo', url: installation.mouse_photo_url, key: 'mouse_photo_file' },
        { label: 'Screenshot', url: installation.screenshot_url, key: 'screenshot_file' },
        { label: 'Evidence File', url: installation.evidence_file_url, key: 'evidence_file' },
    ].filter((item) => item.url);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Installation ${installation.sr_no}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Installation {installation.sr_no}</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {installation.receiver_name} • {installation.district}
                        </p>
                        {isSharedView && (
                            <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                <Share className="mr-2 h-4 w-4" />
                                Shared View
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        {canEdit && (
                            <Link
                                href={`/admin/installations/${installation.id}/edit`}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        )}
                        {canDownload && !isSharedView && (
                            <button
                                onClick={generateShareableLink}
                                className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                            >
                                <Share className="mr-2 h-4 w-4" />
                                Share
                            </button>
                        )}
                        {canDownload && fileItems.length > 0 && (
                            <a
                                href={`/dc-installations/${installation.id}/download-all`}
                                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download All
                            </a>
                        )}
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Status</p>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getStatusColor(installation.delivery_status)}`}
                                >
                                    {installation.delivery_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center">
                            <Monitor className="h-8 w-8 text-green-600 dark:text-green-400" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Installation Status</p>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getStatusColor(installation.installation_status)}`}
                                >
                                    {installation.installation_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getPriorityColor(installation.priority)}`}
                                >
                                    {installation.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion</p>
                                <div className="mt-1 flex items-center">
                                    <span className="mr-2 text-lg font-semibold text-gray-900 dark:text-white">
                                        {installation.completion_percentage}%
                                    </span>
                                    <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                                            style={{ width: `${installation.completion_percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <MapPin className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Region/Division</label>
                                <p className="text-sm text-gray-900 dark:text-white">{installation.region_division}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">District</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.district}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Tahsil</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.tahsil}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Location Address</label>
                                <p className="text-sm text-gray-900 dark:text-white">{installation.location_address}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">PIN Code</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.pin_code}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">DC/IR No</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.dc_ir_no || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <User className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Receiver Name</label>
                                <p className="text-sm text-gray-900 dark:text-white">{installation.receiver_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</label>
                                <div className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.contact_no}</p>
                                </div>
                            </div>
                            {installation.contact_no_two && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Alternative Contact</label>
                                    <div className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                        <p className="text-sm text-gray-900 dark:text-white">{installation.contact_no_two}</p>
                                    </div>
                                </div>
                            )}
                            {installation.assigned_technician && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Technician</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.assigned_technician}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Equipment Details */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <Monitor className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Equipment Details
                        </h3>
                        <div className="space-y-4">
                            {installation.serial_number && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</label>
                                    <p className="font-mono text-sm text-gray-900 dark:text-white">{installation.serial_number}</p>
                                </div>
                            )}
                            {installation.aio_hp_serial && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">AIO-HP Serial</label>
                                    <p className="font-mono text-sm text-gray-900 dark:text-white">{installation.aio_hp_serial}</p>
                                </div>
                            )}
                            {installation.hostname && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Hostname</label>
                                    <p className="font-mono text-sm text-gray-900 dark:text-white">{installation.hostname}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                {installation.keyboard_serial && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Keyboard Serial</label>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">{installation.keyboard_serial}</p>
                                    </div>
                                )}
                                {installation.mouse_serial && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Mouse Serial</label>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">{installation.mouse_serial}</p>
                                    </div>
                                )}
                            </div>
                            {installation.antivirus && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Antivirus</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.antivirus}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Important Dates */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <Calendar className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Important Dates
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {new Date(installation.created_at).toLocaleDateString()} at{' '}
                                    {new Date(installation.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                            {installation.dispatch_date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Dispatch Date</label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(installation.dispatch_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {installation.delivery_date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(installation.delivery_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {installation.installation_date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Installation Date</label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(installation.installation_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {installation.created_by && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                                    <p className="text-sm text-gray-900 dark:text-white">{installation.created_by}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Document Status */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <FileText className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Document & Photo Status
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Documents</h4>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    {installation.soft_copy_dc ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Soft Copy DC</span>
                                </div>
                                <div className="flex items-center">
                                    {installation.soft_copy_ir ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Soft Copy IR</span>
                                </div>
                                <div className="flex items-center">
                                    {installation.original_pod_received ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Original POD Received</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Physical Documents</h4>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    {installation.original_dc_received ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Original DC Received</span>
                                </div>
                                <div className="flex items-center">
                                    {installation.ir_original_copy_received ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">IR Original Copy Received</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Photos & Evidence</h4>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    {installation.back_side_photo_taken ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Back Side Photo</span>
                                </div>
                                <div className="flex items-center">
                                    {installation.os_installation_photo_taken ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">OS Installation Photo</span>
                                </div>
                                <div className="flex items-center">
                                    {installation.belarc_report_generated ? (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Belarc Report</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Files Section */}
                {fileItems.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                <Download className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                                Available Files ({fileItems.length})
                            </h3>
                            {canDownload && (
                                <a
                                    href={`/dc-installations/${installation.id}/download-all`}
                                    className="inline-flex items-center rounded bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
                                >
                                    <Download className="mr-1 h-3 w-3" />
                                    Download All
                                </a>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {fileItems.map((file, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {file.url?.toLowerCase().includes('.jpg') ||
                                            file.url?.toLowerCase().includes('.png') ||
                                            file.url?.toLowerCase().includes('.jpeg') ? (
                                                <FileImage className="mr-3 h-6 w-6 text-blue-500" />
                                            ) : (
                                                <FileText className="mr-3 h-6 w-6 text-gray-500" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {file.url && (
                                                <>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View File"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                    <a
                                                        href={`/dc-installations/${installation.id}/download/${file.key}`}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Download File"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Remarks & Notes */}
                {(installation.remarks || installation.internal_notes) && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <FileText className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                            Additional Information
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {installation.remarks && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">Installation Remarks</label>
                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{installation.remarks}</p>
                                    </div>
                                </div>
                            )}
                            {installation.internal_notes && !isSharedView && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">Internal Notes</label>
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{installation.internal_notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="flex justify-start">
                    {!isSharedView ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            ← Back to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            ← Go to Home
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
