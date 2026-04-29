<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_absensi', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->enum('tipe', ['masuk', 'pulang']);
            $table->string('token', 64)->unique();
            $table->string('qr_path')->nullable()->comment('Path file SVG QR Code');
            $table->boolean('is_used')->default(false)->comment('Apakah QR sudah pernah dipakai');
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->unique(['tanggal', 'tipe']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_absensi');
    }
};