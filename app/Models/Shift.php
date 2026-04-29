<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    protected $table = 'shift';

    protected $fillable = [
        'nama_shift',
        'jam_masuk',
        'jam_pulang',
        'toleransi_menit',
    ];

    protected function casts(): array
    {
        return [
            'toleransi_menit' => 'integer',
        ];
    }

    public function karyawan(): HasMany
    {
        return $this->hasMany(Karyawan::class, 'shift_id');
    }
}