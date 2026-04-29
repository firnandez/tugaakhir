<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penggajian;
use App\Models\DetailGaji;
use App\Models\Karyawan;
use App\Models\Absensi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PenggajianController extends Controller
{
    const HARI_KERJA_SEBULAN = 26;

    public function index(Request $request)
    {
        $bulan = $request->integer('bulan', now()->month);
        $tahun = $request->integer('tahun', now()->year);

        $penggajianList = Penggajian::with(['karyawan.jabatan'])
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => [
                'id_penggajian'      => $p->id_penggajian,
                'nama'               => $p->karyawan->nama_lengkap,
                'nik'                => $p->karyawan->nik,
                'jabatan'            => $p->karyawan->jabatan->nama_jabatan ?? '-',
                'gaji_pokok'         => $p->gaji_pokok,
                'potongan_cuti'      => $p->potongan_cuti,
                'potongan_lainnya'   => $p->potongan_lainnya,
                'status_pembayaran'  => $p->status_pembayaran,
                'tanggal_pembayaran' => $p->tanggal_pembayaran,
            ]);

        $sudahDigenerate = Penggajian::where('bulan', $bulan)->where('tahun', $tahun)->exists();

        return Inertia::render('admin/penggajian/index', [
            'penggajianList'  => $penggajianList,
            'sudahDigenerate' => $sudahDigenerate,
            'filterBulan'     => $bulan,
            'filterTahun'     => $tahun,
            'totalGaji'       => $penggajianList->sum('total_gaji'),
            'totalLunas'      => $penggajianList->where('status_pembayaran', 'lunas')->count(),
            'totalBelumLunas' => $penggajianList->where('status_pembayaran', 'belum_lunas')->count(),
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2099',
        ]);

        $bulan = $request->integer('bulan');
        $tahun = $request->integer('tahun');

        if (Penggajian::where('bulan', $bulan)->where('tahun', $tahun)->exists()) {
            return back()->withErrors(['bulan' => "Penggajian bulan {$bulan}/{$tahun} sudah pernah di-generate."]);
        }

        $karyawanList = Karyawan::with('jabatan')
            ->where('status', 'aktif')
            ->get();

        $preview = $karyawanList->map(function ($karyawan) use ($bulan, $tahun) {
            return $this->hitungGaji($karyawan, $bulan, $tahun);
        });

        return Inertia::render('admin/penggajian/generate', [
            'preview' => $preview,
            'bulan'   => $bulan,
            'tahun'   => $tahun,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bulan'                    => 'required|integer|min:1|max:12',
            'tahun'                    => 'required|integer|min:2020',
            'data'                     => 'required|array|min:1',
            'data.*.id_karyawan'       => 'required|exists:karyawan,id_karyawan',
            'data.*.gaji_pokok'        => 'required|numeric|min:0',
            'data.*.potongan_cuti'     => 'required|numeric|min:0',
            'data.*.potongan_lainnya'  => 'required|numeric|min:0',
            'data.*.total_gaji'        => 'required|numeric|min:0',
            'data.*.detail'            => 'required|array',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->data as $item) {
                $penggajian = Penggajian::create([
                    'id_karyawan'        => $item['id_karyawan'],
                    'bulan'              => $request->bulan,
                    'tahun'              => $request->tahun,
                    'gaji_pokok'         => $item['gaji_pokok'],
                    'potongan_cuti'      => $item['potongan_cuti'],
                    'potongan_lainnya'   => $item['potongan_lainnya'],
                    'total_gaji'         => $item['total_gaji'],
                    'tanggal_pembayaran' => null,
                    'status_pembayaran'  => 'belum_lunas',
                ]);

                foreach ($item['detail'] as $detail) {
                    DetailGaji::create([
                        'id_penggajian' => $penggajian->id_penggajian,
                        'komponen'      => $detail['komponen'],
                        'jumlah'        => $detail['jumlah'],
                        'keterangan'    => $detail['keterangan'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('admin.penggajian.index', [
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
        ])->with('success', 'Penggajian berhasil di-generate dan disimpan.');
    }

    public function show(Penggajian $penggajian)
    {
        $penggajian->load(['karyawan.jabatan', 'detailGaji']);

        return Inertia::render('admin/penggajian/detail', [
            'penggajian' => [
                'id_penggajian'      => $penggajian->id_penggajian,
                'bulan'              => $penggajian->bulan,
                'tahun'              => $penggajian->tahun,
                'gaji_pokok'         => $penggajian->gaji_pokok,
                'potongan_cuti'      => $penggajian->potongan_cuti,
                'potongan_lainnya'   => $penggajian->potongan_lainnya,
                'total_gaji'         => $penggajian->total_gaji,
                'status_pembayaran'  => $penggajian->status_pembayaran,
                'tanggal_pembayaran' => $penggajian->tanggal_pembayaran,
                'karyawan' => [
                    'nama'              => $penggajian->karyawan->nama_lengkap,
                    'nik'               => $penggajian->karyawan->nik,
                    'jabatan'           => $penggajian->karyawan->jabatan->nama_jabatan ?? '-',
                    'foto'              => $penggajian->karyawan->foto,
                    'tanggal_bergabung' => $penggajian->karyawan->tanggal_bergabung,
                ],
                'detail' => $penggajian->detailGaji->map(fn($d) => [
                    'id_detail'  => $d->id_detail,
                    'komponen'   => $d->komponen,
                    'jumlah'     => $d->jumlah,
                    'keterangan' => $d->keterangan,
                ]),
            ],
        ]);
    }

    public function updateStatus(Request $request, Penggajian $penggajian)
    {
        $request->validate([
            'status_pembayaran'  => 'required|in:lunas,belum_lunas',
            'tanggal_pembayaran' => 'nullable|date',
        ]);

        $penggajian->update([
            'status_pembayaran'  => $request->status_pembayaran,
            'tanggal_pembayaran' => $request->status_pembayaran === 'lunas'
                ? ($request->tanggal_pembayaran ?? now()->toDateString())
                : null,
        ]);

        return back()->with('success', 'Status pembayaran berhasil diperbarui.');
    }

    public function destroy(Penggajian $penggajian)
    {
        if ($penggajian->status_pembayaran === 'lunas') {
            return back()->withErrors(['error' => 'Penggajian yang sudah lunas tidak dapat dihapus.']);
        }

        $penggajian->detailGaji()->delete();
        $penggajian->delete();

        return back()->with('success', 'Data penggajian berhasil dihapus.');
    }

    public function slipKaryawan(Request $request)
    {
        $karyawan = auth()->user()->karyawan;

        if (!$karyawan) {
            abort(403, 'Data karyawan tidak ditemukan.');
        }

        $tahun = $request->integer('tahun', now()->year);

        $slipList = Penggajian::where('id_karyawan', $karyawan->id_karyawan)
            ->where('tahun', $tahun)
            ->orderBy('bulan')
            ->get()
            ->map(fn($p) => [
                'id_penggajian'      => $p->id_penggajian,
                'bulan'              => $p->bulan,
                'tahun'              => $p->tahun,
                'gaji_pokok'         => $p->gaji_pokok,
                'potongan_cuti'      => $p->potongan_cuti,
                'potongan_lainnya'   => $p->potongan_lainnya,
                'total_gaji'         => $p->total_gaji,
                'status_pembayaran'  => $p->status_pembayaran,
                'tanggal_pembayaran' => $p->tanggal_pembayaran,
            ]);

        return Inertia::render('karyawan/slip-gaji', [
            'slipList' => $slipList,
            'karyawan' => [
                'nama'    => $karyawan->nama_lengkap,
                'nik'     => $karyawan->nik,
                'jabatan' => $karyawan->jabatan->nama_jabatan ?? '-',
            ],
            'filterTahun' => $tahun,
        ]);
    }

    private function hitungGaji(Karyawan $karyawan, int $bulan, int $tahun): array
    {
        $gajiPokok  = (float) ($karyawan->jabatan->gaji_pokok ?? 0);
        $gajiHarian = $gajiPokok / self::HARI_KERJA_SEBULAN;

        $absensi = Absensi::where('id_karyawan', $karyawan->id_karyawan)
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->get();

        $jumlahAlpha = $absensi->where('status', 'alpha')->count();
        $jumlahCuti  = $absensi->where('status', 'cuti')->count();

        $cutiMaksimal       = 4;
        $cutiDipotong       = max(0, $jumlahCuti - $cutiMaksimal);
        $potonganAlpha        = round($gajiHarian * $jumlahAlpha, 0);
        $potonganCutiBerlebih = round($gajiHarian * $cutiDipotong, 0);
        $totalPotongan        = $potonganAlpha + $potonganCutiBerlebih;

        $totalGaji = max(0, $gajiPokok - $totalPotongan);

        $detail = [];

        $detail[] = [
            'komponen'   => 'Gaji Pokok',
            'jumlah'     => $gajiPokok,
            'keterangan' => "Jabatan: {$karyawan->jabatan->nama_jabatan}",
        ];

        if ($jumlahAlpha > 0) {
            $detail[] = [
                'komponen'   => 'Potongan Alpha',
                'jumlah'     => -$potonganAlpha,
                'keterangan' => "{$jumlahAlpha} hari tidak hadir tanpa keterangan",
            ];
        }

        if ($cutiDipotong > 0) {
            $detail[] = [
                'komponen'   => 'Potongan Cuti Berlebih',
                'jumlah'     => -$potonganCutiBerlebih,
                'keterangan' => "{$jumlahCuti} hari cuti (jatah {$cutiMaksimal}, lebih {$cutiDipotong} hari)",
            ];
        }

        return [
            'id_karyawan'      => $karyawan->id_karyawan,
            'nama'             => $karyawan->nama_lengkap,
            'nik'              => $karyawan->nik,
            'jabatan'          => $karyawan->jabatan->nama_jabatan ?? '-',
            'gaji_pokok'       => $gajiPokok,
            'jumlah_alpha'     => $jumlahAlpha,
            'jumlah_cuti'      => $jumlahCuti,
            'cuti_dipotong'    => $cutiDipotong,
            'potongan_cuti'    => $potonganCutiBerlebih,
            'potongan_lainnya' => $potonganAlpha,
            'total_potongan'   => $totalPotongan,
            'total_gaji'       => $totalGaji,
            'detail'           => $detail,
        ];
    }
}