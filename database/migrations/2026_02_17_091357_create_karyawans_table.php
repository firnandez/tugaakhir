<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
    Schema::create('karyawan', function (Blueprint $table) {
        $table->id('id_karyawan'); // Diganti agar sinkron dengan Controller
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('jabatan_id')->constrained('jabatan')->onDelete('restrict');
        $table->foreignId('shift_id')->constrained('shift')->onDelete('restrict');
        $table->string('nik', 20)->unique();
        $table->string('nama_lengkap');
        $table->text('alamat')->nullable();
        $table->string('no_telepon', 20)->nullable();
        $table->string('email')->nullable();
        $table->string('foto')->nullable();
        $table->string('qr_code')->nullable();
        $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
        $table->date('tanggal_bergabung');
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('karyawan');
    }
};