import { Eye, EyeOff, Lock, Save, Shield, User, X } from 'lucide-react';
import React, { useState } from 'react';

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    user_type: 'Admin' | 'Client' | 'User';
    is_active: boolean;
}

export interface UserFormProps {
    initialData?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => void;
    isSubmitting?: boolean;
    submitButtonText?: string;
    isEditing?: boolean;
    errors?: { [key: string]: string };
}

const UserForm: React.FC<UserFormProps> = ({
    initialData = {},
    onSubmit,
    isSubmitting = false,
    submitButtonText = 'Create User',
    isEditing = false,
    errors = {},
}) => {
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_type: 'User',
        is_active: true,
        ...initialData,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            user_type: 'User',
            is_active: true,
        });
    };

    const getUserTypeColor = (userType: string) => {
        switch (userType) {
            case 'Admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'Client':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'User':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    const getUserTypeDescription = (userType: string) => {
        switch (userType) {
            case 'Admin':
                return 'Full system access, user management, analytics';
            case 'Client':
                return 'View installations, download files, generate reports';
            case 'User':
                return 'Create installations, view basic dashboard';
            default:
                return '';
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit User' : 'Create New User'}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Basic Information */}
                <div className="space-y-6">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <User className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="space-y-6">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <Lock className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                        {isEditing ? 'Change Password (Optional)' : 'Password'}
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Password {!isEditing && '*'}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                    placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                            {!isEditing && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 8 characters required</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password {!isEditing && '*'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.password_confirmation}
                                    onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                    placeholder={isEditing ? 'Confirm new password' : 'Confirm password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permissions & Access */}
                <div className="space-y-6">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <Shield className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Permissions & Access
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">User Type *</label>
                            <select
                                value={formData.user_type}
                                onChange={(e) => handleInputChange('user_type', e.target.value as 'Admin' | 'Client' | 'User')}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                            >
                                <option value="User">User</option>
                                <option value="Client">Client</option>
                                <option value="Admin">Admin</option>
                            </select>
                            {errors.user_type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.user_type}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</label>
                            <div className="flex items-center space-x-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                        className="mr-2 h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-blue-400 dark:focus:ring-blue-400"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active Account</span>
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Inactive users cannot log in to the system</p>
                        </div>
                    </div>

                    {/* User Type Information Card */}
                    <div className={`rounded-lg border p-4 ${getUserTypeColor(formData.user_type)}`}>
                        <div className="flex items-center">
                            <Shield className="mr-2 h-5 w-5" />
                            <h4 className="font-semibold">{formData.user_type} Permissions</h4>
                        </div>
                        <p className="mt-2 text-sm">{getUserTypeDescription(formData.user_type)}</p>

                        <div className="mt-3">
                            <h5 className="mb-2 text-sm font-medium">Access Level:</h5>
                            <ul className="space-y-1 text-xs">
                                {formData.user_type === 'Admin' && (
                                    <>
                                        <li>• Full system administration</li>
                                        <li>• User management and permissions</li>
                                        <li>• System settings and configuration</li>
                                        <li>• Advanced analytics and reports</li>
                                        <li>• Installation CRUD operations</li>
                                    </>
                                )}
                                {formData.user_type === 'Client' && (
                                    <>
                                        <li>• View all installation records</li>
                                        <li>• Download files and generate reports</li>
                                        <li>• Bulk file downloads</li>
                                        <li>• Installation status tracking</li>
                                        <li>• Limited editing capabilities</li>
                                    </>
                                )}
                                {formData.user_type === 'User' && (
                                    <>
                                        <li>• Create new installation records</li>
                                        <li>• View basic dashboard</li>
                                        <li>• Search installations</li>
                                        <li>• View own submissions</li>
                                        <li>• Basic file uploads</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Reset Form
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {submitButtonText}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
