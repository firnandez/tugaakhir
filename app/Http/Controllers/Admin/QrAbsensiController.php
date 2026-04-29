<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateQrAbsensiJob;
use App\Models\QrAbsensi;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QrAbsensiController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today()->toDateString();

        $qrMasuk  = QrAbsensi::where('tanggal', $today)->where('tipe', 'masuk')->first();
        $qrPulang = QrAbsensi::where('tanggal', $today)->where('tipe', 'pulang')->first();

        return Inertia::render('admin/qr-absensi/index', [
            'qrMasuk'  => $qrMasuk ? [
                'id'         => $qrMasuk->id,
                'tanggal'    => $qrMasuk->tanggal->format('d M Y'),
                'tipe'       => $qrMasuk->tipe,
                'qr_url'     => $qrMasuk->qr_url,
                'is_used'    => $qrMasuk->is_used,
                'expired_at' => $qrMasuk->expired_at?->format('H:i'),
                'is_valid'   => $qrMasuk->isValid(),
                'is_expired' => $qrMasuk->isExpired(),
            ] : null,
            'qrPulang' => $qrPulang ? [
                'id'         => $qrPulang->id,
                'tanggal'    => $qrPulang->tanggal->format('d M Y'),
                'tipe'       => $qrPulang->tipe,
                'qr_url'     => $qrPulang->qr_url,
                'is_used'    => $qrPulang->is_used,
                'expired_at' => $qrPulang->expired_at?->format('H:i'),
                'is_valid'   => $qrPulang->isValid(),
                'is_expired' => $qrPulang->isExpired(),
            ] : null,
            'today'    => Carbon::today()->translatedFormat('l, d F Y'),
        ]);
    }

    public function generate(Request $request): RedirectResponse
    {
        $request->validate([
            'tipe' => ['required', 'in:masuk,pulang'],
        ]);

        GenerateQrAbsensiJob::dispatchSync($request->tipe, Carbon::today());

        return back()->with('success', "QR Absensi {$request->tipe} berhasil di-generate.");
    }

    public function download(QrAbsensi $qrAbsensi): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_unless(
            $qrAbsensi->qr_path && Storage::disk('public')->exists($qrAbsensi->qr_path),
            404,
            'File QR tidak ditemukan.'
        );

        $filename = "QR-Absensi-{$qrAbsensi->tipe}-{$qrAbsensi->tanggal->format('d-m-Y')}.svg";

        return Storage::disk('public')->download($qrAbsensi->qr_path, $filename);
    }
}