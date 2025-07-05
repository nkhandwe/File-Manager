import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    FileText,
    Monitor,
    Moon,
    Package,
    Server,
    Settings,
    Shield,
    Sun,
    TrendingUp,
    User,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Flash {
    success?: string;
    error?: string;
}

interface PageProps {
    flash?: Flash;
    installations?: any;
    stats?: {
        total: number;
        delivered: number;
        installed: number;
        pending_delivery: number;
        pending_installation: number;
        in_progress: number;
        overdue: number;
        high_priority: number;
        this_week: number;
    };
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            user_type: string;
        };
    };
}

export default function Welcome({ flash, installations, stats, auth }: PageProps) {
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const features = [
        {
            icon: Monitor,
            title: 'Installation Tracking',
            description: 'Track DC installations from dispatch to completion with real-time status updates.',
            color: 'blue',
        },
        {
            icon: FileText,
            title: 'Document Management',
            description: 'Manage delivery reports, installation reports, and all related documentation.',
            color: 'green',
        },
        {
            icon: BarChart3,
            title: 'Analytics & Reports',
            description: 'Generate comprehensive reports and analytics for better decision making.',
            color: 'purple',
        },
        {
            icon: Users,
            title: 'User Management',
            description: 'Role-based access control for administrators, clients, and technicians.',
            color: 'orange',
        },
        {
            icon: Shield,
            title: 'Audit Trail',
            description: 'Complete audit logging for security and compliance requirements.',
            color: 'red',
        },
        {
            icon: Package,
            title: 'Equipment Tracking',
            description: 'Track equipment serials, warranties, and maintenance schedules.',
            color: 'indigo',
        },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
            green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
            purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
            orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
            red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
            indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20',
        };
        return colors[color] || colors.blue;
    };

    const handleNavigation = (route: string) => {
        router.get(route);
    };

    return (
        <>
            <Head title="DC Installation Management System" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 transition-colors duration-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    <Monitor className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DC Installation Management</h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Settlement Commissioner and Director of Land Record (Maharashtra State)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </button>

                                {!auth?.user ? (
                                    <button
                                        onClick={() => handleNavigation('/login')}
                                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white transition-all hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Login
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            Welcome, <span className="font-medium text-gray-900 dark:text-white">{auth.user.name}</span>
                                        </span>
                                        <button
                                            onClick={() => {
                                                const dashboardRoute =
                                                    auth.user?.user_type === 'Admin'
                                                        ? '/admin/dashboard'
                                                        : auth.user?.user_type === 'Client'
                                                          ? '/client/dashboard'
                                                          : '/dashboard';
                                                handleNavigation(dashboardRoute);
                                            }}
                                            className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white transition-all hover:from-blue-700 hover:to-purple-700"
                                        >
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                            <div className="flex items-center">
                                <CheckCircle className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-800 dark:text-green-200">{flash.success}</span>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
                            <div className="flex items-center">
                                <AlertCircle className="mr-3 h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="font-medium text-red-800 dark:text-red-200">{flash.error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {auth?.user ? (
                    // Authenticated User Dashboard Preview
                    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        {/* Welcome Section */}
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Welcome back, {auth.user.name}!</h2>
                            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                                Manage your DC installations efficiently with our comprehensive management system.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        {stats && (
                            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Installations</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                                            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.installed}</p>
                                        </div>
                                        <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.in_progress}</p>
                                        </div>
                                        <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
                                            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.this_week}</p>
                                        </div>
                                        <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                                            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mb-12 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <button
                                    onClick={() => {
                                        const dashboardRoute =
                                            auth.user?.user_type === 'Admin'
                                                ? '/admin/dashboard'
                                                : auth.user?.user_type === 'Client'
                                                  ? '/client/dashboard'
                                                  : '/dashboard';
                                        handleNavigation(dashboardRoute);
                                    }}
                                    className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                >
                                    <BarChart3 className="mr-4 h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    <div className="text-left">
                                        <h4 className="font-medium text-gray-900 dark:text-white">View Dashboard</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Access your main dashboard</p>
                                    </div>
                                </button>

                                {auth.user.user_type === 'Admin' && (
                                    <button
                                        onClick={() => handleNavigation('/admin/installations')}
                                        className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                    >
                                        <Settings className="mr-4 h-8 w-8 text-green-600 dark:text-green-400" />
                                        <div className="text-left">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Manage Installations</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all installations</p>
                                        </div>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        const reportRoute = auth.user?.user_type === 'Admin' ? '/admin/reports' : '/client/reports';
                                        handleNavigation(reportRoute);
                                    }}
                                    className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                >
                                    <FileText className="mr-4 h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    <div className="text-left">
                                        <h4 className="font-medium text-gray-900 dark:text-white">View Reports</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate and download reports</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Installations */}
                        {installations?.data && installations.data.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Installations</h3>
                                    <button
                                        onClick={() => {
                                            const installationsRoute =
                                                auth.user?.user_type === 'Admin' ? '/admin/installations' : '/client/installations';
                                            handleNavigation(installationsRoute);
                                        }}
                                        className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {installations.data.slice(0, 5).map((installation: any) => (
                                        <div
                                            key={installation.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                                    <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">{installation.sr_no}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {installation.receiver_name} - {installation.district}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                        installation.installation_status === 'Installed'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : installation.installation_status === 'In Progress'
                                                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {installation.installation_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                ) : (
                    // Public Landing Page
                    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        {/* Hero Section */}
                        <div className="mb-16 text-center">
                            <h2 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
                                Streamline Your
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> DC Installations</span>
                            </h2>
                            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                                Comprehensive management system for tracking, monitoring, and managing DC installations across Maharashtra State with
                                real-time updates and detailed reporting.
                            </p>
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <button
                                    onClick={() => handleNavigation('/login')}
                                    className="inline-flex transform items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <User className="mr-2 h-5 w-5" />
                                    Get Started
                                </button>
                                <button
                                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center rounded-lg border border-gray-300 px-8 py-4 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <Activity className="mr-2 h-5 w-5" />
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div id="features" className="mb-16">
                            <div className="mb-12 text-center">
                                <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Powerful Features</h3>
                                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                                    Everything you need to manage DC installations efficiently and effectively.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <div className={`inline-flex rounded-lg p-3 ${getColorClasses(feature.color)} mb-4`}>
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h4 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Stats */}
                        <div className="mb-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <div className="mb-8 text-center">
                                <h3 className="mb-4 text-3xl font-bold">System Performance</h3>
                                <p className="text-lg text-blue-100">Real-time statistics and system health</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="mb-2 flex justify-center">
                                        <Server className="h-8 w-8 text-blue-200" />
                                    </div>
                                    <div className="mb-1 text-3xl font-bold">99.9%</div>
                                    <div className="text-blue-200">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 flex justify-center">
                                        <Zap className="h-8 w-8 text-blue-200" />
                                    </div>
                                    <div className="mb-1 text-3xl font-bold">&lt;200ms</div>
                                    <div className="text-blue-200">Response Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 flex justify-center">
                                        <Shield className="h-8 w-8 text-blue-200" />
                                    </div>
                                    <div className="mb-1 text-3xl font-bold">100%</div>
                                    <div className="text-blue-200">Secure</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 flex justify-center">
                                        <Users className="h-8 w-8 text-blue-200" />
                                    </div>
                                    <div className="mb-1 text-3xl font-bold">24/7</div>
                                    <div className="text-blue-200">Support</div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Ready to Get Started?</h3>
                            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                                Join the digital transformation of DC installation management. Login to access your personalized dashboard and start
                                managing installations efficiently.
                            </p>
                            <button
                                onClick={() => handleNavigation('/login')}
                                className="inline-flex transform items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                            >
                                <User className="mr-2 h-5 w-5" />
                                Access Dashboard
                            </button>
                        </div>
                    </main>
                )}

                {/* Footer */}
                <footer className="mt-20 border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div className="col-span-1 md:col-span-2">
                                <div className="mb-4 flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                        <Monitor className="h-5 w-5" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">DC Management</span>
                                </div>
                                <p className="mb-4 text-gray-600 dark:text-gray-300">
                                    Comprehensive DC installation management system for Maharashtra State's Settlement Commissioner and Director of
                                    Land Record.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 ASK Technologies - Cybernet IT Pvt. Ltd.</p>
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Quick Links</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Dashboard
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Installations
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Reports
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Analytics
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Support</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            Contact Support
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            System Status
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                            <div className="flex flex-col items-center justify-between md:flex-row">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Built with modern technology for reliable and secure operations.
                                </p>
                                <div className="mt-4 flex items-center space-x-4 md:mt-0">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Powered by</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="fw-bolder h-6 w-8 text-center rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white">UD</div>
                                        <a
                                            href="http://uniquedeveloper.in"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2"
                                        >
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unique Developers</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
