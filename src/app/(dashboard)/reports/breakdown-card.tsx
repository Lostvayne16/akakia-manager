'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiDonutChart } from '@/components/charts/multi-donut-chart'
import { getCategoryColor } from '@/lib/expense-category'
import type { ExpenseCategoryTotal } from '@/app/(dashboard)/reports/actions'

type BreakdownCardProps = {
  breakdown: ExpenseCategoryTotal[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

function categoryColor(category: string): string {
  return getCategoryColor(category).text
}

export function BreakdownCard({ breakdown }: BreakdownCardProps) {
  const total = breakdown.reduce((s, b) => s + b.total, 0)

  const segments = breakdown.map((item) => ({
    label: item.category,
    value: item.total,
    color: categoryColor(item.category),
  }))

  return (
    <Card className="group relative rounded-2xl border border-border bg-card transition-all glow-primary-hover">
      <div className="card-blob bg-secondary" />
      <CardHeader className="relative pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Pengeluaran per Kategori
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {breakdown.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Tidak ada pengeluaran pada periode ini
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <MultiDonutChart segments={segments} size={180} strokeWidth={16}>
              <div className="flex max-w-[110px] flex-col items-center px-1 text-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="truncate text-sm font-bold leading-tight text-foreground font-mono">
                  {formatRupiah(total)}
                </span>
              </div>
            </MultiDonutChart>

            <div className="grid w-full grid-cols-1 gap-x-6 gap-y-2 sm:w-auto sm:grid-cols-2">
              {breakdown.map((item) => {
                const pct = total > 0 ? (item.total / total) * 100 : 0
                return (
                  <div key={item.category} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: categoryColor(item.category) }}
                    />
                    <span className="text-sm text-foreground">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ({pct.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
