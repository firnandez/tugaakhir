<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Karyawan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AbsensiController extends Controller
{
    public function index(Request $request): Response
    {
        $search      = $request->input('search', '');
        $status      = $request->input('status', '');
        $tanggal     = $request->input('tanggal', Carbon::today()->toDateString());
        $karyawan_id = $request->input('karyawan_id', '');

        $absensi = Absensi::with(['karyawan.jabatan', 'karyawan.shift'])
            ->when($search, fn($q) => $q->whereHas('karyawan', fn($k) =>
                $k->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
            ))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($tanggal, fn($q) => $q->where('tanggal', $tanggal))
            ->when($karyawan_id, fn($q) => $q->where('karyawan_id', $karyawan_id))
            ->orderBy('tanggal', 'desc')
            ->orderBy('jam_masuk', 'asc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/absensi/index', [
            'absensi'      => $absensi,
            'karyawanList' => Karyawan::orderBy('nama_lengkap')->get(['id_karyawan', 'nama_lengkap', 'nik']),
            'filters'      => compact('search', 'status', 'tanggal', 'karyawan_id'),
            'summary'      => [
                'hadir' => Absensi::where('tanggal', $tanggal)->where('status', 'hadir')->count(),
                'izin'  => Absensi::where('tanggal', $tanggal)->where('status', 'izin')->count(),
                'sakit' => Absensi::where('tanggal', $tanggal)->where('status', 'sakit')->count(),
                'alpha' => Absensi::where('tanggal', $tanggal)->where('status', 'alpha')->count(),
                'cuti'  => Absensi::where('tanggal', $tanggal)->where('status', 'cuti')->count(),
            ],
        ]);
    }

    public function show(Absensi $absensi): Response
    {
        $absensi->load(['karyawan.jabatan', 'karyawan.shift']);

        return Inertia::render('admin/absensi/show', [
            'absensi' => $absensi,
        ]);
    }

    public function update(Request $request, Absensi $absensi)
    {
        $request->validate([
            'status'     => ['required', 'in:hadir,izin,sakit,alpha,cuti'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $absensi->update($request->only('status', 'keterangan'));

        return back()->with('success', 'Data absensi berhasil diperbarui.');
    }

 public function indexIzin(Request $request): Response
{
    $filter = $request->input('status', 'pending');

    $query = Absensi::with(['karyawan.jabatan'])
        ->whereIn('status', ['izin', 'sakit', 'cuti'])
        ->orderBy('tanggal', 'desc');

    if ($filter === 'pending') {
        $query->whereNull('jam_masuk');
    }

    $izinList = $query->paginate(15)->withQueryString();

    return Inertia::render('admin/absensi/izin', [
        'izinList'     => $izinList,
        'filterStatus' => $filter,
    ]);
}
public function updateStatusIzin(Request $request, Absensi $absensi)
{
    $request->validate([
        'aksi' => 'required|in:setuju,tolak',
    ]);

    if ($request->aksi === 'tolak') {
        $absensi->delete();
        return back()->with('success', 'Pengajuan izin ditolak dan dihapus.');
    }

    $absensi->update([
        'jam_masuk' => '00:00:00',
    ]);

    return back()->with('success', 'Pengajuan izin disetujui.');
}
    }
