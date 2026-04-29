import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import {
    Wallet, TrendingDown, CheckCircle2, Clock, Download, Eye,
    User, Briefcase, ChevronRight,
} from 'lucide-react';
import {
    PDFDownloadLink, Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

interface SlipItem {
    id_penggajian: number;
    bulan: number;
    tahun: number;
    gaji_pokok: number;
    potongan_cuti: number;
    potongan_lainnya: number;
    total_gaji: number;
    status_pembayaran: 'lunas' | 'belum_lunas';
    tanggal_pembayaran: string | null;
}

interface Props {
    slipList: SlipItem[];
    karyawan: { nama: string; nik: string; jabatan: string };
    filterTahun: number;
    [key: string]: any;
}

const BULAN_NAMES = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const formatTanggal = (tgl: string | null) =>
    tgl ? new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Slip Gaji', href: '/slip-gaji' },
];


const miniPdfStyles = StyleSheet.create({
    page: { padding: 36, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
    title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#111827' },
    sub: { fontSize: 10, color: '#6b7280', marginBottom: 20 },
    divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { fontSize: 10, color: '#6b7280' },
    value: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
        backgroundColor: '#ecfdf5', padding: 10, borderRadius: 4 },
    totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#065f46' },
    totalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#059669' },
    deductValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#dc2626' },
    statusBox: { marginTop: 14, padding: 8, borderRadius: 4 },
    statusText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
});

