<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KaryawanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $karyawan = $this->route('karyawan');
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'nik' => [
                'required',
                'string',
                'max:20',
                Rule::unique('karyawan', 'nik')->ignore($karyawan?->id_karyawan, 'id_karyawan'),
            ],
            'nama_lengkap' => ['required', 'string', 'max:150'],
            'jabatan_id' => ['required', 'exists:jabatan,id'],
            'shift_id' => ['required', 'exists:shift,id'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'no_telepon' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'foto' => ['nullable', 'image', 'max:2048'], 
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
            'tanggal_bergabung' => ['required', 'date'],

            'email_user' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($karyawan?->user_id, 'id'),
            ],
            'password' => $isUpdate
                ? ['nullable', 'string', 'min:8', 'confirmed']
                : ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nik' => 'NIK',
            'nama_lengkap' => 'nama lengkap',
            'jabatan_id' => 'jabatan',
            'shift_id' => 'shift',
            'alamat' => 'alamat',
            'no_telepon' => 'nomor telepon',
            'email' => 'email karyawan',
            'foto' => 'foto',
            'status' => 'status',
            'tanggal_bergabung' => 'tanggal bergabung',
            'email_user' => 'email akun',
            'password' => 'password',
        ];
    }
}