import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, CheckCircle, FileText, Package, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
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
    this_month?: number;
    completion_rate?: number;
    // User stats (optional)
    total_users?: number;
    active_users?: number;
    admin_users?: number;
    client_users?: number;
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
    district?: string;
    region_division?: string;
}

interface Props {
    stats: Stats;
    recentInstallations: Installation[];
    // Make these optional since they might not be passed from the controller
    overdueInstallations?: Installation[];
    highPriorityInstallations?: Installation[];
    statusDistribution?: {
        completed: number;
        pending: number;
        in_progress: number;
    };
    regionDistribution?: {
        [key: string]: number;
    };
}

export default function AdminDashboard({
    stats,
    recentInstallations = [],
    overdueInstallations = [],
    highPriorityInstallations = [],
    statusDistribution,
    regionDistribution = {},
}: Props) {
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

    // Calculate derived stats from the main stats object
    const totalInstallations = stats.total || 0;
    const completedInstallations = stats.installed || 0;
    const pendingInstallations = stats.pending_installation + stats.pending_delivery || 0;
    const inProgressInstallations = stats.in_progress || 0;
    const completionRate = totalInstallations > 0 ? Math.round((completedInstallations / totalInstallations) * 100) : 0;

    // Create status distribution from stats if not provided
    const finalStatusDistribution = statusDistribution || {
        completed: completedInstallations,
        pending: pendingInstallations,
        in_progress: inProgressInstallations,
    };

    // Create region distribution from installations if not provided
    const finalRegionDistribution =
        Object.keys(regionDistribution).length > 0
            ? regionDistribution
            : recentInstallations.reduce(
                  (acc, installation) => {
                      const region = installation.region_division || installation.district || 'Unknown';
                      acc[region] = (acc[region] || 0) + 1;
                      return acc;
                  },
                  {} as { [key: string]: number },
              );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Comprehensive system overview and management</p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Package className="mr-2 h-4 w-4" />
                            New Installation
                        </Link>
                        {stats.total_users !== undefined && (
                            <Link
                                href="/admin/users/create"
                                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Installation Stats */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Installations</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalInstallations}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 dark:text-green-400">Completed: {completedInstallations}</span>
                                <span className="text-yellow-600 dark:text-yellow-400">Pending: {pendingInstallations}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completionRate}%</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-2 rounded-full bg-green-600 transition-all duration-300 dark:bg-green-400"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Issues</p>
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

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stats.total_users !== undefined ? 'Total Users' : 'This Week'}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stats.total_users !== undefined ? stats.total_users : stats.this_week}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            {stats.total_users !== undefined ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 dark:text-green-400">Active: {stats.active_users || 0}</span>
                                    <span className="text-blue-600 dark:text-blue-400">Admins: {stats.admin_users || 0}</span>
                                </div>
                            ) : (
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600 dark:text-blue-400">New installations this week</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Status Distribution */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Status Distribution</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{finalStatusDistribution.completed}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-2 rounded-full bg-green-600"
                                    style={{
                                        width: `${totalInstallations > 0 ? (finalStatusDistribution.completed / totalInstallations) * 100 : 0}%`,
                                    }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{finalStatusDistribution.in_progress}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{
                                        width: `${totalInstallations > 0 ? (finalStatusDistribution.in_progress / totalInstallations) * 100 : 0}%`,
                                    }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{finalStatusDistribution.pending}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-2 rounded-full bg-yellow-600"
                                    style={{
                                        width: `${totalInstallations > 0 ? (finalStatusDistribution.pending / totalInstallations) * 100 : 0}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Regional Distribution */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Regional Distribution</h3>
                        <div className="space-y-3">
                            {Object.entries(finalRegionDistribution)
                                .slice(0, 6)
                                .map(([region, count]) => (
                                    <div key={region} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{region}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600"
                                                    style={{ width: `${totalInstallations > 0 ? (count / totalInstallations) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
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
                                <Link href="/admin/installations" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    View all
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentInstallations.slice(0, 5).map((installation) => (
                                    <div key={installation.id} className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{installation.sr_no}</p>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{installation.receiver_name}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(installation.installation_status)}`}
                                            >
                                                {installation.installation_status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {recentInstallations.length === 0 && (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">No installations found</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* High Priority & Overdue */}
                    <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attention Required</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {[...overdueInstallations.slice(0, 3), ...highPriorityInstallations.slice(0, 2)].map((installation) => (
                                    <div key={installation.id} className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{installation.sr_no}</p>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{installation.receiver_name}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(installation.priority)}`}
                                            >
                                                {installation.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {overdueInstallations.length === 0 && highPriorityInstallations.length === 0 && (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">No urgent items</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Link
                            href="/admin/reports"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <FileText className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Reports</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Generate reports</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/analytics"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <TrendingUp className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">View insights</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/users"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <Users className="mr-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">User management</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/settings"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <Activity className="mr-3 h-8 w-8 text-orange-600 dark:text-orange-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">System Settings</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Configure system</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
