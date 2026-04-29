<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\JabatanRequest;
use App\Models\Jabatan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class JabatanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        $jabatan = Jabatan::when($search, fn($q) => $q->where('nama_jabatan', 'like', "%{$search}%"))
            ->withCount('karyawan')
            ->orderBy('nama_jabatan')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/jabatan/index', [
            'jabatan' => $jabatan,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/jabatan/create');
    }

    public function store(JabatanRequest $request): RedirectResponse
    {
        try {
            Jabatan::create($request->validated());

            return to_route('admin.jabatan.index')
                ->with('success', 'Jabatan berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Gagal membuat jabatan', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal menambahkan jabatan. Silakan coba lagi.');
        }
    }

    public function edit(Jabatan $jabatan): Response
    {
        return Inertia::render('admin/jabatan/edit', [
            'jabatan' => $jabatan,
        ]);
    }

    public function update(JabatanRequest $request, Jabatan $jabatan): RedirectResponse
    {
        try {
            $jabatan->update($request->validated());

            return to_route('admin.jabatan.index')
                ->with('success', 'Jabatan berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui jabatan', ['error' => $e->getMessage(), 'id' => $jabatan->id]);
            return back()->with('error', 'Gagal memperbarui jabatan. Silakan coba lagi.');
        }
    }

    public function destroy(Jabatan $jabatan): RedirectResponse
    {
        try {
            if ($jabatan->karyawan()->exists()) {
                return back()->with('error', 'Jabatan tidak dapat dihapus karena masih memiliki karyawan.');
            }

            $jabatan->delete();

            return to_route('admin.jabatan.index')
                ->with('success', 'Jabatan berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal menghapus jabatan', ['error' => $e->getMessage(), 'id' => $jabatan->id]);
            return back()->with('error', 'Gagal menghapus jabatan. Silakan coba lagi.');
        }
    }
}