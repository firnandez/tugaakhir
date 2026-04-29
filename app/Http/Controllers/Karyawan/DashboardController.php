<?php

namespace App\Http\Controllers\Karyawan;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $karyawan = Auth::user()->karyawan;
        if (!$karyawan) abort(403);

        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        // ── Riwayat 30 hari terakhir ──
        $riwayat = Absensi::where('id_karyawan', $karyawan->id_karyawan)
            ->where('tanggal', '>=', Carbon::now()->subDays(30)->toDateString())
            ->orderBy('tanggal', 'desc')
            ->get()
            ->map(fn($a) => [
                'tanggal'    => $a->tanggal->toDateString(),
                'jam_masuk'  => $a->jam_masuk,
                'jam_pulang' => $a->jam_pulang,
                'status'     => $a->status,
            ]);

        // ── Ringkasan bulan ini ──
        $absenBulanIni = Absensi::where('id_karyawan', $karyawan->id_karyawan)
            ->whereMonth('tanggal', $bulanIni)
            ->whereYear('tanggal', $tahunIni)
            ->get();

        $ringkasan = [
            'total_kehadiran' => $absenBulanIni->where('status', 'hadir')->count(),
            'terlambat'       => $absenBulanIni->where('keterlambatan', '>', 0)->count(),
            'izin'            => $absenBulanIni->whereIn('status', ['izin', 'sakit', 'cuti'])->count(),
            'absen'           => $absenBulanIni->where('status', 'alpha')->count(),
        ];

        // ── Jadwal shift 7 hari ke depan ──
        $shift = $karyawan->shift;
        $shiftMendatang = collect();

        if ($shift) {
            $shiftMendatang = collect(range(0, 6))->map(fn($i) => [
                'tanggal'    => Carbon::now()->addDays($i)->toDateString(),
                'nama_shift' => $shift->nama_shift,
                'jam_masuk'  => $shift->jam_masuk,
                'jam_pulang' => $shift->jam_pulang,
                'status'     => 'dijadwalkan',
            ]);
        }

        return Inertia::render('karyawan/dashboard', [
            'ringkasan'      => $ringkasan,
            'riwayat'        => $riwayat,
            'shiftMendatang' => $shiftMendatang,
        ]);
    }
}