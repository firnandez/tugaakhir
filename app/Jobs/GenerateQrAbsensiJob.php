<?php

namespace App\Jobs;

use App\Models\QrAbsensi;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateQrAbsensiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $tipe, // 'masuk' atau 'pulang'
        public readonly ?Carbon $tanggal = null,
    ) {}

    public function handle(): void
    {
        $tanggal = $this->tanggal ?? Carbon::today();

        try {
            $qrLama = QrAbsensi::where('tanggal', $tanggal->toDateString())
                ->where('tipe', $this->tipe)
                ->first();

            if ($qrLama) {
                $qrLama->deleteFile();
                $qrLama->delete();
            }

            $token = Str::random(32) . '_' . $tanggal->format('Ymd') . '_' . $this->tipe;

            if ($this->tipe === 'masuk') {
                $expired = Carbon::now()->addHours(6);
            } else {
                $expired = $tanggal->copy()->setTime(23, 59, 59);
            }

            $qrDir  = 'absensi/qrcode';
            Storage::disk('public')->makeDirectory($qrDir);
            $qrPath = "{$qrDir}/qr_{$this->tipe}_{$tanggal->format('Ymd')}.svg";

            $renderer = new ImageRenderer(
                new RendererStyle(400),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $writer->writeFile(
                $token,
                Storage::disk('public')->path($qrPath)
            );

            QrAbsensi::create([
                'tanggal'    => $tanggal->toDateString(),
                'tipe'       => $this->tipe,
                'token'      => $token,
                'qr_path'    => $qrPath,
                'is_used'    => false,
                'expired_at' => $expired,
            ]);

            Log::info("QR Absensi {$this->tipe} berhasil di-generate untuk {$tanggal->toDateString()}");
        } catch (\Exception $e) {
            Log::error("Gagal generate QR Absensi {$this->tipe}", ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}