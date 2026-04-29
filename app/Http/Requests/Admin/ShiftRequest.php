<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_shift' => ['required', 'string', 'max:100'],
            'jam_masuk' => ['required', 'date_format:H:i'],
            'jam_pulang' => ['required', 'date_format:H:i'],
            'toleransi_menit' => ['required', 'integer', 'min:0', 'max:120'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nama_shift' => 'nama shift',
            'jam_masuk' => 'jam masuk',
            'jam_pulang' => 'jam pulang',
            'toleransi_menit' => 'toleransi keterlambatan',
        ];
    }
}