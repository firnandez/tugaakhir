import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw, QrCode, Clock } from 'lucide-react';

interface QrData {
    id: number;
    tanggal: string;
    tipe: 'masuk' | 'pulang';
    qr_url: string | null;
    is_used: boolean;
    expired_at: string;
    is_valid: boolean;
    is_expired: boolean;
}

interface Props {
    qrMasuk: QrData | null;
    qrPulang: QrData | null;
    today: string;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'QR Absensi', href: '/admin/qr-absensi' },
];

function QrCard({
    title,
    tipe,
    qr,
    onGenerate,
}: {
    title: string;
    tipe: 'masuk' | 'pulang';
    qr: QrData | null;
    onGenerate: () => void;
}) {
    const handleDownload = () => {
        if (!qr) return;
        window.open(`/admin/qr-absensi/${qr.id}/download`, '_blank');
    };

    return (
        <Card className="flex-1">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        <CardDescription>
                            {qr ? `Berlaku hingga ${qr.expired_at} WIB` : 'Belum di-generate hari ini'}
                        </CardDescription>
                    </div>
                    {qr && (
                        <Badge
                            variant={
                                qr.is_used
                                    ? 'secondary'
                                    : qr.is_expired
                                      ? 'destructive'
                                      : qr.is_valid
                                        ? 'default'
                                        : 'destructive'
                            }
                        >
                            {qr.is_used
                                ? 'Sudah Digunakan'
                                : qr.is_expired
                                  ? 'Kedaluwarsa'
                                  : qr.is_valid
                                    ? 'Aktif'
                                    : 'Tidak Valid'}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {qr?.qr_url ? (
                    <div className="flex justify-center rounded-lg border bg-white p-4">
                        <img src={qr.qr_url} alt={`QR Absensi ${tipe}`} className="h-56 w-56" />
                    </div>
                ) : (
                    <div className="flex h-56 items-center justify-center rounded-lg border border-dashed bg-muted text-muted-foreground">
                        <div className="text-center">
                            <QrCode className="mx-auto mb-2 h-12 w-12 opacity-30" />
                            <p className="text-sm">QR belum tersedia</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={onGenerate}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {qr ? 'Generate' : 'Generate QR'}
                    </Button>
                    {qr?.qr_url && (
                        <Button variant="default" className="flex-1" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function QrAbsensiIndex() {
    const { qrMasuk, qrPulang, today } = usePage<Props>().props;

    const handleGenerate = (tipe: 'masuk' | 'pulang') => {
        router.post('/admin/qr-absensi/generate', { tipe }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Absensi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">QR Absensi</h1>
                    <p className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {today}
                    </p>
                </div>

                {/* QR Cards */}
                <div className="flex flex-col gap-6 px-4 md:flex-row">
                    <QrCard
                        title="QR Absensi Masuk"
                        tipe="masuk"
                        qr={qrMasuk}
                        onGenerate={() => handleGenerate('masuk')}
                    />
                    <QrCard
                        title="QR Absensi Pulang"
                        tipe="pulang"
                        qr={qrPulang}
                        onGenerate={() => handleGenerate('pulang')}
                    />
                </div>

                {/* Keterangan */}
                <div className="px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Keterangan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                • QR Absensi Masuk di-generate otomatis setiap hari pukul 06:00 dan berlaku hingga
                                12:00.
                            </p>
                            <p>
                                • QR Absensi Pulang di-generate otomatis setiap hari pukul 15:00 dan berlaku hingga
                                23:59.
                            </p>
                            <p>
                                • Setiap QR hanya dapat digunakan sekali per sesi. Setelah dipakai absen, QR langsung
                                tidak berlaku.
                            </p>
                            <p>
                                • Gunakan tombol <strong>Regenerate</strong> jika QR perlu diperbarui secara manual.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
