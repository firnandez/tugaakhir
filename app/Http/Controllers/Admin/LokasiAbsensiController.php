<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LokasiAbsensi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LokasiAbsensiController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/lokasi-absensi/index', [
            'lokasiList' => LokasiAbsensi::orderBy('nama_lokasi')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nama_lokasi' => ['required', 'string', 'max:100'],
            'latitude'    => ['required', 'numeric', 'between:-90,90'],
            'longitude'   => ['required', 'numeric', 'between:-180,180'],
            'radius'      => ['required', 'integer', 'min:10', 'max:5000'],
        ]);

        LokasiAbsensi::create($request->only('nama_lokasi', 'latitude', 'longitude', 'radius'));

        return back()->with('success', 'Lokasi absensi berhasil ditambahkan.');
    }

    public function update(Request $request, LokasiAbsensi $lokasiAbsensi): RedirectResponse
    {
        $request->validate([
            'nama_lokasi' => ['required', 'string', 'max:100'],
            'latitude'    => ['required', 'numeric', 'between:-90,90'],
            'longitude'   => ['required', 'numeric', 'between:-180,180'],
            'radius'      => ['required', 'integer', 'min:10', 'max:5000'],
            'is_aktif'    => ['boolean'],
        ]);

        $lokasiAbsensi->update($request->only('nama_lokasi', 'latitude', 'longitude', 'radius', 'is_aktif'));

        return back()->with('success', 'Lokasi absensi berhasil diperbarui.');
    }

    public function destroy(LokasiAbsensi $lokasiAbsensi): RedirectResponse
    {
        $lokasiAbsensi->delete();

        return back()->with('success', 'Lokasi absensi berhasil dihapus.');
    }
}