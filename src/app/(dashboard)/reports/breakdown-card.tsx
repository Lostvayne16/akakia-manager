'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function BreakdownCard({ breakdown }: BreakdownCardProps) {
  const total = breakdown.reduce((s, b) => s + b.total, 0)

  return (
    <Card className="rounded-2xl border border-border bg-card transition-all hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Pengeluaran per Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Tidak ada pengeluaran pada periode ini
          </p>
        ) : (
          <div className="space-y-4">
            {breakdown.map((item) => {
              const colors = getCategoryColor(item.category)
              const pct = total > 0 ? (item.total / total) * 100 : 0

              return (
                <div key={item.category}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm tabular-nums">
                      <span className="font-semibold text-foreground">
                        {formatRupiah(item.total)}
                      </span>
                      <span className="text-muted-foreground">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.text}`}
                      style={{ backgroundColor: 'currentColor', width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
