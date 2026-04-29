import type { Activity } from '@/types/dashboard'

const badgeMap: Record<string, string> = {
    hadir: 'bg-green-100 text-green-800',
    izin:  'bg-amber-100 text-amber-800',
    sakit: 'bg-amber-100 text-amber-800',
    alpha: 'bg-red-100 text-red-800',
    cuti:  'bg-blue-100 text-blue-800',
}

const avatarMap: Record<string, string> = {
    hadir: 'bg-teal-50 text-teal-800',
    izin:  'bg-amber-50 text-amber-800',
    sakit: 'bg-amber-50 text-amber-800',
    alpha: 'bg-red-50 text-red-800',
    cuti:  'bg-blue-50 text-blue-800',
}

export default function ActivityFeed({ aktivitas }: { aktivitas: Activity[] }) {
    if (aktivitas.length === 0) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-5">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Aktivitas hari ini</h3>
                <p className="text-sm text-gray-400">Belum ada aktivitas hari ini.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Aktivitas hari ini</h3>
            <div className="divide-y divide-gray-50">
                {aktivitas.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarMap[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {item.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-gray-900">
                                {item.nama}{' '}
                                <span className="text-gray-500">{item.action}</span>
                            </p>
                            <p className="text-xs text-gray-400">{item.time}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeMap[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {item.badge}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}