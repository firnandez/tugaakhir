import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Jabatan {
    id: number;
    nama_jabatan: string;
    gaji_pokok: number;
    deskripsi: string | null;
    karyawan_count: number;
    created_at: string;
}

interface Props {
    jabatan: {
        data: Jabatan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { search?: string };
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Jabatan', href: '/admin/jabatan' },
];

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

// ─── Form Dialog (Tambah & Edit) ─────────
function JabatanFormDialog({
    jabatan,
    open,
    onOpenChange,
}: {
    jabatan?: Jabatan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEdit = !!jabatan;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_jabatan: jabatan?.nama_jabatan ?? '',
        gaji_pokok: jabatan?.gaji_pokok?.toString() ?? '',
        deskripsi: jabatan?.deskripsi ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/jabatan/${jabatan.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post('/admin/jabatan', {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Perbarui informasi jabatan yang sudah ada.'
                            : 'Tambahkan posisi kerja baru ke sistem.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                {formatRupiah(Number(data.gaji_pokok))}
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
                            placeholder="Deskripsi singkat tugas dan tanggung jawab"
                            rows={3}
                        />
                        <InputError message={errors.deskripsi} />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => reset()}
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Menyimpan...'
                                : isEdit
                                    ? 'Simpan Perubahan'
                                    : 'Tambah Jabatan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ──────
export default function JabatanIndex() {
    const { jabatan, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [openCreate, setOpenCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Jabatan | null>(null);
    const [deletingItem, setDeletingItem] = useState<Jabatan | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/jabatan',
            { search },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(`/admin/jabatan/${deletingItem.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Jabatan" />

            {/* Dialog Tambah */}
            <JabatanFormDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
            />

            {/* Dialog Edit */}
            {editingItem && (
                <JabatanFormDialog
                    jabatan={editingItem}
                    open={!!editingItem}
                    onOpenChange={(o) => !o && setEditingItem(null)}
                />
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Manajemen Jabatan
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola posisi kerja dan gaji pokok
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Jabatan
                    </Button>
                </div>


                <CardHeader>
                    <CardTitle>Daftar Jabatan</CardTitle>
                    <CardDescription>
                        Total: {jabatan.total} jabatan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSearch}
                        className="mb-6 flex gap-3"
                    >
                        <Input
                            placeholder="Cari nama jabatan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">
                            Cari
                        </Button>
                    </form>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="py-4">Nama Jabatan</TableHead>
                                    <TableHead className="py-4">Gaji Pokok</TableHead>
                                    <TableHead className="py-4">Jumlah Karyawan</TableHead>
                                    <TableHead className="py-4">Deskripsi</TableHead>
                                    <TableHead className="py-4 text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jabatan.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Belum ada jabatan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jabatan.data.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/30">
                                            <TableCell className="py-4 font-medium">
                                                {item.nama_jabatan}
                                            </TableCell>
                                            <TableCell className="py-4 font-mono text-sm">
                                                {formatRupiah(item.gaji_pokok)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary">
                                                    {item.karyawan_count}{' '}
                                                    karyawan
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate py-4 text-sm text-muted-foreground">
                                                {item.deskripsi || '-'}
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setEditingItem(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Dialog
                                                        open={
                                                            deletingItem?.id ===
                                                            item.id
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
                                                                Jabatan
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                Yakin ingin
                                                                menghapus
                                                                jabatan{' '}
                                                                <strong>
                                                                    "
                                                                    {
                                                                        item.nama_jabatan
                                                                    }
                                                                    "
                                                                </strong>
                                                                ?
                                                                {item.karyawan_count >
                                                                    0 && (
                                                                        <span className="mt-2 block font-medium text-destructive">
                                                                            ⚠️
                                                                            Jabatan
                                                                            ini
                                                                            masih
                                                                            memiliki{' '}
                                                                            {
                                                                                item.karyawan_count
                                                                            }{' '}
                                                                            karyawan
                                                                            dan
                                                                            tidak
                                                                            dapat
                                                                            dihapus.
                                                                        </span>
                                                                    )}
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
                                                                    disabled={
                                                                        item.karyawan_count >
                                                                        0
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {jabatan.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan{' '}
                                {(jabatan.current_page - 1) *
                                    jabatan.per_page +
                                    1}
                                –
                                {Math.min(
                                    jabatan.current_page *
                                    jabatan.per_page,
                                    jabatan.total,
                                )}{' '}
                                dari {jabatan.total}
                            </p>
                            <div className="flex gap-2">
                                {jabatan.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>
        </AppLayout>
    );
}