import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Filter, Monitor, MoreVertical, Search, Shield, Trash2, User, UserCheck, UserPlus, UserX } from 'lucide-react';
import React, { useState } from 'react';

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
        title: 'User Management',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    user_type: 'Admin' | 'Client' | 'User';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    links: PaginationLinks[];
}

interface Props {
    users: PaginatedUsers;
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
}

export default function Users({ users, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            {
                search: searchTerm,
                type: selectedType,
                status: selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (filterType: string, value: string) => {
        if (filterType === 'type') {
            setSelectedType(value);
        } else if (filterType === 'status') {
            setSelectedStatus(value);
        }

        router.get(
            '/admin/users',
            {
                search: searchTerm,
                type: filterType === 'type' ? value : selectedType,
                status: filterType === 'status' ? value : selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(`/admin/users/${userId}`, {
                onSuccess: () => {
                    setOpenDropdown(null);
                },
            });
        }
    };

    const handleToggleStatus = (userId: number) => {
        router.patch(
            `/admin/users/${userId}/toggle-status`,
            {},
            {
                onSuccess: () => {
                    setOpenDropdown(null);
                },
            },
        );
    };

    const getUserTypeIcon = (userType: string) => {
        switch (userType) {
            case 'Admin':
                return <Shield className="h-4 w-4 text-red-600" />;
            case 'Client':
                return <Monitor className="h-4 w-4 text-blue-600" />;
            case 'User':
                return <User className="h-4 w-4 text-green-600" />;
            default:
                return <User className="h-4 w-4 text-gray-600" />;
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

    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage system users, permissions, and access levels</p>
                    </div>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New User
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Search Users</label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        placeholder="Search by name or email..."
                                    />
                                </div>
                            </div>

                            {/* User Type Filter */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">User Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Client">Client</option>
                                    <option value="User">User</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500">
                                                    <span className="text-sm font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getUserTypeIcon(user.user_type)}
                                                <span
                                                    className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getUserTypeColor(user.user_type)}`}
                                                >
                                                    {user.user_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(user.is_active)}`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>

                                                {openDropdown === user.id && (
                                                    <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black dark:bg-gray-700">
                                                        <Link
                                                            href={`/admin/users/${user.id}/edit`}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                                            onClick={() => setOpenDropdown(null)}
                                                        >
                                                            <Edit className="mr-3 h-4 w-4" />
                                                            Edit User
                                                        </Link>
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id)}
                                                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                                        >
                                                            {user.is_active ? (
                                                                <>
                                                                    <UserX className="mr-3 h-4 w-4" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="mr-3 h-4 w-4" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                                                        >
                                                            <Trash2 className="mr-3 h-4 w-4" />
                                                            Delete User
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{(users.current_page - 1) * users.per_page + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(users.current_page * users.per_page, users.total)}</span> of{' '}
                                    <span className="font-medium">{users.total}</span> results
                                </div>
                                <div className="flex space-x-1">
                                    {users.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {users.data.length === 0 && (
                    <div className="py-12 text-center">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
