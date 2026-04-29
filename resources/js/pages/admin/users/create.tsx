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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'Tambah User', href: '/admin/users/create' },
];

export default function CreateUser() {
    const { errors } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah User" />

            <div className="space-y-6">
                {/* Header */}
                <div className="p-4">
                    <h1 className="text-3xl font-bold tracking-tight">Tambah User</h1>
                    <p className="text-muted-foreground">Tambahkan akun pengguna baru ke sistem</p>
                </div>

                <div className="px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi User</CardTitle>
                            <CardDescription>Isi form berikut untuk membuat akun pengguna baru</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" action="/admin/users" className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Nama <span className="text-destructive">*</span>
                                    </Label>
                                    <Input id="name" name="name" required placeholder="Nama lengkap" />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input id="email" name="email" type="email" required placeholder="Alamat email" />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Minimal 8 karakter"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        placeholder="Ulangi password"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role">
                                        Role <span className="text-destructive">*</span>
                                    </Label>
                                    <Select name="role" required>
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
                                    <Button type="submit">Tambah User</Button>
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
