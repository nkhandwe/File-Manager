import { useState } from 'react';
import { 
    Plus, 
    Upload,
    X,
    File,
    FileImage,
    FilePdf,
    Trash2,
    Save,
    CheckCircle,
    Calendar,
    MapPin,
    Monitor,
    Package,
    AlertCircle
} from 'lucide-react';

interface FilePreview {
    file: File;
    url: string;
    type: string;
    size: string;
}

export default function DCInstallationForm() {
    // Form state
    const [formData, setFormData] = useState({
        // Basic Information
        sr_no: '',
        region_division: '',
        location_address: '',
        district: '',
        tahsil: '',
        pin_code: '',
        receiver_name: '',
        contact_no: '',
        dc_ir_no: '',

        // Dates
        dispatch_date: '',
        delivery_date: '',
        installation_date: '',

        // Delivery Details
        total_boxes: '',
        courier_docket_no: '',
        representative_name: '',

        // Equipment Details
        aio_hp_serial: '',
        keyboard_serial: '',
        mouse_serial: '',
        ups_serial: '',
        antivirus: '',
        breakage_notes: '',

        // Installation Details
        ir_receiver_name: '',
        ir_receiver_designation: '',
        entity_vendor_name: '',
        vendor_contact_number: '',
        charges: '',
        remarks: '',

        // Status Fields
        delivery_status: 'Pending',
        installation_status: 'Pending',

        // Updated Equipment Details (HP 440 G9 AIO)
        hp_440_g9_serial: '',
        hp_keyboard_serial: '',
        hp_mouse_serial: '',
        updated_antivirus: '',
        updated_breakage_notes: '',

        // Updated Installation Details
        updated_ir_receiver_name: '',
        updated_ir_receiver_designation: '',
        updated_installation_date: '',
        updated_remarks: '',
        hostname: '',
        updated_entity_vendor: '',
        updated_contact_number: '',

        // Priority and Assignment
        priority: 'Medium',
        assigned_technician: '',
        internal_notes: '',

        // Document Status
        soft_copy_dc: false,
        soft_copy_ir: false,
        original_pod_received: false,
        original_dc_received: false,
        ir_original_copy_received: false,

        // Photo/Evidence Status
        back_side_photo_taken: false,
        os_installation_photo_taken: false,
        belarc_report_generated: false,
    });

    const [filePreviews, setFilePreviews] = useState<{[key: string]: FilePreview}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const fileFields = [
        { key: 'delivery_report_file', label: 'Delivery Report', accept: '.pdf,.jpg,.jpeg,.png', required: false },
        { key: 'installation_report_file', label: 'Installation Report', accept: '.pdf,.jpg,.jpeg,.png', required: false },
        { key: 'belarc_report_file', label: 'Belarc Report', accept: '.pdf', required: false },
        { key: 'back_side_photo_file', label: 'Back Side Photo', accept: '.jpg,.jpeg,.png', required: false },
        { key: 'os_installation_photo_file', label: 'OS Installation Photo', accept: '.jpg,.jpeg,.png', required: false },
        { key: 'keyboard_photo_file', label: 'Keyboard Photo', accept: '.jpg,.jpeg,.png', required: false },
        { key: 'mouse_photo_file', label: 'Mouse Photo', accept: '.jpg,.jpeg,.png', required: false },
        { key: 'screenshot_file', label: 'Screenshot', accept: '.jpg,.jpeg,.png', required: false },
        { key: 'evidence_file', label: 'Evidence File', accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx', required: false },
    ];

    const regions = ['Amravati', 'Nashik', 'Pune', 'Mumbai', 'Nagpur', 'Aurangabad'];

    const handleInputChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }

            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'document';
            const size = formatFileSize(file.size);
            
            setFilePreviews(prev => ({
                ...prev,
                [field]: { file, url, type, size }
            }));
        }
    };

    const removeFile = (field: string) => {
        if (filePreviews[field]) {
            URL.revokeObjectURL(filePreviews[field].url);
        }
        setFilePreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[field];
            return newPreviews;
        });
    };

    const getFileIcon = (type: string, fileName: string) => {
        if (type === 'image') return <FileImage className="h-8 w-8 text-blue-500" />;
        if (fileName.toLowerCase().endsWith('.pdf')) return <FilePdf className="h-8 w-8 text-red-500" />;
        return <File className="h-8 w-8 text-gray-500" />;
    };

    const generateSrNo = () => {
        const timestamp = Date.now().toString().slice(-6);
        const srNo = `DC-2025-${timestamp}`;
        setFormData(prev => ({ ...prev, sr_no: srNo }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Create FormData for file upload
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

            // Simulate API call (replace with actual API endpoint)
            console.log('Submitting to API...');
            console.log('Form Data:', Object.fromEntries(submitData.entries()));
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setSubmitStatus('success');
            
            // Reset form after successful submission
            setTimeout(() => {
                resetForm();
            }, 2000);

        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        // Reset form data
        setFormData({
            sr_no: '', region_division: '', location_address: '', district: '', tahsil: '', pin_code: '',
            receiver_name: '', contact_no: '', dc_ir_no: '', dispatch_date: '', delivery_date: '',
            installation_date: '', total_boxes: '', courier_docket_no: '', representative_name: '',
            aio_hp_serial: '', keyboard_serial: '', mouse_serial: '', ups_serial: '', antivirus: '',
            breakage_notes: '', ir_receiver_name: '', ir_receiver_designation: '', entity_vendor_name: '',
            vendor_contact_number: '', charges: '', remarks: '', delivery_status: 'Pending',
            installation_status: 'Pending', hp_440_g9_serial: '', hp_keyboard_serial: '', hp_mouse_serial: '',
            updated_antivirus: '', updated_breakage_notes: '', updated_ir_receiver_name: '',
            updated_ir_receiver_designation: '', updated_installation_date: '', updated_remarks: '',
            hostname: '', updated_entity_vendor: '', updated_contact_number: '', priority: 'Medium',
            assigned_technician: '', internal_notes: '', soft_copy_dc: false, soft_copy_ir: false,
            original_pod_received: false, original_dc_received: false, ir_original_copy_received: false,
            back_side_photo_taken: false, os_installation_photo_taken: false, belarc_report_generated: false,
        });

        // Clear file previews
        Object.values(filePreviews).forEach(preview => {
            URL.revokeObjectURL(preview.url);
        });
        setFilePreviews({});
        setSubmitStatus('idle');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">DC Installation Management</h1>
                            <p className="mt-1 text-gray-600">Settlement Commissioner and Director of Land Record (Maharashtra State)</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={generateSrNo}
                                className="inline-flex items-center rounded-lg border border-blue-600 bg-white px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Generate SR No
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center">
                            <CheckCircle className="mr-3 h-5 w-5 text-green-600" />
                            <span className="text-green-800 font-medium">Installation record submitted successfully!</span>
                        </div>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center">
                            <AlertCircle className="mr-3 h-5 w-5 text-red-600" />
                            <span className="text-red-800 font-medium">Error submitting form. Please try again.</span>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900">New DC Installation Record</h2>
                        <p className="mt-1 text-sm text-gray-600">Fill in the details for the new installation record</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Basic Information */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <Monitor className="mr-2 h-5 w-5 text-blue-600" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Serial Number</label>
                                    <input
                                        type="text"
                                        value={formData.sr_no}
                                        onChange={(e) => handleInputChange('sr_no', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Auto-generated or manual entry"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Region/Division *</label>
                                    <select
                                        value={formData.region_division}
                                        onChange={(e) => handleInputChange('region_division', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">District *</label>
                                    <input
                                        type="text"
                                        value={formData.district}
                                        onChange={(e) => handleInputChange('district', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Tahsil *</label>
                                    <input
                                        type="text"
                                        value={formData.tahsil}
                                        onChange={(e) => handleInputChange('tahsil', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">PIN Code *</label>
                                    <input
                                        type="text"
                                        value={formData.pin_code}
                                        onChange={(e) => handleInputChange('pin_code', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Receiver Name *</label>
                                    <input
                                        type="text"
                                        value={formData.receiver_name}
                                        onChange={(e) => handleInputChange('receiver_name', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Contact Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.contact_no}
                                        onChange={(e) => handleInputChange('contact_no', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">DC/IR Number</label>
                                    <input
                                        type="text"
                                        value={formData.dc_ir_no}
                                        onChange={(e) => handleInputChange('dc_ir_no', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => handleInputChange('priority', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Location/Address *</label>
                                <textarea
                                    value={formData.location_address}
                                    onChange={(e) => handleInputChange('location_address', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Complete address with landmarks"
                                    required
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <Calendar className="mr-2 h-5 w-5 text-green-600" />
                                Important Dates
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Dispatch Date</label>
                                    <input
                                        type="date"
                                        value={formData.dispatch_date}
                                        onChange={(e) => handleInputChange('dispatch_date', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Delivery Date</label>
                                    <input
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Installation Date</label>
                                    <input
                                        type="date"
                                        value={formData.installation_date}
                                        onChange={(e) => handleInputChange('installation_date', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <Package className="mr-2 h-5 w-5 text-purple-600" />
                                Delivery Details
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Total Boxes</label>
                                    <input
                                        type="number"
                                        value={formData.total_boxes}
                                        onChange={(e) => handleInputChange('total_boxes', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Courier Docket No</label>
                                    <input
                                        type="text"
                                        value={formData.courier_docket_no}
                                        onChange={(e) => handleInputChange('courier_docket_no', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Representative Name</label>
                                    <input
                                        type="text"
                                        value={formData.representative_name}
                                        onChange={(e) => handleInputChange('representative_name', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Equipment Details */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <Monitor className="mr-2 h-5 w-5 text-indigo-600" />
                                Equipment Details
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">AIO-HP Serial Number</label>
                                    <input
                                        type="text"
                                        value={formData.aio_hp_serial}
                                        onChange={(e) => handleInputChange('aio_hp_serial', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Keyboard Serial</label>
                                    <input
                                        type="text"
                                        value={formData.keyboard_serial}
                                        onChange={(e) => handleInputChange('keyboard_serial', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Mouse Serial</label>
                                    <input
                                        type="text"
                                        value={formData.mouse_serial}
                                        onChange={(e) => handleInputChange('mouse_serial', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">UPS Serial</label>
                                    <input
                                        type="text"
                                        value={formData.ups_serial}
                                        onChange={(e) => handleInputChange('ups_serial', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Antivirus</label>
                                    <input
                                        type="text"
                                        value={formData.antivirus}
                                        onChange={(e) => handleInputChange('antivirus', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Hostname</label>
                                    <input
                                        type="text"
                                        value={formData.hostname}
                                        onChange={(e) => handleInputChange('hostname', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Breakage Notes</label>
                                <textarea
                                    value={formData.breakage_notes}
                                    onChange={(e) => handleInputChange('breakage_notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Any damage or breakage notes"
                                />
                            </div>
                        </div>

                        {/* Installation Details */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <MapPin className="mr-2 h-5 w-5 text-orange-600" />
                                Installation Details
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">IR Receiver Name</label>
                                    <input
                                        type="text"
                                        value={formData.ir_receiver_name}
                                        onChange={(e) => handleInputChange('ir_receiver_name', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">IR Receiver Designation</label>
                                    <input
                                        type="text"
                                        value={formData.ir_receiver_designation}
                                        onChange={(e) => handleInputChange('ir_receiver_designation', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Entity/Vendor Name</label>
                                    <input
                                        type="text"
                                        value={formData.entity_vendor_name}
                                        onChange={(e) => handleInputChange('entity_vendor_name', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Vendor Contact Number</label>
                                    <input
                                        type="tel"
                                        value={formData.vendor_contact_number}
                                        onChange={(e) => handleInputChange('vendor_contact_number', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Charges</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.charges}
                                        onChange={(e) => handleInputChange('charges', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Assigned Technician</label>
                                    <input
                                        type="text"
                                        value={formData.assigned_technician}
                                        onChange={(e) => handleInputChange('assigned_technician', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Installation Remarks</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Any installation remarks or notes"
                                />
                            </div>
                        </div>

                        {/* Status Fields */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                                Status Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Delivery Status</label>
                                    <select
                                        value={formData.delivery_status}
                                        onChange={(e) => handleInputChange('delivery_status', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Transit">In Transit</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Installation Status</label>
                                    <select
                                        value={formData.installation_status}
                                        onChange={(e) => handleInputChange('installation_status', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <File className="mr-2 h-5 w-5 text-blue-600" />
                                Document Status
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.soft_copy_dc}
                                        onChange={(e) => handleInputChange('soft_copy_dc', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Soft Copy DC</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.soft_copy_ir}
                                        onChange={(e) => handleInputChange('soft_copy_ir', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Soft Copy IR</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.original_pod_received}
                                        onChange={(e) => handleInputChange('original_pod_received', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Original POD Received</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.original_dc_received}
                                        onChange={(e) => handleInputChange('original_dc_received', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Original DC Received</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.ir_original_copy_received}
                                        onChange={(e) => handleInputChange('ir_original_copy_received', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">IR Original Copy Received</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.back_side_photo_taken}
                                        onChange={(e) => handleInputChange('back_side_photo_taken', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Back Side Photo Taken</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.os_installation_photo_taken}
                                        onChange={(e) => handleInputChange('os_installation_photo_taken', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">OS Installation Photo Taken</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.belarc_report_generated}
                                        onChange={(e) => handleInputChange('belarc_report_generated', e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Belarc Report Generated</span>
                                </label>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="mb-8">
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <Upload className="mr-2 h-5 w-5 text-purple-600" />
                                File Uploads
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {fileFields.map(({ key, label, accept, required }) => (
                                    <div key={key} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {label} {required && <span className="text-red-500">*</span>}
                                        </label>
                                        
                                        {!filePreviews[key] ? (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept={accept}
                                                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    required={required}
                                                />
                                                <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                                    <div className="text-center">
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            Click to upload {label.toLowerCase()}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {accept.replace(/\./g, '').toUpperCase()} up to 10MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {getFileIcon(filePreviews[key].type, filePreviews[key].file.name)}
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                                {filePreviews[key].file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {filePreviews[key].size}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(key)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                
                                                {filePreviews[key].type === 'image' && (
                                                    <div className="mt-3">
                                                        <img
                                                            src={filePreviews[key].url}
                                                            alt="Preview"
                                                            className="h-32 w-full object-cover rounded border"
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
                            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                <FileText className="mr-2 h-5 w-5 text-gray-600" />
                                Additional Information
                            </h3>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Internal Notes</label>
                                <textarea
                                    value={formData.internal_notes}
                                    onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Any internal notes or additional information"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between border-t pt-6">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Reset Form
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
            <footer className="mt-12 border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">© 2025 Settlement Commissioner and Director of Land Record (Maharashtra State)</p>
                        <p className="mt-1 text-xs text-gray-400">WO No-Ref/All-In-One/workorder/2025 Date – 09.05.2025 | Cybernet IT Pvt. Ltd.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}