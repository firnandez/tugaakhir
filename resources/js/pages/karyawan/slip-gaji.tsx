import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import {
    Wallet,
    CheckCircle2,
    Clock,
    TrendingDown,
    TrendingUp,
    FileText,
    User,
    Briefcase,
    BadgeCheck,
    Eye,
    Download,
} from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface SlipItem {
    id_penggajian: number;
    bulan: number;
    tahun: number;
    gaji_pokok: number | string;
    potongan_cuti: number | string;
    potongan_lainnya: number | string;
    total_gaji: number | string;
    status_pembayaran: 'lunas' | 'belum_lunas';
    tanggal_pembayaran: string | null;
}

interface KaryawanInfo {
    nama: string;
    nik: string;
    jabatan: string;
}

interface Props {
    slipList: SlipItem[];
    karyawan: KaryawanInfo;
    filterTahun: number;
    [key: string]: any;
}

const BULAN_NAMES = [
    '',
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (val: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(val));

const formatTanggal = (val: string | null) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Slip Gaji', href: '/karyawan/slip-gaji' },
];

const pdfStyles = StyleSheet.create({
    page: { padding: 36, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
    title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#111827' },
    sub: { fontSize: 10, color: '#6b7280', marginBottom: 20 },
    divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { fontSize: 10, color: '#6b7280' },
    value: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827' },
    deductVal: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#dc2626' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        backgroundColor: '#ecfdf5',
        padding: 10,
        borderRadius: 4,
    },
    totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#065f46' },
    totalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#059669' },
    statusBox: { marginTop: 14, padding: 8, borderRadius: 4 },
    statusText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
});

