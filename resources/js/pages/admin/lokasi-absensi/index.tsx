import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Plus, Pencil, Trash2, Info, Loader2, LocateFixed, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Leaflet z-index fix (scoped) ───
if (typeof document !== 'undefined' && !document.getElementById('leaflet-zfix')) {
    const s = document.createElement('style');
    s.id = 'leaflet-zfix';
    s.textContent = `
    .leaflet-scope .leaflet-pane,
    .leaflet-scope .leaflet-tile-pane    { z-index: 2; }
    .leaflet-scope .leaflet-overlay-pane { z-index: 3; }
    .leaflet-scope .leaflet-shadow-pane  { z-index: 4; }
    .leaflet-scope .leaflet-marker-pane  { z-index: 5; }
    .leaflet-scope .leaflet-tooltip-pane { z-index: 6; }
    .leaflet-scope .leaflet-popup-pane   { z-index: 7; }
    .leaflet-scope .leaflet-top,
    .leaflet-scope .leaflet-bottom       { z-index: 8; }
    [data-radix-dialog-overlay]          { z-index: 9998 !important; }
    [role="dialog"]                      { z-index: 9999 !important; }
  `;
    document.head.appendChild(s);
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Lokasi {
    id: number;
    nama_lokasi: string;
    latitude: number;
    longitude: number;
    radius: number;
    is_aktif: boolean;
}

interface Props {
    lokasiList: Lokasi[];
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Lokasi Absensi', href: '/admin/lokasi-absensi' },
];

const makePin = (color: string, big = false) =>
    L.divIcon({
        className: '',
        html: `<div style="width:${big ? 32 : 26}px;height:${big ? 32 : 26}px;position:relative;
        background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        border:3px solid #fff;box-shadow:${big ? `0 0 0 5px ${color}33,` : ''}0 2px 8px rgba(0,0,0,.3);">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:7px;height:7px;background:#fff;border-radius:50%;"></div></div>`,
        iconSize: [big ? 32 : 26, big ? 32 : 26],
        iconAnchor: [big ? 16 : 13, big ? 32 : 26],
        popupAnchor: [0, big ? -34 : -28],
    });

function FlyTo({ pos, zoom = 17 }: { pos: [number, number] | null; zoom?: number }) {
    const map = useMap();
    const prev = useRef('');
    useEffect(() => {
        if (!pos) return;
        const key = pos.join(',');
        if (key !== prev.current) {
            prev.current = key;
            map.flyTo(pos, zoom, { duration: 1.2 });
        }
    });
    return null;
}

function ClickHandler({ fn }: { fn: (lat: number, lng: number) => void }) {
    useMapEvents({ click: (e) => fn(e.latlng.lat, e.latlng.lng) });
    return null;
}

function LokasiForm({ lokasi, onClose }: { lokasi?: Lokasi; onClose: () => void }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_lokasi: lokasi?.nama_lokasi ?? '',
        latitude: lokasi?.latitude?.toString() ?? '',
        longitude: lokasi?.longitude?.toString() ?? '',
        radius: lokasi?.radius?.toString() ?? '100',
        is_aktif: lokasi?.is_aktif ?? true,
    });

    const DEFAULT: [number, number] = [-7.3205, 112.7508];

    const parsedLat = parseFloat(data.latitude);
    const parsedLng = parseFloat(data.longitude);
    const validCoords =
        !isNaN(parsedLat) &&
        !isNaN(parsedLng) &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        parsedLng >= -180 &&
        parsedLng <= 180;

    const markerPos: [number, number] | null = validCoords ? [parsedLat, parsedLng] : null;

    const setPin = useCallback(
        (lat: number, lng: number) => {
            setData((d: any) => ({
                ...d,
                latitude: parseFloat(lat.toFixed(6)).toString(),
                longitude: parseFloat(lng.toFixed(6)).toString(),
            }));
        },
        [setData],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        };
        lokasi ? put(`/admin/lokasi-absensi/${lokasi.id}`, opts) : post('/admin/lokasi-absensi', opts);
    };

    const radiusNum = Math.max(10, parseInt(data.radius) || 100);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="nama">Nama Lokasi</Label>
                <Input
                    id="nama"
                    value={data.nama_lokasi}
                    onChange={(e) => setData('nama_lokasi', e.target.value)}
                    placeholder="Kantor Pusat, Apotek Valencia, dll."
                />
                {errors.nama_lokasi && <p className="text-xs text-destructive">{errors.nama_lokasi}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="lat" className="flex items-center gap-1.5">
                        Latitude
                        {validCoords && <span className="text-[10px] font-semibold text-emerald-500">✓</span>}
                    </Label>
                    <Input
                        id="lat"
                        value={data.latitude}
                        onChange={(e) => setData('latitude', e.target.value)}
                        placeholder="-7.320512"
                        className="font-mono text-sm"
                    />
                    {errors.latitude && <p className="text-xs text-destructive">{errors.latitude}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lng" className="flex items-center gap-1.5">
                        Longitude
                        {validCoords && <span className="text-[10px] font-semibold text-emerald-500">✓</span>}
                    </Label>
                    <Input
                        id="lng"
                        value={data.longitude}
                        onChange={(e) => setData('longitude', e.target.value)}
                        placeholder="112.750817"
                        className="font-mono text-sm"
                    />
                    {errors.longitude && <p className="text-xs text-destructive">{errors.longitude}</p>}
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
                💡 Buka <strong>Google Maps</strong> → klik kanan lokasi → salin koordinat, lalu paste di atas. Atau
                klik / drag pin di peta bawah.
            </p>

            <button
                type="button"
                onClick={() => {
                    if (!navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition(
                        (p) => setPin(p.coords.latitude, p.coords.longitude),
                        () => {},
                        { timeout: 8000 },
                    );
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 py-2 text-sm text-muted-foreground transition-colors hover:border-emerald-400 hover:text-emerald-600"
            >
                <LocateFixed className="h-4 w-4" />
                Gunakan lokasi perangkat saya (GPS)
            </button>

            <div className="space-y-1.5">
                <Label className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        Peta
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                        klik / drag pin untuk ubah posisi
                    </span>
                </Label>
                <div
                    className="leaflet-scope overflow-hidden rounded-xl border"
                    style={{ height: 220, isolation: 'isolate' }}
                >
                    <MapContainer
                        center={markerPos ?? DEFAULT}
                        zoom={markerPos ? 17 : 12}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap"
                        />
                        <FlyTo pos={markerPos} zoom={17} />
                        <ClickHandler fn={setPin} />
                        {markerPos && (
                            <>
                                <Marker
                                    position={markerPos}
                                    icon={makePin('#10b981', true)}
                                    draggable
                                    eventHandlers={{
                                        dragend: (e: any) => {
                                            const ll = e.target.getLatLng();
                                            setPin(ll.lat, ll.lng);
                                        },
                                    }}
                                />
                                <Circle
                                    center={markerPos}
                                    radius={radiusNum}
                                    pathOptions={{
                                        color: '#10b981',
                                        fillColor: '#10b981',
                                        fillOpacity: 0.15,
                                        weight: 2,
                                        dashArray: '6 4',
                                    }}
                                />
                            </>
                        )}
                    </MapContainer>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label>Radius Absensi</Label>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {data.radius} m
                    </span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={1000}
                    step={10}
                    value={data.radius}
                    onChange={(e) => setData('radius', e.target.value)}
                    className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>10 m (ketat)</span>
                    <span>1000 m (luas)</span>
                </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                    <Label className="font-medium">Status Aktif</Label>
                    <p className="text-xs text-muted-foreground">Aktifkan agar bisa digunakan untuk absensi</p>
                </div>
                <Switch checked={data.is_aktif} onCheckedChange={(v) => setData('is_aktif', v)} />
            </div>

            <DialogFooter className="gap-2 pt-1">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Batal
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={processing || !validCoords}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {lokasi ? 'Simpan Perubahan' : 'Tambah Lokasi'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function LokasiAbsensiIndex() {
    const { lokasiList } = usePage<Props>().props;
    const [openCreate, setOpenCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Lokasi | null>(null);
    const [deletingItem, setDeletingItem] = useState<Lokasi | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [flyPos, setFlyPos] = useState<[number, number] | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const DEFAULT_CENTER: [number, number] =
        lokasiList.length > 0 ? [lokasiList[0].latitude, lokasiList[0].longitude] : [-7.3205, 112.7508];

    const focus = (item: Lokasi) => {
        setSelectedId(item.id);
        setFlyPos([item.latitude, item.longitude]);
        setShowMap(true);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(`/admin/lokasi-absensi/${deletingItem.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lokasi Absensi" />

            <div className="space-y-4 pb-6 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Lokasi Absensi</h1>
                        <p className="text-sm text-muted-foreground">Kelola titik koordinat dan radius area absensi</p>
                    </div>
                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Lokasi
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg overflow-y-auto" style={{ zIndex: 9999, maxHeight: '90vh' }}>
                            <DialogTitle>Tambah Lokasi Absensi</DialogTitle>
                            <DialogDescription>
                                Cari lokasi dengan nama tempat, lalu atur nama dan radius area absensi.
                            </DialogDescription>
                            <LokasiForm onClose={() => setOpenCreate(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats — 3 kolom di semua ukuran, font dikecilkan di mobile */}
                <div className="grid grid-cols-3 gap-3 px-4">
                    {[
                        { label: 'Total Lokasi', val: lokasiList.length, cls: '' },
                        { label: 'Aktif', val: lokasiList.filter((l) => l.is_aktif).length, cls: 'text-emerald-600' },
                        {
                            label: 'Nonaktif',
                            val: lokasiList.filter((l) => !l.is_aktif).length,
                            cls: 'text-muted-foreground',
                        },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="px-3 pb-3 pt-4 text-center sm:pt-6">
                                <p className={`text-2xl font-bold sm:text-3xl ${s.cls}`}>{s.val}</p>
                                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Split layout — stacked di mobile, side-by-side di lg */}
                <div className="flex flex-col gap-4 px-4 lg:grid lg:grid-cols-5">

                    {/* ── List panel ── */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm sm:text-base">Daftar Lokasi</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {lokasiList.length === 0 ? (
                                    <div className="flex flex-col items-center py-12 text-muted-foreground">
                                        <MapPin className="mb-2 h-8 w-8 opacity-30" />
                                        <p className="text-sm">Belum ada lokasi</p>
                                    </div>
                                ) : (
                                    lokasiList.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => focus(item)}
                                            className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 ${selectedId === item.id ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}`}
                                        >
                                            <div
                                                className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${item.is_aktif ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40' : 'bg-muted text-muted-foreground'}`}
                                            >
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-semibold">
                                                        {item.nama_lokasi}
                                                    </span>
                                                    <Badge
                                                        variant={item.is_aktif ? 'default' : 'secondary'}
                                                        className={`flex-shrink-0 text-[10px] ${item.is_aktif ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' : ''}`}
                                                    >
                                                        {item.is_aktif ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </div>
                                                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                                    {item.latitude}, {item.longitude}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Radius:{' '}
                                                    <span className="font-medium text-foreground">{item.radius} m</span>
                                                </p>
                                            </div>

                                            {/* Aksi — selalu tampil di mobile, hover di desktop */}
                                            <div
                                                className="flex flex-shrink-0 gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Dialog
                                                    open={editingItem?.id === item.id}
                                                    onOpenChange={(o) => !o && setEditingItem(null)}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-7 sm:w-7"
                                                            onClick={() => setEditingItem(item)}
                                                        >
                                                            <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent
                                                        className="max-w-lg overflow-y-auto"
                                                        style={{ zIndex: 9999, maxHeight: '90vh' }}
                                                    >
                                                        <DialogTitle>Edit Lokasi</DialogTitle>
                                                        <LokasiForm
                                                            lokasi={item}
                                                            onClose={() => setEditingItem(null)}
                                                        />
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog
                                                    open={deletingItem?.id === item.id}
                                                    onOpenChange={(o) => !o && setDeletingItem(null)}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive sm:h-7 sm:w-7"
                                                            onClick={() => setDeletingItem(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent style={{ zIndex: 9999 }}>
                                                        <DialogTitle>Hapus Lokasi</DialogTitle>
                                                        <DialogDescription>
                                                            Yakin hapus <strong>"{item.nama_lokasi}"</strong>? Tindakan
                                                            ini tidak dapat dibatalkan.
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
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Peta panel — collapsible di mobile ── */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm sm:text-base">Peta Lokasi</CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                                        <Info className="h-3.5 w-3.5" /> Klik baris untuk fokus
                                    </span>
                                    {/* Toggle peta di mobile */}
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted lg:hidden"
                                        onClick={() => setShowMap((v) => !v)}
                                    >
                                        {showMap ? (
                                            <>
                                                <ChevronUp className="h-3 w-3" /> Sembunyikan
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3 w-3" /> Tampilkan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </CardHeader>

                        {/* Di mobile: tampil hanya jika showMap = true atau di lg ke atas selalu tampil */}
                        <CardContent className={`p-0 ${!showMap ? 'hidden lg:block' : ''}`}>
                            <div
                                className="leaflet-scope relative overflow-hidden rounded-b-xl"
                                style={{ height: 320, isolation: 'isolate' }}
                            >
                                {!mapReady && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                                <MapContainer
                                    center={DEFAULT_CENTER}
                                    zoom={12}
                                    style={{ height: '100%', width: '100%' }}
                                    whenReady={() => setMapReady(true)}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                                    />
                                    <FlyTo pos={flyPos} zoom={17} />
                                    {lokasiList.map((item) => {
                                        const sel = selectedId === item.id;
                                        const color = item.is_aktif ? '#6366f1' : '#94a3b8';
                                        return (
                                            <div key={item.id}>
                                                <Marker
                                                    position={[item.latitude, item.longitude]}
                                                    icon={makePin(color, sel)}
                                                    eventHandlers={{ click: () => focus(item) }}
                                                >
                                                    <Popup>
                                                        <div className="min-w-[160px] space-y-0.5 py-0.5">
                                                            <p className="font-semibold">{item.nama_lokasi}</p>
                                                            <p className="font-mono text-[11px] text-gray-500">
                                                                {item.latitude}, {item.longitude}
                                                            </p>
                                                            <p className="text-xs">
                                                                Radius: <strong>{item.radius} m</strong>
                                                            </p>
                                                            <span
                                                                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${item.is_aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                                                            >
                                                                {item.is_aktif ? '● Aktif' : '○ Nonaktif'}
                                                            </span>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                                <Circle
                                                    center={[item.latitude, item.longitude]}
                                                    radius={item.radius}
                                                    pathOptions={{
                                                        color,
                                                        fillColor: color,
                                                        fillOpacity: sel ? 0.18 : 0.08,
                                                        weight: sel ? 2.5 : 1.5,
                                                        dashArray: item.is_aktif ? undefined : '6 4',
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </MapContainer>

                                {/* Legend */}
                                <div className="absolute bottom-3 left-3 z-20 space-y-1 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
                                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        Legenda
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                        <span>Aktif</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                                        <span>Nonaktif</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}