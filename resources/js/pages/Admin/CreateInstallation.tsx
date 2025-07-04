import DCInstallationForm from '@/components/DCInstallationForm';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Installations', href: '/admin/installations' },
    { title: 'Create Installation' },
];

interface Props {
    regions: string[];
    districts: string[];
    errors?: { [key: string]: string };
}

export default function AdminCreateInstallation({ regions, districts, errors = {} }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: any, files: any) => {
        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    submitData.append(key, value.toString());
                }
            });

            // Add files
            Object.entries(files).forEach(([key, filePreview]: [string, any]) => {
                submitData.append(key, filePreview.file);
            });

            router.post('/admin/installations', submitData, {
                forceFormData: true,
                onSuccess: () => {
                    // Redirect will be handled by the controller
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Submission error:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Installation" />

            <div className="p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Installation</h1>
                        <p className="text-gray-600 dark:text-gray-400">Add a new DC installation record to the system</p>
                    </div>

                    <DCInstallationForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        submitButtonText="Create Installation"
                        showAllFields={true}
                        regions={regions}
                        districts={districts}
                        errors={errors}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
