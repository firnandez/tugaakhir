import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

type TrenItem = {
    bulan: string
    total: number
}

type Props = {
    data: TrenItem[]
}

const formatRupiah = (value: number) => {
    if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`
    if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`
    return `Rp${value}`
}

export default function TrenPenggajianChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-5">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Tren penggajian bulanan</h3>
                <p className="text-sm text-gray-400">Belum ada data penggajian.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="mb-1 text-sm font-medium text-gray-900">Tren penggajian bulanan</h3>
            <p className="mb-4 text-xs text-gray-400">6 bulan terakhir</p>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                        dataKey="bulan"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatRupiah}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                    />
                    <Tooltip
                        formatter={(value: number) => [
                            new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            }).format(value),
                            'Total gaji',
                        ]}
                        contentStyle={{
                            fontSize: 12,
                            borderRadius: 8,
                            border: '0.5px solid #e5e7eb',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#7F77DD"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#7F77DD' }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}