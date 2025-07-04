import UserForm from '@/components/UserForm';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import React from 'react';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    user_type: 'Admin' | 'Client' | 'User';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    user_type: 'Admin' | 'Client' | 'User';
    is_active: boolean;
}

interface Props {
    user: User;
    errors?: { [key: string]: string };
}

export default function EditUser({ user, errors = {} }: Props) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'User Management',
            href: '/admin/users',
        },
        {
            title: `Edit ${user.name}`,
        },
    ];

    const handleSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);

        try {
            await router.put(`/admin/users/${user.id}`, data, {
                onSuccess: () => {
                    // Success handling is done via redirect in the controller
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Submit error:', error);
            setIsSubmitting(false);
        }
    };

    // Prepare initial data for the form
    const initialData = {
        name: user.name,
        email: user.email,
        password: '', // Always empty for editing
        password_confirmation: '',
        user_type: user.user_type,
        is_active: user.is_active,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.name}`} />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User: {user.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400">Update user information and permissions</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        User ID: {user.id} • Created: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                </div>

                <UserForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    submitButtonText="Update User"
                    isEditing={true}
                    errors={errors}
                />
            </div>
        </AppLayout>
    );
}
