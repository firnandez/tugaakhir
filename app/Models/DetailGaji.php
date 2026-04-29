<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailGaji extends Model
{
    use HasFactory;

    protected $table = 'detail_gaji';
    protected $primaryKey = 'id_detail';

    protected $fillable = [
        'id_penggajian', 'komponen', 'jumlah', 'keterangan'
    ];

    public function penggajian()
    {
        return $this->belongsTo(Penggajian::class, 'id_penggajian', 'id_penggajian');
    }
}