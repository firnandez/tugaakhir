<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penggajian extends Model
{
    use HasFactory;

    protected $table = 'penggajian';
    protected $primaryKey = 'id_penggajian';
    
    protected $fillable = [
        'id_karyawan', 'bulan', 'tahun', 'gaji_pokok', 
        'potongan_cuti', 'potongan_lainnya', 'total_gaji', 
        'tanggal_pembayaran', 'status_pembayaran'
    ];

    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan', 'id_karyawan');
    }

    public function detailGaji()
    {
        return $this->hasMany(DetailGaji::class, 'id_penggajian', 'id_penggajian');
    }
}