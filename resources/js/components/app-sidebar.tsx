import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Database,
    Fingerprint,
    DollarSign,
    Users,
    UserCog,
    Briefcase,
    Clock,
    QrCode,
    MapPin,
    CalendarCheck,
    History,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, PageProps } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Master Data',
        href: '',
        icon: Database,
        children: [
            {
                title: 'Jabatan',
                href: '/admin/jabatan',
                icon: Briefcase,
            },
            {
                title: 'Shift',
                href: '/admin/shift',
                icon: Clock,
            },
            {
                title: 'Karyawan',
                href: '/admin/karyawan',
                icon: Users,
            },
            {
                title: 'Kelola User',
                href: '/admin/users',
                icon: UserCog,
            },
        ],
    },
    {
        title: 'Presensi',
        href: '',
        icon: Fingerprint,
        children: [
            {
                title: 'Data Absensi',
                href: '/admin/absensi',
                icon: CalendarCheck,
            },
            {
                title: 'QR Absensi',
                href: '/admin/qr-absensi',
                icon: QrCode,
            },
            {
                title: 'Lokasi Absensi',
                href: '/admin/lokasi-absensi',
                icon: MapPin,
            },
        ],
    },
    {
        title: 'Penggajian',
        href: '/admin/penggajian',
        icon: DollarSign,
    },
];

const karyawanNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Presensi Saya',
        href: '',
        icon: Fingerprint,
        children: [
            {
                title: 'Absensi',
                href: '/karyawan/absensi',
                icon: CalendarCheck,
            },
            {
                title: 'Riwayat',
                href: '/karyawan/absensi/riwayat',
                icon: History,
            },
        ],
    },
    {
        title: 'Slip Gaji',
        href: '/karyawan/slip-gaji',
        icon: DollarSign,
    },
];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const navItems = user?.role === 'admin' ? adminNavItems : karyawanNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    user?.role === 'admin'
                                        ? '/admin/dashboard'
                                        : dashboard()
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}