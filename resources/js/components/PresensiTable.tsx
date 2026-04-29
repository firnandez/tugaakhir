import type { PresensiRow } from '@/types/dashboard'

const badgeMap: Record<string, string> = {
    Hadir:         'bg-green-100 text-green-800',
    Terlambat:     'bg-red-100 text-red-800',
    Izin:          'bg-amber-100 text-amber-800',
    Sakit:         'bg-amber-100 text-amber-800',
    Cuti:          'bg-blue-100 text-blue-800',
    Alpha:         'bg-red-100 text-red-800',
    'Belum absen': 'bg-gray-100 text-gray-600',
}

export default function PresensiTable({ rows }: { rows: PresensiRow[] }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Presensi hari ini</h3>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-2 text-left text-xs font-medium text-gray-500">Karyawan</th>
                            <th className="pb-2 text-left text-xs font-medium text-gray-500">Jabatan</th>
                            <th className="pb-2 text-left text-xs font-medium text-gray-500">Masuk</th>
                            <th className="pb-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td className="py-2.5 text-gray-900">{row.nama}</td>
                                <td className="py-2.5 text-gray-500">{row.jabatan}</td>
                                <td className="py-2.5 text-gray-500">{row.masuk ?? '—'}</td>
                                <td className="py-2.5">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeMap[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}