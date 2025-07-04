import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, Package, PlusCircle, Search, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Stats {
    total: number;
    delivered: number;
    installed: number;
    pending_delivery: number;
    pending_installation: number;
    in_progress: number;
    overdue: number;
    high_priority: number;
    this_week: number;
    with_files: number;
}

interface Installation {
    id: number;
    sr_no: string;
    receiver_name: string;
    location_address: string;
    installation_status: string;
    delivery_status: string;
    priority: string;
    created_at: string;
    completion_percentage: number;
}

interface Props {
    installations: {
        data: Installation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    recentInstallations: Installation[];
}

export default function UserDashboard({ installations, stats, recentInstallations }: Props) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Welcome to DC Installation Management System</p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Installation
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Installations</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">+{stats.this_week} this week</div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.installed}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-sm text-green-600 dark:text-green-400">
                                {stats.total > 0 ? Math.round((stats.installed / stats.total) * 100) : 0}% completion rate
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stats.in_progress + stats.pending_installation}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-600 dark:text-blue-400">Active: {stats.in_progress}</span>
                                <span className="text-yellow-600 dark:text-yellow-400">Pending: {stats.pending_installation}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">With Documents</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.with_files}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                                {stats.total > 0 ? Math.round((stats.with_files / stats.total) * 100) : 0}% have files
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Link
                            href="/"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <PlusCircle className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Create New Installation</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Submit a new DC installation request</p>
                            </div>
                        </Link>

                        <button
                            onClick={() => {
                                // You can implement search functionality here
                                const searchElement = document.getElementById('search-input');
                                if (searchElement) {
                                    searchElement.focus();
                                }
                            }}
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <Search className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Search Installations</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Find specific installation records</p>
                            </div>
                        </button>

                        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                            <TrendingUp className="mr-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">View Statistics</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Monitor installation progress</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Installations</h3>
                    </div>
                    <div className="p-6">
                        {recentInstallations && recentInstallations.length > 0 ? (
                            <div className="space-y-4">
                                {recentInstallations.slice(0, 5).map((installation) => (
                                    <div
                                        key={installation.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-3">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{installation.sr_no}</p>
                                                <span
                                                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getPriorityColor(installation.priority)}`}
                                                >
                                                    {installation.priority}
                                                </span>
                                            </div>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                {installation.receiver_name} • {installation.location_address}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                Created: {new Date(installation.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.delivery_status)}`}
                                                >
                                                    {installation.delivery_status}
                                                </span>
                                                <div className="mt-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.installation_status)}`}
                                                    >
                                                        {installation.installation_status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {installation.completion_percentage}%
                                                </div>
                                                <div className="mt-1 h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                                        style={{ width: `${installation.completion_percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    No installations found. Create your first installation to get started.
                                </p>
                                <Link
                                    href="/"
                                    className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Installation
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Installation List */}
                {installations && installations.data && installations.data.length > 0 && (
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Installations</h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {(installations.current_page - 1) * installations.per_page + 1} to{' '}
                                    {Math.min(installations.current_page * installations.per_page, installations.total)} of {installations.total}{' '}
                                    results
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Installation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Receiver
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {installations.data.map((installation) => (
                                        <tr key={installation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{installation.sr_no}</div>
                                                    <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                                                        {installation.location_address}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{installation.receiver_name}</div>
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
                                                            className="h-2 rounded-full bg-blue-600"
                                                            style={{ width: `${installation.completion_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                {new Date(installation.created_at).toLocaleDateString()}
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
                                        Showing page {installations.current_page} of {installations.last_page}
                                    </div>
                                    <div className="flex space-x-2">
                                        {installations.current_page > 1 && (
                                            <Link
                                                href={`/dashboard?page=${installations.current_page - 1}`}
                                                className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {installations.current_page < installations.last_page && (
                                            <Link
                                                href={`/dashboard?page=${installations.current_page + 1}`}
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
                )}
            </div>
        </AppLayout>
    );
}
