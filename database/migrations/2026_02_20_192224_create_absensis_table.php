<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
    Schema::create('absensi', function (Blueprint $table) {
        $table->id('id_absensi');
        $table->unsignedBigInteger('id_karyawan');
        $table->foreign('id_karyawan')->references('id_karyawan')->on('karyawan')->onDelete('cascade');  
        $table->date('tanggal');
        $table->time('jam_masuk')->nullable();
        $table->time('jam_pulang')->nullable();
        $table->enum('status', ['hadir', 'izin', 'sakit', 'alpha', 'cuti'])->default('hadir');
        $table->integer('keterlambatan')->default(0);
        $table->text('keterangan')->nullable();
        $table->decimal('latitude_masuk', 10, 7)->nullable();
        $table->decimal('longitude_masuk', 10, 7)->nullable();
        $table->decimal('latitude_pulang', 10, 7)->nullable();
        $table->decimal('longitude_pulang', 10, 7)->nullable();
        $table->timestamps();

        $table->unique(['id_karyawan', 'tanggal']);
    });
}

    public function down(): void
    {
        Schema::dropIfExists('absensi');
    }
};