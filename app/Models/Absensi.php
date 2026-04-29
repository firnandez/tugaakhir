<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absensi extends Model
{
    protected $table = 'absensi';

    protected $primaryKey = 'id_absensi';

    protected $fillable = [
        'id_karyawan',
        'tanggal',
        'jam_masuk',
        'jam_pulang',
        'status',
        'keterlambatan',
        'keterangan',
        'latitude_masuk',
        'longitude_masuk',
        'latitude_pulang',
        'longitude_pulang',
    ];

    protected function casts(): array
    {
        return [
            'tanggal'          => 'date',
            'keterlambatan'    => 'integer',
            'latitude_masuk'   => 'float',
            'longitude_masuk'  => 'float',
            'latitude_pulang'  => 'float',
            'longitude_pulang' => 'float',
        ];
    }

    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan', 'id_karyawan');
    }

    public static function hitungKeterlambatan(string $jamMasukAktual, string $jamMasukShift, int $toleransiMenit): int
    {
        $aktual    = strtotime($jamMasukAktual);
        $batasAman = strtotime($jamMasukShift) + ($toleransiMenit * 60);

        if ($aktual <= $batasAman) {
            return 0;
        }

        return (int) round(($aktual - $batasAman) / 60);
    }

    public function getLabelStatusAttribute(): string
    {
        return match ($this->status) {
            'hadir' => 'Hadir',
            'izin'  => 'Izin',
            'sakit' => 'Sakit',
            'alpha' => 'Alpha',
            'cuti'  => 'Cuti',
            default => ucfirst($this->status),
        };
    }
}