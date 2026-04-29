<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KaryawanRequest;
use App\Models\Jabatan;
use App\Models\Karyawan;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class KaryawanController extends Controller
{
    public function index(Request $request): Response
    {
        $search     = $request->input('search', '');
        $status     = $request->input('status', '');
        $jabatan_id = $request->input('jabatan_id', '');

        $karyawan = Karyawan::with(['jabatan', 'shift', 'user'])
            ->when($search, fn($q) => $q->where('nama_lengkap', 'like', "%{$search}%")
                ->orWhere('nik', 'like', "%{$search}%"))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($jabatan_id, fn($q) => $q->where('jabatan_id', $jabatan_id))
            ->orderBy('nama_lengkap')
            ->paginate(10)
            ->withQueryString();

        $karyawan->through(function ($item) {
            $item->foto_url      = $item->foto      ? asset('storage/' . $item->foto)      : null;
            $item->qr_code_url   = $item->qr_code   ? asset('storage/' . $item->qr_code)   : null;
            return $item;
        });

        return Inertia::render('admin/karyawan/index', [
            'karyawan'    => $karyawan,
            'jabatanList' => Jabatan::orderBy('nama_jabatan')->get(['id', 'nama_jabatan']),
            'filters'     => [
                'search'     => $search,
                'status'     => $status,
                'jabatan_id' => $jabatan_id,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/karyawan/create', [
            'jabatanList' => Jabatan::orderBy('nama_jabatan')->get(['id', 'nama_jabatan']),
            'shiftList'   => Shift::orderBy('jam_masuk')->get(['id', 'nama_shift', 'jam_masuk', 'jam_pulang']),
        ]);
    }

    public function store(KaryawanRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name'     => $request->nama_lengkap,
                    'email'    => $request->email_user,
                    'password' => Hash::make($request->password),
                    'role'     => 'karyawan',
                ]);

                $fotoPath = null;
                if ($request->hasFile('foto')) {
                    $fotoPath = $request->file('foto')->store('karyawan/foto', 'public');
                }

                $karyawan = Karyawan::create([
                    'user_id'           => $user->id,
                    'jabatan_id'        => $request->jabatan_id,
                    'shift_id'          => $request->shift_id,
                    'nik'               => $request->nik,
                    'nama_lengkap'      => $request->nama_lengkap,
                    'alamat'            => $request->alamat,
                    'no_telepon'        => $request->no_telepon,
                    'email'             => $request->email,
                    'foto'              => $fotoPath,
                    'status'            => $request->status ?? 'aktif',
                    'tanggal_bergabung' => $request->tanggal_bergabung,
                ]);

                $qrDir  = 'karyawan/qrcode';
                Storage::disk('public')->makeDirectory($qrDir);
                $qrPath = "{$qrDir}/{$karyawan->nik}.svg";

                $renderer = new ImageRenderer(
                    new RendererStyle(300),
                    new SvgImageBackEnd()
                );
                $writer = new Writer($renderer);
                $writer->writeFile(
                    $karyawan->nik,
                    Storage::disk('public')->path($qrPath)
                );

                $karyawan->update(['qr_code' => $qrPath]);
            });

            return to_route('admin.karyawan.index')
                ->with('success', 'Karyawan berhasil ditambahkan.');

        } catch (\Exception $e) {
            Log::error('Gagal membuat karyawan', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal menambahkan karyawan: ' . $e->getMessage());
        }
    }

    public function show(Karyawan $karyawan): Response
    {
        $karyawan->load(['jabatan', 'shift', 'user']);
        $karyawan->foto_url    = $karyawan->foto     ? asset('storage/' . $karyawan->foto)     : null;
        $karyawan->qr_code_url = $karyawan->qr_code  ? asset('storage/' . $karyawan->qr_code)  : null;

        return Inertia::render('admin/karyawan/show', [
            'karyawan' => $karyawan,
        ]);
    }

    public function edit(Karyawan $karyawan): Response
    {
        $karyawan->load(['jabatan', 'shift', 'user']);
        $karyawan->foto_url    = $karyawan->foto    ? asset('storage/' . $karyawan->foto)    : null;
        $karyawan->qr_code_url = $karyawan->qr_code ? asset('storage/' . $karyawan->qr_code) : null;

        return Inertia::render('admin/karyawan/edit', [
            'karyawan'    => $karyawan,
            'jabatanList' => Jabatan::orderBy('nama_jabatan')->get(['id', 'nama_jabatan']),
            'shiftList'   => Shift::orderBy('jam_masuk')->get(['id', 'nama_shift', 'jam_masuk', 'jam_pulang']),
        ]);
    }

    public function update(KaryawanRequest $request, Karyawan $karyawan): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $karyawan) {
                $karyawan->user->update([
                    'name'  => $request->nama_lengkap,
                    'email' => $request->email_user,
                    ...(filled($request->password)
                        ? ['password' => Hash::make($request->password)]
                        : []),
                ]);

                $fotoPath = $karyawan->foto;
                if ($request->hasFile('foto')) {
                    if ($karyawan->foto) {
                        Storage::disk('public')->delete($karyawan->foto);
                    }
                    $fotoPath = $request->file('foto')->store('karyawan/foto', 'public');
                }

                $tanggal = substr($request->tanggal_bergabung, 0, 10);

                $karyawan->update([
                    'jabatan_id'        => $request->jabatan_id,
                    'shift_id'          => $request->shift_id,
                    'nik'               => $request->nik,
                    'nama_lengkap'      => $request->nama_lengkap,
                    'alamat'            => $request->alamat,
                    'no_telepon'        => $request->no_telepon,
                    'email'             => $request->email,
                    'foto'              => $fotoPath,
                    'status'            => $request->status,
                    'tanggal_bergabung' => $tanggal,
                ]);
            });

            return to_route('admin.karyawan.index')
                ->with('success', 'Data karyawan berhasil diperbarui.');

        } catch (\Exception $e) {
            dd($e->getMessage());
            Log::error('Gagal memperbarui karyawan', [
                'error' => $e->getMessage(),
                'id'    => $karyawan->id_karyawan,
            ]);
            return back()->with('error', 'Gagal memperbarui data karyawan: ' . $e->getMessage());
        }
    }

    public function destroy(Karyawan $karyawan): RedirectResponse
    {
        try {
            DB::transaction(function () use ($karyawan) {
                if ($karyawan->foto)     Storage::disk('public')->delete($karyawan->foto);
                if ($karyawan->qr_code)  Storage::disk('public')->delete($karyawan->qr_code);

                $userId = $karyawan->user_id;
                $karyawan->delete();

                User::find($userId)?->delete();
            });

            return to_route('admin.karyawan.index')
                ->with('success', 'Karyawan berhasil dihapus.');

        } catch (\Exception $e) {
            Log::error('Gagal menghapus karyawan', [
                'error' => $e->getMessage(),
                'id'    => $karyawan->id_karyawan,
            ]);
            return back()->with('error', 'Gagal menghapus karyawan: ' . $e->getMessage());
        }
    }

    public function downloadQr(Karyawan $karyawan): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_unless(
            $karyawan->qr_code && Storage::disk('public')->exists($karyawan->qr_code),
            404
        );

        return Storage::disk('public')->download(
            $karyawan->qr_code,
            "QR-{$karyawan->nik}-{$karyawan->nama_lengkap}.svg"
        );
    }

    public function ajukanIzin(Request $request): \Illuminate\Http\RedirectResponse
{
    $request->validate([
        'tanggal'    => 'required|date|after_or_equal:today',
        'status'     => 'required|in:izin,sakit',
        'keterangan' => 'required|string|max:500',
    ]);

    $karyawan = Auth::user()->karyawan;

    if (!$karyawan) {
        abort(403);
    }

    // Cek apakah sudah ada absensi di tanggal tersebut
    $sudahAda = Absensi::where('id_karyawan', $karyawan->id_karyawan)
        ->where('tanggal', $request->tanggal)
        ->exists();

    if ($sudahAda) {
        return back()->withErrors(['tanggal' => 'Sudah ada data absensi pada tanggal tersebut.']);
    }

    Absensi::create([
        'id_karyawan' => $karyawan->id_karyawan,
        'tanggal'     => $request->tanggal,
        'status'      => $request->status,   // 'izin' atau 'sakit'
        'keterangan'  => $request->keterangan,
    ]);

    return back()->with('success', 'Pengajuan izin berhasil dikirim.');
}
}