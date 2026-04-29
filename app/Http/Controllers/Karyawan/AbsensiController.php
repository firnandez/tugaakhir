<?php

namespace App\Http\Controllers\Karyawan;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\LokasiAbsensi;
use App\Models\QrAbsensi;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AbsensiController extends Controller
{
  public function index(): Response
{
    $karyawan = Auth::user()->karyawan;
    if (!$karyawan) abort(403);

    $today = Carbon::today()->toDateString();
    $now   = Carbon::now();

    // Auto mark alpha jika jam sudah lewat dan belum ada absensi
    $shift = $karyawan->shift;
    if ($shift) {
        $jamMasukShift = Carbon::createFromFormat('H:i:s', $shift->jam_masuk);
        $sudahLewat    = $now->gt($jamMasukShift);

        $absensiAda = Absensi::where('id_karyawan', $karyawan->id_karyawan)
            ->where('tanggal', $today)
            ->exists();

        if ($sudahLewat && !$absensiAda) {
            Absensi::create([
                'id_karyawan'   => $karyawan->id_karyawan,
                'tanggal'       => $today,
                'jam_masuk'     => null,
                'jam_pulang'    => null,
                'status'        => 'alpha',
                'keterlambatan' => 0,
                'keterangan'    => 'Tidak hadir tanpa keterangan',
            ]);
        }
    }

    $absensiHariIni = Absensi::where('id_karyawan', $karyawan->id_karyawan)
        ->where('tanggal', $today)
        ->first();

    $pengajuanHariIni = Absensi::where('id_karyawan', $karyawan->id_karyawan)
    ->where('tanggal', $today)
    ->whereIn('status', ['izin', 'sakit', 'cuti'])
    ->first();

$izinDisetujui = $pengajuanHariIni && $pengajuanHariIni->jam_masuk !== null;
$adaPengajuanPending = $pengajuanHariIni && $pengajuanHariIni->jam_masuk === null;
$isAlpha = $absensiHariIni?->status === 'alpha';

return Inertia::render('karyawan/absensi/scan', [
    'absensiHariIni'      => $absensiHariIni,
    'sudahMasuk'          => $absensiHariIni?->jam_masuk !== null,
    'sudahPulang'         => $absensiHariIni?->jam_pulang !== null,
    'izinDisetujui'       => $izinDisetujui,
    'isAlpha'             => $isAlpha,
    'adaPengajuanPending' => $adaPengajuanPending, // ← tambah
    'pengajuanHariIni'    => $pengajuanHariIni ? [
        'status'     => $pengajuanHariIni->status,
        'statusIzin' => $izinDisetujui ? 'disetujui' : 'pending',
        'keterangan' => $pengajuanHariIni->keterangan,
    ] : null,
]);
}

    /**
     * Proses scan QR — dipanggil via AJAX dari halaman scan
     */
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'token'     => ['required', 'string'],
            'latitude'  => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
        ]);

        $karyawan = Auth::user()->karyawan;
        $qr = QrAbsensi::where('token', $request->token)->first();

        if (! $qr) {
            return response()->json(['message' => 'QR Code tidak valid.'], 422);
        }

        if (! $qr->isValid()) {
            return response()->json(['message' => 'QR Code sudah kedaluwarsa atau sudah digunakan.'], 422);
        }

        $lokasiAktif = LokasiAbsensi::where('is_aktif', true)->get();

        if ($lokasiAktif->isEmpty()) {
            return response()->json(['message' => 'Belum ada lokasi absensi yang dikonfigurasi.'], 422);
        }

        $dalamRadius = $lokasiAktif->contains(fn($lokasi) =>
            $lokasi->dalamRadius($request->latitude, $request->longitude)
        );

        if (! $dalamRadius) {
            return response()->json(['message' => 'Anda berada di luar area absensi yang diizinkan.'], 422);
        }

        $today       = Carbon::today()->toDateString();
        $jamSekarang = Carbon::now()->format('H:i:s');
        $keterlambatan = 0;


        if ($qr->tipe === 'masuk') {
            $sudahAbsen = Absensi::where('id_karyawan', $karyawan->id_karyawan)
                ->where('tanggal', $today)
                ->whereNotNull('jam_masuk')
                ->exists();

            if ($sudahAbsen) {
                return response()->json(['message' => 'Anda sudah melakukan absensi masuk hari ini.'], 422);
            }

            $shift         = $karyawan->shift;
            $keterlambatan = Absensi::hitungKeterlambatan(
                $jamSekarang,
                $shift->jam_masuk,
                $shift->toleransi_menit
            );

            Absensi::updateOrCreate(
                ['id_karyawan' => $karyawan->id_karyawan, 'tanggal' => $today],
                [
                    'jam_masuk'       => $jamSekarang,
                    'status'          => 'hadir',
                    'keterlambatan'   => $keterlambatan,
                    'latitude_masuk'  => $request->latitude,
                    'longitude_masuk' => $request->longitude,
                ]
            );

            $pesan = $keterlambatan > 0
                ? "Absensi masuk berhasil. Anda terlambat {$keterlambatan} menit."
                : 'Absensi masuk berhasil. Tepat waktu!';

        } else {
            $absensi = Absensi::where('id_karyawan', $karyawan->id_karyawan)
                ->where('tanggal', $today)
                ->whereNotNull('jam_masuk')
                ->first();

            if (! $absensi) {
                return response()->json(['message' => 'Anda belum melakukan absensi masuk hari ini.'], 422);
            }

            if ($absensi->jam_pulang) {
                return response()->json(['message' => 'Anda sudah melakukan absensi pulang hari ini.'], 422);
            }

            $absensi->update([
                'jam_pulang'       => $jamSekarang,
                'latitude_pulang'  => $request->latitude,
                'longitude_pulang' => $request->longitude,
            ]);

            $pesan = 'Absensi pulang berhasil. Sampai jumpa besok!';
        }

        $qr->markAsUsed();

        return response()->json([
            'message'       => $pesan,
            'tipe'          => $qr->tipe,
            'jam'           => Carbon::now()->format('H:i'),
            'keterlambatan' => $qr->tipe === 'masuk' ? $keterlambatan : null,
        ]);
    }

    public function riwayat(Request $request): Response
    {
        $karyawan = Auth::user()->karyawan;
        $bulan    = $request->input('bulan', Carbon::now()->month);
        $tahun    = $request->input('tahun', Carbon::now()->year);

        $absensi = Absensi::where('id_karyawan', $karyawan->id_karyawan)
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->orderBy('tanggal', 'desc')
            ->get();

        $rekap = [
            'hadir'          => $absensi->where('status', 'hadir')->count(),
            'izin'           => $absensi->where('status', 'izin')->count(),
            'sakit'          => $absensi->where('status', 'sakit')->count(),
            'alpha'          => $absensi->where('status', 'alpha')->count(),
            'cuti'           => $absensi->where('status', 'cuti')->count(),
            'total_terlambat'=> $absensi->sum('keterlambatan'),
        ];

        return Inertia::render('karyawan/absensi/riwayat', [
            'absensi' => $absensi,
            'rekap'   => $rekap,
            'filters' => compact('bulan', 'tahun'),
        ]);
    }

    public function downloadQr(string $tipe)
    {
        abort_unless(in_array($tipe, ['masuk', 'pulang']), 404);

        $qr = QrAbsensi::where('tanggal', Carbon::today()->toDateString())
            ->where('tipe', $tipe)
            ->first();

        abort_unless($qr && $qr->qr_path, 404, 'QR Code belum tersedia.');
        abort_unless(\Illuminate\Support\Facades\Storage::disk('public')->exists($qr->qr_path), 404);

        $filename = "QR-Absensi-{$tipe}-" . Carbon::today()->format('d-m-Y') . '.svg';

        return \Illuminate\Support\Facades\Storage::disk('public')->download($qr->qr_path, $filename);
    }

    public function ajukanIzin(Request $request)
{
    $request->validate([
        'tanggal'    => ['required', 'date'],
        'status'     => ['required', 'in:izin,sakit,cuti'],
        'keterangan' => ['required', 'string', 'max:500'],
    ]);

    $karyawan = Auth::user()->karyawan;

    Absensi::updateOrCreate(
        [
            'id_karyawan' => $karyawan->id_karyawan,
            'tanggal'     => $request->tanggal,
        ],
        [
            'status'      => $request->status,
            'keterangan'  => $request->keterangan,
        ]
    );

    return back()->with('success', 'Pengajuan ' . $request->status . ' berhasil dikirim.');
}
}