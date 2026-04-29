import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Download, CheckCircle2, Clock, User, Briefcase, Calendar, Receipt } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface DetailItem {
    id_detail: number;
    komponen: string;
    jumlah: number;
    keterangan: string;
}

interface PenggajianDetail {
    id_penggajian: number;
    bulan: number;
    tahun: number;
    gaji_pokok: number;
    potongan_cuti: number;
    potongan_lainnya: number;
    total_gaji: number;
    status_pembayaran: 'lunas' | 'belum_lunas';
    tanggal_pembayaran: string | null;
    karyawan: {
        nama: string;
        nik: string;
        jabatan: string;
        foto: string | null;
        tanggal_bergabung: string;
    };
    detail: DetailItem[];
}

interface Props {
    penggajian: PenggajianDetail;
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

const formatTanggal = (tgl: string | null) =>
    tgl ? new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
    header: { marginBottom: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111827' },
    companySubtitle: { fontSize: 10, color: '#6b7280', marginTop: 2 },
    slipTitle: {
        fontSize: 11,
        color: '#4f46e5',
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#eef2ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 16 },
    section: { marginBottom: 16 },
    sectionTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    infoGrid: { flexDirection: 'row', gap: 24 },
    infoCol: { flex: 1 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { fontSize: 9, color: '#6b7280' },
    infoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' },
    table: { width: '100%' },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        marginBottom: 2,
    },
    tableHeaderText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151' },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    tableRowAlt: { backgroundColor: '#fafafa' },
    col1: { flex: 2 },
    col2: { flex: 2 },
    col3: { flex: 1.5, textAlign: 'right' },
    cellText: { fontSize: 9, color: '#374151' },
    cellMuted: { fontSize: 8, color: '#9ca3af', marginTop: 1 },
    cellAmount: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151', textAlign: 'right' },
    cellDeduct: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#dc2626', textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#ecfdf5',
        borderRadius: 4,
        marginTop: 4,
    },
    totalLabel: { flex: 4.5, fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#065f46' },
    totalAmount: { flex: 1.5, fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#059669', textAlign: 'right' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 12 },
    statusLunas: { backgroundColor: '#dcfce7' },
    statusBelum: { backgroundColor: '#fef3c7' },
    statusText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
    footer: {
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: { fontSize: 8, color: '#9ca3af' },
    signBox: { alignItems: 'center', width: 140 },
    signLine: { borderTopWidth: 1, borderTopColor: '#d1d5db', width: 120, marginTop: 40, marginBottom: 4 },
    signLabel: { fontSize: 8, color: '#6b7280' },
});

function SlipPDF({ p }: { p: PenggajianDetail }) {
    const penambahan = p.detail.filter((d) => d.jumlah > 0);
    const potongan = p.detail.filter((d) => d.jumlah < 0);

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.header}>
                    <View style={pdfStyles.headerTop}>
                        <View>
                            <Text style={pdfStyles.companyName}>SLIP GAJI KARYAWAN</Text>
                            <Text style={pdfStyles.companySubtitle}>
                                Periode: {BULAN_NAMES[p.bulan]} {p.tahun}
                            </Text>
                        </View>
                        <Text style={pdfStyles.slipTitle}>#{String(p.id_penggajian).padStart(6, '0')}</Text>
                    </View>
                    <View style={pdfStyles.divider} />
                    <View style={pdfStyles.section}>
                        <Text style={pdfStyles.sectionTitle}>Data Karyawan</Text>
                        <View style={pdfStyles.infoGrid}>
                            <View style={pdfStyles.infoCol}>
                                <View style={pdfStyles.infoRow}>
                                    <Text style={pdfStyles.infoLabel}>Nama</Text>
                                    <Text style={pdfStyles.infoValue}>{p.karyawan.nama}</Text>
                                </View>
                                <View style={pdfStyles.infoRow}>
                                    <Text style={pdfStyles.infoLabel}>NIK</Text>
                                    <Text style={pdfStyles.infoValue}>{p.karyawan.nik}</Text>
                                </View>
                            </View>
                            <View style={pdfStyles.infoCol}>
                                <View style={pdfStyles.infoRow}>
                                    <Text style={pdfStyles.infoLabel}>Jabatan</Text>
                                    <Text style={pdfStyles.infoValue}>{p.karyawan.jabatan}</Text>
                                </View>
                                <View style={pdfStyles.infoRow}>
                                    <Text style={pdfStyles.infoLabel}>Bergabung</Text>
                                    <Text style={pdfStyles.infoValue}>
                                        {formatTanggal(p.karyawan.tanggal_bergabung)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={pdfStyles.divider} />
                </View>

                <View style={pdfStyles.section}>
                    <Text style={pdfStyles.sectionTitle}>Rincian Gaji</Text>
                    <View style={pdfStyles.table}>
                        <View style={pdfStyles.tableHeader}>
                            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col1]}>Komponen</Text>
                            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col2]}>Keterangan</Text>
                            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col3]}>Jumlah</Text>
                        </View>
                        {penambahan.map((d, i) => (
                            <View
                                key={d.id_detail}
                                style={[pdfStyles.tableRow, i % 2 === 1 ? pdfStyles.tableRowAlt : {}]}
                            >
                                <View style={pdfStyles.col1}>
                                    <Text style={pdfStyles.cellText}>{d.komponen}</Text>
                                </View>
                                <View style={pdfStyles.col2}>
                                    <Text style={pdfStyles.cellMuted}>{d.keterangan}</Text>
                                </View>
                                <Text style={[pdfStyles.cellAmount, pdfStyles.col3]}>{formatRupiah(d.jumlah)}</Text>
                            </View>
                        ))}
                        {potongan.map((d) => (
                            <View key={d.id_detail} style={[pdfStyles.tableRow, { backgroundColor: '#fff5f5' }]}>
                                <View style={pdfStyles.col1}>
                                    <Text style={[pdfStyles.cellText, { color: '#dc2626' }]}>{d.komponen}</Text>
                                </View>
                                <View style={pdfStyles.col2}>
                                    <Text style={pdfStyles.cellMuted}>{d.keterangan}</Text>
                                </View>
                                <Text style={[pdfStyles.cellDeduct, pdfStyles.col3]}>{formatRupiah(d.jumlah)}</Text>
                            </View>
                        ))}
                        <View style={pdfStyles.totalRow}>
                            <Text style={pdfStyles.totalLabel}>TOTAL GAJI DITERIMA</Text>
                            <Text style={pdfStyles.totalAmount}>{formatRupiah(p.total_gaji)}</Text>
                        </View>
                    </View>
                    <View
                        style={[
                            pdfStyles.statusBadge,
                            p.status_pembayaran === 'lunas' ? pdfStyles.statusLunas : pdfStyles.statusBelum,
                        ]}
                    >
                        <Text
                            style={[
                                pdfStyles.statusText,
                                { color: p.status_pembayaran === 'lunas' ? '#15803d' : '#92400e' },
                            ]}
                        >
                            {p.status_pembayaran === 'lunas'
                                ? `SUDAH DIBAYAR — ${formatTanggal(p.tanggal_pembayaran)}`
                                : 'BELUM DIBAYAR'}
                        </Text>
                    </View>
                </View>

                <View style={pdfStyles.footer}>
                    <Text style={pdfStyles.footerText}>
                        Dicetak:{' '}
                        {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                    <View style={pdfStyles.signBox}>
                        <Text style={pdfStyles.signLabel}>Mengetahui,</Text>
                        <View style={pdfStyles.signLine} />
                        <Text style={pdfStyles.signLabel}>( Saiful Imaduddin S.Km,. M.Km )</Text>
                        <Text style={pdfStyles.signLabel}>Pimpinan</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export default function PenggajianDetail() {
    const { penggajian: p } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Penggajian', href: '/admin/penggajian' },
        { title: `Slip — ${p.karyawan.nama}`, href: '#' },
    ];

    const penambahan = p.detail.filter((d) => d.jumlah > 0);
    const potongan = p.detail.filter((d) => d.jumlah < 0);
    const fileName = `Slip_Gaji_${p.karyawan.nik}_${BULAN_NAMES[p.bulan]}_${p.tahun}.pdf`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Slip Gaji — ${p.karyawan.nama}`} />

            <div className="space-y-4 pb-6 sm:space-y-6">

                {/* Header */}
                <div className="px-4 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get('/admin/penggajian')}
                        className="mb-3"
                    >
                        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                        Kembali
                    </Button>

                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Slip Gaji</h1>
                            <p className="text-sm text-muted-foreground">
                                {BULAN_NAMES[p.bulan]} {p.tahun} · {p.karyawan.nama}
                            </p>
                        </div>
                        <PDFDownloadLink document={<SlipPDF p={p} />} fileName={fileName} className="w-full sm:w-auto">
                            {({ loading }) => (
                                <Button disabled={loading} className="w-full sm:w-auto">
                                    <Download className="mr-2 h-4 w-4" />
                                    {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>

                <div className="space-y-3 px-4 sm:space-y-4">

                    {/* Info Karyawan — 2 kolom di mobile, 4 di sm ke atas */}
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 sm:gap-x-8">
                                {[
                                    { icon: User, label: 'Nama', value: p.karyawan.nama },
                                    { icon: Receipt, label: 'NIK', value: p.karyawan.nik, mono: true },
                                    { icon: Briefcase, label: 'Jabatan', value: p.karyawan.jabatan },
                                    {
                                        icon: Calendar,
                                        label: 'Bergabung',
                                        value: formatTanggal(p.karyawan.tanggal_bergabung),
                                    },
                                ].map((info) => (
                                    <div key={info.label} className="flex items-start gap-2">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <info.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-muted-foreground">{info.label}</p>
                                            <p className={`text-sm font-semibold truncate ${info.mono ? 'font-mono' : ''}`}>
                                                {info.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Periode & Status */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <Card>
                            <CardContent className="space-y-1 pt-4 pb-4">
                                <p className="text-xs text-muted-foreground">Periode</p>
                                <p className="text-base font-bold sm:text-lg">
                                    {BULAN_NAMES[p.bulan]} {p.tahun}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center justify-between pt-4 pb-4">
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge
                                        className={`mt-1 text-xs ${
                                            p.status_pembayaran === 'lunas'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                        }`}
                                    >
                                        {p.status_pembayaran === 'lunas' ? '✓ Lunas' : 'Belum Lunas'}
                                    </Badge>
                                    {p.tanggal_pembayaran && (
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                                            {formatTanggal(p.tanggal_pembayaran)}
                                        </p>
                                    )}
                                </div>
                                {p.status_pembayaran === 'lunas' ? (
                                    <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500 sm:h-7 sm:w-7" />
                                ) : (
                                    <Clock className="h-6 w-6 shrink-0 text-amber-500 sm:h-7 sm:w-7" />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rincian Gaji */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base">Rincian Komponen Gaji</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">

                            {/* Penambahan */}
                            {penambahan.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Penambahan
                                    </p>
                                    <div className="space-y-1">
                                        {penambahan.map((d) => (
                                            <div
                                                key={d.id_detail}
                                                className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/20 sm:px-4"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-medium truncate">{d.komponen}</p>
                                                    {d.keterangan && (
                                                        <p className="text-[11px] text-muted-foreground truncate">
                                                            {d.keterangan}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="font-mono text-sm font-semibold text-emerald-700 shrink-0">
                                                    +{formatRupiah(d.jumlah)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Potongan */}
                            {potongan.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Potongan
                                    </p>
                                    <div className="space-y-1">
                                        {potongan.map((d) => (
                                            <div
                                                key={d.id_detail}
                                                className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-950/20 sm:px-4"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-medium text-destructive truncate">
                                                        {d.komponen}
                                                    </p>
                                                    {d.keterangan && (
                                                        <p className="text-[11px] text-muted-foreground truncate">
                                                            {d.keterangan}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="font-mono text-sm font-semibold text-destructive shrink-0">
                                                    {formatRupiah(d.jumlah)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className="flex flex-col gap-1 rounded-xl bg-emerald-600 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <div>
                                    <p className="text-sm font-medium text-emerald-100">Total Gaji Diterima</p>
                                    <p className="text-[11px] text-emerald-200">
                                        {BULAN_NAMES[p.bulan]} {p.tahun}
                                    </p>
                                </div>
                                <p className="font-mono text-xl font-bold sm:text-2xl">
                                    {formatRupiah(p.total_gaji)}
                                </p>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}