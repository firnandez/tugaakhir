import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, Users, CheckCircle2, Clock, Plus, Eye, Trash2, TrendingUp, FileText } from 'lucide-react';

interface PenggajianRow {
    id_penggajian: number;
    nama: string;
    nik: string;
    jabatan: string;
    gaji_pokok: number;
    potongan_cuti: number;
    potongan_lainnya: number;
    total_gaji: number;
    status_pembayaran: 'lunas' | 'belum_lunas';
    tanggal_pembayaran: string | null;
}

interface Props {
    penggajianList: PenggajianRow[];
    sudahDigenerate: boolean;
    filterBulan: number;
    filterTahun: number;
    totalGaji: number;
    totalLunas: number;
    totalBelumLunas: number;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Penggajian', href: '/admin/penggajian' },
];

const BULAN_NAMES = [
    '',
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

const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

export default function PenggajianIndex() {
    const { penggajianList, sudahDigenerate, filterBulan, filterTahun, totalGaji, totalLunas, totalBelumLunas } =
        usePage<Props>().props;

    const [bulan, setBulan] = useState(filterBulan.toString());
    const [tahun, setTahun] = useState(filterTahun.toString());
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const currentYear = new Date().getFullYear();
    const tahunOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleFilter = () => {
        router.get('/admin/penggajian', { bulan, tahun }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/admin/penggajian/${deletingId}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingId(null),
        });
    };

    const handleUpdateStatus = (id: number, status: 'lunas' | 'belum_lunas') => {
        router.patch(
            `/admin/penggajian/${id}/status`,
            {
                status_pembayaran: status,
                tanggal_pembayaran: status === 'lunas' ? new Date().toISOString().split('T')[0] : null,
            },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penggajian" />

            <div className="space-y-4 pb-6 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Penggajian</h1>
                        <p className="text-sm text-muted-foreground">Kelola payroll bulanan karyawan</p>
                    </div>
                    {!sudahDigenerate && (
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => router.post('/admin/penggajian/preview', { bulan, tahun })}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Generate Penggajian
                        </Button>
                    )}
                </div>

                {/* Filter */}
                <div className="px-4">
                    <Card>
                        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
                            <div className="flex flex-1 gap-2">
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Bulan</p>
                                    <Select value={bulan} onValueChange={setBulan}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BULAN_NAMES.slice(1).map((name, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Tahun</p>
                                    <Select value={tahun} onValueChange={setTahun}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tahunOptions.map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleFilter} className="w-full sm:w-auto">
                                Tampilkan
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats — 2 kolom di mobile, 4 kolom di desktop */}
                <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
                    {[
                        {
                            label: 'Total Karyawan',
                            value: penggajianList.length,
                            icon: Users,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                        },
                        {
                            label: 'Total Pengeluaran',
                            value: formatRupiah(totalGaji),
                            icon: Wallet,
                            color: 'text-emerald-600',
                            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                            smallText: true,
                        },
                        {
                            label: 'Sudah Lunas',
                            value: totalLunas,
                            icon: CheckCircle2,
                            color: 'text-green-600',
                            bg: 'bg-green-50 dark:bg-green-950/30',
                        },
                        {
                            label: 'Belum Lunas',
                            value: totalBelumLunas,
                            icon: Clock,
                            color: 'text-amber-600',
                            bg: 'bg-amber-50 dark:bg-amber-950/30',
                        },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-3 pt-4 pb-4">
                                <div
                                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${s.bg}`}
                                >
                                    <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
                                    <p className={`font-bold leading-tight ${s.color} ${s.smallText ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                                        {s.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabel / List */}
                <div className="px-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                Penggajian {BULAN_NAMES[filterBulan]} {filterTahun}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {penggajianList.length === 0 ? (
                                <div className="flex flex-col items-center py-16 text-muted-foreground">
                                    <FileText className="mb-3 h-10 w-10 opacity-25" />
                                    <p className="font-medium">Belum ada data penggajian</p>
                                    <p className="text-sm text-center px-4">
                                        {sudahDigenerate
                                            ? 'Data tidak ditemukan.'
                                            : 'Klik "Generate Penggajian" untuk membuat data bulan ini.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* ── Mobile view: card per baris ── */}
                                    <div className="divide-y divide-border lg:hidden">
                                        {penggajianList.map((p) => {
                                            const totalPotongan =
                                                (Number(p.potongan_cuti) || 0) + (Number(p.potongan_lainnya) || 0);
                                            return (
                                                <div key={p.id_penggajian} className="px-4 py-3 space-y-2">
                                                    {/* Baris atas: nama + badge */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold truncate">{p.nama}</p>
                                                            <p className="font-mono text-[11px] text-muted-foreground">
                                                                {p.nik}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{p.jabatan}</p>
                                                        </div>
                                                        <Badge
                                                            className={`shrink-0 ${
                                                                p.status_pembayaran === 'lunas'
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                            }`}
                                                        >
                                                            {p.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                                        </Badge>
                                                    </div>

                                                    {/* Baris bawah: gaji + aksi */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <p className="font-mono text-sm font-semibold text-emerald-600">
                                                                {formatRupiah(p.total_gaji)}
                                                            </p>
                                                            {totalPotongan > 0 ? (
                                                                <p className="font-mono text-xs text-destructive">
                                                                    -{formatRupiah(totalPotongan)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Tidak ada potongan
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs px-2"
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        p.id_penggajian,
                                                                        p.status_pembayaran === 'lunas'
                                                                            ? 'belum_lunas'
                                                                            : 'lunas',
                                                                    )
                                                                }
                                                            >
                                                                {p.status_pembayaran === 'lunas'
                                                                    ? 'Batal Lunas'
                                                                    : 'Tandai Lunas'}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() =>
                                                                    router.get(`/admin/penggajian/${p.id_penggajian}`)
                                                                }
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                            {p.status_pembayaran !== 'lunas' && (
                                                                <Dialog
                                                                    open={deletingId === p.id_penggajian}
                                                                    onOpenChange={(open) =>
                                                                        !open && setDeletingId(null)
                                                                    }
                                                                >
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                                            onClick={() =>
                                                                                setDeletingId(p.id_penggajian)
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogTitle>Hapus Data Penggajian</DialogTitle>
                                                                        <DialogDescription>
                                                                            Yakin hapus penggajian{' '}
                                                                            <strong>{p.nama}</strong>? Data detail gaji
                                                                            juga akan ikut terhapus.
                                                                        </DialogDescription>
                                                                        <DialogFooter className="gap-2">
                                                                            <DialogClose asChild>
                                                                                <Button variant="secondary">Batal</Button>
                                                                            </DialogClose>
                                                                            <Button
                                                                                variant="destructive"
                                                                                onClick={handleDelete}
                                                                            >
                                                                                Hapus
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* ── Desktop view: tabel normal ── */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="py-4">Karyawan</TableHead>
                                                    <TableHead className="py-4">Jabatan</TableHead>
                                                    <TableHead className="py-4 text-right">Gaji Pokok</TableHead>
                                                    <TableHead className="py-4 text-right">Potongan</TableHead>
                                                    <TableHead className="py-4 text-right">Total Gaji</TableHead>
                                                    <TableHead className="py-4">Status</TableHead>
                                                    <TableHead className="py-4 text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {penggajianList.map((p) => {
                                                    const totalPotongan =
                                                        (Number(p.potongan_cuti) || 0) +
                                                        (Number(p.potongan_lainnya) || 0);
                                                    return (
                                                        <TableRow
                                                            key={p.id_penggajian}
                                                            className="hover:bg-muted/30"
                                                        >
                                                            <TableCell className="py-4">
                                                                <p className="text-sm font-semibold">{p.nama}</p>
                                                                <p className="font-mono text-[11px] text-muted-foreground">
                                                                    {p.nik}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-sm">{p.jabatan}</TableCell>
                                                            <TableCell className="py-4 text-right font-mono text-sm">
                                                                {formatRupiah(p.gaji_pokok)}
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right">
                                                                {totalPotongan > 0 ? (
                                                                    <span className="font-mono text-sm text-destructive">
                                                                        -{formatRupiah(totalPotongan)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-muted-foreground">–</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right font-mono text-sm font-semibold text-emerald-600">
                                                                {formatRupiah(p.total_gaji)}
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <Badge
                                                                    variant={
                                                                        p.status_pembayaran === 'lunas'
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                    }
                                                                    className={
                                                                        p.status_pembayaran === 'lunas'
                                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                                    }
                                                                >
                                                                    {p.status_pembayaran === 'lunas'
                                                                        ? 'Lunas'
                                                                        : 'Belum Lunas'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs"
                                                                        onClick={() =>
                                                                            handleUpdateStatus(
                                                                                p.id_penggajian,
                                                                                p.status_pembayaran === 'lunas'
                                                                                    ? 'belum_lunas'
                                                                                    : 'lunas',
                                                                            )
                                                                        }
                                                                    >
                                                                        {p.status_pembayaran === 'lunas'
                                                                            ? 'Batal Lunas'
                                                                            : 'Tandai Lunas'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() =>
                                                                            router.get(
                                                                                `/admin/penggajian/${p.id_penggajian}`,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    {p.status_pembayaran !== 'lunas' && (
                                                                        <Dialog
                                                                            open={deletingId === p.id_penggajian}
                                                                            onOpenChange={(open) =>
                                                                                !open && setDeletingId(null)
                                                                            }
                                                                        >
                                                                            <DialogTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                                                                    onClick={() =>
                                                                                        setDeletingId(p.id_penggajian)
                                                                                    }
                                                                                >
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </Button>
                                                                            </DialogTrigger>
                                                                            <DialogContent>
                                                                                <DialogTitle>
                                                                                    Hapus Data Penggajian
                                                                                </DialogTitle>
                                                                                <DialogDescription>
                                                                                    Yakin hapus penggajian{' '}
                                                                                    <strong>{p.nama}</strong>? Data
                                                                                    detail gaji juga akan ikut terhapus.
                                                                                </DialogDescription>
                                                                                <DialogFooter className="gap-2">
                                                                                    <DialogClose asChild>
                                                                                        <Button variant="secondary">
                                                                                            Batal
                                                                                        </Button>
                                                                                    </DialogClose>
                                                                                    <Button
                                                                                        variant="destructive"
                                                                                        onClick={handleDelete}
                                                                                    >
                                                                                        Hapus
                                                                                    </Button>
                                                                                </DialogFooter>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}