function SlipMiniPDF({ slip, karyawan }: { slip: SlipItem; karyawan: Props['karyawan'] }) {
    const totalPotongan = slip.potongan_cuti + slip.potongan_lainnya;
    return (
        <Document>
            <Page size="A5" style={miniPdfStyles.page}>
                <Text style={miniPdfStyles.title}>SLIP GAJI</Text>
                <Text style={miniPdfStyles.sub}>
                    Periode: {BULAN_NAMES[slip.bulan]} {slip.tahun}
                </Text>
                <View style={miniPdfStyles.divider} />
                <View style={miniPdfStyles.row}>
                    <Text style={miniPdfStyles.label}>Nama</Text>
                    <Text style={miniPdfStyles.value}>{karyawan.nama}</Text>
                </View>
                <View style={miniPdfStyles.row}>
                    <Text style={miniPdfStyles.label}>NIK</Text>
                    <Text style={miniPdfStyles.value}>{karyawan.nik}</Text>
                </View>
                <View style={miniPdfStyles.row}>
                    <Text style={miniPdfStyles.label}>Jabatan</Text>
                    <Text style={miniPdfStyles.value}>{karyawan.jabatan}</Text>
                </View>
                <View style={[miniPdfStyles.divider, { marginTop: 12 }]} />
                <View style={miniPdfStyles.row}>
                    <Text style={miniPdfStyles.label}>Gaji Pokok</Text>
                    <Text style={miniPdfStyles.value}>{formatRupiah(slip.gaji_pokok)}</Text>
                </View>
                {totalPotongan > 0 && (
                    <View style={miniPdfStyles.row}>
                        <Text style={miniPdfStyles.label}>Total Potongan</Text>
                        <Text style={miniPdfStyles.deductValue}>-{formatRupiah(totalPotongan)}</Text>
                    </View>
                )}
                <View style={miniPdfStyles.totalRow}>
                    <Text style={miniPdfStyles.totalLabel}>TOTAL DITERIMA</Text>
                    <Text style={miniPdfStyles.totalValue}>{formatRupiah(slip.total_gaji)}</Text>
                </View>
                <View style={[miniPdfStyles.statusBox, {
                    backgroundColor: slip.status_pembayaran === 'lunas' ? '#dcfce7' : '#fef3c7',
                }]}>
                    <Text style={[miniPdfStyles.statusText, {
                        color: slip.status_pembayaran === 'lunas' ? '#15803d' : '#92400e',
                    }]}>
                        {slip.status_pembayaran === 'lunas'
                            ? `SUDAH DIBAYAR — ${formatTanggal(slip.tanggal_pembayaran)}`
                            : 'BELUM DIBAYAR'}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

function SlipDetailModal({ slip, karyawan, onClose }: {
    slip: SlipItem;
    karyawan: Props['karyawan'];
    onClose: () => void;
}) {
    const totalPotongan = slip.potongan_cuti + slip.potongan_lainnya;
    const fileName = `Slip_${karyawan.nik}_${BULAN_NAMES[slip.bulan]}_${slip.tahun}.pdf`;

    return (
        <Dialog open onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogTitle className="flex items-center justify-between">
                    <span>Slip Gaji — {BULAN_NAMES[slip.bulan]} {slip.tahun}</span>
                    <PDFDownloadLink document={<SlipMiniPDF slip={slip} karyawan={karyawan} />} fileName={fileName}>
                        {({ loading }) => (
                            <Button size="sm" variant="outline" disabled={loading} className="ml-2">
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                PDF
                            </Button>
                        )}
                    </PDFDownloadLink>
                </DialogTitle>

                <div className="space-y-4 py-2">
                    {/* Karyawan info */}
                    <div className="rounded-xl border bg-muted/30 px-4 py-3">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Nama', value: karyawan.nama },
                                { label: 'NIK', value: karyawan.nik, mono: true },
                                { label: 'Jabatan', value: karyawan.jabatan },
                                { label: 'Periode', value: `${BULAN_NAMES[slip.bulan]} ${slip.tahun}` },
                            ].map(i => (
                                <div key={i.label}>
                                    <p className="text-[10px] text-muted-foreground">{i.label}</p>
                                    <p className={`text-sm font-semibold ${i.mono ? 'font-mono' : ''}`}>{i.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Komponen */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/20">
                            <p className="text-sm font-medium">Gaji Pokok</p>
                            <p className="font-mono text-sm font-semibold text-emerald-700">
                                +{formatRupiah(slip.gaji_pokok)}
                            </p>
                        </div>
                        {slip.potongan_lainnya > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2.5 dark:bg-red-950/20">
                                <p className="text-sm text-destructive">Potongan Alpha</p>
                                <p className="font-mono text-sm font-semibold text-destructive">
                                    -{formatRupiah(slip.potongan_lainnya)}
                                </p>
                            </div>
                        )}
                        {slip.potongan_cuti > 0 && (
                            <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2.5 dark:bg-red-950/20">
                                <p className="text-sm text-destructive">Potongan Cuti</p>
                                <p className="font-mono text-sm font-semibold text-destructive">
                                    -{formatRupiah(slip.potongan_cuti)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-600 px-5 py-4 text-white">
                        <p className="font-medium text-emerald-100">Total Diterima</p>
                        <p className="font-mono text-xl font-bold">{formatRupiah(slip.total_gaji)}</p>
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
                        slip.status_pembayaran === 'lunas'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/20'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                    }`}>
                        {slip.status_pembayaran === 'lunas'
                            ? <><CheckCircle2 className="h-4 w-4" /> Sudah dibayar {formatTanggal(slip.tanggal_pembayaran)}</>
                            : <><Clock className="h-4 w-4" /> Belum dibayar</>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function SlipGaji() {
    const { slipList, karyawan, filterTahun } = usePage<Props>().props;
    const [tahun, setTahun]       = useState(filterTahun.toString());
    const [viewSlip, setViewSlip] = useState<SlipItem | null>(null);

    const currentYear = new Date().getFullYear();
    const tahunOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

    const totalTahunIni = slipList.reduce((s, sl) => s + sl.total_gaji, 0);
    const totalPotonganTahunIni = slipList.reduce((s, sl) => s + sl.potongan_cuti + sl.potongan_lainnya, 0);
    const sudahLunas = slipList.filter(sl => sl.status_pembayaran === 'lunas').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Slip Gaji Saya" />
            <div className="space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Slip Gaji Saya</h1>
                        <p className="text-sm text-muted-foreground">
                            Riwayat penggajian bulanan Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={tahun} onValueChange={v => {
                            setTahun(v);
                            router.get('/slip-gaji', { tahun: v }, { preserveState: true });
                        }}>
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {tahunOptions.map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ── Info karyawan ── */}
                <Card>
                    <CardContent className="flex flex-wrap items-center gap-6 pt-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/40">
                            <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">{karyawan.nama}</p>
                            <p className="text-sm text-muted-foreground font-mono">{karyawan.nik}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{karyawan.jabatan}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Ringkasan tahun ── */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: `Total Gaji ${tahun}`, value: formatRupiah(totalTahunIni), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                        { label: 'Total Potongan', value: formatRupiah(totalPotonganTahunIni), icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
                        { label: 'Slip Terbayar', value: `${sudahLunas} / ${slipList.length}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-3 pt-5">
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                                    <s.icon className={`h-5 w-5 ${s.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                                    <p className={`text-sm font-bold truncate ${s.color}`}>{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── List slip per bulan ── */}
                <div className="space-y-2">
                    {slipList.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
                                <Wallet className="mb-3 h-10 w-10 opacity-25" />
                                <p className="font-medium">Belum ada slip gaji tahun {tahun}</p>
                            </CardContent>
                        </Card>
                    ) : slipList.map(slip => {
                        const totalPotongan = slip.potongan_cuti + slip.potongan_lainnya;
                        return (
                            <Card key={slip.id_penggajian}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => setViewSlip(slip)}>
                                <CardContent className="flex items-center gap-4 py-4">
                                    {/* Bulan badge */}
                                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                                        <span className="text-[10px] font-semibold text-indigo-500">{slip.tahun}</span>
                                        <span className="text-sm font-bold text-indigo-700">{BULAN_NAMES[slip.bulan].slice(0, 3)}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{BULAN_NAMES[slip.bulan]} {slip.tahun}</p>
                                            <Badge
                                                className={`text-[10px] ${slip.status_pembayaran === 'lunas'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}`}
                                            >
                                                {slip.status_pembayaran === 'lunas' ? '✓ Lunas' : '⏳ Pending'}
                                            </Badge>
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                                            <span>Gaji Pokok: {formatRupiah(slip.gaji_pokok)}</span>
                                            {totalPotongan > 0 && (
                                                <span className="text-destructive">
                                                    Potongan: -{formatRupiah(totalPotongan)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-mono text-lg font-bold text-emerald-600">
                                            {formatRupiah(slip.total_gaji)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">yang diterima</p>
                                    </div>

                                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            {viewSlip && (
                <SlipDetailModal
                    slip={viewSlip}
                    karyawan={karyawan}
                    onClose={() => setViewSlip(null)}
                />
            )}
        </AppLayout>
    );
}