import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';

interface Jabatan {
    id: number;
    nama_jabatan: string;
    gaji_pokok: number;
    deskripsi: string | null;
}

interface Props {
    jabatan?: Jabatan;
}

export default function JabatanForm({ jabatan }: Props) {
    const isEdit = !!jabatan;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Jabatan', href: '/admin/jabatan' },
        { title: isEdit ? 'Edit Jabatan' : 'Tambah Jabatan', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        nama_jabatan: jabatan?.nama_jabatan ?? '',
        gaji_pokok: jabatan?.gaji_pokok?.toString() ?? '',
        deskripsi: jabatan?.deskripsi ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/jabatan/${jabatan.id}`);
        } else {
            post('/admin/jabatan');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEdit
                            ? 'Perbarui informasi jabatan'
                            : 'Tambahkan posisi kerja baru ke sistem'}
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informasi Jabatan</CardTitle>
                        <CardDescription>
                            Gaji pokok akan digunakan sebagai dasar perhitungan
                            penggajian karyawan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_jabatan">
                                    Nama Jabatan{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nama_jabatan"
                                    value={data.nama_jabatan}
                                    onChange={(e) =>
                                        setData('nama_jabatan', e.target.value)
                                    }
                                    placeholder="contoh: Apoteker, Kasir, Manager"
                                />
                                <InputError message={errors.nama_jabatan} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gaji_pokok">
                                    Gaji Pokok (Rp){' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="gaji_pokok"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={data.gaji_pokok}
                                    onChange={(e) =>
                                        setData('gaji_pokok', e.target.value)
                                    }
                                    placeholder="contoh: 5000000"
                                />
                                {data.gaji_pokok && (
                                    <p className="text-sm text-muted-foreground">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            maximumFractionDigits: 0,
                                        }).format(Number(data.gaji_pokok))}
                                    </p>
                                )}
                                <InputError message={errors.gaji_pokok} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) =>
                                        setData('deskripsi', e.target.value)
                                    }
                                    placeholder="Deskripsi singkat tugas dan tanggung jawab jabatan ini"
                                    rows={4}
                                />
                                <InputError message={errors.deskripsi} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Menyimpan...'
                                        : isEdit
                                          ? 'Perbarui Jabatan'
                                          : 'Tambah Jabatan'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/jabatan">Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
