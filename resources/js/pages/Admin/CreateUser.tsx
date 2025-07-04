import UserForm from '@/components/UserForm';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import React from 'react';

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
        href: '/admin/users',
    },
    {
        title: 'Create User',
    },
];

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    user_type: 'Admin' | 'Client' | 'User';
    is_active: boolean;
}

interface Props {
    errors?: { [key: string]: string };
}

export default function CreateUser({ errors = {} }: Props) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);

        try {
            await router.post('/admin/users', data, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h1>
                    <p className="text-gray-600 dark:text-gray-400">Add a new user to the DC Installation Management System</p>
                </div>

                <UserForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitButtonText="Create User" isEditing={false} errors={errors} />
            </div>
        </AppLayout>
    );
}
