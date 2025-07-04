import { Head, router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, File, FileImage, UploadIcon, Monitor, Package, Save, Trash2, Upload, User, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Flash {
    success?: string;
    error?: string;
}

interface PageProps {
    flash?: Flash;
    regions: string[];
    auth?: {
        user?: any;
    };
}

interface FilePreview {
    file: File;
    url: string;
    type: string;
    size: string;
}

export default function Welcome({ flash, regions, auth }: PageProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

    // Form state
    const [formData, setFormData] = useState({
        sr_no: '',
        region_division: '',
        location_address: '',
        district: '',
        tahsil: '',
        pin_code: '',
        receiver_name: '',
        contact_no: '',
        dc_ir_no: '',
        dispatch_date: '',
        delivery_date: '',
        installation_date: '',
        total_boxes: '',
        courier_docket_no: '',
        representative_name: '',
        aio_hp_serial: '',
        keyboard_serial: '',
        mouse_serial: '',
        ups_serial: '',
        antivirus: '',
        breakage_notes: '',
        ir_receiver_name: '',
        ir_receiver_designation: '',
        entity_vendor_name: '',
        vendor_contact_number: '',
        charges: '',
        remarks: '',
        delivery_status: 'Pending',
        installation_status: 'Pending',
        hp_440_g9_serial: '',
        hp_keyboard_serial: '',
        hp_mouse_serial: '',
        updated_antivirus: '',
        updated_breakage_notes: '',
        updated_ir_receiver_name: '',
        updated_ir_receiver_designation: '',
        updated_installation_date: '',
        updated_remarks: '',
        hostname: '',
        updated_entity_vendor: '',
        updated_contact_number: '',
        priority: 'Medium',
        assigned_technician: '',
        internal_notes: '',
        soft_copy_dc: false,
        soft_copy_ir: false,
        original_pod_received: false,
        original_dc_received: false,
        ir_original_copy_received: false,
        back_side_photo_taken: false,
        os_installation_photo_taken: false,
        belarc_report_generated: false,
    });

    const [filePreviews, setFilePreviews] = useState<{ [key: string]: FilePreview }>({});

    const fileFields = [
        { key: 'delivery_report_file', label: 'Delivery Report', accept: '.pdf,.jpg,.jpeg,.png' },
        { key: 'installation_report_file', label: 'Installation Report', accept: '.pdf,.jpg,.jpeg,.png' },
        { key: 'belarc_report_file', label: 'Belarc Report', accept: '.pdf' },
        { key: 'back_side_photo_file', label: 'Back Side Photo', accept: '.jpg,.jpeg,.png' },
        { key: 'os_installation_photo_file', label: 'OS Installation Photo', accept: '.jpg,.jpeg,.png' },
        { key: 'keyboard_photo_file', label: 'Keyboard Photo', accept: '.jpg,.jpeg,.png' },
        { key: 'mouse_photo_file', label: 'Mouse Photo', accept: '.jpg,.jpeg,.png' },
        { key: 'screenshot_file', label: 'Screenshot', accept: '.jpg,.jpeg,.png' },
        { key: 'evidence_file', label: 'Evidence File', accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx' },
    ];

    const defaultRegions = ['Amravati', 'Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Aurangabad'];
    const regionsToUse = regions?.length > 0 ? regions : defaultRegions;

    const handleInputChange = (field: string, value: string | boolean | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = (field: string, file: File | null) => {
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }

            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'document';
            const size = formatFileSize(file.size);

            setFilePreviews((prev) => ({
                ...prev,
                [field]: { file, url, type, size },
            }));
        }
    };

    const removeFile = (field: string) => {
        if (filePreviews[field]) {
            URL.revokeObjectURL(filePreviews[field].url);
        }
        setFilePreviews((prev) => {
            const newPreviews = { ...prev };
            delete newPreviews[field];
            return newPreviews;
        });
    };

    const getFileIcon = (type: string, fileName: string) => {
        if (type === 'image') return <FileImage className="h-8 w-8 text-blue-500" />;
        if (fileName.toLowerCase().endsWith('.pdf')) return <UploadIcon className="h-8 w-8 text-red-500" />;
        return <File className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
    };

    const generateSrNo = () => {
        const timestamp = Date.now().toString().slice(-6);
        const srNo = `DC-2025-${timestamp}`;
        setFormData((prev) => ({ ...prev, sr_no: srNo }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const submitData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    submitData.append(key, value.toString());
                }
            });

            // Add files
            Object.entries(filePreviews).forEach(([key, preview]) => {
                submitData.append(key, preview.file);
            });

            // Submit to Laravel backend
            router.post('/dc-installations', submitData, {
                forceFormData: true,
                onSuccess: () => {
                    setSubmitStatus('success');
                    resetForm();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    setSubmitStatus('error');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            sr_no: '',
            region_division: '',
            location_address: '',
            district: '',
            tahsil: '',
            pin_code: '',
            receiver_name: '',
            contact_no: '',
            dc_ir_no: '',
            dispatch_date: '',
            delivery_date: '',
            installation_date: '',
            total_boxes: '',
            courier_docket_no: '',
            representative_name: '',
            aio_hp_serial: '',
            keyboard_serial: '',
            mouse_serial: '',
            ups_serial: '',
            antivirus: '',
            breakage_notes: '',
            ir_receiver_name: '',
            ir_receiver_designation: '',
            entity_vendor_name: '',
            vendor_contact_number: '',
            charges: '',
            remarks: '',
            delivery_status: 'Pending',
            installation_status: 'Pending',
            hp_440_g9_serial: '',
            hp_keyboard_serial: '',
            hp_mouse_serial: '',
            updated_antivirus: '',
            updated_breakage_notes: '',
            updated_ir_receiver_name: '',
            updated_ir_receiver_designation: '',
            updated_installation_date: '',
            updated_remarks: '',
            hostname: '',
            updated_entity_vendor: '',
            updated_contact_number: '',
            priority: 'Medium',
            assigned_technician: '',
            internal_notes: '',
            soft_copy_dc: false,
            soft_copy_ir: false,
            original_pod_received: false,
            original_dc_received: false,
            ir_original_copy_received: false,
            back_side_photo_taken: false,
            os_installation_photo_taken: false,
            belarc_report_generated: false,
        });

        Object.values(filePreviews).forEach((preview) => {
            URL.revokeObjectURL(preview.url);
        });
        setFilePreviews({});
        setSubmitStatus('idle');
    };

    return (
        <>
            <Head title="DC Installation Management" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                {/* Header */}
                <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DC Installation Management</h1>
                                <p className="mt-1 text-gray-600 dark:text-gray-300">Settlement Commissioner and Director of Land Record (Maharashtra State)</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? (
                                        <Sun className="h-4 w-4" />
                                    ) : (
                                        <Moon className="h-4 w-4" />
                                    )}
                                </button>

                                {!auth?.user ? (
                                    <button
                                        onClick={() => router.get('/login')}
                                        className="inline-flex items-center rounded-lg border border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-800 px-4 py-2 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Login
                                    </button>
                                ) : (
                                    <span className="text-gray-600 dark:text-gray-300">Welcome, {auth.user.name}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
                            <div className="flex items-center">
                                <CheckCircle className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-800 dark:text-green-200">{flash.success}</span>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
                            <div className="flex items-center">
                                <AlertCircle className="mr-3 h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="font-medium text-red-800 dark:text-red-200">{flash.error}</span>
                            </div>
                        </div>
                    )}

                    {submitStatus === 'success' && (
                        <div className="mb-6 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
                            <div className="flex items-center">
                                <CheckCircle className="mr-3 h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-800 dark:text-green-200">Installation record submitted successfully!</span>
                            </div>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
                            <div className="flex items-center">
                                <AlertCircle className="mr-3 h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="font-medium text-red-800 dark:text-red-200">Error submitting form. Please try again.</span>
                            </div>
                        </div>
                    )}

                    {/* Main Form */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
                        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New DC Installation Record</h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Fill in the details for the new installation record</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Basic Information */}
                            <div className="mb-8">
                                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    <Monitor className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Total Boxes</label>
                                        <input
                                            type="number"
                                            value={formData.total_boxes}
                                            onChange={(e) => handleInputChange('total_boxes', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Courier Docket No</label>
                                        <input
                                            type="text"
                                            value={formData.courier_docket_no}
                                            onChange={(e) => handleInputChange('courier_docket_no', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Representative Name</label>
                                        <input
                                            type="text"
                                            value={formData.representative_name}
                                            onChange={(e) => handleInputChange('representative_name', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Equipment Details */}
                            <div className="mb-8">
                                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    <Monitor className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    Equipment Details
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">AIO-HP Serial Number</label>
                                        <input
                                            type="text"
                                            value={formData.aio_hp_serial}
                                            onChange={(e) => handleInputChange('aio_hp_serial', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard Serial</label>
                                        <input
                                            type="text"
                                            value={formData.keyboard_serial}
                                            onChange={(e) => handleInputChange('keyboard_serial', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mouse Serial</label>
                                        <input
                                            type="text"
                                            value={formData.mouse_serial}
                                            onChange={(e) => handleInputChange('mouse_serial', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">UPS Serial</label>
                                        <input
                                            type="text"
                                            value={formData.ups_serial}
                                            onChange={(e) => handleInputChange('ups_serial', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Hostname</label>
                                        <input
                                            type="text"
                                            value={formData.hostname}
                                            onChange={(e) => handleInputChange('hostname', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Technician</label>
                                        <input
                                            type="text"
                                            value={formData.assigned_technician}
                                            onChange={(e) => handleInputChange('assigned_technician', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Fields */}
                            <div className="mb-8">
                                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    <CheckCircle className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                                    Status Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Status</label>
                                        <select
                                            value={formData.delivery_status}
                                            onChange={(e) => handleInputChange('delivery_status', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Transit">In Transit</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Installation Status</label>
                                        <select
                                            value={formData.installation_status}
                                            onChange={(e) => handleInputChange('installation_status', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Installed">Installed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Document Status Checkboxes */}
                            <div className="mb-8">
                                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    <File className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Document Status
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.soft_copy_dc}
                                            onChange={(e) => handleInputChange('soft_copy_dc', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Soft Copy DC</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.soft_copy_ir}
                                            onChange={(e) => handleInputChange('soft_copy_ir', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Soft Copy IR</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.original_pod_received}
                                            onChange={(e) => handleInputChange('original_pod_received', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Original POD Received</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.original_dc_received}
                                            onChange={(e) => handleInputChange('original_dc_received', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Original DC Received</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.ir_original_copy_received}
                                            onChange={(e) => handleInputChange('ir_original_copy_received', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">IR Original Copy Received</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.back_side_photo_taken}
                                            onChange={(e) => handleInputChange('back_side_photo_taken', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Back Side Photo Taken</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.os_installation_photo_taken}
                                            onChange={(e) => handleInputChange('os_installation_photo_taken', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">OS Installation Photo Taken</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.belarc_report_generated}
                                            onChange={(e) => handleInputChange('belarc_report_generated', e.target.checked)}
                                            className="mr-3 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Belarc Report Generated</span>
                                    </label>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div className="mb-8">
                                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    <Upload className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    File Uploads
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {fileFields.map(({ key, label, accept }) => (
                                        <div key={key} className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

                                            {!filePreviews[key] ? (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept={accept}
                                                        onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                    />
                                                    <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                        <div className="text-center">
                                                            <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Click to upload {label.toLowerCase()}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                {accept.replace(/\./g, '').toUpperCase()} up to 10MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            {getFileIcon(filePreviews[key].type, filePreviews[key].file.name)}
                                                            <div className="ml-3">
                                                                <p className="max-w-[200px] truncate text-sm font-medium text-gray-900 dark:text-white">
                                                                    {filePreviews[key].file.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{filePreviews[key].size}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(key)}
                                                            className="text-red-500 dark:text-red-400 transition-colors hover:text-red-700 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {filePreviews[key].type === 'image' && (
                                                        <div className="mt-3">
                                                            <img
                                                                src={filePreviews[key].url}
                                                                alt="Preview"
                                                                className="h-32 w-full rounded border object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Internal Notes */}
                            <div className="mb-8">
                                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    <File className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    Additional Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Installation Remarks</label>
                                        <textarea
                                            value={formData.remarks}
                                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                            placeholder="Any installation remarks or notes"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Internal Notes</label>
                                        <textarea
                                            value={formData.internal_notes}
                                            onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-colors duration-200"
                                            placeholder="Any internal notes or additional information"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:outline-none"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Reset Form
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Submit Installation Record
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-300">
                    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 ASK Technologies</p>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                Cybernet IT Pvt. Ltd.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}