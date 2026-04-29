import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChevronLeft,
    User,
    Briefcase,
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Timer,
    LogIn,
    LogOut,
    Activity,
} from 'lucide-react';

interface AbsensiDetail {
    id_absensi: number;
    tanggal: string;
    jam_masuk: string | null;
    jam_pulang: string | null;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'cuti';
    keterlambatan: number;
    keterangan: string | null;
    latitude_masuk: number | null;
    longitude_masuk: number | null;
    latitude_pulang: number | null;
    longitude_pulang: number | null;
    karyawan: {
        id_karyawan: number;
        nama_lengkap: string;
        nik: string;
        jabatan: {
            nama_jabatan: string;
        } | null;
        shift: {
            nama_shift: string;
            jam_masuk: string;
            jam_pulang: string;
            toleransi_menit: number;
        } | null;
    };
}

interface Props {
    absensi: AbsensiDetail;
    [key: string]: any;
}

const formatTanggal = (tgl: string) =>
    new Date(tgl).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

const formatJam = (jam: string | null) => {
    if (!jam) return '–';
    return jam.slice(0, 5); // HH:MM
};

const statusConfig = {
    hadir: {
        label: 'Hadir',
        color: 'bg-green-100 text-green-700 hover:bg-green-100',
        icon: CheckCircle2,
        iconColor: 'text-green-500',
        bg: 'bg-green-50 dark:bg-green-950/20',
    },
    izin: {
        label: 'Izin',
        color: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        icon: FileText,
        iconColor: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    sakit: {
        label: 'Sakit',
        color: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
        icon: AlertCircle,
        iconColor: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-950/20',
    },
    alpha: {
        label: 'Alpha',
        color: 'bg-red-100 text-red-700 hover:bg-red-100',
        icon: XCircle,
        iconColor: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-950/20',
    },
    cuti: {
        label: 'Cuti',
        color: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
        icon: Calendar,
        iconColor: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-950/20',
    },
};

function hitungDurasi(jamMasuk: string | null, jamPulang: string | null): string {
    if (!jamMasuk || !jamPulang) return '–';
    const [mH, mM] = jamMasuk.split(':').map(Number);
    const [pH, pM] = jamPulang.split(':').map(Number);
    const totalMenit = (pH * 60 + pM) - (mH * 60 + mM);
    if (totalMenit <= 0) return '–';
    const jam = Math.floor(totalMenit / 60);
    const menit = totalMenit % 60;
    return menit > 0 ? `${jam} jam ${menit} menit` : `${jam} jam`;
}

export default function AbsensiShow() {
    const { absensi: a } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Absensi', href: '/admin/absensi' },
        { title: `Detail — ${a.karyawan.nama_lengkap}`, href: '#' },
    ];

    const cfg = statusConfig[a.status] ?? statusConfig.alpha;
    const StatusIcon = cfg.icon;
    const durasi = hitungDurasi(a.jam_masuk, a.jam_pulang);

    const mapsUrlMasuk =
        a.latitude_masuk && a.longitude_masuk
            ? `https://www.google.com/maps?q=${a.latitude_masuk},${a.longitude_masuk}`
            : null;

    const mapsUrlPulang =
        a.latitude_pulang && a.longitude_pulang
            ? `https://www.google.com/maps?q=${a.latitude_pulang},${a.longitude_pulang}`
            : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Absensi — ${a.karyawan.nama_lengkap}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 p-4">
                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get('/admin/absensi')}
                            className="mb-3"
                        >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Kembali
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Detail Absensi</h1>
                        <p className="text-muted-foreground">
                            {formatTanggal(a.tanggal)} · {a.karyawan.nama_lengkap}
                        </p>
                    </div>
                    <Badge className={`mt-1 px-3 py-1.5 text-sm ${cfg.color}`}>
                        <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                        {cfg.label}
                    </Badge>
                </div>

                <div className="space-y-4 px-4">
                    {/* Info Karyawan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-indigo-500" />
                                Informasi Karyawan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                                {[
                                    { icon: User, label: 'Nama Lengkap', value: a.karyawan.nama_lengkap },
                                    { icon: FileText, label: 'NIK', value: a.karyawan.nik, mono: true },
                                    {
                                        icon: Briefcase,
                                        label: 'Jabatan',
                                        value: a.karyawan.jabatan?.nama_jabatan ?? '–',
                                    },
                                    {
                                        icon: Clock,
                                        label: 'Shift',
                                        value: a.karyawan.shift?.nama_shift ?? '–',
                                    },
                                ].map((info) => (
                                    <div key={info.label} className="flex items-start gap-2.5">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <info.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">{info.label}</p>
                                            <p className={`text-sm font-semibold ${info.mono ? 'font-mono' : ''}`}>
                                                {info.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Jadwal Shift */}
                    {a.karyawan.shift && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="h-4 w-4 text-indigo-500" />
                                    Jadwal Shift
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                                        <p className="text-[11px] text-muted-foreground">Jam Masuk Shift</p>
                                        <p className="font-mono text-lg font-bold">
                                            {formatJam(a.karyawan.shift.jam_masuk)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                                        <p className="text-[11px] text-muted-foreground">Jam Pulang Shift</p>
                                        <p className="font-mono text-lg font-bold">
                                            {formatJam(a.karyawan.shift.jam_pulang)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                                        <p className="text-[11px] text-muted-foreground">Toleransi Terlambat</p>
                                        <p className="font-mono text-lg font-bold">
                                            {a.karyawan.shift.toleransi_menit} menit
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Waktu Absensi */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Jam Masuk */}
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Jam Masuk</p>
                                        <p className="font-mono text-2xl font-bold">
                                            {formatJam(a.jam_masuk)}
                                        </p>
                                        {mapsUrlMasuk && (
                                            <a
                                                href={mapsUrlMasuk}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                Lihat Lokasi
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                                        <LogIn className="h-5 w-5 text-indigo-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Jam Pulang */}
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Jam Pulang</p>
                                        <p className="font-mono text-2xl font-bold">
                                            {formatJam(a.jam_pulang)}
                                        </p>
                                        {mapsUrlPulang && (
                                            <a
                                                href={mapsUrlPulang}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                Lihat Lokasi
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                                        <LogOut className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Durasi */}
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Durasi Kerja</p>
                                        <p className="text-lg font-bold">{durasi}</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                                        <Timer className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Keterlambatan & Status */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Keterlambatan */}
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-5">
                                <div
                                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                                        a.keterlambatan > 0
                                            ? 'bg-red-50 dark:bg-red-950/30'
                                            : 'bg-green-50 dark:bg-green-950/30'
                                    }`}
                                >
                                    <Clock
                                        className={`h-5 w-5 ${
                                            a.keterlambatan > 0 ? 'text-red-500' : 'text-green-500'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Keterlambatan</p>
                                    {a.keterlambatan > 0 ? (
                                        <p className="text-lg font-bold text-red-600">
                                            {a.keterlambatan} menit
                                        </p>
                                    ) : (
                                        <p className="text-lg font-bold text-green-600">Tepat Waktu</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardContent className="flex items-center gap-4 pt-5">
                                <div
                                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}
                                >
                                    <StatusIcon className={`h-5 w-5 ${cfg.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status Kehadiran</p>
                                    <Badge className={`mt-0.5 ${cfg.color}`}>{cfg.label}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Keterangan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                Keterangan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {a.keterangan ? (
                                <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm">{a.keterangan}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Tidak ada keterangan.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}