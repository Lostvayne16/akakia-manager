'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ProfitLossReport, PeriodComparison } from '@/app/(dashboard)/reports/actions'

type ProfitLossCardProps = {
  profitLoss: ProfitLossReport
  comparison: PeriodComparison
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export function ProfitLossCard({ profitLoss, comparison }: ProfitLossCardProps) {
  const isProfit = profitLoss.untungRugi >= 0

  const compPositive = comparison.selisihRupiah >= 0
  const compNonNull = comparison.selisihPersen !== null

  return (
    <Card className="rounded-2xl border border-border bg-card transition-all hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Laba / Rugi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Baris: Pendapatan – Pengeluaran = Untung/Rugi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Pendapatan</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatRupiah(profitLoss.totalPendapatan)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Pengeluaran</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatRupiah(profitLoss.totalPengeluaran)}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {isProfit ? 'Untung' : 'Rugi'}
              </span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatRupiah(Math.abs(profitLoss.untungRugi))}
              </span>
            </div>
          </div>
        </div>

        {/* Perbandingan periode sebelumnya */}
        <div className="rounded-xl bg-muted/30 px-4 py-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            vs periode sebelumnya
          </div>

          {compNonNull ? (
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-sm font-semibold ${
                  compPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {compPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {formatRupiah(Math.abs(comparison.selisihRupiah))}
              </span>
              <span className="text-sm text-muted-foreground">
                ({comparison.selisihPersen}%)
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tidak ada data pembanding
            </p>
          )}

          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span>
              Sekarang: {formatRupiah(comparison.periodeSekarang)}
            </span>
            <span>
              Sebelum: {formatRupiah(comparison.periodeSebelum)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
