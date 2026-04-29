import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { Users, UserCheck, UserX, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AbsensiItem {
    id_absensi: number;
    tanggal: string;
    jam_masuk: string | null;
    jam_pulang: string | null;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'cuti';
    keterlambatan: number;
    keterangan: string | null;
    karyawan: {
        id: number;
        nik: string;
        nama_lengkap: string;
        jabatan: { nama_jabatan: string };
        shift: { nama_shift: string; jam_masuk: string };
    };
}

interface Props {
    absensi: {
        data: AbsensiItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    karyawanList: Array<{ id: number; nama_lengkap: string; nik: string }>;
    filters: { search: string; status: string; tanggal: string; karyawan_id: string };
    summary: { hadir: number; izin: number; sakit: number; alpha: number; cuti: number };
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Absensi', href: '/admin/absensi' },
];

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    hadir: 'default',
    izin: 'secondary',
    sakit: 'secondary',
    alpha: 'destructive',
    cuti: 'outline',
};

export default function AbsensiIndex() {
    const { absensi, filters, summary } = usePage<Props>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [tanggal, setTanggal] = useState(filters?.tanggal || '');
    const [karyawanId, setKaryawanId] = useState(filters?.karyawan_id || 'all');
    const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/absensi',
            {
                search,
                status: status === 'all' ? '' : status,
                tanggal,
                karyawan_id: karyawanId === 'all' ? '' : karyawanId,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const isPending = (item: AbsensiItem) =>
        ['izin', 'sakit', 'cuti'].includes(item.status) && !item.jam_masuk;

    const handleUpdateStatus = (id: number, aksi: 'setuju' | 'tolak') => {
        if (aksi === 'tolak' && !confirm('Yakin ingin menolak pengajuan ini? Data akan dihapus.')) return;
        router.patch(
            `/admin/absensi/${id}/izin`,
            { aksi, catatan_admin: catatanMap[id] ?? '' },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Absensi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">Data Absensi</h1>
                    <p className="text-muted-foreground">Monitor kehadiran seluruh karyawan</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 px-4 md:grid-cols-5">
                    {[
                        { label: 'Hadir', value: summary.hadir, icon: UserCheck, color: 'text-green-600' },
                        { label: 'Izin', value: summary.izin, icon: Users, color: 'text-blue-600' },
                        { label: 'Sakit', value: summary.sakit, icon: Users, color: 'text-yellow-600' },
                        { label: 'Alpha', value: summary.alpha, icon: UserX, color: 'text-red-600' },
                        { label: 'Cuti', value: summary.cuti, icon: Clock, color: 'text-purple-600' },
                    ].map((item) => (
                        <Card key={item.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {item.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table Section */}
                <CardHeader>
                    <CardTitle>Daftar Absensi</CardTitle>
                    <CardDescription>Total: {absensi.total} record</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleFilter} className="mb-6 flex flex-wrap gap-3">
                        <Input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="w-[170px]"
                        />
                        <Input
                            placeholder="Cari nama / NIK..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="hadir">Hadir</SelectItem>
                                <SelectItem value="izin">Izin</SelectItem>
                                <SelectItem value="sakit">Sakit</SelectItem>
                                <SelectItem value="alpha">Alpha</SelectItem>
                                <SelectItem value="cuti">Cuti</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">
                            Filter
                        </Button>
                    </form>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="py-4">Karyawan</TableHead>
                                    <TableHead className="py-4">Jabatan</TableHead>
                                    <TableHead className="py-4">Tanggal</TableHead>
                                    <TableHead className="py-4">Jam Masuk</TableHead>
                                    <TableHead className="py-4">Jam Pulang</TableHead>
                                    <TableHead className="py-4">Status</TableHead>
                                    <TableHead className="py-4">Terlambat</TableHead>
                                    <TableHead className="py-4 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {absensi.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Belum ada data absensi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    absensi.data.map((item) => (
                                        <TableRow key={item.id_absensi} className="hover:bg-muted/30">
                                            <TableCell className="py-4">
                                                <p className="font-medium">{item.karyawan.nama_lengkap}</p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {item.karyawan.nik}
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                {item.karyawan.jabatan.nama_jabatan}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="py-4 font-mono text-sm">
                                                {item.jam_masuk ?? '-'}
                                            </TableCell>
                                            <TableCell className="py-4 font-mono text-sm">
                                                {item.jam_pulang ?? '-'}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant={statusColor[item.status]}>
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {item.keterlambatan > 0 ? (
                                                    <span className="text-sm font-medium text-red-600">
                                                        {item.keterlambatan} menit
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-green-600">-</span>
                                                )}
                                            </TableCell>

                                            {/* ── KOLOM AKSI ── */}
                                            <TableCell className="py-4 text-right">
                                                {isPending(item) ? (
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => handleUpdateStatus(item.id_absensi, 'setuju')}
                                                            >
                                                                <CheckCircle size={14} className="mr-1" />
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleUpdateStatus(item.id_absensi, 'tolak')}
                                                            >
                                                                <XCircle size={14} className="mr-1" />
                                                                Tolak
                                                            </Button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Catatan admin (opsional)"
                                                            className="w-48 rounded border px-2 py-1 text-xs text-muted-foreground"
                                                            value={catatanMap[item.id_absensi] ?? ''}
                                                            onChange={(e) =>
                                                                setCatatanMap((prev) => ({
                                                                    ...prev,
                                                                    [item.id_absensi]: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/absensi/${item.id_absensi}`}>Detail</Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {absensi.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {(absensi.current_page - 1) * absensi.per_page + 1}–
                                {Math.min(absensi.current_page * absensi.per_page, absensi.total)} dari{' '}
                                {absensi.total}
                            </p>
                            <div className="flex gap-2">
                                {absensi.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>
        </AppLayout>
    );
}