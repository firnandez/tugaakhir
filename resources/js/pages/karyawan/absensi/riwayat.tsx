import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { CheckCircle, AlertTriangle, Umbrella, Calendar, TrendingDown, ChevronLeft } from 'lucide-react';

interface AbsensiItem {
    id: number;
    tanggal: string;
    jam_masuk: string | null;
    jam_pulang: string | null;
    status: string;
    keterlambatan: number;
    keterangan: string | null;
}

interface Props {
    absensi: AbsensiItem[];
    rekap: {
        hadir: number;
        izin: number;
        sakit: number;
        alpha: number;
        cuti: number;
        total_terlambat: number;
    };
    filters: { bulan: number; tahun: number };
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/karyawan/dashboard' },
    { title: 'Absensi', href: '/karyawan/absensi' },
    { title: 'Riwayat', href: '/karyawan/absensi/riwayat' },
];

const bulanList = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    hadir: { label: 'Hadir', variant: 'default' },
    izin: { label: 'Izin', variant: 'secondary' },
    sakit: { label: 'Sakit', variant: 'secondary' },
    alpha: { label: 'Alpha', variant: 'destructive' },
    cuti: { label: 'Cuti', variant: 'outline' },
};

export default function KaryawanRiwayatAbsensi() {
    const { absensi, rekap, filters } = usePage<Props>().props;
    const currentYear = new Date().getFullYear();

    const [bulan, setBulan] = useState(filters?.bulan?.toString() ?? (new Date().getMonth() + 1).toString());
    const [tahun, setTahun] = useState(filters?.tahun?.toString() ?? currentYear.toString());

    const handleFilter = () => {
        router.get(
            '/karyawan/absensi/riwayat',
            { bulan, tahun },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const rekapItems = [
        {
            label: 'Hadir',
            value: rekap.hadir,
            icon: CheckCircle,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            label: 'Izin',
            value: rekap.izin,
            icon: Calendar,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            label: 'Sakit',
            value: rekap.sakit,
            icon: AlertTriangle,
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
        },
        {
            label: 'Alpha',
            value: rekap.alpha,
            icon: AlertTriangle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
        },
        {
            label: 'Cuti',
            value: rekap.cuti,
            icon: Umbrella,
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            label: 'Terlambat',
            value: `${rekap.total_terlambat} mnt`,
            icon: TrendingDown,
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Absensi" />

            <div className="space-y-6">
                {/* ── Header ── */}
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">Riwayat Absensi</h1>
                    <p className="text-muted-foreground">Rekap kehadiran bulanan Anda</p>
                </div>

                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-2 gap-4 px-4 md:grid-cols-3 lg:grid-cols-6">
                    {rekapItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.label}>
                                <CardHeader className="pb-2">
                                    <div
                                        className={`mb-1 flex h-8 w-8 items-center justify-center rounded-lg ${item.bgColor}`}
                                    >
                                        <Icon className={`h-4 w-4 ${item.iconColor}`} />
                                    </div>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {item.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={`font-mono text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* ── Filter Bulan & Tahun ── */}
                <div className="px-4">
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={bulan} onValueChange={setBulan}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bulanList.map((b, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                {b}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={tahun} onValueChange={setTahun}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button onClick={handleFilter} variant="secondary">
                                    Tampilkan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Tabel Absensi ── */}
                <div className="px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Absensi</CardTitle>
                            <CardDescription>
                                {bulanList[parseInt(bulan) - 1]} {tahun} · {absensi.length} catatan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="py-4">Tanggal</TableHead>
                                            <TableHead className="py-4">Jam Masuk</TableHead>
                                            <TableHead className="py-4">Jam Pulang</TableHead>
                                            <TableHead className="py-4">Status</TableHead>
                                            <TableHead className="py-4">Terlambat</TableHead>
                                            <TableHead className="py-4">Keterangan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {absensi.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    Tidak ada data absensi untuk periode ini.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            absensi.map((item) => {
                                                const tgl = new Date(item.tanggal);
                                                const sc = statusConfig[item.status] ?? {
                                                    label: item.status,
                                                    variant: 'outline' as const,
                                                };
                                                return (
                                                    <TableRow key={item.id} className="hover:bg-muted/30">
                                                        <TableCell className="py-4">
                                                            <p className="font-medium">
                                                                {tgl.toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                })}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {tgl.toLocaleDateString('id-ID', { weekday: 'short' })}
                                                            </p>
                                                        </TableCell>

                                                        <TableCell className="py-4 font-mono text-sm">
                                                            {item.jam_masuk ?? (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="py-4 font-mono text-sm">
                                                            {item.jam_pulang ?? (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <Badge variant={sc.variant}>{sc.label}</Badge>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            {item.keterlambatan > 0 ? (
                                                                <span className="font-mono text-sm font-medium text-red-600">
                                                                    +{item.keterlambatan} mnt
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-green-600">—</span>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="py-4 text-sm text-muted-foreground">
                                                            {item.keterangan ?? '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Kembali ── */}
                <div className="px-4 pb-4">
                    <Button variant="outline" onClick={() => router.get('/karyawan/absensi')}>
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Kembali ke Absensi
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
