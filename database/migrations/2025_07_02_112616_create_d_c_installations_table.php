<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dc_installations', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('sr_no')->unique();
            $table->string('region_division');
            $table->text('location_address');
            $table->string('district')->nullable(); // Added to match model
            $table->string('tahsil');
            $table->string('pin_code');
            $table->string('receiver_name');
            $table->string('contact_no');
            $table->string('contact_no_two')->nullable();
            $table->string('dc_ir_no');

            // Dates
            $table->date('dispatch_date')->nullable(); // Added to match model
            $table->date('delivery_date')->nullable();
            $table->date('installation_date')->nullable();

            // Delivery Details
            $table->integer('total_boxes')->nullable(); // Added to match model
            $table->string('courier_docket_no')->nullable();
            $table->string('representative_name')->nullable(); // Added to match model

            // Status Fields
            $table->enum('delivery_status', ['Delivered', 'Pending', 'In Transit'])->default('Pending');
            $table->enum('installation_status', ['Installed', 'Pending', 'In Progress'])->default('Pending');

            // Document Status
            $table->boolean('soft_copy_dc')->default(false);
            $table->boolean('soft_copy_ir')->default(false);
            $table->boolean('original_pod_received')->default(false); // Added to match model
            $table->boolean('original_dc_received')->default(false);
            $table->boolean('ir_original_copy_received')->default(false);

            // Photo/Evidence Status
            $table->boolean('back_side_photo_taken')->default(false);
            $table->boolean('os_installation_photo_taken')->default(false);
            $table->boolean('belarc_report_generated')->default(false);

            // Equipment Details
            $table->string('serial_number')->nullable();
            $table->string('aio_hp_serial')->nullable();
            $table->string('keyboard_serial')->nullable();
            $table->string('mouse_serial')->nullable();
            $table->string('ups_serial')->nullable(); // Added to match model
            $table->string('antivirus')->nullable(); // Added to match model
            $table->text('breakage_notes')->nullable(); // Added to match model

            // Updated Equipment Details
            $table->string('hp_440_g9_serial')->nullable(); // Added to match model
            $table->string('hp_keyboard_serial')->nullable();
            $table->string('hp_mouse_serial')->nullable();
            $table->string('updated_antivirus')->nullable();
            $table->text('updated_breakage_notes')->nullable();

            // Installation Details
            $table->string('ir_receiver_name')->nullable();
            $table->string('ir_receiver_designation')->nullable();
            $table->string('entity_vendor_name')->nullable();
            $table->string('vendor_contact_number')->nullable();
            $table->decimal('charges', 10, 2)->nullable(); // Added to match model
            $table->text('remarks')->nullable();

            // Updated Installation Details
            $table->string('updated_ir_receiver_name')->nullable(); // Added to match model
            $table->string('updated_ir_receiver_designation')->nullable(); // Added to match model
            $table->date('updated_installation_date')->nullable(); // Added to match model
            $table->text('updated_remarks')->nullable(); // Added to match model
            $table->string('hostname')->nullable();
            $table->string('updated_entity_vendor')->nullable(); // Added to match model
            $table->string('updated_contact_number')->nullable(); // Added to match model

            // File Upload Fields
            $table->string('delivery_report_file')->nullable();
            $table->string('installation_report_file')->nullable();
            $table->string('belarc_report_file')->nullable();
            $table->string('back_side_photo_file')->nullable();
            $table->string('os_installation_photo_file')->nullable();
            $table->string('keyboard_photo_file')->nullable();
            $table->string('mouse_photo_file')->nullable();
            $table->string('screenshot_file')->nullable();
            $table->string('evidence_file')->nullable();
            $table->json('additional_documents')->nullable(); // Changed to JSON to match model

            // Priority and Assignment
            $table->enum('priority', ['High', 'Medium', 'Low'])->default('Medium'); // Added to match model
            $table->string('assigned_technician')->nullable(); // Added to match model
            $table->text('internal_notes')->nullable(); // Added to match model

            // Tracking
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['delivery_status', 'installation_status']);
            $table->index(['region_division']);
            $table->index(['district']);
            $table->index(['tahsil']);
            $table->index(['delivery_date', 'installation_date']);
            $table->index(['priority']);
            $table->index(['assigned_technician']);
            $table->index('sr_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dc_installations');
    }
};
