<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class QrAbsensi extends Model
{
    protected $table = 'qr_absensi';

    protected $fillable = [
        'tanggal',
        'tipe',
        'token',
        'qr_path',
        'is_used',
        'expired_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal'    => 'date',
            'is_used'    => 'boolean',
            'expired_at' => 'datetime',
        ];
    }

    public function getQrUrlAttribute(): ?string
    {
        return $this->qr_path ? asset('storage/' . $this->qr_path) : null;
    }

    public function isValid(): bool
    {
        return ! $this->is_used
            && $this->expired_at !== null
            && $this->expired_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expired_at !== null
            && $this->expired_at->isPast();
    }

    public function markAsUsed(): void
    {
        $this->update(['is_used' => true]);
    }

    public function deleteFile(): void
    {
        if ($this->qr_path && Storage::disk('public')->exists($this->qr_path)) {
            Storage::disk('public')->delete($this->qr_path);
        }
    }
}