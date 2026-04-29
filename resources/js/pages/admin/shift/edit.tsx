import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';

interface Shift {
    id: number;
    nama_shift: string;
    jam_masuk: string;
    jam_pulang: string;
    toleransi_menit: number;
}

interface Props {
    shift?: Shift;
}

export default function ShiftForm({ shift }: Props) {
    const isEdit = !!shift;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Shift', href: '/admin/shift' },
        { title: isEdit ? 'Edit Shift' : 'Tambah Shift', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        nama_shift: shift?.nama_shift ?? '',
        jam_masuk: shift?.jam_masuk?.slice(0, 5) ?? '', // format HH:MM
        jam_pulang: shift?.jam_pulang?.slice(0, 5) ?? '',
        toleransi_menit: shift?.toleransi_menit?.toString() ?? '15',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(`/admin/shift/${shift.id}`) : post('/admin/shift');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Shift' : 'Tambah Shift'} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Shift' : 'Tambah Shift'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEdit
                            ? 'Perbarui jadwal shift'
                            : 'Tambahkan pola kerja baru ke sistem'}
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informasi Shift</CardTitle>
                        <CardDescription>
                            Toleransi keterlambatan digunakan untuk kalkulasi
                            absensi otomatis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_shift">
                                    Nama Shift{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nama_shift"
                                    value={data.nama_shift}
                                    onChange={(e) =>
                                        setData('nama_shift', e.target.value)
                                    }
                                    placeholder="contoh: Shift Pagi, Shift Malam"
                                />
                                <InputError message={errors.nama_shift} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="jam_masuk">
                                        Jam Masuk{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="jam_masuk"
                                        type="time"
                                        value={data.jam_masuk}
                                        onChange={(e) =>
                                            setData('jam_masuk', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.jam_masuk} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="jam_pulang">
                                        Jam Pulang{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="jam_pulang"
                                        type="time"
                                        value={data.jam_pulang}
                                        onChange={(e) =>
                                            setData(
                                                'jam_pulang',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.jam_pulang} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="toleransi_menit">
                                    Toleransi Keterlambatan (menit){' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="toleransi_menit"
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={data.toleransi_menit}
                                    onChange={(e) =>
                                        setData(
                                            'toleransi_menit',
                                            e.target.value,
                                        )
                                    }
                                    className="max-w-xs"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Karyawan dianggap terlambat jika masuk lebih
                                    dari {data.toleransi_menit} menit setelah
                                    jam masuk
                                </p>
                                <InputError message={errors.toleransi_menit} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Menyimpan...'
                                        : isEdit
                                          ? 'Perbarui Shift'
                                          : 'Tambah Shift'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/shift">Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
