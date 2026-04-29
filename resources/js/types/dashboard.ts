export type Stat = {
    totalKaryawan: number
    tambahKaryawan: number
    totalPresensi: number
    persenHadir: number
    totalIzin: number
    izinNaik: boolean
}

export type Activity = {
    initials: string
    nama: string
    jabatan: string
    action: string
    time: string
    badge: string
    status: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'cuti'
}

export type PresensiRow = {
    nama: string
    jabatan: string
    masuk: string | null
    status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpha' | 'Belum absen'
}

export type DistribusiPresensi = {
    hadir: number
    izin: number
    sakit: number
    alpha: number
    cuti: number
}

export type TrenPenggajian = {
    bulan: string
    total: number
}