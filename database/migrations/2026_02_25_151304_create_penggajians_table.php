<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
    Schema::create('penggajian', function (Blueprint $table) {
        $table->id('id_penggajian');
        $table->unsignedBigInteger('id_karyawan');
        $table->foreign('id_karyawan')->references('id_karyawan')->on('karyawan')->onDelete('cascade');
        $table->integer('bulan');
        $table->integer('tahun');
        $table->decimal('gaji_pokok', 15, 2);
        $table->decimal('potongan_cuti', 15, 2)->default(0);
        $table->decimal('potongan_lainnya', 15, 2)->default(0);
        $table->decimal('total_gaji', 15, 2);
        $table->date('tanggal_pembayaran')->nullable();
        $table->enum('status_pembayaran', ['lunas', 'belum_lunas'])->default('belum_lunas');
        $table->timestamps();

        $table->unique(['id_karyawan', 'bulan', 'tahun']);
    });
}

    public function down(): void
    {
        Schema::dropIfExists('penggajian');
    }
};