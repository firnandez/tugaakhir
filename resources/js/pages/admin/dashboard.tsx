import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import type { Stat, Activity, PresensiRow, DistribusiPresensi, TrenPenggajian } from '@/types/dashboard'
import StatCards from '@/components/StatCards'
import ActivityFeed from '@/components/ActivityFeed'
import PresensiTable from '@/components/PresensiTable'
import PresensiDonutChart from '@/components/PresensiDonutChart'
import TrenPenggajianChart from '@/components/TrenPenggajianChart'

type PageProps = {
    stats: Stat
    aktivitas: Activity[]
    presensiHariIni: PresensiRow[]
    distribusiPresensi: DistribusiPresensi
    trenPenggajian: TrenPenggajian[]
    [key: string]: unknown
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
]

export default function Dashboard() {
    const props = usePage<PageProps>().props

    const stats            = props.stats
    const aktivitas        = props.aktivitas ?? []
    const presensiHariIni  = props.presensiHariIni ?? []
    const distribusi       = props.distribusiPresensi
    const trenPenggajian   = props.trenPenggajian ?? []

    if (!stats) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-6 text-sm text-gray-500">Memuat data dashboard...</div>
            </AppLayout>
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

                <StatCards stats={stats} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PresensiDonutChart {...distribusi} />
                    <TrenPenggajianChart data={trenPenggajian} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PresensiTable rows={presensiHariIni} />
                    <ActivityFeed aktivitas={aktivitas} />
                </div>
            </div>
        </AppLayout>
    )
}