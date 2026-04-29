import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';
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
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { useState } from 'react';

interface Jabatan {
    id: number;
    nama_jabatan: string;
}
interface Shift {
    id: number;
    nama_shift: string;
    jam_masuk: string;
    jam_pulang: string;
}

interface Props {
    jabatanList: Jabatan[];
    shiftList: Shift[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Karyawan',
        href: '/admin/karyawan',
    },
    {
        title: 'Tambah Karyawan',
        href: '#',
    },
];

export default function CreateKaryawan({
    jabatanList,
    shiftList,
}: Props) {
    const [
        fotoPreview,
        setFotoPreview,
    ] = useState<string | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<{
        nik: string;
        nama_lengkap: string;
        jabatan_id: string;
        shift_id: string;
        alamat: string;
        no_telepon: string;
        email: string;
        foto: File | null;
        status: string;
        tanggal_bergabung: string;
        email_user: string;
        password: string;
        password_confirmation: string;
    }>({
        nik: '',
        nama_lengkap: '',
        jabatan_id: '',
        shift_id: '',
        alamat: '',
        no_telepon: '',
        email: '',
        foto: null,
        status: 'aktif',
        tanggal_bergabung: '',
        email_user: '',
        password: '',
        password_confirmation: '',
    });

    const handleFotoChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            e.target.files?.[0];
        if (file) {
            setData('foto', file);
            setFotoPreview(
                URL.createObjectURL(
                    file,
                ),
            );
        }
    };

    const handleSubmit = (
        e: React.FormEvent,
    ) => {
        e.preventDefault();
        post('/admin/karyawan', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Tambah Karyawan" />

            <div className="space-y-6">
                {/* Header — konsisten dengan halaman index (pakai p-4) */}
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tambah Karyawan
                    </h1>
                    <p className="text-muted-foreground">
                        Data akun login
                        akan dibuat
                        otomatis
                        bersamaan dengan
                        data karyawan
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-6 px-4"
                >
                    {/* ── Bagian 1: Data Akun ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Data
                                Akun
                                Login
                            </CardTitle>
                            <CardDescription>
                                Karyawan
                                akan
                                menggunakan
                                email
                                dan
                                password
                                ini
                                untuk
                                masuk ke
                                sistem
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="email_user">
                                    Email
                                    Akun{' '}
                                    <span className="text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Input
                                    id="email_user"
                                    type="email"
                                    value={
                                        data.email_user
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setData(
                                            'email_user',
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="email@apotek.com"
                                />
                                <InputError
                                    message={
                                        errors.email_user
                                    }
                                />
                            </div>
                            <div />{' '}
                            {/* spacer */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Password{' '}
                                    <span className="text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={
                                        data.password
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setData(
                                            'password',
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Minimal 8 karakter"
                                />
                                <InputError
                                    message={
                                        errors.password
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi
                                    Password{' '}
                                    <span className="text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={
                                        data.password_confirmation
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setData(
                                            'password_confirmation',
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Ulangi password"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Bagian 2: Data Karyawan ── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Data
                                Karyawan
                            </CardTitle>
                            <CardDescription>
                                QR Code
                                akan
                                digenerate
                                otomatis
                                berdasarkan
                                NIK
                                karyawan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Foto */}
                            <div className="flex items-start gap-6">
                                <div className="shrink-0">
                                    {fotoPreview ? (
                                        <img
                                            src={
                                                fotoPreview
                                            }
                                            alt="Preview"
                                            className="h-24 w-24 rounded-full border object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-muted text-sm text-muted-foreground">
                                            Foto
                                        </div>
                                    )}
                                </div>
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="foto">
                                        Foto
                                        Karyawan
                                    </Label>
                                    <Input
                                        id="foto"
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleFotoChange
                                        }
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Format
                                        JPG/PNG,
                                        maks
                                        2MB
                                    </p>
                                    <InputError
                                        message={
                                            errors.foto
                                        }
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="nik">
                                        NIK{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="nik"
                                        value={
                                            data.nik
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'nik',
                                                e
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Nomor Induk Karyawan"
                                        maxLength={
                                            20
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors.nik
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nama_lengkap">
                                        Nama
                                        Lengkap{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="nama_lengkap"
                                        value={
                                            data.nama_lengkap
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'nama_lengkap',
                                                e
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Nama lengkap karyawan"
                                    />
                                    <InputError
                                        message={
                                            errors.nama_lengkap
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="jabatan_id">
                                        Jabatan{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={
                                            data.jabatan_id
                                        }
                                        onValueChange={(
                                            v,
                                        ) =>
                                            setData(
                                                'jabatan_id',
                                                v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jabatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jabatanList.map(
                                                (
                                                    j,
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            j.id
                                                        }
                                                        value={j.id.toString()}
                                                    >
                                                        {
                                                            j.nama_jabatan
                                                        }
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            errors.jabatan_id
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="shift_id">
                                        Shift{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={
                                            data.shift_id
                                        }
                                        onValueChange={(
                                            v,
                                        ) =>
                                            setData(
                                                'shift_id',
                                                v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shiftList.map(
                                                (
                                                    s,
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            s.id
                                                        }
                                                        value={s.id.toString()}
                                                    >
                                                        {
                                                            s.nama_shift
                                                        }{' '}
                                                        (
                                                        {s.jam_masuk.slice(
                                                            0,
                                                            5,
                                                        )}
                                                        –
                                                        {s.jam_pulang.slice(
                                                            0,
                                                            5,
                                                        )}
                                                        )
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            errors.shift_id
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="no_telepon">
                                        No.
                                        Telepon
                                    </Label>
                                    <Input
                                        id="no_telepon"
                                        value={
                                            data.no_telepon
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'no_telepon',
                                                e
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="08xx-xxxx-xxxx"
                                    />
                                    <InputError
                                        message={
                                            errors.no_telepon
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email
                                        Karyawan
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={
                                            data.email
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'email',
                                                e
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Email pribadi (opsional)"
                                    />
                                    <InputError
                                        message={
                                            errors.email
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_bergabung">
                                        Tanggal
                                        Bergabung{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="tanggal_bergabung"
                                        type="date"
                                        value={
                                            data.tanggal_bergabung
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'tanggal_bergabung',
                                                e
                                                    .target
                                                    .value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors.tanggal_bergabung
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">
                                        Status{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={
                                            data.status
                                        }
                                        onValueChange={(
                                            v,
                                        ) =>
                                            setData(
                                                'status',
                                                v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aktif">
                                                Aktif
                                            </SelectItem>
                                            <SelectItem value="nonaktif">
                                                Nonaktif
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            errors.status
                                        }
                                    />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="alamat">
                                        Alamat
                                    </Label>
                                    <Textarea
                                        id="alamat"
                                        value={
                                            data.alamat
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            setData(
                                                'alamat',
                                                e
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Alamat lengkap karyawan"
                                        rows={
                                            3
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors.alamat
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 p-4">
                        <Button
                            type="submit"
                            disabled={
                                processing
                            }
                        >
                            {processing
                                ? 'Menyimpan...'
                                : 'Tambah Karyawan'}
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                        >
                            <Link href="/admin/karyawan">
                                Batal
                            </Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
