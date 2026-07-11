import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/charts/bar-chart'
import type { MonthlyRevenue } from '@/app/(dashboard)/actions'

type IncomeChartProps = {
  data: MonthlyRevenue[]
}

export function IncomeChart({ data }: IncomeChartProps) {
  // Untuk tooltip-ish: konversi ke format chart {label, value}
  const chartData = data.map((d) => ({ label: d.month, value: d.total }))

  // Tentukan periode teks (contoh: "Februari – Juli")
  const startMonth = data[0]?.month
  const endMonth = data[data.length - 1]?.month

  const totalRevenue = data.reduce((sum, d) => sum + d.total, 0)
  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n)

  return (
    <Card className="rounded-2xl border border-border bg-card transition-all hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Tren Pemasukan
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {startMonth && endMonth
                ? `${startMonth} – ${endMonth}`
                : '6 bulan terakhir'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground">
              Total
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatRupiah(totalRevenue)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BarChart data={chartData} height={200} barColor="var(--chart-1)" />
      </CardContent>
    </Card>
  )
}
