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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // User information
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('user_type')->nullable();

            // Action details
            $table->string('action'); // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, DOWNLOAD
            $table->string('resource_type'); // DCInstallation, User, System
            $table->string('resource_id')->nullable(); // ID or identifier of the resource

            // Data changes
            $table->json('old_values')->nullable(); // Previous data state
            $table->json('new_values')->nullable(); // New data state

            // Request information
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('url')->nullable();
            $table->string('method')->nullable(); // GET, POST, PUT, DELETE

            // Additional metadata
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->string('description'); // Human readable description
            $table->json('metadata')->nullable(); // Additional context data

            $table->timestamps();

            // Indexes for better performance
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['resource_type', 'created_at']);
            $table->index(['severity', 'created_at']);
            $table->index('created_at');

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
