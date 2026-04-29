import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Dialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Shift {
    id: number;
    nama_shift: string;
    jam_masuk: string;
    jam_pulang: string;
    toleransi_menit: number;
    karyawan_count: number;
}

interface Props {
    shift: {
        data: Shift[];
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
    { title: 'Shift', href: '/admin/shift' },
];

// ─── Form Dialog (Tambah & Edit) ────

function ShiftFormDialog({
    shift,
    open,
    onOpenChange,
}: {
    shift?: Shift;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEdit = !!shift;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_shift:      shift?.nama_shift ?? '',
        jam_masuk:       shift?.jam_masuk?.slice(0, 5) ?? '',
        jam_pulang:      shift?.jam_pulang?.slice(0, 5) ?? '',
        toleransi_menit: shift?.toleransi_menit?.toString() ?? '15',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/shift/${shift.id}`, {
                preserveScroll: true,
                onSuccess: () => { reset(); onOpenChange(false); },
            });
        } else {
            post('/admin/shift', {
                preserveScroll: true,
                onSuccess: () => { reset(); onOpenChange(false); },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={o => { if (!o) reset(); onOpenChange(o); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Shift' : 'Tambah Shift'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Perbarui jadwal shift yang sudah ada.'
                            : 'Tambahkan pola kerja baru ke sistem.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nama Shift */}
                    <div className="grid gap-2">
                        <Label htmlFor="nama_shift">
                            Nama Shift <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nama_shift"
                            value={data.nama_shift}
                            onChange={e => setData('nama_shift', e.target.value)}
                            placeholder="contoh: Shift Pagi, Shift Malam"
                        />
                        <InputError message={errors.nama_shift} />
                    </div>

                    {/* Jam Masuk & Pulang */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="jam_masuk">
                                Jam Masuk <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="jam_masuk"
                                type="time"
                                value={data.jam_masuk}
                                onChange={e => setData('jam_masuk', e.target.value)}
                            />
                            <InputError message={errors.jam_masuk} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="jam_pulang">
                                Jam Pulang <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="jam_pulang"
                                type="time"
                                value={data.jam_pulang}
                                onChange={e => setData('jam_pulang', e.target.value)}
                            />
                            <InputError message={errors.jam_pulang} />
                        </div>
                    </div>

                    {/* Toleransi */}
                    <div className="grid gap-2">
                        <Label htmlFor="toleransi_menit">
                            Toleransi Keterlambatan (menit) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="toleransi_menit"
                            type="number"
                            min="0"
                            max="120"
                            value={data.toleransi_menit}
                            onChange={e => setData('toleransi_menit', e.target.value)}
                            className="max-w-xs"
                        />
                        <p className="text-sm text-muted-foreground">
                            Karyawan dianggap terlambat jika masuk lebih dari{' '}
                            {data.toleransi_menit} menit setelah jam masuk.
                        </p>
                        <InputError message={errors.toleransi_menit} />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={() => reset()}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Shift'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ShiftIndex() {
    const { shift, filters } = usePage<Props>().props;

    const [search, setSearch]         = useState(filters?.search || '');
    const [openCreate, setOpenCreate] = useState(false);
    const [editingItem, setEditingItem]   = useState<Shift | null>(null);
    const [deletingItem, setDeletingItem] = useState<Shift | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/shift', { search }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(`/admin/shift/${deletingItem.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Shift" />

            {/* Dialog Tambah */}
            <ShiftFormDialog open={openCreate} onOpenChange={setOpenCreate} />

            {/* Dialog Edit */}
            {editingItem && (
                <ShiftFormDialog
                    shift={editingItem}
                    open={!!editingItem}
                    onOpenChange={o => !o && setEditingItem(null)}
                />
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manajemen Shift</h1>
                        <p className="text-muted-foreground">Kelola jadwal dan jam kerja karyawan</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Shift
                    </Button>
                </div>

                <CardHeader>
                    <CardTitle>Daftar Shift</CardTitle>
                    <CardDescription>Total: {shift.total} shift</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                        <Input
                            placeholder="Cari nama shift..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">Cari</Button>
                    </form>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="py-4">Nama Shift</TableHead>
                                    <TableHead className="py-4">Jam Masuk</TableHead>
                                    <TableHead className="py-4">Jam Pulang</TableHead>
                                    <TableHead className="py-4">Toleransi</TableHead>
                                    <TableHead className="py-4">Karyawan</TableHead>
                                    <TableHead className="py-4 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shift.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Belum ada shift.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    shift.data.map(item => (
                                        <TableRow key={item.id} className="hover:bg-muted/30">
                                            <TableCell className="py-4 font-medium">{item.nama_shift}</TableCell>
                                            <TableCell className="py-4">{item.jam_masuk.slice(0, 5)}</TableCell>
                                            <TableCell className="py-4">{item.jam_pulang.slice(0, 5)}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline">{item.toleransi_menit} menit</Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary">{item.karyawan_count} karyawan</Badge>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Tombol Edit → buka modal */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingItem(item)}
                                                    >
                                                        Edit
                                                    </Button>

                                                    {/* Dialog Hapus */}
                                                    <Dialog
                                                        open={deletingItem?.id === item.id}
                                                        onOpenChange={open => !open && setDeletingItem(null)}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => setDeletingItem(item)}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Hapus Shift</DialogTitle>
                                                            <DialogDescription>
                                                                Yakin ingin menghapus shift{' '}
                                                                <strong>"{item.nama_shift}"</strong>?
                                                                {item.karyawan_count > 0 && (
                                                                    <span className="mt-2 block font-medium text-destructive">
                                                                        ⚠️ Shift ini masih digunakan oleh{' '}
                                                                        {item.karyawan_count} karyawan.
                                                                    </span>
                                                                )}
                                                            </DialogDescription>
                                                            <DialogFooter className="gap-2">
                                                                <DialogClose asChild>
                                                                    <Button variant="secondary">Batal</Button>
                                                                </DialogClose>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={handleDelete}
                                                                    disabled={item.karyawan_count > 0}
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

                    {shift.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan{' '}
                                {(shift.current_page - 1) * shift.per_page + 1}–
                                {Math.min(shift.current_page * shift.per_page, shift.total)}{' '}
                                dari {shift.total}
                            </p>
                            <div className="flex gap-2">
                                {shift.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
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