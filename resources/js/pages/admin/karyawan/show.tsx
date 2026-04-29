import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Karyawan {
    id: number;
    nik: string;
    nama_lengkap: string;
    alamat: string | null;
    no_telepon: string | null;
    email: string | null;
    foto_url: string | null;
    qr_code_url: string | null;
    status: string;
    tanggal_bergabung: string;
    jabatan: { id: number; nama_jabatan: string; gaji_pokok: number };
    shift: {
        id: number;
        nama_shift: string;
        jam_masuk: string;
        jam_pulang: string;
    };
    user: { id: number; email: string };
}

interface Props {
    karyawan: Karyawan;
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

export default function ShowKaryawan({ karyawan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Karyawan', href: '/admin/karyawan' },
        { title: karyawan.nama_lengkap, href: '#' },
    ];

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={karyawan.nama_lengkap} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{karyawan.nama_lengkap}</h1>
                        <p className="text-muted-foreground">NIK: {karyawan.nik}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/karyawan">Kembali</Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/admin/karyawan/${karyawan.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 mb-4">
                    {/* ── Profil ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Karyawan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={karyawan.foto_url ?? undefined} />
                                    <AvatarFallback className="text-lg">
                                        {getInitials(karyawan.nama_lengkap)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xl font-semibold">{karyawan.nama_lengkap}</p>
                                    <p className="text-muted-foreground">{karyawan.jabatan.nama_jabatan}</p>
                                    <Badge
                                        className="mt-1"
                                        variant={karyawan.status === 'aktif' ? 'default' : 'secondary'}
                                    >
                                        {karyawan.status}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground">Jabatan</p>
                                    <p className="font-medium">{karyawan.jabatan.nama_jabatan}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Gaji Pokok</p>
                                    <p className="font-medium">{formatRupiah(karyawan.jabatan.gaji_pokok)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Shift Kerja</p>
                                    <p className="font-medium">
                                        {karyawan.shift.nama_shift} ({karyawan.shift.jam_masuk.slice(0, 5)}–
                                        {karyawan.shift.jam_pulang.slice(0, 5)})
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tanggal Bergabung</p>
                                    <p className="font-medium">
                                        {new Date(karyawan.tanggal_bergabung).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">No. Telepon</p>
                                    <p className="font-medium">{karyawan.no_telepon || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Email Karyawan</p>
                                    <p className="font-medium">{karyawan.email || '-'}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-muted-foreground">Alamat</p>
                                    <p className="font-medium">{karyawan.alamat || '-'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">Email Akun Login</p>
                                <p className="font-medium">{karyawan.user.email}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
