import AppLayout from '@/Layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    User,
    UserCheck,
    UserX,
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
        title: 'System Management',
    },
    {
        title: 'Audit Trail',
    },
];

interface AuditEntry {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    user_type: string;
    action: string;
    resource_type: string;
    resource_id: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string;
    user_agent: string;
    created_at: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

interface Props {
    auditEntries: {
        data: AuditEntry[];
        links: any[];
        meta: any;
    };
    filters: {
        action?: string;
        user?: string;
        resource?: string;
        date_from?: string;
        date_to?: string;
        severity?: string;
        search?: string;
    };
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

export default function Audit({ auditEntries, filters, users }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSeverity, setSelectedSeverity] = useState(filters.severity || 'all');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [selectedResource, setSelectedResource] = useState(filters.resource || 'all');
    const [selectedUser, setSelectedUser] = useState(filters.user || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
            case 'created':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'update':
            case 'updated':
                return <FileText className="h-4 w-4 text-blue-600" />;
            case 'delete':
            case 'deleted':
                return <Trash2 className="h-4 w-4 text-red-600" />;
            case 'login':
                return <UserCheck className="h-4 w-4 text-green-600" />;
            case 'logout':
                return <UserX className="h-4 w-4 text-gray-600" />;
            case 'view':
            case 'accessed':
                return <Eye className="h-4 w-4 text-blue-600" />;
            case 'download':
                return <Download className="h-4 w-4 text-purple-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const severityClasses = {
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };

        return (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityClasses[severity] || severityClasses.low}`}
            >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </span>
        );
    };

    const getUserTypeBadge = (userType: string) => {
        const userTypeClasses = {
            Admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            Client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            User: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        };

        return (
            <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${userTypeClasses[userType] || userTypeClasses.User}`}>
                {userType}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSearch = () => {
        setIsLoading(true);
        router.get(
            '/admin/audit',
            {
                search: searchTerm,
                severity: selectedSeverity !== 'all' ? selectedSeverity : '',
                action: selectedAction !== 'all' ? selectedAction : '',
                resource: selectedResource !== 'all' ? selectedResource : '',
                user: selectedUser !== 'all' ? selectedUser : '',
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedSeverity('all');
        setSelectedAction('all');
        setSelectedResource('all');
        setSelectedUser('all');
        setDateFrom('');
        setDateTo('');
        setIsLoading(true);
        router.get(
            '/admin/audit',
            {},
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
        if (selectedAction !== 'all') params.append('action', selectedAction);
        if (selectedResource !== 'all') params.append('resource', selectedResource);
        if (selectedUser !== 'all') params.append('user', selectedUser);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        window.open(`/admin/audit/export?${params.toString()}`, '_blank');
    };

    const renderValueChanges = (oldValues: Record<string, any> | null, newValues: Record<string, any> | null) => {
        if (!oldValues && !newValues) return null;

        return (
            <div className="mt-3 space-y-2">
                {oldValues && Object.keys(oldValues).length > 0 && (
                    <div>
                        <h5 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">Previous Values</h5>
                        <div className="mt-1 rounded bg-red-50 p-2 dark:bg-red-900/10">
                            <pre className="text-xs whitespace-pre-wrap text-red-800 dark:text-red-300">{JSON.stringify(oldValues, null, 2)}</pre>
                        </div>
                    </div>
                )}
                {newValues && Object.keys(newValues).length > 0 && (
                    <div>
                        <h5 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">New Values</h5>
                        <div className="mt-1 rounded bg-green-50 p-2 dark:bg-green-900/10">
                            <pre className="text-xs whitespace-pre-wrap text-green-800 dark:text-green-300">{JSON.stringify(newValues, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Audit Trail" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Audit Trail</h1>
                        <p className="text-gray-600 dark:text-gray-400">Track all system activities and user actions for security and compliance</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </button>
                        <button
                            onClick={() => router.reload()}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="mb-4 flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                            <div className="relative mt-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search descriptions, resources..."
                                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Severity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                            <select
                                value={selectedSeverity}
                                onChange={(e) => setSelectedSeverity(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Severities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Action */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Actions</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                                <option value="view">View</option>
                                <option value="download">Download</option>
                            </select>
                        </div>

                        {/* Resource */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resource</label>
                            <select
                                value={selectedResource}
                                onChange={(e) => setSelectedResource(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Resources</option>
                                <option value="DCInstallation">DC Installation</option>
                                <option value="User">User</option>
                                <option value="System">System</option>
                            </select>
                        </div>

                        {/* User */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Users</option>
                                {users?.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Searching...' : 'Apply Filters'}
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={isLoading}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Entries */}
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                <Shield className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Audit Entries
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{auditEntries?.meta?.total || 0} total entries</span>
                        </div>
                    </div>

                    <div className="p-6">
                        {auditEntries?.data?.length > 0 ? (
                            <div className="space-y-4">
                                {auditEntries.data.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">{getActionIcon(entry.action)}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">{entry.user_name}</span>
                                                        {getUserTypeBadge(entry.user_type)}
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {entry.action.toLowerCase()}d
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{entry.resource_type}</span>
                                                        {entry.resource_id && (
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">#{entry.resource_id}</span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{entry.description}</p>
                                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {formatDate(entry.created_at)}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <User className="mr-1 h-3 w-3" />
                                                            {entry.ip_address}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getSeverityBadge(entry.severity)}
                                                <button
                                                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                                                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedEntry === entry.id && (
                                            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                    <div>
                                                        <h5 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                            User Details
                                                        </h5>
                                                        <div className="mt-1 text-sm text-gray-900 dark:text-white">
                                                            <p>Email: {entry.user_email}</p>
                                                            <p>Type: {entry.user_type}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                            Technical Details
                                                        </h5>
                                                        <div className="mt-1 text-sm text-gray-900 dark:text-white">
                                                            <p>IP: {entry.ip_address}</p>
                                                            <p className="truncate" title={entry.user_agent}>
                                                                User Agent: {entry.user_agent?.substring(0, 50)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {renderValueChanges(entry.old_values, entry.new_values)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No audit entries found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {auditEntries?.links && auditEntries.links.length > 3 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    {auditEntries.links[0].url && (
                                        <button
                                            onClick={() => router.get(auditEntries.links[0].url)}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {auditEntries.links[auditEntries.links.length - 1].url && (
                                        <button
                                            onClick={() => router.get(auditEntries.links[auditEntries.links.length - 1].url)}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {/* Showing <span className="font-medium">{auditEntries.meta.from || 0}</span> to{' '} */}
                                            {/* <span className="font-medium">{auditEntries.meta.to || 0}</span> of{' '}
                                            <span className="font-medium">{auditEntries.meta.total || 0}</span> results */}
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                            {auditEntries.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 focus:outline-none ${
                                                        link.active
                                                            ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                                            : link.url
                                                              ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                                              : 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-300'
                                                    } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                        index === auditEntries.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
