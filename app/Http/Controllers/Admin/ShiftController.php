<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ShiftRequest;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        $shift = Shift::when($search, fn($q) => $q->where('nama_shift', 'like', "%{$search}%"))
            ->withCount('karyawan')
            ->orderBy('jam_masuk')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/shift/index', [
            'shift' => $shift,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/shift/create');
    }

    public function store(ShiftRequest $request): RedirectResponse
    {
        try {
            Shift::create($request->validated());

            return to_route('admin.shift.index')
                ->with('success', 'Shift berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Gagal membuat shift', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal menambahkan shift. Silakan coba lagi.');
        }
    }

    public function edit(Shift $shift): Response
    {
        return Inertia::render('admin/shift/edit', [
            'shift' => $shift,
        ]);
    }

    public function update(ShiftRequest $request, Shift $shift): RedirectResponse
    {
        try {
            $shift->update($request->validated());

            return to_route('admin.shift.index')
                ->with('success', 'Shift berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui shift', ['error' => $e->getMessage(), 'id' => $shift->id]);
            return back()->with('error', 'Gagal memperbarui shift. Silakan coba lagi.');
        }
    }

    public function destroy(Shift $shift): RedirectResponse
    {
        try {
            if ($shift->karyawan()->exists()) {
                return back()->with('error', 'Shift tidak dapat dihapus karena masih memiliki karyawan.');
            }

            $shift->delete();

            return to_route('admin.shift.index')
                ->with('success', 'Shift berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal menghapus shift', ['error' => $e->getMessage(), 'id' => $shift->id]);
            return back()->with('error', 'Gagal menghapus shift. Silakan coba lagi.');
        }
    }
}