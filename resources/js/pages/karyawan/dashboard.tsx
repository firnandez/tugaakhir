import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarCheck, Clock, CalendarX, UserX, LogIn, LogOut } from 'lucide-react';

interface ShiftMendatang {
    tanggal: string;
    nama_shift: string;
    jam_masuk: string;
    jam_pulang: string;
    status: string;
}

interface RiwayatItem {
    tanggal: string;
    jam_masuk: string | null;
    jam_pulang: string | null;
    status: string;
}

interface Props {
    ringkasan?: {
        total_kehadiran: number;
        terlambat: number;
        izin: number;
        absen: number;
    };
    shiftMendatang?: ShiftMendatang[];
    riwayat?: RiwayatItem[];
    [key: string]: any;
}

const DUMMY_RINGKASAN = {
    total_kehadiran: 18,
    terlambat: 3,
    izin: 1,
    absen: 0,
};

const DUMMY_SHIFT: ShiftMendatang[] = [
    { tanggal: '2026-03-07', nama_shift: 'Pagi', jam_masuk: '08:00:00', jam_pulang: '16:00:00', status: 'dijadwalkan' },
    { tanggal: '2026-03-08', nama_shift: 'Pagi', jam_masuk: '08:00:00', jam_pulang: '16:00:00', status: 'dijadwalkan' },
    { tanggal: '2026-03-09', nama_shift: 'Siang', jam_masuk: '13:00:00', jam_pulang: '21:00:00', status: 'dijadwalkan' },
];

const DUMMY_RIWAYAT: RiwayatItem[] = [
    { tanggal: '2026-03-06', jam_masuk: '08:05:00', jam_pulang: '16:02:00', status: 'hadir' },
    { tanggal: '2026-03-05', jam_masuk: '08:21:00', jam_pulang: '16:10:00', status: 'terlambat' },
    { tanggal: '2026-03-04', jam_masuk: '07:58:00', jam_pulang: '16:00:00', status: 'hadir' },
    { tanggal: '2026-03-03', jam_masuk: null, jam_pulang: null, status: 'izin' },
    { tanggal: '2026-03-02', jam_masuk: '08:00:00', jam_pulang: '16:00:00', status: 'hadir' },
];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Beranda', href: '/karyawan/dashboard' }];

