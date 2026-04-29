<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create Karyawan User
        User::create([
            'name' => 'Karyawan',
            'email' => 'karyawan@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'karyawan',
            'email_verified_at' => now(),
        ]);
    }
}