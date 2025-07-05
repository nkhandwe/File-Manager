import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, BarChart3, Download, FileText, Home, LayoutDashboard, LogOut, Menu, Monitor, Package, Shield, User, Users, X } from 'lucide-react';
import { useState } from 'react';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

interface User {
    id: number;
    name: string;
    email: string;
    user_type: 'Admin' | 'Client' | 'User';
    is_active: boolean;
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { auth } = usePage<PageProps>().props;
    const { user } = auth;

    const getMenuItems = () => {
        const baseItems = [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
                current: location.pathname === '/dashboard',
            },
        ];

        if (user.user_type === 'Admin') {
            return [
                {
                    name: 'Admin Dashboard',
                    href: '/admin/dashboard',
                    icon: Shield,
                    current: location.pathname === '/admin/dashboard',
                },
                {
                    name: 'Installation Management',
                    href: '/admin/installations',
                    icon: Package,
                    current: location.pathname.startsWith('/admin/installations'),
                },
                {
                    name: 'User Management',
                    href: '/admin/users',
                    icon: Users,
                    current: location.pathname.startsWith('/admin/users'),
                },
                {
                    name: 'Reports & Analytics',
                    href: '/admin/reports',
                    icon: BarChart3,
                    current: location.pathname.startsWith('/admin/reports') || location.pathname.startsWith('/admin/analytics'),
                },
                {
                    name: 'Audit Logs',
                    href: '/admin/audit',
                    icon: Activity,
                    current: location.pathname.startsWith('/admin/audit'),
                },
            ];
        } else if (user.user_type === 'Client') {
            return [
                {
                    name: 'Client Dashboard',
                    href: '/client/dashboard',
                    icon: Monitor,
                    current: location.pathname === '/client/dashboard',
                },
                {
                    name: 'Installations',
                    href: '/client/installations',
                    icon: Package,
                    current: location.pathname.startsWith('/client/installations'),
                },
                {
                    name: 'Reports',
                    href: '/client/reports',
                    icon: FileText,
                    current: location.pathname.startsWith('/client/reports'),
                },
                {
                    name: 'Downloads',
                    href: '/client/installations?tab=downloads',
                    icon: Download,
                    current: location.pathname.includes('downloads'),
                },
                {
                    name: 'Profile',
                    href: '/client/profile',
                    icon: User,
                    current: location.pathname === '/client/profile',
                },
            ];
        } else {
            // Regular User
            return [
                ...baseItems,
                {
                    name: 'Create Installation',
                    href: '/',
                    icon: Home,
                    current: location.pathname === '/',
                },
            ];
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevent multiple logout attempts

        setIsLoggingOut(true);

        try {
            // Method 1: Try the standard Laravel logout route
            await router.post(
                '/logout',
                {},
                {
                    onSuccess: () => {
                        // Redirect to home page after successful logout
                        window.location.href = '/';
                    },
                    onError: (errors) => {
                        console.error('Logout error:', errors);
                        // If the POST request fails, try alternative methods
                        handleLogoutFallback();
                    },
                    onFinish: () => {
                        setIsLoggingOut(false);
                    },
                },
            );
        } catch (error) {
            console.error('Logout failed:', error);
            handleLogoutFallback();
        }
    };

    const handleLogoutFallback = () => {
        // Method 2: Try GET request to logout
        try {
            router.get(
                '/logout',
                {},
                {
                    onSuccess: () => {
                        window.location.href = '/';
                    },
                    onError: () => {
                        // Method 3: Direct browser navigation as last resort
                        window.location.href = '/logout';
                    },
                    onFinish: () => {
                        setIsLoggingOut(false);
                    },
                },
            );
        } catch (error) {
            // Method 4: Manual form submission as absolute fallback
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/logout';

            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            document.body.appendChild(form);
            form.submit();
            setIsLoggingOut(false);
        }
    };

    const getUserTypeColor = (userType: string) => {
        switch (userType) {
            case 'Admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'Client':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'User':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Head title="DC Installation Management" />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="bg-opacity-75 fixed inset-0 z-40 bg-gray-600 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0 dark:bg-gray-800 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo and close button */}
                    <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">DC Manager</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600 lg:hidden dark:hover:text-gray-300"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* User info */}
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500">
                                    <span className="text-sm font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                <div className="mt-1 flex items-center">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getUserTypeColor(user.user_type)}`}
                                    >
                                        {user.user_type}
                                    </span>
                                    {user.is_active && (
                                        <span className="ml-2 flex h-2 w-2">
                                            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        item.current
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            item.current
                                                ? 'text-blue-500 dark:text-blue-400'
                                                : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                                        }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout button */}
                    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isLoggingOut
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {isLoggingOut ? (
                                <>
                                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                    Signing out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
                                    Sign out
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="text-gray-500 hover:text-gray-600 lg:hidden dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <Menu className="h-6 w-6" />
                            </button>

                            {/* Breadcrumbs */}
                            {breadcrumbs.length > 0 && (
                                <nav className="ml-4 lg:ml-0">
                                    <ol className="flex items-center space-x-2 text-sm">
                                        {breadcrumbs.map((crumb, index) => (
                                            <li key={index} className="flex items-center">
                                                {index > 0 && <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>}
                                                {crumb.href ? (
                                                    <Link
                                                        href={crumb.href}
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                    >
                                                        {crumb.title}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium text-gray-900 dark:text-white">{crumb.title}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}
                        </div>

                        {/* User menu */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Welcome,</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getUserTypeColor(user.user_type)}`}
                                >
                                    {user.user_type}
                                </span>
                            </div>

                            {/* Quick logout button in top bar */}
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
                                title="Sign out"
                            >
                                {isLoggingOut ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                ) : (
                                    <LogOut className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
