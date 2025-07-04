import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Activity, AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Clock, MapPin, PieChart, RefreshCw, Target, TrendingUp } from 'lucide-react';
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
        href: '/admin/reports',
    },
    {
        title: 'Advanced Analytics',
    },
];

interface Analytics {
    completion_rate: number;
    avg_completion_time: number;
    overdue_percentage: number;
    high_priority_percentage: number;
}

interface Props {
    analytics: Analytics;
}

export default function Analytics({ analytics }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    const [selectedMetric, setSelectedMetric] = useState('completion');

    // Mock data for demonstration - in real app, this would come from props
    const trends = {
        completion: [
            { period: 'Week 1', value: 85, change: 5 },
            { period: 'Week 2', value: 78, change: -7 },
            { period: 'Week 3', value: 92, change: 14 },
            { period: 'Week 4', value: 88, change: -4 },
        ],
        efficiency: [
            { period: 'Week 1', value: 4.2, change: -0.3 },
            { period: 'Week 2', value: 3.8, change: -0.4 },
            { period: 'Week 3', value: 3.5, change: -0.3 },
            { period: 'Week 4', value: 3.2, change: -0.3 },
        ],
    };

    const kpis = [
        {
            label: 'Completion Rate',
            value: `${analytics.completion_rate}%`,
            change: '+5.2%',
            trend: 'up',
            icon: CheckCircle,
            color: 'green',
            description: 'Percentage of completed installations',
        },
        {
            label: 'Avg. Completion Time',
            value: `${analytics.avg_completion_time} days`,
            change: '-0.8 days',
            trend: 'down',
            icon: Clock,
            color: 'blue',
            description: 'Average time from delivery to installation',
        },
        {
            label: 'Overdue Rate',
            value: `${analytics.overdue_percentage}%`,
            change: '-2.1%',
            trend: 'down',
            icon: AlertTriangle,
            color: 'red',
            description: 'Percentage of overdue installations',
        },
        {
            label: 'High Priority Rate',
            value: `${analytics.high_priority_percentage}%`,
            change: '+1.3%',
            trend: 'up',
            icon: Target,
            color: 'orange',
            description: 'Percentage of high priority installations',
        },
    ];

    const regionalPerformance = [
        { region: 'Mumbai', score: 95, installations: 245, efficiency: 3.2 },
        { region: 'Pune', score: 89, installations: 189, efficiency: 3.8 },
        { region: 'Nashik', score: 87, installations: 156, efficiency: 4.1 },
        { region: 'Nagpur', score: 82, installations: 134, efficiency: 4.5 },
        { region: 'Aurangabad', score: 78, installations: 98, efficiency: 4.8 },
        { region: 'Amravati', score: 75, installations: 87, efficiency: 5.2 },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            green: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
            blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
            red: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
            orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
        };
        return colors[color] || colors.blue;
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        if (score >= 80) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advanced Analytics" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
                        <p className="text-gray-600 dark:text-gray-400">Deep insights and performance analysis for DC installations</p>
                    </div>
                    <div className="flex space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                        <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={kpi.label} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className={`rounded-lg p-2 ${getColorClasses(kpi.color)}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm">
                                        {kpi.trend === 'up' ? (
                                            <ArrowUp className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ArrowDown className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{kpi.change}</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{kpi.label}</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{kpi.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Trend Analysis */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                <TrendingUp className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Performance Trends
                            </h3>
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="completion">Completion Rate</option>
                                <option value="efficiency">Efficiency</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            {trends[selectedMetric].map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.period}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="h-2 rounded-full bg-blue-600"
                                                style={{
                                                    width: selectedMetric === 'completion' ? `${item.value}%` : `${(item.value / 6) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">
                                            {selectedMetric === 'completion' ? `${item.value}%` : `${item.value}d`}
                                        </span>
                                        <span className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.change > 0 ? '+' : ''}
                                            {item.change}
                                            {selectedMetric === 'completion' ? '%' : 'd'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Distribution */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <PieChart className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Status Distribution
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.completion_rate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {(100 - analytics.completion_rate - analytics.overdue_percentage).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-red-600"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{analytics.overdue_percentage}%</span>
                            </div>

                            {/* Visual representation */}
                            <div className="mt-4">
                                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="flex h-full">
                                        <div className="bg-green-600" style={{ width: `${analytics.completion_rate}%` }}></div>
                                        <div
                                            className="bg-yellow-600"
                                            style={{ width: `${100 - analytics.completion_rate - analytics.overdue_percentage}%` }}
                                        ></div>
                                        <div className="bg-red-600" style={{ width: `${analytics.overdue_percentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regional Performance Table */}
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <MapPin className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                            Regional Performance Analysis
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Region</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Performance Score</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Installations</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time</th>
                                        <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Ranking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regionalPerformance.map((region, index) => (
                                        <tr key={region.region} className="border-b border-gray-100 dark:border-gray-700">
                                            <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">{region.region}</td>
                                            <td className="py-4 text-right">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getScoreColor(region.score)}`}
                                                >
                                                    {region.score}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right text-sm text-gray-600 dark:text-gray-400">{region.installations}</td>
                                            <td className="py-4 text-right text-sm text-gray-600 dark:text-gray-400">{region.efficiency} days</td>
                                            <td className="py-4 text-right">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">#{index + 1}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Insights & Recommendations */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Key Insights */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <Activity className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Key Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <strong>Performance Improvement:</strong> Completion rate increased by 5.2% this month, indicating improved
                                    operational efficiency.
                                </p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    <strong>Time Optimization:</strong> Average completion time reduced by 0.8 days, showing better resource
                                    allocation.
                                </p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    <strong>Regional Variance:</strong> Mumbai leads with 95% performance score, while Amravati needs attention at
                                    75%.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                            <Target className="mr-2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                            Recommendations
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Focus on Amravati and Aurangabad regions to improve overall performance scores.
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Implement best practices from Mumbai region across other locations.
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-orange-600"></div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Consider additional resources for high-priority installations to reduce completion time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
