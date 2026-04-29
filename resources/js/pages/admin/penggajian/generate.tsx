import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Save, Eye, AlertTriangle, ChevronLeft, Users, Wallet, Scissors, CheckCircle2 } from 'lucide-react';

interface DetailItem {
    komponen: string;
    jumlah: number;
    keterangan: string;
}

interface PreviewItem {
    id_karyawan: number;
    nama: string;
    nik: string;
    jabatan: string;
    gaji_pokok: number;
    jumlah_alpha: number;
    jumlah_cuti: number;
    potongan_cuti: number;
    potongan_lainnya: number;
    total_gaji: number;
    detail: DetailItem[];
}

interface Props {
    preview: PreviewItem[];
    bulan: number;
    tahun: number;
    [key: string]: any;
}

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

const HARI_KERJA = 26;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Penggajian', href: '/admin/penggajian' },
    { title: 'Generate', href: '#' },
];

function EditRowDialog({
    item,
    open,
    onClose,
    onSave,
}: {
    item: PreviewItem;
    open: boolean;
    onClose: () => void;
    onSave: (updated: PreviewItem) => void;
}) {
    const [alpha, setAlpha] = useState(item.jumlah_alpha.toString());
    const [cuti, setCuti] = useState(item.jumlah_cuti.toString());
    const [gajiPokok, setGajiPokok] = useState(item.gaji_pokok.toString());

    const alphaNum = Math.max(0, parseInt(alpha) || 0);
    const cutiNum = Math.max(0, parseInt(cuti) || 0);
    const gajiNum = Math.max(0, parseFloat(gajiPokok) || 0);
    const gajHarian = gajiNum / HARI_KERJA;

    const potAlpha = Math.round(gajHarian * alphaNum);
    const potCuti = Math.round(gajHarian * cutiNum);
    const total = Math.max(0, gajiNum - potAlpha - potCuti);

    const handleSave = () => {
        const detail: DetailItem[] = [
            { komponen: 'Gaji Pokok', jumlah: gajiNum, keterangan: `Jabatan: ${item.jabatan}` },
        ];
        if (alphaNum > 0) {
            detail.push({
                komponen: 'Potongan Alpha',
                jumlah: -potAlpha,
                keterangan: `${alphaNum} hari tidak hadir tanpa keterangan`,
            });
        }
        if (cutiNum > 0) {
            detail.push({ komponen: 'Potongan Cuti', jumlah: -potCuti, keterangan: `${cutiNum} hari cuti` });
        }
        onSave({
            ...item,
            gaji_pokok: gajiNum,
            jumlah_alpha: alphaNum,
            jumlah_cuti: cutiNum,
            potongan_lainnya: potAlpha,
            potongan_cuti: potCuti,
            total_gaji: total,
            detail,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogTitle>Edit Gaji — {item.nama}</DialogTitle>
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                        <p className="font-medium">{item.nama}</p>
                        <p className="text-muted-foreground">
                            {item.nik} · {item.jabatan}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Gaji Pokok (Rp)</Label>
                        <Input
                            value={gajiPokok}
                            onChange={(e) => setGajiPokok(e.target.value)}
                            type="number"
                            min={0}
                            className="font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Hari Alpha</Label>
                            <Input
                                value={alpha}
                                onChange={(e) => setAlpha(e.target.value)}
                                type="number"
                                min={0}
                                max={HARI_KERJA}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Hari Cuti</Label>
                            <Input
                                value={cuti}
                                onChange={(e) => setCuti(e.target.value)}
                                type="number"
                                min={0}
                                max={HARI_KERJA}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 rounded-xl border bg-muted/20 p-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Gaji Pokok</span>
                            <span className="font-mono">{formatRupiah(gajiNum)}</span>
                        </div>
                        {alphaNum > 0 && (
                            <div className="flex justify-between text-destructive">
                                <span>Potongan Alpha ({alphaNum} hari)</span>
                                <span className="font-mono">-{formatRupiah(potAlpha)}</span>
                            </div>
                        )}
                        {cutiNum > 0 && (
                            <div className="flex justify-between text-destructive">
                                <span>Potongan Cuti ({cutiNum} hari)</span>
                                <span className="font-mono">-{formatRupiah(potCuti)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-1.5 font-semibold text-emerald-600">
                            <span>Total Gaji</span>
                            <span className="font-mono">{formatRupiah(total)}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                            Terapkan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Generate Page ─────────────

export default function PenggajianGenerate() {
    const { preview: initialPreview, bulan, tahun } = usePage<Props>().props;

    const [data, setData] = useState<PreviewItem[]>(initialPreview);
    const [editItem, setEditItem] = useState<PreviewItem | null>(null);
    const [saving, setSaving] = useState(false);

    const totalGaji = useMemo(() => data.reduce((s, d) => s + d.total_gaji, 0), [data]);
    const totalPotongan = useMemo(() => data.reduce((s, d) => s + d.potongan_cuti + d.potongan_lainnya, 0), [data]);
    const adaPotongan = data.some((d) => d.jumlah_alpha > 0 || d.jumlah_cuti > 0);

    const handleSaveEdit = (updated: PreviewItem) => {
        setData((prev) => prev.map((d) => (d.id_karyawan === updated.id_karyawan ? updated : d)));
    };

    const handleSimpan = () => {
        setSaving(true);
        router.post('/admin/penggajian', { bulan, tahun, data }, { onFinish: () => setSaving(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Generate Penggajian ${BULAN_NAMES[bulan]} ${tahun}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 p-4">
                    <div>
                        {/* Tombol Kembali */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get('/admin/penggajian')}
                            className="mb-3"
                        >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Kembali
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Preview Generate — {BULAN_NAMES[bulan]} {tahun}
                        </h1>
                        <p className="text-muted-foreground">
                            Review dan edit sebelum data disimpan final. Perubahan tidak bisa dibatalkan setelah
                            disimpan.
                        </p>
                    </div>
                </div>

                {/* Warning potongan */}
                {adaPotongan && (
                    <div className="mx-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                            <p className="font-semibold">Terdapat Potongan Gaji</p>
                            <p className="text-amber-700 dark:text-amber-400">
                                Beberapa karyawan memiliki potongan alpha/cuti. Pastikan data absensi sudah benar
                                sebelum menyimpan.
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 px-4 lg:grid-cols-4">
                    {[
                        {
                            label: 'Jumlah Karyawan',
                            value: data.length,
                            icon: Users,
                            color: 'text-indigo-600',
                            bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                        },
                        {
                            label: 'Total Gaji Pokok',
                            value: formatRupiah(data.reduce((s, d) => s + d.gaji_pokok, 0)),
                            icon: Wallet,
                            color: 'text-blue-600',
                            bg: 'bg-blue-50 dark:bg-blue-950/30',
                        },
                        {
                            label: 'Total Potongan',
                            value: formatRupiah(totalPotongan),
                            icon: Scissors,
                            color: 'text-red-600',
                            bg: 'bg-red-50 dark:bg-red-950/30',
                        },
                        {
                            label: 'Total Dibayarkan',
                            value: formatRupiah(totalGaji),
                            icon: CheckCircle2,
                            color: 'text-emerald-600',
                            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                        },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}
                                >
                                    <s.icon className={`h-5 w-5 ${s.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                                    <p className={`text-sm font-bold ${s.color} truncate`}>{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabel preview */}
                <div className="px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Data Penggajian Karyawan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="py-4">Karyawan</TableHead>
                                            <TableHead className="py-4">Jabatan</TableHead>
                                            <TableHead className="py-4 text-center">Alpha</TableHead>
                                            <TableHead className="py-4 text-center">Cuti</TableHead>
                                            <TableHead className="py-4 text-right">Gaji Pokok</TableHead>
                                            <TableHead className="py-4 text-right">Potongan</TableHead>
                                            <TableHead className="py-4 text-right">Total Gaji</TableHead>
                                            <TableHead className="py-4 text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((item) => {
                                            const totalPot = item.potongan_cuti + item.potongan_lainnya;
                                            return (
                                                <TableRow
                                                    key={item.id_karyawan}
                                                    className={
                                                        totalPot > 0
                                                            ? 'bg-red-50/30 dark:bg-red-950/10'
                                                            : 'hover:bg-muted/30'
                                                    }
                                                >
                                                    <TableCell className="py-4">
                                                        <p className="text-sm font-semibold">{item.nama}</p>
                                                        <p className="font-mono text-[11px] text-muted-foreground">
                                                            {item.nik}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm">{item.jabatan}</TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        {item.jumlah_alpha > 0 ? (
                                                            <Badge variant="destructive" className="text-[10px]">
                                                                {item.jumlah_alpha} hari
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">–</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        {item.jumlah_cuti > 0 ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-300 text-[10px] text-amber-700"
                                                            >
                                                                {item.jumlah_cuti} hari
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">–</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right font-mono text-sm">
                                                        {formatRupiah(item.gaji_pokok)}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right">
                                                        {totalPot > 0 ? (
                                                            <span className="font-mono text-sm text-destructive">
                                                                -{formatRupiah(totalPot)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">–</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right font-mono text-sm font-semibold text-emerald-600">
                                                        {formatRupiah(item.total_gaji)}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setEditItem(item)}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer action */}
                <div className="flex justify-end gap-3 px-4 pb-6">
                    <Button variant="outline" onClick={() => router.get('/admin/penggajian')}>
                        Batal
                    </Button>
                    <Button onClick={handleSimpan} disabled={saving || data.length === 0}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>

            {/* Edit Dialog */}
            {editItem && (
                <EditRowDialog
                    item={editItem}
                    open={!!editItem}
                    onClose={() => setEditItem(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </AppLayout>
    );
}
