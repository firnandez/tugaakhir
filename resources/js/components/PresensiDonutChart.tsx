import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Props = {
    hadir: number
    izin: number
    sakit: number
    alpha: number
    cuti: number
}

const COLORS = ['#1D9E75', '#EF9F27', '#378ADD', '#E24B4A', '#7F77DD']

export default function PresensiDonutChart({ hadir, izin, sakit, alpha, cuti }: Props) {
    const data = [
        { name: 'Hadir', value: hadir },
        { name: 'Izin', value: izin },
        { name: 'Sakit', value: sakit },
        { name: 'Alpha', value: alpha },
        { name: 'Cuti', value: cuti },
    ].filter(d => d.value > 0)

    const total = data.reduce((sum, d) => sum + d.value, 0)

    if (total === 0) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-5">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Distribusi status presensi</h3>
                <p className="text-sm text-gray-400">Belum ada data presensi bulan ini.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="mb-1 text-sm font-medium text-gray-900">Distribusi status presensi</h3>
            <p className="mb-4 text-xs text-gray-400">Bulan ini · {total} total presensi</p>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number, name: string) => [
                            `${value} (${Math.round((value / total) * 100)}%)`,
                            name,
                        ]}
                        contentStyle={{
                            fontSize: 12,
                            borderRadius: 8,
                            border: '0.5px solid #e5e7eb',
                        }}
                    />
                    <Legend
                        iconType="square"
                        iconSize={10}
                        formatter={(value) => (
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}