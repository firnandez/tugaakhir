import {
    Head,
    Link,
    router,
    usePage,
} from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { useState } from 'react';

interface Karyawan {
    id_karyawan: number;
    nik: string;
    nama_lengkap: string;
    foto_url: string | null;
    qr_code_url: string | null;
    status: 'aktif' | 'nonaktif';
    tanggal_bergabung: string;
    jabatan: {
        id: number;
        nama_jabatan: string;
    };
    shift: {
        id: number;
        nama_shift: string;
    };
    user: { id: number; email: string };
}

interface Jabatan {
    id: number;
    nama_jabatan: string;
}

interface Props {
    karyawan: {
        data: Karyawan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    jabatanList: Jabatan[];
    filters: {
        search?: string;
        status?: string;
        jabatan_id?: string;
    };
    [key: string]: any;
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
];

export default function KaryawanIndex() {
    const {
        karyawan,
        jabatanList,
        filters,
    } = usePage<Props>().props;
    const [search, setSearch] =
        useState(filters?.search || '');
    const [status, setStatus] =
        useState(
            filters?.status || 'all',
        );
    const [jabatanId, setJabatanId] =
        useState(
            filters?.jabatan_id ||
                'all',
        );
    const [
        deletingItem,
        setDeletingItem,
    ] = useState<Karyawan | null>(null);

    const handleSearch = (
        e: React.FormEvent,
    ) => {
        e.preventDefault();
        router.get(
            '/admin/karyawan',
            {
                search,
                status:
                    status === 'all'
                        ? ''
                        : status,
                jabatan_id:
                    jabatanId === 'all'
                        ? ''
                        : jabatanId,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(
            `/admin/karyawan/${deletingItem.id_karyawan}`,
            {
                preserveScroll: true,
                onSuccess: () =>
                    setDeletingItem(
                        null,
                    ),
            },
        );
    };

    const getInitials = (
        name: string,
    ) =>
        name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Manajemen Karyawan" />

            <div className="space-y-6">
                {/* Header — konsisten dengan JabatanIndex (pakai p-4) */}
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Manajemen
                            Karyawan
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola data
                            karyawan dan
                            akun sistem
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/karyawan/create">
                            Tambah
                            Karyawan
                        </Link>
                    </Button>
                </div>

                {/* Card Header — tanpa wrapper <Card> agar konsisten dengan JabatanIndex */}
                <CardHeader>
                    <CardTitle>
                        Daftar Karyawan
                    </CardTitle>
                    <CardDescription>
                        Total:{' '}
                        {karyawan.total}{' '}
                        karyawan
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Filter Form */}
                    <form
                        onSubmit={
                            handleSearch
                        }
                        className="mb-6 flex flex-wrap gap-3"
                    >
                        <Input
                            placeholder="Cari nama atau NIK..."
                            value={
                                search
                            }
                            onChange={(
                                e,
                            ) =>
                                setSearch(
                                    e
                                        .target
                                        .value,
                                )
                            }
                            className="max-w-xs"
                        />
                        <Select
                            value={
                                jabatanId
                            }
                            onValueChange={
                                setJabatanId
                            }
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua
                                    Jabatan
                                </SelectItem>
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
                        <Select
                            value={
                                status
                            }
                            onValueChange={
                                setStatus
                            }
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua
                                    Status
                                </SelectItem>
                                <SelectItem value="aktif">
                                    Aktif
                                </SelectItem>
                                <SelectItem value="nonaktif">
                                    Nonaktif
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            type="submit"
                            variant="secondary"
                        >
                            Filter
                        </Button>
                    </form>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="py-4">
                                        Karyawan
                                    </TableHead>
                                    <TableHead className="py-4">
                                        NIK
                                    </TableHead>
                                    <TableHead className="py-4">
                                        Jabatan
                                    </TableHead>
                                    <TableHead className="py-4">
                                        Shift
                                    </TableHead>
                                    <TableHead className="py-4">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-4">
                                        Bergabung
                                    </TableHead>
                                    <TableHead className="py-4 text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {karyawan
                                    .data
                                    .length ===
                                0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                7
                                            }
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Belum
                                            ada
                                            karyawan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    karyawan.data.map(
                                        (
                                            item,
                                        ) => (
                                            <TableRow
                                                key={
                                                    item.id_karyawan
                                                }
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={
                                                                    item.foto_url ??
                                                                    undefined
                                                                }
                                                                alt={
                                                                    item.nama_lengkap
                                                                }
                                                            />
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(
                                                                    item.nama_lengkap,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="leading-none font-medium">
                                                                {
                                                                    item.nama_lengkap
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {
                                                                    item
                                                                        .user
                                                                        .email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 font-mono text-sm">
                                                    {
                                                        item.nik
                                                    }
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {
                                                        item
                                                            .jabatan
                                                            .nama_jabatan
                                                    }
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {
                                                        item
                                                            .shift
                                                            .nama_shift
                                                    }
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge
                                                        variant={
                                                            item.status ===
                                                            'aktif'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {
                                                            item.status
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {new Date(
                                                        item.tanggal_bergabung,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/karyawan/${item.id_karyawan}`}
                                                            >
                                                                Detail
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/karyawan/${item.id_karyawan}/edit`}
                                                            >
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Dialog
                                                            open={
                                                                deletingItem?.id_karyawan ===
                                                                item.id_karyawan
                                                            }
                                                            onOpenChange={(
                                                                open,
                                                            ) =>
                                                                !open &&
                                                                setDeletingItem(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            <DialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setDeletingItem(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogTitle>
                                                                    Hapus
                                                                    Karyawan
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Yakin
                                                                    ingin
                                                                    menghapus
                                                                    karyawan{' '}
                                                                    <strong>
                                                                        "
                                                                        {
                                                                            item.nama_lengkap
                                                                        }
                                                                        "
                                                                    </strong>

                                                                    ?
                                                                    Akun
                                                                    login,
                                                                    foto,
                                                                    dan
                                                                    QR
                                                                    Code
                                                                    karyawan
                                                                    ini
                                                                    juga
                                                                    akan
                                                                    ikut
                                                                    dihapus.
                                                                    Tindakan
                                                                    ini
                                                                    tidak
                                                                    dapat
                                                                    dibatalkan.
                                                                </DialogDescription>
                                                                <DialogFooter className="gap-2">
                                                                    <DialogClose
                                                                        asChild
                                                                    >
                                                                        <Button variant="secondary">
                                                                            Batal
                                                                        </Button>
                                                                    </DialogClose>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={
                                                                            handleDelete
                                                                        }
                                                                    >
                                                                        Hapus
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {karyawan.last_page >
                        1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan{' '}
                                {(karyawan.current_page -
                                    1) *
                                    karyawan.per_page +
                                    1}
                                –
                                {Math.min(
                                    karyawan.current_page *
                                        karyawan.per_page,
                                    karyawan.total,
                                )}{' '}
                                dari{' '}
                                {
                                    karyawan.total
                                }
                            </p>
                            <div className="flex gap-2">
                                {karyawan.links.map(
                                    (
                                        link,
                                        i,
                                    ) => (
                                        <Button
                                            key={
                                                i
                                            }
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            disabled={
                                                !link.url
                                            }
                                            onClick={() =>
                                                link.url &&
                                                router.get(
                                                    link.url,
                                                )
                                            }
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>
        </AppLayout>
    );
}
