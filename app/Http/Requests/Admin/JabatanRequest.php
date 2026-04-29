<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class JabatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_jabatan' => ['required', 'string', 'max:100'],
            'gaji_pokok' => ['required', 'numeric', 'min:0'],
            'deskripsi' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nama_jabatan' => 'nama jabatan',
            'gaji_pokok' => 'gaji pokok',
            'deskripsi' => 'deskripsi',
        ];
    }
}