import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface IzinItem {
    id_absensi: number;
    tanggal: string;
    status: 'izin' | 'sakit';
    status_izin: 'pending' | 'disetujui' | 'ditolak' | null;
    catatan_admin: string | null;
    keterangan: string | null;
    karyawan: {
        nama_lengkap: string;
        nik: string;
        jabatan: { nama_jabatan: string };
    };
}

interface Props {
    izinList: {
        data: IzinItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filterStatus: string;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Absensi', href: '/admin/absensi' },
    { title: 'Pengajuan Izin', href: '/admin/absensi/izin' },
];

export default function AbsensiIzin() {
    const { izinList, filterStatus } = usePage<Props>().props;
    const [catatanMap, setCatatanMap] = useState<Record<number, string>>({});
    const [statusFilter, setStatusFilter] = useState(filterStatus || 'pending');

    const handleFilter = (val: string) => {
        setStatusFilter(val);
        router.get('/admin/absensi/izin', { status: val }, { preserveState: true, preserveScroll: true });
    };

    const handleUpdateStatus = (id: number, status: 'disetujui' | 'ditolak') => {
        router.patch(
            `/admin/absensi/${id}/izin`,
            { status_izin: status, catatan_admin: catatanMap[id] ?? '' },
            { preserveScroll: true },
        );
    };

    const badgeVariant = (status: string) => {
        if (status === 'disetujui') return 'default';
        if (status === 'ditolak') return 'destructive';
        return 'secondary';
    };

    const badgeLabel = (status: string) => {
        if (status === 'disetujui') return 'Disetujui';
        if (status === 'ditolak') return 'Ditolak';
        return 'Pending';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengajuan Izin" />

            <div className="space-y-6">
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">Pengajuan Izin</h1>
                    <p className="text-muted-foreground">Kelola pengajuan izin dan sakit karyawan</p>
                </div>

                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daftar Pengajuan</CardTitle>
                        <CardDescription>Total: {izinList.total} pengajuan</CardDescription>
                    </div>
                    {/* Filter status */}
                    <Select value={statusFilter} onValueChange={handleFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="disetujui">Disetujui</SelectItem>
                            <SelectItem value="ditolak">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="py-4">Karyawan</TableHead>
                                    <TableHead className="py-4">Jabatan</TableHead>
                                    <TableHead className="py-4">Tanggal</TableHead>
                                    <TableHead className="py-4">Jenis</TableHead>
                                    <TableHead className="py-4">Keterangan</TableHead>
                                    <TableHead className="py-4">Status</TableHead>
                                    <TableHead className="py-4">Catatan Admin</TableHead>
                                    <TableHead className="py-4 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {izinList.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Tidak ada pengajuan izin.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    izinList.data.map((item) => (
                                        <TableRow key={item.id_absensi} className="hover:bg-muted/30">
                                            <TableCell className="py-4">
                                                <p className="font-medium">{item.karyawan.nama_lengkap}</p>
                                                <p className="font-mono text-xs text-muted-foreground">{item.karyawan.nik}</p>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                {item.karyawan.jabatan.nama_jabatan}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant={item.status === 'sakit' ? 'destructive' : 'secondary'}>
                                                    {item.status === 'sakit' ? 'Sakit' : 'Izin'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 max-w-[160px] text-sm text-muted-foreground">
                                                {item.keterangan ?? '-'}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant={badgeVariant(item.status_izin ?? 'pending')}>
                                                    {badgeLabel(item.status_izin ?? 'pending')}
                                                </Badge>
                                            </TableCell>

                                            {/* Kolom catatan — hanya muncul input saat pending */}
                                            <TableCell className="py-4 min-w-[180px]">
                                                {item.status_izin === 'pending' || !item.status_izin ? (
                                                    <Textarea
                                                        placeholder="Catatan (opsional)..."
                                                        rows={2}
                                                        className="resize-none text-sm"
                                                        value={catatanMap[item.id_absensi] ?? ''}
                                                        onChange={(e) =>
                                                            setCatatanMap((prev) => ({
                                                                ...prev,
                                                                [item.id_absensi]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.catatan_admin ?? '-'}
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* ── KOLOM AKSI ── */}
                                            <TableCell className="py-4 text-right">
                                                {item.status_izin === 'pending' || !item.status_izin ? (
                                                    // Belum diproses → tampil tombol Setujui & Tolak
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleUpdateStatus(item.id_absensi, 'disetujui')}
                                                        >
                                                            <CheckCircle size={14} className="mr-1" />
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleUpdateStatus(item.id_absensi, 'ditolak')}
                                                        >
                                                            <XCircle size={14} className="mr-1" />
                                                            Tolak
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // Sudah diproses → tampil tombol Detail
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

                    {izinList.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {(izinList.current_page - 1) * izinList.per_page + 1}–
                                {Math.min(izinList.current_page * izinList.per_page, izinList.total)} dari {izinList.total}
                            </p>
                            <div className="flex gap-2">
                                {izinList.links.map((link, i) => (
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