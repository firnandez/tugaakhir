<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AbsensiSeeder extends Seeder
{
    public function run(): void
    {
        // Konfigurasi — sesuaikan bulan/tahun yang ingin disimulasi
        $bulan = 4;   // April
        $tahun = 2026;

        $karyawanList = [
            ['id' => 1, 'nama' => 'Firnanda Tri Buana'],
            ['id' => 5, 'nama' => 'sulis'],
        ];

        // Distribusi status per karyawan (total harus = jumlah hari kerja)
        // Hari kerja April 2026 = 26 hari (Senin-Sabtu, skip Minggu)
        $distribusiStatus = [
            1 => [
                'hadir' => 20,
                'alpha' => 3,
                'cuti'  => 2,
                'izin'  => 1,
                'sakit' => 0,
            ],
            5 => [
                'hadir' => 22,
                'alpha' => 2,
                'cuti'  => 1,
                'izin'  => 0,
                'sakit' => 1,
            ],
        ];

        DB::table('absensi')->whereMonth('tanggal', $bulan)->whereYear('tanggal', $tahun)->delete();

        foreach ($karyawanList as $karyawan) {
            $statusPool = [];

            foreach ($distribusiStatus[$karyawan['id']] as $status => $jumlah) {
                for ($i = 0; $i < $jumlah; $i++) {
                    $statusPool[] = $status;
                }
            }

            shuffle($statusPool);

            $startDate = Carbon::create($tahun, $bulan, 1);
            $endDate   = Carbon::create($tahun, $bulan, 1)->endOfMonth();

            $statusIndex = 0;

            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                // Skip hari Minggu
                if ($date->dayOfWeek === Carbon::SUNDAY) {
                    continue;
                }

                $status = $statusPool[$statusIndex] ?? 'hadir';
                $statusIndex++;

                $jamMasuk   = null;
                $jamPulang  = null;
                $terlambat  = 0;
                $keterangan = null;

                if ($status === 'hadir') {
                    // Acak jam masuk antara 07:00 - 08:30
                    $menitOffset = rand(0, 90);
                    $masuk = Carbon::create($tahun, $bulan, $date->day, 7, 0, 0)->addMinutes($menitOffset);
                    $jamMasuk  = $masuk->format('H:i:s');
                    $jamPulang = Carbon::create($tahun, $bulan, $date->day, 16, rand(0, 30), 0)->format('H:i:s');

                    // Toleransi 15 menit, jam shift 07:00
                    if ($menitOffset > 15) {
                        $terlambat = $menitOffset - 15;
                    }
                } elseif ($status === 'izin') {
                    $keterangan = 'Izin keperluan pribadi';
                } elseif ($status === 'sakit') {
                    $keterangan = 'Sakit (dengan surat dokter)';
                } elseif ($status === 'cuti') {
                    $keterangan = 'Cuti tahunan';
                } elseif ($status === 'alpha') {
                    $keterangan = null;
                }

                DB::table('absensi')->insert([
                    'id_karyawan'      => $karyawan['id'],
                    'tanggal'          => $date->toDateString(),
                    'jam_masuk'        => $jamMasuk,
                    'jam_pulang'       => $jamPulang,
                    'status'           => $status,
                    'keterlambatan'    => $terlambat,
                    'keterangan'       => $keterangan,
                    'latitude_masuk'   => $jamMasuk ? -7.4478 : null,
                    'longitude_masuk'  => $jamMasuk ? 112.7183 : null,
                    'latitude_pulang'  => $jamPulang ? -7.4478 : null,
                    'longitude_pulang' => $jamPulang ? 112.7183 : null,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }

            $this->command->info("✓ Absensi {$karyawan['nama']} berhasil di-seed.");
        }

        $this->command->info('✓ AbsensiSeeder selesai!');
    }
}