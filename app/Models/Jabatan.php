<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jabatan extends Model
{
    protected $table = 'jabatan';

    protected $fillable = [
        'nama_jabatan',
        'gaji_pokok',
        'deskripsi',
    ];

    protected function casts(): array
    {
        return [
            'gaji_pokok' => 'decimal:2',
        ];
    }

    public function karyawan(): HasMany
    {
        return $this->hasMany(Karyawan::class, 'jabatan_id');
    }
}