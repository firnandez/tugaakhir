<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\JabatanController;
use App\Http\Controllers\Admin\KaryawanController;
use App\Http\Controllers\Admin\ShiftController;
use App\Http\Controllers\Admin\AbsensiController as AdminAbsensiController;
use App\Http\Controllers\Admin\QrAbsensiController;
use App\Http\Controllers\Admin\LokasiAbsensiController;
use App\Http\Controllers\Admin\PenggajianController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Karyawan\AbsensiController as KaryawanAbsensiController;

// Redirect root ke login
Route::get('/', function () {
    return redirect()->route('login');
});

// ── Dashboard Karyawan 
Route::get('dashboard', [\App\Http\Controllers\Karyawan\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:karyawan'])
    ->name('dashboard');

// ── Routes Karyawan
Route::prefix('karyawan')
    ->name('karyawan.')
    ->middleware(['auth', 'verified', 'role:karyawan'])
    ->group(function () {

        // Absensi
        Route::get('absensi',[KaryawanAbsensiController::class, 'index'])      ->name('absensi.index');
        Route::post('absensi/scan',[KaryawanAbsensiController::class, 'scan'])       ->name('absensi.scan');
        Route::get('absensi/riwayat',[KaryawanAbsensiController::class, 'riwayat'])    ->name('absensi.riwayat');
        Route::get('absensi/qr/{tipe}/download',[KaryawanAbsensiController::class, 'downloadQr'])->name('absensi.qr.download');
        Route::post('absensi/izin',[KaryawanAbsensiController::class, 'ajukanIzin'])->name('absensi.izin');

        // Slip Gaji
        Route::get('slip-gaji', [PenggajianController::class, 'slipKaryawan'])->name('slip-gaji.index');
    });

// ── Routes Admin ─────────────────────────────────────────────────────────────
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'role:admin'])
    ->group(function () {

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Users
        Route::resource('users', UserController::class)->names([
            'index'   => 'users.index',
            'create'  => 'users.create',
            'store'   => 'users.store',
            'edit'    => 'users.edit',
            'update'  => 'users.update',
            'destroy' => 'users.destroy',
        ]);

        // Jabatan
        Route::resource('jabatan', JabatanController::class)
            ->except(['show'])
            ->names([
                'index'   => 'jabatan.index',
                'create'  => 'jabatan.create',
                'store'   => 'jabatan.store',
                'edit'    => 'jabatan.edit',
                'update'  => 'jabatan.update',
                'destroy' => 'jabatan.destroy',
            ]);

        // Shift
        Route::resource('shift', ShiftController::class)
            ->except(['show'])
            ->names([
                'index'=> 'shift.index',
                'create'  => 'shift.create',
                'store'   => 'shift.store',
                'edit'    => 'shift.edit',
                'update'  => 'shift.update',
                'destroy' => 'shift.destroy',
            ]);

        // Karyawan
        Route::resource('karyawan', KaryawanController::class)
            ->names([
                'index'   => 'karyawan.index',
                'create'  => 'karyawan.create',
                'store'   => 'karyawan.store',
                'show'    => 'karyawan.show',
                'edit'    => 'karyawan.edit',
                'update'  => 'karyawan.update',
                'destroy' => 'karyawan.destroy',
            ]);
        Route::get('karyawan/{karyawan}/qr', [KaryawanController::class, 'downloadQr'])->name('karyawan.qr');

        // Absensi
        Route::get('absensi',[AdminAbsensiController::class, 'index'])           ->name('absensi.index');
        Route::get('absensi/izin',                     [AdminAbsensiController::class, 'indexIzin'])       ->name('absensi.izin.index');
        Route::get('absensi/{absensi}',                [AdminAbsensiController::class, 'show'])            ->name('absensi.show');
        Route::patch('absensi/{absensi}',              [AdminAbsensiController::class, 'update'])          ->name('absensi.update');
        Route::patch('absensi/{absensi}/izin',         [AdminAbsensiController::class, 'updateStatusIzin'])->name('absensi.izin.update');

        // QR Absensi
        Route::get('qr-absensi',                       [QrAbsensiController::class, 'index'])   ->name('qr-absensi.index');
        Route::post('qr-absensi/generate',             [QrAbsensiController::class, 'generate'])->name('qr-absensi.generate');
        Route::get('qr-absensi/{qrAbsensi}/download',  [QrAbsensiController::class, 'download'])->name('qr-absensi.download');

        // Lokasi Absensi
        Route::get('lokasi-absensi',                   [LokasiAbsensiController::class, 'index'])  ->name('lokasi-absensi.index');
        Route::post('lokasi-absensi',                  [LokasiAbsensiController::class, 'store'])  ->name('lokasi-absensi.store');
        Route::put('lokasi-absensi/{lokasiAbsensi}',   [LokasiAbsensiController::class, 'update']) ->name('lokasi-absensi.update');
        Route::delete('lokasi-absensi/{lokasiAbsensi}',[LokasiAbsensiController::class, 'destroy'])->name('lokasi-absensi.destroy');

        // Penggajian
        Route::get('penggajian',                       [PenggajianController::class, 'index'])        ->name('penggajian.index');
        Route::post('penggajian/preview',              [PenggajianController::class, 'preview'])      ->name('penggajian.preview');
        Route::post('penggajian',                      [PenggajianController::class, 'store'])        ->name('penggajian.store');
        Route::get('penggajian/{penggajian}',          [PenggajianController::class, 'show'])         ->name('penggajian.show');
        Route::patch('penggajian/{penggajian}/status', [PenggajianController::class, 'updateStatus']) ->name('penggajian.status');
        Route::delete('penggajian/{penggajian}',       [PenggajianController::class, 'destroy'])      ->name('penggajian.destroy');
    });

require __DIR__.'/settings.php';