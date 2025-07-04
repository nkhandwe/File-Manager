import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    FileText,
    Filter,
    LineChart,
    MapPin,
    Star,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Reports & Analytics',
    },
];

interface Stats {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    high_priority: number;
}

interface RegionalData {
    region_division: string;
    total: number;
    completed: number;
}

interface PerformanceMetrics {
    completion_rate: number;
    overdue_rate: number;
    high_priority_rate: number;
}

interface Props {
    stats: Stats;
    monthlyTrends: { [key: number]: number };
    regionalData: RegionalData[];
    performanceMetrics: PerformanceMetrics;
    recentActivity: { [key: string]: number };
    statusByRegion: { [key: string]: Array<{ installation_status: string; count: number }> };
}

export default function Reports({ stats, monthlyTrends, regionalData, performanceMetrics, recentActivity, statusByRegion }: Props) {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const handleExport = async () => {
        setIsExporting(true);

        const params = new URLSearchParams();
        if (filterStatus) params.append('status', filterStatus);
        if (filterRegion) params.append('region', filterRegion);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        try {
            window.location.href = `/admin/reports/export?${params.toString()}`;
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setTimeout(() => setIsExporting(false), 2000);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Installed':
                return 'text-green-600';
            case 'Pending':
                return 'text-yellow-600';
            case 'In Progress':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPerformanceColor = (rate: number, type: 'good' | 'bad' = 'good') => {
        if (type === 'good') {
            return rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-yellow-600' : 'text-red-600';
        } else {
            return rate <= 10 ? 'text-green-600' : rate <= 25 ? 'text-yellow-600' : 'text-red-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                        <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics for DC installations</p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href="/admin/analytics"
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Advanced Analytics
                        </Link>
                    </div>
                </div>

                {/* Summary Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Installations</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
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
                                <p className={`text-sm ${getPerformanceColor(performanceMetrics.completion_rate)}`}>
                                    {performanceMetrics.completion_rate}% completion rate
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.overdue}</p>
                                <p className={`text-sm ${getPerformanceColor(performanceMetrics.overdue_rate, 'bad')}`}>
                                    {performanceMetrics.overdue_rate}% overdue rate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Filters */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <Filter className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Export Filters
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                            <select
                                value={filterRegion}
                                onChange={(e) => setFilterRegion(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Regions</option>
                                {regionalData.map((region) => (
                                    <option key={region.region_division} value={region.region_division}>
                                        {region.region_division}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Monthly Trends */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <LineChart className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Monthly Installation Trends ({new Date().getFullYear()})
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(monthlyTrends).map(([month, count]) => (
                                <div key={month} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{monthNames[parseInt(month) - 1]}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="h-2 rounded-full bg-blue-600"
                                                style={{
                                                    width: `${Math.max((count / Math.max(...Object.values(monthlyTrends))) * 100, 5)}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="w-8 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                            Performance Metrics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-green-600"
                                            style={{ width: `${performanceMetrics.completion_rate}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-sm font-medium ${getPerformanceColor(performanceMetrics.completion_rate)}`}>
                                        {performanceMetrics.completion_rate}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Overdue Rate</span>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-red-600"
                                            style={{ width: `${Math.max(performanceMetrics.overdue_rate, 5)}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-sm font-medium ${getPerformanceColor(performanceMetrics.overdue_rate, 'bad')}`}>
                                        {performanceMetrics.overdue_rate}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">High Priority Rate</span>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-orange-600"
                                            style={{ width: `${Math.max(performanceMetrics.high_priority_rate, 5)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-orange-600">{performanceMetrics.high_priority_rate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regional Analysis */}
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <MapPin className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Regional Distribution & Performance
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Region</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Completed</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Rate</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-2">
                                    {regionalData.map((region) => {
                                        const completionRate = region.total > 0 ? (region.completed / region.total) * 100 : 0;
                                        return (
                                            <tr key={region.region_division} className="border-b border-gray-100 dark:border-gray-700">
                                                <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{region.region_division}</td>
                                                <td className="py-3 text-right text-sm text-gray-600 dark:text-gray-400">{region.total}</td>
                                                <td className="py-3 text-right text-sm text-gray-600 dark:text-gray-400">{region.completed}</td>
                                                <td className="py-3 text-right text-sm">
                                                    <span className={getPerformanceColor(completionRate)}>{completionRate.toFixed(1)}%</span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end">
                                                        <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className="h-2 rounded-full bg-blue-600"
                                                                style={{ width: `${completionRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <Activity className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Recent Activity (Last 30 Days)
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(recentActivity)
                            .slice(-10)
                            .map(([date, count]) => (
                                <div key={date} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(date).toLocaleDateString()}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-1 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="h-1 rounded-full bg-indigo-600"
                                                style={{
                                                    width: `${Math.max((count / Math.max(...Object.values(recentActivity))) * 100, 10)}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="w-6 text-right text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                    </div>
                                </div>
                            ))}
                        {Object.keys(recentActivity).length === 0 && (
                            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No recent activity data available</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Link
                            href="/admin/installations?status=overdue"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <AlertTriangle className="mr-3 h-8 w-8 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">View Overdue</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.overdue} items</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/installations?priority=High"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <Star className="mr-3 h-8 w-8 text-orange-600 dark:text-orange-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">High Priority</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.high_priority} items</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/installations?status=completed"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <CheckCircle className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.completed} items</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/dashboard"
                            className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            <BarChart3 className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Dashboard</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Overview</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