const statusConfig: Record<string, { label: string; className: string }> = {
    hadir: { label: 'Hadir', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    terlambat: { label: 'Terlambat', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
    izin: { label: 'Izin', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
    alpha: { label: 'Absen', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
    dijadwalkan: { label: 'Dijadwalkan', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
    return <Badge className={cfg.className}>{cfg.label}</Badge>;
};

const formatTanggalPendek = (val: string) =>
    new Date(val).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

const formatTanggal = (val: string) =>
    new Date(val).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const formatJam = (val: string) => val.slice(0, 5);

export default function KaryawanDashboard() {
    const { ringkasan, shiftMendatang, riwayat } = usePage<Props>().props;

    const r = ringkasan ?? DUMMY_RINGKASAN;
    const shift = shiftMendatang ?? DUMMY_SHIFT;
    const hist = riwayat ?? DUMMY_RIWAYAT;

    const stats = [
        {
            label: 'Kehadiran',
            value: r.total_kehadiran,
            icon: CalendarCheck,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-950/30',
        },
        {
            label: 'Terlambat',
            value: r.terlambat,
            icon: Clock,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-950/30',
        },
        {
            label: 'Izin',
            value: r.izin,
            icon: CalendarX,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
        },
        {
            label: 'Absen',
            value: r.absen,
            icon: UserX,
            color: 'text-gray-600',
            bg: 'bg-gray-100 dark:bg-gray-800/40',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beranda" />

            <div className="space-y-5 p-4 pb-8 sm:space-y-6">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Beranda</h1>
                </div>

                {/* ── Aksi Cepat — di atas di mobile ── */}
                <div className="flex gap-3">
                    <Button
                        className="flex-1 sm:flex-none"
                        onClick={() => router.get('/karyawan/absensi')}
                    >
                        <LogIn className="mr-2 h-4 w-4" />
                        Check-in
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => router.get('/karyawan/absensi')}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Check-out
                    </Button>
                </div>

                {/* ── Ringkasan Kehadiran — 2 kolom di mobile, 4 di lg ── */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold sm:text-base">Ringkasan Kehadiran</h2>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {stats.map((s) => (
                            <Card key={s.label}>
                                <CardContent className="flex items-center gap-3 pt-4 pb-4 sm:gap-4 sm:pt-5 sm:pb-5">
                                    <div
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${s.bg}`}
                                    >
                                        <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
                                        <p className={`text-xl font-bold sm:text-2xl ${s.color}`}>{s.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* ── Jadwal Shift Mendatang ── */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold sm:text-base">Jadwal Shift Mendatang</h2>

                    {/* Mobile: card per baris */}
                    <div className="space-y-2 sm:hidden">
                        {shift.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                    Tidak ada jadwal shift mendatang.
                                </CardContent>
                            </Card>
                        ) : (
                            shift.map((s, i) => (
                                <Card key={i}>
                                    <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
                                        <div>
                                            <p className="text-sm font-semibold">{formatTanggalPendek(s.tanggal)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Shift {s.nama_shift} &middot;{' '}
                                                <span className="font-mono">{formatJam(s.jam_masuk)}–{formatJam(s.jam_pulang)}</span>
                                            </p>
                                        </div>
                                        <StatusBadge status={s.status} />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Desktop: tabel */}
                    <Card className="hidden sm:block">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="py-3">Tanggal</TableHead>
                                            <TableHead className="py-3">Shift</TableHead>
                                            <TableHead className="py-3">Jam Masuk</TableHead>
                                            <TableHead className="py-3">Jam Pulang</TableHead>
                                            <TableHead className="py-3">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shift.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                                                    Tidak ada jadwal shift mendatang.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            shift.map((s, i) => (
                                                <TableRow key={i} className="hover:bg-muted/30">
                                                    <TableCell className="py-3 text-sm">{formatTanggal(s.tanggal)}</TableCell>
                                                    <TableCell className="py-3 text-sm font-medium">{s.nama_shift}</TableCell>
                                                    <TableCell className="py-3 font-mono text-sm">{formatJam(s.jam_masuk)}</TableCell>
                                                    <TableCell className="py-3 font-mono text-sm">{formatJam(s.jam_pulang)}</TableCell>
                                                    <TableCell className="py-3"><StatusBadge status={s.status} /></TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Riwayat Kehadiran ── */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold sm:text-base">Riwayat Kehadiran</h2>

                    {/* Mobile: card per baris */}
                    <div className="space-y-2 sm:hidden">
                        {hist.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada riwayat kehadiran.
                                </CardContent>
                            </Card>
                        ) : (
                            hist.map((h, i) => (
                                <Card key={i}>
                                    <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
                                        <div>
                                            <p className="text-sm font-semibold">{formatTanggalPendek(h.tanggal)}</p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {h.jam_masuk ? formatJam(h.jam_masuk) : '—'}
                                                {' '}→{' '}
                                                {h.jam_pulang ? formatJam(h.jam_pulang) : '—'}
                                            </p>
                                        </div>
                                        <StatusBadge status={h.status} />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Desktop: tabel */}
                    <Card className="hidden sm:block">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="py-3">Tanggal</TableHead>
                                            <TableHead className="py-3">Check-in</TableHead>
                                            <TableHead className="py-3">Check-out</TableHead>
                                            <TableHead className="py-3">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {hist.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                                                    Belum ada riwayat kehadiran.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            hist.map((h, i) => (
                                                <TableRow key={i} className="hover:bg-muted/30">
                                                    <TableCell className="py-3 text-sm">{formatTanggal(h.tanggal)}</TableCell>
                                                    <TableCell className="py-3 font-mono text-sm">
                                                        {h.jam_masuk ? formatJam(h.jam_masuk) : <span className="text-muted-foreground">—</span>}
                                                    </TableCell>
                                                    <TableCell className="py-3 font-mono text-sm">
                                                        {h.jam_pulang ? formatJam(h.jam_pulang) : <span className="text-muted-foreground">—</span>}
                                                    </TableCell>
                                                    <TableCell className="py-3"><StatusBadge status={h.status} /></TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}