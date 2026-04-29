<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Karyawan;
use App\Models\Penggajian;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today     = Carbon::today();
        $bulanIni  = $today->month;
        $tahunIni  = $today->year;
        $bulanLalu = Carbon::now()->subMonth()->month;

        $totalKaryawan     = Karyawan::where('status', 'aktif')->count();
        $totalKaryawanLalu = Karyawan::where('status', 'aktif')
            ->whereMonth('tanggal_bergabung', '!=', $bulanIni)
            ->count();
        $tambahKaryawan = $totalKaryawan - $totalKaryawanLalu;

        $totalPresensi = Absensi::whereMonth('tanggal', $bulanIni)
            ->whereYear('tanggal', $tahunIni)
            ->whereIn('status', ['hadir', 'sakit', 'izin', 'cuti'])
            ->count();

        $totalHadir = Absensi::whereMonth('tanggal', $bulanIni)
            ->whereYear('tanggal', $tahunIni)
            ->where('status', 'hadir')
            ->count();

        $persenHadir = $totalPresensi > 0
            ? round(($totalHadir / $totalPresensi) * 100)
            : 0;

        $totalIzinBulanIni  = Absensi::whereMonth('tanggal', $bulanIni)
            ->whereYear('tanggal', $tahunIni)
            ->whereIn('status', ['izin', 'sakit', 'cuti'])
            ->count();

        $totalIzinBulanLalu = Absensi::whereMonth('tanggal', $bulanLalu)
            ->whereYear('tanggal', $tahunIni)
            ->whereIn('status', ['izin', 'sakit', 'cuti'])
            ->count();

        $aktivitas = Absensi::with(['karyawan.jabatan'])
            ->whereDate('tanggal', $today)
            ->orderBy('jam_masuk', 'asc')
            ->get()
            ->map(fn($a) => [
                'initials' => $this->getInitials($a->karyawan->nama_lengkap),
                'nama'     => $a->karyawan->nama_lengkap,
                'jabatan'  => $a->karyawan->jabatan?->nama_jabatan ?? '-',
                'action'   => $this->getActionLabel($a->status),
                'time'     => $a->jam_masuk
                    ? Carbon::parse($a->jam_masuk)->format('H:i') . ' WIB'
                    : '-',
                'badge'    => $a->label_status,
                'status'   => $a->status,
            ]);

        $presensiHariIni = Karyawan::with(['absensi' => function ($q) use ($today) {
                $q->whereDate('tanggal', $today);
            }, 'jabatan'])
            ->where('status', 'aktif')
            ->get()
            ->map(function ($k) {
                $absensi = $k->absensi->first();
                return [
                    'nama'    => $k->nama_lengkap,
                    'jabatan' => $k->jabatan?->nama_jabatan ?? '-',
                    'masuk'   => $absensi?->jam_masuk
                        ? Carbon::parse($absensi->jam_masuk)->format('H:i')
                        : null,
                    'status'  => $absensi ? ucfirst($absensi->status) : 'Belum absen',
                ];
            });

$distribusiPresensi = [
    'hadir' => Absensi::whereMonth('tanggal', $bulanIni)->whereYear('tanggal', $tahunIni)->where('status', 'hadir')->count(),
    'izin'  => Absensi::whereMonth('tanggal', $bulanIni)->whereYear('tanggal', $tahunIni)->where('status', 'izin')->count(),
    'sakit' => Absensi::whereMonth('tanggal', $bulanIni)->whereYear('tanggal', $tahunIni)->where('status', 'sakit')->count(),
    'alpha' => Absensi::whereMonth('tanggal', $bulanIni)->whereYear('tanggal', $tahunIni)->where('status', 'alpha')->count(),
    'cuti'  => Absensi::whereMonth('tanggal', $bulanIni)->whereYear('tanggal', $tahunIni)->where('status', 'cuti')->count(),
];

$trenPenggajian = collect(range(5, 0))->map(function ($i) {
    $tanggal = Carbon::now()->subMonths($i);
    $total = Penggajian::whereMonth('tanggal_pembayaran', $tanggal->month)
        ->whereYear('tanggal_pembayaran', $tanggal->year)
        ->sum('total_gaji');
    return [
        'bulan' => $tanggal->translatedFormat('M Y'),
        'total' => (int) $total,
    ];
})->values();

return Inertia::render('admin/dashboard', [
    'stats' => [
        'totalKaryawan'  => $totalKaryawan,
        'tambahKaryawan' => $tambahKaryawan,
        'totalPresensi'  => $totalPresensi,
        'persenHadir'    => $persenHadir,
        'totalIzin'      => $totalIzinBulanIni,
        'izinNaik'       => $totalIzinBulanIni > $totalIzinBulanLalu,
    ],
    'aktivitas'          => $aktivitas,
    'presensiHariIni'    => $presensiHariIni,
    'distribusiPresensi' => $distribusiPresensi,
    'trenPenggajian'     => $trenPenggajian, 
]);
    }

    private function getInitials(string $nama): string
    {
        $words = explode(' ', trim($nama));
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($nama, 0, 2));
    }

    private function getActionLabel(string $status): string
    {
        return match ($status) {
            'hadir'  => 'melakukan presensi masuk',
            'izin'   => 'mengajukan izin',
            'sakit'  => 'mengajukan izin sakit',
            'alpha'  => 'tidak hadir tanpa keterangan',
            'cuti'   => 'sedang cuti',
            default  => 'melakukan presensi',
        };
    }
}