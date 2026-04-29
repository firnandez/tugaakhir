<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LokasiAbsensi extends Model
{
    protected $table = 'lokasi_absensi';

    protected $fillable = [
        'nama_lokasi',
        'latitude',
        'longitude',
        'radius',
        'is_aktif',
    ];

    protected function casts(): array
    {
        return [
            'latitude'  => 'float',
            'longitude' => 'float',
            'radius'    => 'integer',
            'is_aktif'  => 'boolean',
        ];
    }

    public function hitungJarak(float $lat, float $lng): float
    {
        $earthRadius = 6371000; // meter

        $latFrom = deg2rad($this->latitude);
        $latTo   = deg2rad($lat);
        $latDiff = deg2rad($lat - $this->latitude);
        $lngDiff = deg2rad($lng - $this->longitude);

        $a = sin($latDiff / 2) ** 2
            + cos($latFrom) * cos($latTo) * sin($lngDiff / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

   
    public function dalamRadius(float $lat, float $lng): bool
    {
        return $this->hitungJarak($lat, $lng) <= $this->radius;
    }
}