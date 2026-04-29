import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
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
    filters: {
        search?: string;
        role?: string;
    };
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

export default function UserIndex() {
    const { users, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || 'all');
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            { search, role: role === 'all' ? '' : role },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(`/admin/users/${deletingUser.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingUser(null),
        });
    };

    const getRoleBadgeVariant = (role: string): 'default' | 'destructive' | 'secondary' => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'karyawan':
                return 'default';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Kelola akun pengguna dan role</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/users/create">Tambah User</Link>
                    </Button>
                </div>

                <CardHeader>
                    <CardTitle>Daftar User</CardTitle>
                    <CardDescription>Total: {users.total} user</CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Filter */}
                    <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                        <Input
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="karyawan">Karyawan</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">
                            Filter
                        </Button>
                    </form>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="py-4">Nama</TableHead>
                                    <TableHead className="py-4">Email</TableHead>
                                    <TableHead className="py-4">Role</TableHead>
                                    <TableHead className="py-4">Dibuat</TableHead>
                                    <TableHead className="py-4 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Belum ada user.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/30">
                                            <TableCell className="py-4 font-medium">{user.name}</TableCell>
                                            <TableCell className="py-4">{user.email}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                                                    </Button>

                                                    <Dialog
                                                        open={deletingUser?.id === user.id}
                                                        onOpenChange={(open) => !open && setDeletingUser(null)}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => setDeletingUser(user)}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogTitle>Hapus Pengguna</DialogTitle>
                                                            <DialogDescription>
                                                                Apakah Anda yakin ingin menghapus pengguna{' '}
                                                                <strong>"{user.name}"</strong>? Tindakan ini tidak dapat
                                                                dibatalkan.
                                                            </DialogDescription>
                                                            <DialogFooter className="gap-2">
                                                                <DialogClose asChild>
                                                                    <Button variant="secondary">Batal</Button>
                                                                </DialogClose>
                                                                <Button variant="destructive" onClick={handleDelete}>
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

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {(users.current_page - 1) * users.per_page + 1}–
                                {Math.min(users.current_page * users.per_page, users.total)} dari {users.total}
                            </p>
                            <div className="flex gap-2">
                                {users.links.map((link, index) => (
                                    <Button
                                        key={index}
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
