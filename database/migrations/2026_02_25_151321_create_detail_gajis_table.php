<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void {
    Schema::create('detail_gaji', function (Blueprint $table) {
        $table->id('id_detail');
        $table->foreignId('id_penggajian')->constrained('penggajian', 'id_penggajian')->onDelete('cascade');
        $table->string('komponen');
        $table->decimal('jumlah', 15, 2);
        $table->text('keterangan')->nullable();
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('detail_gaji');
    }
};