import type { Stat } from '@/types/dashboard'

export default function StatCards({ stats }: { stats: Stat }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-2 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {stats.tambahKaryawan > 0 ? `+${stats.tambahKaryawan}` : stats.tambahKaryawan} bulan ini
                    </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalKaryawan}</div>
                <div className="mt-0.5 text-sm text-gray-500">Total karyawan</div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-2 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                            <path d="M9 16l2 2 4-4" />
                        </svg>
                    </div>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {stats.persenHadir}% hadir
                    </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalPresensi}</div>
                <div className="mt-0.5 text-sm text-gray-500">Total presensi bulan ini</div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-2 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                            <path d="M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01" />
                        </svg>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stats.izinNaik ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {stats.izinNaik ? 'naik dari bulan lalu' : 'turun dari bulan lalu'}
                    </span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalIzin}</div>
                <div className="mt-0.5 text-sm text-gray-500">Total izin bulan ini</div>
            </div>
        </div>
    )
}