function SlipPDF({ slip, karyawan }: { slip: SlipItem; karyawan: KaryawanInfo }) {
    const totalPotongan = Number(slip.potongan_cuti) + Number(slip.potongan_lainnya);
    return (
        <Document>
            <Page size="A5" style={pdfStyles.page}>
                <Text style={pdfStyles.title}>SLIP GAJI</Text>
                <Text style={pdfStyles.sub}>Periode: {BULAN_NAMES[slip.bulan]} {slip.tahun}</Text>
                <View style={pdfStyles.divider} />
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Nama</Text>
                    <Text style={pdfStyles.value}>{karyawan.nama}</Text>
                </View>
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>NIK</Text>
                    <Text style={pdfStyles.value}>{karyawan.nik}</Text>
                </View>
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Jabatan</Text>
                    <Text style={pdfStyles.value}>{karyawan.jabatan}</Text>
                </View>
                <View style={[pdfStyles.divider, { marginTop: 12 }]} />
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Gaji Pokok</Text>
                    <Text style={pdfStyles.value}>{formatRupiah(slip.gaji_pokok)}</Text>
                </View>
                {totalPotongan > 0 && (
                    <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Total Potongan</Text>
                        <Text style={pdfStyles.deductVal}>-{formatRupiah(totalPotongan)}</Text>
                    </View>
                )}
                <View style={pdfStyles.totalRow}>
                    <Text style={pdfStyles.totalLabel}>TOTAL DITERIMA</Text>
                    <Text style={pdfStyles.totalValue}>{formatRupiah(slip.total_gaji)}</Text>
                </View>
                <View
                    style={[
                        pdfStyles.statusBox,
                        { backgroundColor: slip.status_pembayaran === 'lunas' ? '#dcfce7' : '#fef3c7' },
                    ]}
                >
                    <Text
                        style={[
                            pdfStyles.statusText,
                            { color: slip.status_pembayaran === 'lunas' ? '#15803d' : '#92400e' },
                        ]}
                    >
                        {slip.status_pembayaran === 'lunas'
                            ? `SUDAH DIBAYAR — ${formatTanggal(slip.tanggal_pembayaran)}`
                            : 'BELUM DIBAYAR'}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

function SlipDetailModal({
    slip,
    karyawan,
    open,
    onClose,
}: {
    slip: SlipItem | null;
    karyawan: KaryawanInfo;
    open: boolean;
    onClose: () => void;
}) {
    if (!slip) return null;

    const potonganCuti = Number(slip.potongan_cuti);
    const potonganLainnya = Number(slip.potongan_lainnya);
    const fileName = `Slip_${karyawan.nik}_${BULAN_NAMES[slip.bulan]}_${slip.tahun}.pdf`;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md overflow-hidden p-0">
                {/* Modal header */}
                <div className="bg-emerald-600 px-5 py-4 text-white sm:px-6 sm:py-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-base font-bold text-white sm:text-lg">Slip Gaji</DialogTitle>
                            <p className="mt-0.5 text-xs text-emerald-100 sm:text-sm">
                                {BULAN_NAMES[slip.bulan]} {slip.tahun}
                            </p>
                        </div>
                        <Badge
                            className={
                                slip.status_pembayaran === 'lunas'
                                    ? 'border-white/30 bg-white/20 text-white hover:bg-white/20'
                                    : 'border-amber-300/30 bg-amber-400/30 text-amber-100 hover:bg-amber-400/30'
                            }
                        >
                            {slip.status_pembayaran === 'lunas' ? '✓ Lunas' : '⏳ Belum Lunas'}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-4 px-5 py-4 sm:space-y-5 sm:px-6 sm:py-5">
                    {/* Info karyawan */}
                    <div className="space-y-2 rounded-lg border bg-muted/40 p-3 sm:space-y-2.5 sm:p-4">
                        {[
                            { icon: User, label: 'Nama', value: karyawan.nama, mono: false },
                            { icon: BadgeCheck, label: 'NIK', value: karyawan.nik, mono: true },
                            { icon: Briefcase, label: 'Jabatan', value: karyawan.jabatan, mono: false },
                        ].map(({ icon: Icon, label, value, mono }) => (
                            <div key={label} className="flex items-center gap-2 text-sm">
                                <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                <span className="text-muted-foreground">{label}</span>
                                <span className={`ml-auto font-semibold ${mono ? 'font-mono text-xs' : ''}`}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Komponen gaji */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/20 sm:px-4">
                            <p className="text-sm font-medium">Gaji Pokok</p>
                            <p className="font-mono text-sm font-semibold text-emerald-700">
                                +{formatRupiah(slip.gaji_pokok)}
                            </p>
                        </div>
                        {potonganLainnya > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-950/20 sm:px-4">
                                <p className="text-sm text-destructive">Potongan Alpha</p>
                                <p className="font-mono text-sm font-semibold text-destructive">
                                    -{formatRupiah(potonganLainnya)}
                                </p>
                            </div>
                        )}
                        {potonganCuti > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-950/20 sm:px-4">
                                <p className="text-sm text-destructive">Potongan Cuti</p>
                                <p className="font-mono text-sm font-semibold text-destructive">
                                    -{formatRupiah(potonganCuti)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="flex flex-col gap-0.5 rounded-xl bg-emerald-600 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                        <p className="text-sm font-medium text-emerald-100">Total Diterima</p>
                        <p className="font-mono text-xl font-bold sm:text-xl">{formatRupiah(slip.total_gaji)}</p>
                    </div>

                    {/* Status pembayaran */}
                    <div
                        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm sm:px-4 ${
                            slip.status_pembayaran === 'lunas'
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/20'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                        }`}
                    >
                        {slip.status_pembayaran === 'lunas' ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                Dibayarkan {formatTanggal(slip.tanggal_pembayaran)}
                            </>
                        ) : (
                            <>
                                <Clock className="h-4 w-4 shrink-0" />
                                Pembayaran sedang diproses admin
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <PDFDownloadLink
                            document={<SlipPDF slip={slip} karyawan={karyawan} />}
                            fileName={fileName}
                            className="flex-1"
                        >
                            {({ loading }) => (
                                <Button variant="outline" className="w-full" disabled={loading}>
                                    <Download className="mr-2 h-4 w-4" />
                                    {loading ? 'Menyiapkan...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                        <DialogClose asChild>
                            <Button variant="secondary" className="flex-1">Tutup</Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function SlipGaji() {
    const { slipList, karyawan, filterTahun } = usePage<Props>().props;

    const currentYear = new Date().getFullYear();
    const tahunOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const [tahun, setTahun] = useState(filterTahun.toString());
    const [selectedSlip, setSelectedSlip] = useState<SlipItem | null>(null);

    const handleFilter = () => {
        router.get('/karyawan/slip-gaji', { tahun }, { preserveState: true });
    };

    const totalDiterima = slipList.reduce((s, r) => s + Number(r.total_gaji), 0);
    const totalPotonganAll = slipList.reduce((s, r) => s + Number(r.potongan_cuti) + Number(r.potongan_lainnya), 0);
    const totalLunas = slipList.filter((r) => r.status_pembayaran === 'lunas').length;
    const totalBelum = slipList.filter((r) => r.status_pembayaran === 'belum_lunas').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Slip Gaji" />

            <div className="space-y-4 pb-6 sm:space-y-6">

                {/* ── Header ── */}
                <div className="px-4 pt-4">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Slip Gaji</h1>
                    <p className="text-sm text-muted-foreground">Riwayat penggajian bulanan Anda</p>
                </div>

                {/* ── Filter ── */}
                <div className="px-4">
                    <Card>
                        <CardContent className="flex items-end gap-3 pt-4 pb-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Tahun</p>
                                <Select value={tahun} onValueChange={setTahun}>
                                    <SelectTrigger className="w-28">
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
                            <Button variant="outline" onClick={handleFilter}>
                                Tampilkan
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Stats Cards — 2 kolom di semua ukuran, 4 kolom di lg ── */}
                <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
                    {[
                        {
                            label: 'Total Diterima',
                            value: formatRupiah(totalDiterima),
                            icon: Wallet,
                            color: 'text-emerald-600',
                            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                            small: true,
                        },
                        {
                            label: 'Total Potongan',
                            value: formatRupiah(totalPotonganAll),
                            icon: TrendingDown,
                            color: 'text-red-600',
                            bg: 'bg-red-50 dark:bg-red-950/30',
                            small: true,
                        },
                        {
                            label: 'Sudah Dibayar',
                            value: `${totalLunas} bulan`,
                            icon: CheckCircle2,
                            color: 'text-green-600',
                            bg: 'bg-green-50 dark:bg-green-950/30',
                            small: false,
                        },
                        {
                            label: 'Belum Dibayar',
                            value: `${totalBelum} bulan`,
                            icon: Clock,
                            color: 'text-amber-600',
                            bg: 'bg-amber-50 dark:bg-amber-950/30',
                            small: false,
                        },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-3 pt-4 pb-4 sm:pt-5">
                                <div
                                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${s.bg}`}
                                >
                                    <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                                    <p className={`font-bold leading-tight ${s.color} ${s.small ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                                        {s.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Daftar Slip ── */}
                <div className="px-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                Riwayat Slip Gaji {tahun}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {slipList.length === 0 ? (
                                <div className="flex flex-col items-center py-16 text-muted-foreground">
                                    <FileText className="mb-3 h-10 w-10 opacity-25" />
                                    <p className="font-medium">Belum ada slip gaji</p>
                                    <p className="text-sm">Slip gaji tahun {tahun} belum tersedia.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile: card per baris */}
                                    <div className="divide-y divide-border sm:hidden">
                                        {slipList.map((slip) => {
                                            const totalPotongan =
                                                Number(slip.potongan_cuti) + Number(slip.potongan_lainnya);
                                            return (
                                                <div
                                                    key={slip.id_penggajian}
                                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold">
                                                            {BULAN_NAMES[slip.bulan]} {slip.tahun}
                                                        </p>
                                                        <p className="font-mono text-xs text-emerald-600 font-semibold">
                                                            {formatRupiah(slip.total_gaji)}
                                                        </p>
                                                        {totalPotongan > 0 && (
                                                            <p className="font-mono text-[11px] text-destructive">
                                                                -{formatRupiah(totalPotongan)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                        <Badge
                                                            className={
                                                                slip.status_pembayaran === 'lunas'
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                            }
                                                        >
                                                            {slip.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs"
                                                            onClick={() => setSelectedSlip(slip)}
                                                        >
                                                            <Eye className="mr-1 h-3.5 w-3.5" />
                                                            Detail
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Desktop: tabel */}
                                    <div className="hidden overflow-x-auto sm:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="py-4">Periode</TableHead>
                                                    <TableHead className="py-4 text-right">Gaji Pokok</TableHead>
                                                    <TableHead className="py-4 text-right">Potongan</TableHead>
                                                    <TableHead className="py-4 text-right">Total Diterima</TableHead>
                                                    <TableHead className="py-4">Status</TableHead>
                                                    <TableHead className="py-4">Tanggal Bayar</TableHead>
                                                    <TableHead className="py-4 text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {slipList.map((slip) => {
                                                    const totalPotongan =
                                                        Number(slip.potongan_cuti) + Number(slip.potongan_lainnya);
                                                    return (
                                                        <TableRow key={slip.id_penggajian} className="hover:bg-muted/30">
                                                            <TableCell className="py-4">
                                                                <p className="text-sm font-semibold">
                                                                    {BULAN_NAMES[slip.bulan]} {slip.tahun}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right font-mono text-sm">
                                                                {formatRupiah(slip.gaji_pokok)}
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
                                                                {formatRupiah(slip.total_gaji)}
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <Badge
                                                                    className={
                                                                        slip.status_pembayaran === 'lunas'
                                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                                    }
                                                                >
                                                                    {slip.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-sm text-muted-foreground">
                                                                {formatTanggal(slip.tanggal_pembayaran)}
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => setSelectedSlip(slip)}
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
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SlipDetailModal
                slip={selectedSlip}
                karyawan={karyawan}
                open={!!selectedSlip}
                onClose={() => setSelectedSlip(null)}
            />
        </AppLayout>
    );
}