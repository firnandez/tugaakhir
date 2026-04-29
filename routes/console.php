<?php

use App\Jobs\GenerateQrAbsensiJob;
use Illuminate\Support\Facades\Schedule;

// Generate QR Masuk setiap hari jam 06:00
Schedule::job(new GenerateQrAbsensiJob('masuk'))->dailyAt('06:00');

// Generate QR Pulang setiap hari jam 15:00
Schedule::job(new GenerateQrAbsensiJob('pulang'))->dailyAt('15:00');