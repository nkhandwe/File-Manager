import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, Download, Eye, FileText, Package, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Client Dashboard',
        href: '/client/dashboard',
    },
];

interface Stats {
    total_installations: number;
    completed: number;
    pending: number;
    in_progress: number;
    overdue: number;
    high_priority: number;
    this_week: number;
    this_month: number;
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

interface StatusDistribution {
    completed: number;
    pending: number;
    in_progress: number;
}

interface RegionDistribution {
    [key: string]: number;
}

interface Props {
    stats: Stats;
    recentInstallations: Installation[];
    overdueInstallations: Installation[];
    statusDistribution: StatusDistribution;
    regionDistribution: RegionDistribution;
}

export default function ClientDashboard({ stats, recentInstallations, overdueInstallations, statusDistribution, regionDistribution }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Installed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'In Progress':
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
            <Head title="Client Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Monitor and manage your DC installations</p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/client/installations"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View All
                        </Link>
                        <Link
                            href="/client/reports"
                            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Reports
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
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total_installations}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 dark:text-green-400">This Week: {stats.this_week}</span>
                                <span className="text-blue-600 dark:text-blue-400">This Month: {stats.this_month}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-sm text-green-600 dark:text-green-400">
                                Success Rate: {stats.total_installations > 0 ? Math.round((stats.completed / stats.total_installations) * 100) : 0}%
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
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending + stats.in_progress}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-600 dark:text-blue-400">Active: {stats.in_progress}</span>
                                <span className="text-yellow-600 dark:text-yellow-400">Pending: {stats.pending}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attention Required</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.overdue + stats.high_priority}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-600 dark:text-red-400">Overdue: {stats.overdue}</span>
                                <span className="text-orange-600 dark:text-orange-400">High Priority: {stats.high_priority}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Progress Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Installation Progress */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Installation Progress</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Completion</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {stats.completed} of {stats.total_installations}
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className="h-3 rounded-full bg-green-600 transition-all duration-500 dark:bg-green-400"
                                        style={{
                                            width: `${stats.total_installations > 0 ? (stats.completed / stats.total_installations) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statusDistribution.completed}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusDistribution.in_progress}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusDistribution.pending}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regional Distribution */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Regional Distribution</h3>
                        <div className="space-y-4">
                            {Object.entries(regionDistribution)
                                .slice(0, 6)
                                .map(([region, count]) => (
                                    <div key={region} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{region}</span>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600"
                                                    style={{
                                                        width: `${stats.total_installations > 0 ? (count / stats.total_installations) * 100 : 0}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="w-8 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Tables Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Installations */}
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Installations</h3>
                                <Link
                                    href="/client/installations"
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    View all
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentInstallations.slice(0, 5).map((installation) => (
                                    <div key={installation.id} className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-3">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{installation.sr_no}</p>
                                                <span
                                                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getPriorityColor(installation.priority)}`}
                                                >
                                                    {installation.priority}
                                                </span>
                                            </div>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{installation.receiver_name}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.installation_status)}`}
                                            >
                                                {installation.installation_status}
                                            </span>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{installation.completion_percentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Overdue Items */}
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items Requiring Attention</h3>
                        </div>
                        <div className="p-6">
                            {overdueInstallations.length > 0 ? (
                                <div className="space-y-4">
                                    {overdueInstallations.slice(0, 5).map((installation) => (
                                        <div key={installation.id} className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{installation.sr_no}</p>
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                </div>
                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{installation.receiver_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.installation_status)}`}
                                                >
                                                    {installation.installation_status}
                                                </span>
                                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Overdue</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No overdue installations</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Link
                            href="/client/installations"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <Package className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">View Installations</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Browse all records</p>
                            </div>
                        </Link>

                        <Link
                            href="/client/installations?status=completed"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <Download className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Download Files</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Get installation files</p>
                            </div>
                        </Link>

                        <Link
                            href="/client/reports"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <FileText className="mr-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Generate Reports</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Export data</p>
                            </div>
                        </Link>

                        <Link
                            href="/client/profile"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <TrendingUp className="mr-3 h-8 w-8 text-orange-600 dark:text-orange-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">My Activity</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
