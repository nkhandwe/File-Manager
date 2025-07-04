import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Settings as SettingsIcon, 
    Save, 
    Bell, 
    Shield, 
    Database, 
    Mail, 
    Globe, 
    Users, 
    FileText,
    Clock,
    Palette,
    Server,
    Key,
    AlertTriangle,
    Check,
    X
} from 'lucide-react';

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
        title: 'System Settings',
    },
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState('');

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'DC Installation Management',
        siteDescription: 'Digital Computer Installation Management System',
        timezone: 'Asia/Kolkata',
        dateFormat: 'Y-m-d',
        recordsPerPage: 15,
        maintenanceMode: false,
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        overdueAlerts: true,
        priorityAlerts: true,
        dailyReports: false,
        weeklyReports: true,
        alertEmail: 'admin@dcmanagement.com',
        overdueThreshold: 7,
    });

    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: 120,
        passwordMinLength: 8,
        requireSpecialChars: true,
        maxLoginAttempts: 5,
        twoFactorAuth: false,
        autoLogout: true,
    });

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        fromEmail: 'noreply@dcmanagement.com',
        fromName: 'DC Management System',
        encryption: 'tls',
    });

    const tabs = [
        { id: 'general', name: 'General', icon: SettingsIcon },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'email', name: 'Email', icon: Mail },
        { id: 'backup', name: 'Backup', icon: Database },
    ];

    const handleSave = async (settingsType: string) => {
        setIsSaving(true);
        
        try {
            let data = {};
            switch (settingsType) {
                case 'general':
                    data = { type: 'general', settings: generalSettings };
                    break;
                case 'notifications':
                    data = { type: 'notifications', settings: notificationSettings };
                    break;
                case 'security':
                    data = { type: 'security', settings: securitySettings };
                    break;
                case 'email':
                    data = { type: 'email', settings: emailSettings };
                    break;
            }

            await router.post('/admin/settings', data, {
                onSuccess: () => {
                    setSavedMessage('Settings saved successfully!');
                    setTimeout(() => setSavedMessage(''), 3000);
                },
                onError: (errors) => {
                    console.error('Settings save error:', errors);
                },
            });
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Site Configuration</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site Name
                        </label>
                        <select
                           
                            value={generalSettings.siteName}
                            onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="Y-m-d">YYYY-MM-DD</option>
                            <option value="d/m/Y">DD/MM/YYYY</option>
                            <option value="m/d/Y">MM/DD/YYYY</option>
                        </select>
                    </div>
                </div>
                
                <div className="mt-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={generalSettings.maintenanceMode}
                            onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Maintenance Mode</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        When enabled, only administrators can access the system
                    </p>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    onClick={() => handleSave('general')}
                    disabled={isSaving}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Email Notifications</span>
                    </label>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={notificationSettings.overdueAlerts}
                            onChange={(e) => setNotificationSettings({...notificationSettings, overdueAlerts: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Overdue Installation Alerts</span>
                    </label>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={notificationSettings.priorityAlerts}
                            onChange={(e) => setNotificationSettings({...notificationSettings, priorityAlerts: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">High Priority Alerts</span>
                    </label>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reports</h3>
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={notificationSettings.dailyReports}
                            onChange={(e) => setNotificationSettings({...notificationSettings, dailyReports: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Daily Reports</span>
                    </label>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={notificationSettings.weeklyReports}
                            onChange={(e) => setNotificationSettings({...notificationSettings, weeklyReports: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Weekly Reports</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alert Email Address
                    </label>
                    <input
                        type="email"
                        value={notificationSettings.alertEmail}
                        onChange={(e) => setNotificationSettings({...notificationSettings, alertEmail: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Overdue Threshold (days)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={notificationSettings.overdueThreshold}
                        onChange={(e) => setNotificationSettings({...notificationSettings, overdueThreshold: parseInt(e.target.value)})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    onClick={() => handleSave('notifications')}
                    disabled={isSaving}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Session & Authentication</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Session Timeout (minutes)
                        </label>
                        <select
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Max Login Attempts
                        </label>
                        <select
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value={3}>3 attempts</option>
                            <option value={5}>5 attempts</option>
                            <option value={10}>10 attempts</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password Policy</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Password Length
                        </label>
                        <select
                            value={securitySettings.passwordMinLength}
                            onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value={6}>6 characters</option>
                            <option value={8}>8 characters</option>
                            <option value={10}>10 characters</option>
                            <option value={12}>12 characters</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={securitySettings.requireSpecialChars}
                                onChange={(e) => setSecuritySettings({...securitySettings, requireSpecialChars: e.target.checked})}
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Require Special Characters</span>
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Security</h3>
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={securitySettings.twoFactorAuth}
                            onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Two-Factor Authentication</span>
                    </label>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={securitySettings.autoLogout}
                            onChange={(e) => setSecuritySettings({...securitySettings, autoLogout: e.target.checked})}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto-logout on browser close</span>
                    </label>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    onClick={() => handleSave('security')}
                    disabled={isSaving}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderEmailSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SMTP Configuration</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SMTP Host
                        </label>
                        <input
                            type="text"
                            value={emailSettings.smtpHost}
                            onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="smtp.gmail.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SMTP Port
                        </label>
                        <input
                            type="number"
                            value={emailSettings.smtpPort}
                            onChange={(e) => setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="587"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SMTP Username
                        </label>
                        <input
                            type="text"
                            value={emailSettings.smtpUsername}
                            onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SMTP Password
                        </label>
                        <input
                            type="password"
                            value={emailSettings.smtpPassword}
                            onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            From Email
                        </label>
                        <input
                            type="email"
                            value={emailSettings.fromEmail}
                            onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            From Name
                        </label>
                        <input
                            type="text"
                            value={emailSettings.fromName}
                            onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Encryption
                        </label>
                        <select
                            value={emailSettings.encryption}
                            onChange={(e) => setEmailSettings({...emailSettings, encryption: e.target.value})}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                    <button
                        className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        onClick={() => {
                            // Test email functionality
                            alert('Test email sent! Check your inbox.');
                        }}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Test Email
                    </button>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    onClick={() => handleSave('email')}
                    disabled={isSaving}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderBackupSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Database Backup</h3>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 mb-6">
                    <div className="flex items-start">
                        <Database className="h-5 w-5 text-blue-600 mt-0.5 mr-3 dark:text-blue-400" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Backup Information</h4>
                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                Regular backups ensure your data is safe. Last backup: Today at 2:00 AM
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">
                        <Database className="mr-2 h-4 w-4" />
                        Create Backup Now
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700">
                        <FileText className="mr-2 h-4 w-4" />
                        Download Latest
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-3 text-sm font-medium text-white hover:bg-orange-700">
                        <Server className="mr-2 h-4 w-4" />
                        Restore Backup
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Backup History</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            <tr>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                    2025-01-03 02:00:00
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    45.2 MB
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Automatic
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">Download</button>
                                </td>
                            </tr>
                            <tr>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                    2025-01-02 02:00:00
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    44.8 MB
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Automatic
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">Download</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Configure system preferences and administrative options
                        </p>
                    </div>
                    {savedMessage && (
                        <div className="flex items-center rounded-lg bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <Check className="mr-2 h-4 w-4" />
                            {savedMessage}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <Icon className="mr-3 h-4 w-4" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            {activeTab === 'general' && renderGeneralSettings()}
                            {activeTab === 'notifications' && renderNotificationSettings()}
                            {activeTab === 'security' && renderSecuritySettings()}
                            {activeTab === 'email' && renderEmailSettings()}
                            {activeTab === 'backup' && renderBackupSettings()}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}