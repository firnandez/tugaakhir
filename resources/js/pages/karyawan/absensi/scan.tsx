import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useRef, useEffect } from 'react';
import {
    Camera,
    Download,
    CheckCircle,
    XCircle,
    Loader2,
    Clock,
    History,
    MapPin,
    ChevronRight,
    ScanLine,
    FileText,
} from 'lucide-react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface AbsensiHariIni {
    id: number;
    jam_masuk: string | null;
    jam_pulang: string | null;
    status: string;
    keterlambatan: number;
}

interface Props {
    absensiHariIni: AbsensiHariIni | null;
    sudahMasuk: boolean;
    sudahPulang: boolean;
    izinDisetujui: boolean;
    isAlpha: boolean;
    adaPengajuanPending: boolean;
    pengajuanHariIni: {
        status: string;
        statusIzin: 'pending' | 'disetujui';
        keterangan: string;
    } | null;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/karyawan/dashboard' },
    { title: 'Absensi', href: '/karyawan/absensi' },
];

function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return <span>{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>;
}

export default function KaryawanAbsensiScan() {
    const { absensiHariIni, sudahMasuk, sudahPulang, izinDisetujui, isAlpha, adaPengajuanPending, pengajuanHariIni } = usePage<Props>().props;

    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        tipe?: string;
        jam?: string;
        keterlambatan?: number | null;
    } | null>(null);
    const [showIzinModal, setShowIzinModal] = useState(false);
    const [izinForm, setIzinForm] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        status: 'izin',
        keterangan: '',
    });

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const scannerDivId = 'qr-scanner-container';

    const tipeAbsensi = (izinDisetujui || isAlpha || adaPengajuanPending)
        ? null
        : !sudahMasuk
            ? 'masuk'
            : !sudahPulang
                ? 'pulang'
                : null;

    const progressPercent = sudahMasuk && sudahPulang ? 100 : sudahMasuk ? 50 : 0;

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const startScanner = () => {
        setScanning(true);
        setResult(null);
    };

    useEffect(() => {
        if (!scanning) return;
        const scanner = new Html5QrcodeScanner(scannerDivId, { fps: 10, qrbox: { width: 220, height: 220 } }, false);
        scanner.render(
            async (decodedText) => {
                scanner.clear();
                setScanning(false);
                await processAbsensi(decodedText);
            },
            () => { },
        );
        scannerRef.current = scanner;
        return () => {
            scanner.clear().catch(() => { });
        };
    }, [scanning]);

    const processAbsensi = async (token: string) => {
        setLoading(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                });
            });
            const response = await axios.post('/karyawan/absensi/scan', {
                token,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setResult({
                success: true,
                message: response.data.message,
                tipe: response.data.tipe,
                jam: response.data.jam,
                keterlambatan: response.data.keterlambatan,
            });
            setTimeout(() => router.reload(), 2500);
        } catch (error: any) {
            const msg =
                error.code === 1
                    ? 'Akses lokasi ditolak. Izinkan akses lokasi untuk absensi.'
                    : error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
            setResult({ success: false, message: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadQr = (tipe: 'masuk' | 'pulang') => {
        window.open(`/karyawan/absensi/qr/${tipe}/download`, '_blank');
    };

    const submitIzin = () => {
        router.post('/karyawan/absensi/izin', izinForm, {
            onSuccess: () => {
                setShowIzinModal(false);
                setIzinForm({ tanggal: new Date().toISOString().split('T')[0], status: 'izin', keterangan: '' });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
                .absensi-root * { font-family: 'Sora', sans-serif; }
                .mono { font-family: 'JetBrains Mono', monospace !important; }
                .glass-card {
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.9);
                    border-radius: 20px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
                }
                .dark .glass-card {
                    background: rgba(30,30,40,0.7);
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
                }
                .hero-card {
                    background: linear-gradient(135deg, #1e3a5f 0%, #0f2440 50%, #162d4a 100%);
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                    border: none;
                    box-shadow: 0 8px 32px rgba(15,36,64,0.35);
                }
                .hero-card::before {
                    content: '';
                    position: absolute;
                    top: -60px; right: -60px;
                    width: 220px; height: 220px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99,179,237,0.15) 0%, transparent 70%);
                }
                .hero-card::after {
                    content: '';
                    position: absolute;
                    bottom: -40px; left: -40px;
                    width: 160px; height: 160px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(66,153,225,0.12) 0%, transparent 70%);
                }
                .time-display {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 3rem;
                    font-weight: 500;
                    letter-spacing: -1px;
                    color: #fff;
                    line-height: 1;
                }
                .scan-btn {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    padding: 16px 24px;
                    font-size: 1rem;
                    font-weight: 600;
                    letter-spacing: 0.01em;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 16px rgba(59,130,246,0.35);
                    font-family: 'Sora', sans-serif;
                }
                .scan-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.45); }
                .scan-btn:active { transform: translateY(0); }
                .scan-btn-secondary {
                    background: transparent;
                    color: #374151;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 14px;
                    padding: 13px 24px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'Sora', sans-serif;
                }
                .scan-btn-secondary:hover { background: #f9fafb; border-color: #d1d5db; }
                .dark .scan-btn-secondary { color: #d1d5db; border-color: rgba(255,255,255,0.12); }
                .dark .scan-btn-secondary:hover { background: rgba(255,255,255,0.06); }
                .status-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 8px;
                }
                .progress-bar-track {
                    height: 4px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 2px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #63b3ed, #90cdf4);
                    border-radius: 2px;
                    transition: width 0.8s ease;
                }
                .result-card-success {
                    border-radius: 16px;
                    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                    border: 1.5px solid #bbf7d0;
                    padding: 20px;
                }
                .result-card-error {
                    border-radius: 16px;
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    border: 1.5px solid #fecaca;
                    padding: 20px;
                }
                .divider-text {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #9ca3af;
                    font-size: 0.75rem;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                .divider-text::before, .divider-text::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e5e7eb;
                }
                .dark .divider-text::before, .dark .divider-text::after { background: rgba(255,255,255,0.1); }
                .step-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    background: rgba(59,130,246,0.1);
                    color: #2563eb;
                    border-radius: 99px;
                    padding: 4px 12px;
                }
                .done-card {
                    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                    border: 1.5px solid #bbf7d0;
                    border-radius: 20px;
                    padding: 28px 24px;
                    text-align: center;
                }
                .alpha-card {
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    border: 1.5px solid #fecaca;
                    border-radius: 20px;
                    padding: 28px 24px;
                    text-align: center;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
                    70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(34,197,94,0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }
                .pulse-icon { animation: pulse-ring 2s infinite; }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .slide-up { animation: slide-up 0.35s ease forwards; }
                .loading-card {
                    border-radius: 20px;
                    background: rgba(255,255,255,0.9);
                    border: 1px solid rgba(0,0,0,0.06);
                    padding: 40px 24px;
                    text-align: center;
                }
                .dark .loading-card { background: rgba(30,30,40,0.9); border-color: rgba(255,255,255,0.08); }
                .history-btn {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 16px 20px;
                    border-radius: 14px;
                    background: transparent;
                    border: 1.5px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Sora', sans-serif;
                }
                .history-btn:hover { background: #f9fafb; border-color: #d1d5db; }
                .dark .history-btn { border-color: rgba(255,255,255,0.1); color: #d1d5db; }
                .dark .history-btn:hover { background: rgba(255,255,255,0.05); }
                #qr-scanner-container { background: #f8fafc !important; border-radius: 12px; overflow: hidden; }
                #qr-scanner-container video { border-radius: 8px !important; width: 100% !important; object-fit: cover; }
                #qr-scanner-container > div { background: #f8fafc !important; border: none !important; padding: 12px !important; }
                #qr-scanner-container #qr-shaded-region { border-color: #3b82f6 !important; }
                #qr-scanner-container #html5-qrcode-anchor-scan-type-change { color: #3b82f6 !important; font-family: 'Sora', sans-serif !important; font-size: 0.8rem !important; }
                #qr-scanner-container select { font-family: 'Sora', sans-serif !important; border: 1.5px solid #e5e7eb !important; border-radius: 8px !important; padding: 4px 8px !important; background: #fff !important; color: #374151 !important; font-size: 0.82rem !important; }
                #qr-scanner-container img[alt="Info icon"] { display: none !important; }
                #qr-scanner-container #html5-qrcode-button-camera-permission,
                #qr-scanner-container #html5-qrcode-button-camera-start,
                #qr-scanner-container #html5-qrcode-button-camera-stop,
                #qr-scanner-container #html5-qrcode-button-file-selection {
                    background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
                    color: #fff !important; border: none !important; border-radius: 10px !important;
                    padding: 10px 20px !important; font-family: 'Sora', sans-serif !important;
                    font-weight: 600 !important; font-size: 0.85rem !important; cursor: pointer !important;
                    margin: 6px 4px !important; box-shadow: 0 2px 10px rgba(59,130,246,0.3) !important;
                }
                #qr-scanner-container span { color: #374151 !important; font-size: 0.8rem !important; }
            `}</style>

            <div className="absensi-root mx-auto max-w-md space-y-4 px-1 pt-6 pb-8">

                {/* ── HERO: Jam & Tanggal ── */}
                <div className="hero-card slide-up p-6">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <MapPin size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 500 }}>
                                {today}
                            </span>
                        </div>

                        <div className="time-display mono">
                            <LiveClock />
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                    Progress Absensi
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 600 }}>
                                    {isAlpha ? 'Alpha' : `${progressPercent}%`}
                                </span>
                            </div>
                            <div className="progress-bar-track">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${progressPercent}%`,
                                        background: isAlpha
                                            ? 'linear-gradient(90deg, #f87171, #ef4444)'
                                            : 'linear-gradient(90deg, #63b3ed, #90cdf4)',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div className="status-dot" style={{ background: sudahMasuk ? '#4ade80' : isAlpha ? '#f87171' : 'rgba(255,255,255,0.25)' }} />
                                    <span style={{ color: sudahMasuk ? '#4ade80' : isAlpha ? '#f87171' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 500 }}>
                                        {isAlpha ? 'Alpha' : sudahMasuk ? absensiHariIni?.jam_masuk : 'Belum Masuk'}
                                    </span>
                                </div>
                                {!isAlpha && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: sudahPulang ? '#4ade80' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 500 }}>
                                            {sudahPulang ? absensiHariIni?.jam_pulang : 'Belum Pulang'}
                                        </span>
                                        <div className="status-dot" style={{ background: sudahPulang ? '#4ade80' : 'rgba(255,255,255,0.25)', marginRight: 0 }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {absensiHariIni?.keterlambatan && absensiHariIni.keterlambatan > 0 ? (
                            <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={14} style={{ color: '#fca5a5' }} />
                                <span style={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 500 }}>
                                    Terlambat {absensiHariIni.keterlambatan} menit hari ini
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* ── HASIL SCAN ── */}
                {result && (
                    <div className={`slide-up ${result.success ? 'result-card-success' : 'result-card-error'}`}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: result.success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {result.success
                                    ? <CheckCircle size={20} style={{ color: '#16a34a' }} />
                                    : <XCircle size={20} style={{ color: '#dc2626' }} />}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: result.success ? '#15803d' : '#b91c1c', margin: 0 }}>
                                    {result.message}
                                </p>
                                {result.success && result.jam && (
                                    <p style={{ marginTop: '4px', fontSize: '0.82rem', color: '#16a34a', opacity: 0.8 }}>
                                        Tercatat pukul <span className="mono" style={{ fontWeight: 600 }}>{result.jam}</span> WIB
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── LOADING ── */}
                {loading && (
                    <div className="loading-card slide-up">
                        <Loader2 size={32} style={{ color: '#3b82f6', margin: '0 auto 12px', display: 'block' }} className="animate-spin" />
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 4px', color: '#111827' }}>Memproses Absensi</p>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>Mohon tunggu, sedang mengambil lokasi...</p>
                    </div>
                )}

                {/* ── SCAN SECTION ── */}
                {tipeAbsensi && !loading && (
                    <div className="glass-card slide-up p-5">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <div className="step-chip" style={{ marginBottom: '6px' }}>
                                    <ScanLine size={10} />
                                    Langkah {tipeAbsensi === 'masuk' ? '1' : '2'} dari 2
                                </div>
                                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, color: '#111827' }}>
                                    Absensi {tipeAbsensi === 'masuk' ? 'Masuk' : 'Pulang'}
                                </h2>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: tipeAbsensi === 'masuk' ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={20} style={{ color: tipeAbsensi === 'masuk' ? '#3b82f6' : '#a855f7' }} />
                            </div>
                        </div>

                        {scanning ? (
                            <div style={{ marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px', background: 'rgba(59,130,246,0.08)', borderRadius: '10px', padding: '8px 14px' }}>
                                    <Camera size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500, margin: 0 }}>
                                        Arahkan kamera ke QR Code absensi
                                    </p>
                                </div>
                                <div style={{ borderRadius: '14px', border: '2px solid #e5e7eb', overflow: 'hidden', background: '#f8fafc' }}>
                                    <div id={scannerDivId} style={{ width: '100%' }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <button className="scan-btn" onClick={startScanner}>
                                    <Camera size={20} />
                                    Buka Kamera & Scan QR
                                </button>
                                <div className="divider-text" style={{ margin: '16px 0' }}>atau</div>
                                <button className="scan-btn-secondary" onClick={() => handleDownloadQr(tipeAbsensi)}>
                                    <Download size={16} />
                                    Download QR {tipeAbsensi === 'masuk' ? 'Masuk' : 'Pulang'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ── ALPHA ── */}
                {isAlpha && !loading && (
                    <div className="alpha-card slide-up">
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <XCircle size={30} style={{ color: '#dc2626' }} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#b91c1c', margin: '0 0 6px' }}>
                            Absensi Hari Ini Alpha
                        </p>
                        <p style={{ fontSize: '0.83rem', color: '#dc2626', opacity: 0.75, margin: 0 }}>
                            Anda tidak melakukan absensi masuk hari ini
                        </p>
                    </div>
                )}

                {/* ── PENGAJUAN PENDING ── */}
                {adaPengajuanPending && !loading && (
                    <div
                        className="slide-up"
                        style={{
                            padding: '28px 24px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                            border: '1.5px solid #fde68a',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Clock size={30} style={{ color: '#d97706' }} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#92400e', margin: '0 0 6px' }}>
                            Menunggu Persetujuan Admin
                        </p>
                        <p style={{ fontSize: '0.83rem', color: '#d97706', opacity: 0.85, margin: 0 }}>
                            Pengajuan {pengajuanHariIni?.status === 'sakit' ? 'sakit' : 'izin'} kamu sedang diproses
                        </p>
                    </div>
                )}

                {/* ── IZIN DISETUJUI ── */}
                {izinDisetujui && !loading && (
                    <div className="done-card slide-up">
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }} className="pulse-icon">
                            <CheckCircle size={30} style={{ color: '#16a34a' }} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#15803d', margin: '0 0 6px' }}>
                            Izin Hari Ini Disetujui
                        </p>
                        <p style={{ fontSize: '0.83rem', color: '#16a34a', opacity: 0.75, margin: 0 }}>
                            Tidak perlu melakukan absensi hari ini
                        </p>
                    </div>
                )}

                {/* ── SELESAI ABSENSI NORMAL ── */}
                {!tipeAbsensi && !loading && !isAlpha && !izinDisetujui && (
                    <div className="done-card slide-up">
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }} className="pulse-icon">
                            <CheckCircle size={30} style={{ color: '#16a34a' }} />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#15803d', margin: '0 0 6px' }}>
                            Absensi Hari Ini Selesai
                        </p>
                        <p style={{ fontSize: '0.83rem', color: '#16a34a', opacity: 0.75, margin: 0 }}>
                            Masuk <span className="mono" style={{ fontWeight: 600 }}>{absensiHariIni?.jam_masuk}</span>
                            {' · '}
                            Pulang <span className="mono" style={{ fontWeight: 600 }}>{absensiHariIni?.jam_pulang}</span>
                        </p>
                    </div>
                )}

                {/* ── RIWAYAT ── */}
                <button className="history-btn slide-up" onClick={() => router.get('/karyawan/absensi/riwayat')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={18} style={{ color: '#6b7280' }} />
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Lihat Riwayat Absensi</span>
                    </div>
                    <ChevronRight size={16} style={{ color: '#9ca3af' }} />
                </button>

                {/* ── AJUKAN IZIN ── */}
                {!sudahMasuk && !isAlpha && (
                    <>
                        {pengajuanHariIni ? (
                            <div
                                className="slide-up"
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '14px',
                                    border: `1.5px solid ${pengajuanHariIni.statusIzin === 'disetujui' ? '#bbf7d0' : '#e5e7eb'}`,
                                    background: pengajuanHariIni.statusIzin === 'disetujui' ? '#f0fdf4' : '#f9fafb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileText size={18} style={{ color: '#6b7280' }} />
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>
                                            Pengajuan {pengajuanHariIni.status === 'sakit' ? 'Sakit' : 'Izin'}
                                        </p>
                                        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>
                                            {pengajuanHariIni.statusIzin === 'pending'
                                                ? 'Menunggu persetujuan admin'
                                                : 'Disetujui oleh admin'}
                                        </p>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 700, borderRadius: '99px', padding: '4px 10px',
                                    background: pengajuanHariIni.statusIzin === 'disetujui' ? '#dcfce7' : '#f3f4f6',
                                    color: pengajuanHariIni.statusIzin === 'disetujui' ? '#16a34a' : '#6b7280',
                                }}>
                                    {pengajuanHariIni.statusIzin === 'disetujui' ? 'Disetujui' : 'Pending'}
                                </span>
                            </div>
                        ) : (
                            <button className="history-btn slide-up" onClick={() => setShowIzinModal(true)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileText size={18} style={{ color: '#6b7280' }} />
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Ajukan Izin / Sakit</span>
                                </div>
                                <ChevronRight size={16} style={{ color: '#9ca3af' }} />
                            </button>
                        )}
                    </>
                )}

                {/* ── MODAL IZIN ── */}
                {showIzinModal && (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                        onClick={() => setShowIzinModal(false)}
                    >
                        <div
                            className="glass-card slide-up"
                            style={{ width: '100%', maxWidth: '480px', padding: '24px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '20px' }}>
                                Ajukan Izin / Sakit
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Tanggal</label>
                                    <input
                                        type="date"
                                        value={izinForm.tanggal}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setIzinForm(f => ({ ...f, tanggal: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Sora, sans-serif' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Jenis</label>
                                    <select
                                        value={izinForm.status}
                                        onChange={e => setIzinForm(f => ({ ...f, status: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', background: '#fff' }}
                                    >
                                        <option value="izin">Izin</option>
                                        <option value="sakit">Sakit</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Keterangan</label>
                                    <textarea
                                        value={izinForm.keterangan}
                                        onChange={e => setIzinForm(f => ({ ...f, keterangan: e.target.value }))}
                                        rows={3}
                                        placeholder="Alasan izin..."
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', resize: 'none' }}
                                    />
                                </div>
                                <button
                                    className="scan-btn"
                                    onClick={submitIzin}
                                    disabled={!izinForm.tanggal || !izinForm.keterangan}
                                    style={{ opacity: (!izinForm.tanggal || !izinForm.keterangan) ? 0.5 : 1 }}
                                >
                                    Kirim Pengajuan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}