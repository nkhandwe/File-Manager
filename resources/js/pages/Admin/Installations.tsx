import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Edit, Eye, Filter, Package, Plus, Search, Share, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin Dashboard', href: '/admin/dashboard' }, { title: 'Installations' }];

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

export default function AdminInstallations({ installations, regions, districts, filters }: Props) {
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
        router.get('/admin/installations', {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            region: selectedRegion || undefined,
            district: selectedDistrict || undefined,
            priority: selectedPriority || undefined,
        });
    };

    const handleDelete = (installationId: number) => {
        if (confirm('Are you sure you want to delete this installation?')) {
            router.delete(`/admin/installations/${installationId}`);
        }
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) {
            alert('Please select items to delete');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedItems.length} installations?`)) {
            // Handle bulk delete
            selectedItems.forEach((id) => {
                router.delete(`/admin/installations/${id}`);
            });
            setSelectedItems([]);
        }
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

    const toggleSelectAll = () => {
        if (selectedItems.length === installations.data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(installations.data.map((item) => item.id));
        }
    };

    const toggleSelectItem = (id: number) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Installations" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Installations</h1>
                        <p className="text-gray-600 dark:text-gray-400">Total: {installations.total} installations</p>
                    </div>
                    <div className="flex space-x-3">
                        {selectedItems.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedItems.length})
                            </button>
                        )}
                        <Link
                            href="/admin/installations/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Installation
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="Search by SR No, name, location..."
                                />
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Regions</option>
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Installations Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === installations.data.length && installations.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Installation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {installations.data.map((installation) => (
                                    <tr key={installation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(installation.id)}
                                                onChange={() => toggleSelectItem(installation.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {installation.district}, {installation.tahsil}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{installation.region_division}</div>
                                                <div className="max-w-xs truncate text-xs text-gray-400 dark:text-gray-500">
                                                    {installation.location_address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.delivery_status)}`}
                                                >
                                                    {installation.delivery_status}
                                                </span>
                                                <br />
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.installation_status)}`}
                                                >
                                                    {installation.installation_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    {installation.completion_percentage}%
                                                </div>
                                                <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                                        style={{ width: `${installation.completion_percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {installation.assigned_technician && (
                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Tech: {installation.assigned_technician}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(installation.priority)}`}
                                            >
                                                {installation.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/dc-installations/${installation.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/installations/${installation.id}/edit`}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => generateShareableLink(installation)}
                                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                    title="Generate Shareable Link"
                                                >
                                                    <Share className="h-4 w-4" />
                                                </button>
                                                <a
                                                    href={`/admin/installations/${installation.id}/download-all`}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="Download All Files"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(installation.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {installations.last_page > 1 && (
                        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {(installations.current_page - 1) * installations.per_page + 1} to{' '}
                                    {Math.min(installations.current_page * installations.per_page, installations.total)} of {installations.total}{' '}
                                    results
                                </div>
                                <div className="flex space-x-2">
                                    {installations.current_page > 1 && (
                                        <Link
                                            href={`/admin/installations?page=${installations.current_page - 1}&${new URLSearchParams(filters).toString()}`}
                                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
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
                                                    href={`/admin/installations?page=${pageNum}&${new URLSearchParams(filters).toString()}`}
                                                    className={`rounded border px-3 py-1 text-sm ${
                                                        pageNum === installations.current_page
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
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
                                            href={`/admin/installations?page=${installations.current_page + 1}&${new URLSearchParams(filters).toString()}`}
                                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
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
                    <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No installations found</h3>
                        <p className="mb-4 text-gray-500 dark:text-gray-400">
                            {Object.values(filters).some(Boolean)
                                ? 'Try adjusting your filters or search terms.'
                                : 'Get started by creating your first installation record.'}
                        </p>
                        <Link
                            href="/admin/installations/create"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Installation
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
