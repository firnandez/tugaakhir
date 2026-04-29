<?php

namespace App\Models;
use App\Models\Absensi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Karyawan extends Model
{
    protected $table = 'karyawan';

    protected $primaryKey = 'id_karyawan';

    protected $fillable = [
        'user_id',
        'jabatan_id',
        'shift_id',
        'nik',
        'nama_lengkap',
        'alamat',
        'no_telepon',
        'email',
        'foto',
        'qr_code',
        'status',
        'tanggal_bergabung',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_bergabung' => 'date',
            'status' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'jabatan_id');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'shift_id');
    }

    public function absensi(): HasMany
    {
        return $this->hasMany(Absensi::class, 'id_karyawan', 'id_karyawan');
    }

   public function penggajian(): HasMany
    {
        return $this->hasMany(Penggajian::class, 'id_karyawan', 'id_karyawan');
    }

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }

    public function getQrCodeUrlAttribute(): ?string
    {
        return $this->qr_code ? asset('storage/' . $this->qr_code) : null;
    }
}