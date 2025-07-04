import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { 
    Package, 
    Search, 
    Filter, 
    Download, 
    Eye,
    Share,
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client Dashboard', href: '/client/dashboard' },
    {
        title: 'Installations',
        href: ''
    },
];

interface Installation {
    id: number;
    sr_no: string;
    region_division: string;
    district: string;
    tahsil: string;
    receiver_name: string;
    contact_no: string;
    location_address: string;
    delivery_status: string;
    installation_status: string;
    priority: string;
    completion_percentage: number;
    created_at: string;
    assigned_technician: string;
}

interface Props {
    installations: {
        data: Installation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    regions: string[];
    districts: string[];
    filters: {
        status?: string;
        region?: string;
        district?: string;
        priority?: string;
        search?: string;
    };
}

export default function ClientInstallations({ installations, regions, districts, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedRegion, setSelectedRegion] = useState(filters.region || '');
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district || '');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || '');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

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

    const handleSearch = () => {
        router.get('/client/installations', {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            region: selectedRegion || undefined,
            district: selectedDistrict || undefined,
            priority: selectedPriority || undefined,
        });
    };

    const generateShareableLink = async (installation: Installation) => {
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

    const handleBulkDownload = () => {
        if (selectedItems.length === 0) {
            alert('Please select installations to download');
            return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/client/installations/download-bulk';
        
        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        // Add selected installation IDs
        selectedItems.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'installation_ids[]';
            input.value = id.toString();
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === installations.data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(installations.data.map(item => item.id));
        }
    };

    const toggleSelectItem = (id: number) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Installations" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Installations</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Total: {installations.total} installations
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {selectedItems.length > 0 && (
                            <button
                                onClick={handleBulkDownload}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download Selected ({selectedItems.length})
                            </button>
                        )}
                        <Link
                            href="/client/export"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Export Data
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {installations.data.filter(i => i.installation_status === 'Installed').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {installations.data.filter(i => i.installation_status === 'In Progress').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {installations.data.filter(i => i.installation_status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Priority</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {installations.data.filter(i => i.priority === 'High').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by SR No, name, location..."
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Region
                            </label>
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Regions</option>
                                {regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priority
                            </label>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Installations Grid/Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === installations.data.length && installations.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {installations.data.map((installation) => (
                                    <tr key={installation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(installation.id)}
                                                onChange={() => toggleSelectItem(installation.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {installation.sr_no}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {installation.receiver_name}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {new Date(installation.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {installation.district}, {installation.tahsil}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {installation.region_division}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                                    {installation.location_address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(installation.delivery_status)}`}>
                                                    {installation.delivery_status}
                                                </span>
                                                <br />
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(installation.installation_status)}`}>
                                                    {installation.installation_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                                                    {installation.completion_percentage}%
                                                </div>
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${installation.completion_percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {installation.assigned_technician && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Tech: {installation.assigned_technician}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(installation.priority)}`}>
                                                {installation.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    href={`/dc-installations/${installation.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">View</span>
                                                </Link>
                                                <button
                                                    onClick={() => generateShareableLink(installation)}
                                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                                                    title="Generate Shareable Link"
                                                >
                                                    <Share className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">Share</span>
                                                </button>
                                                <a
                                                    href={`/client/installations/${installation.id}/download-all`}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                                                    title="Download All Files"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">Download</span>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {installations.last_page > 1 && (
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {((installations.current_page - 1) * installations.per_page) + 1} to {Math.min(installations.current_page * installations.per_page, installations.total)} of {installations.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {installations.current_page > 1 && (
                                        <Link
                                            href={`/client/installations?page=${installations.current_page - 1}&${new URLSearchParams(filters).toString()}`}
                                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    
                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, installations.last_page) }, (_, i) => {
                                        const pageNum = installations.current_page - 2 + i;
                                        if (pageNum > 0 && pageNum <= installations.last_page) {
                                            return (
                                                <Link
                                                    key={pageNum}
                                                    href={`/client/installations?page=${pageNum}&${new URLSearchParams(filters).toString()}`}
                                                    className={`px-3 py-1 text-sm border rounded ${
                                                        pageNum === installations.current_page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            );
                                        }
                                        return null;
                                    })}

                                    {installations.current_page < installations.last_page && (
                                        <Link
                                            href={`/client/installations?page=${installations.current_page + 1}&${new URLSearchParams(filters).toString()}`}
                                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {installations.data.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No installations found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {Object.values(filters).some(Boolean) 
                                ? 'Try adjusting your filters or search terms.'
                                : 'No installation records are available.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}