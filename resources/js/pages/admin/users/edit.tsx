import { Head, Link, usePage } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Edit User', href: '/admin/users/edit' },
];

export default function EditUser({ user }: { user: User }) {
    const { errors } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="space-y-6">
                {/* Header */}
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">Perbarui informasi akun pengguna</p>
                </div>

                <div className="px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi User</CardTitle>
                            <CardDescription>Kosongkan password jika tidak ingin mengubah password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" action={`/admin/users/${user.id}`} className="space-y-6">
                                <input type="hidden" name="_method" value="put" />

                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Nama <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={user.name}
                                        placeholder="Nama lengkap"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue={user.email}
                                        placeholder="Alamat email"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Password Baru{' '}
                                        <span className="text-xs text-muted-foreground">
                                            (Kosongkan jika tidak diubah)
                                        </span>
                                    </Label>
                                    <Input id="password" name="password" type="password" placeholder="Password baru" />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        placeholder="Ulangi password baru"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role">
                                        Role <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="role" required defaultValue={user.role}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="karyawan">Karyawan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <Button type="submit">Simpan Perubahan</Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/admin/users">Batal</Link>
                                    </Button>
                                </div>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
