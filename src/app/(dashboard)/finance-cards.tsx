'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react'

type FinanceCardProps = {
  totalPendapatan: number
  totalPengeluaran: number
  untungRugi: number
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendUp,
  showArrow = false,
}: {
  title: string
  value: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: string
  trendUp?: boolean
  showArrow?: boolean
}) {
  return (
    <Card
      className="group rounded-2xl border border-border bg-card transition-all hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm">
                {showArrow && (
                  <span
                    className={`font-medium ${
                      trendUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {trendUp ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
                <span className="text-muted-foreground">{trend}</span>
              </p>
            )}
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FinanceCards({
  totalPendapatan,
  totalPengeluaran,
  untungRugi,
}: FinanceCardProps) {
  const isProfit = untungRugi >= 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Pendapatan"
        value={formatRupiah(totalPendapatan)}
        icon={Wallet}
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-400"
        trend="Bulan ini"
      />
      <StatCard
        title="Total Pengeluaran"
        value={formatRupiah(totalPengeluaran)}
        icon={TrendingDown}
        iconBg="bg-rose-500/10"
        iconColor="text-rose-400"
        trend="Bulan ini"
      />
      <StatCard
        title={isProfit ? 'Untung' : 'Rugi'}
        value={formatRupiah(Math.abs(untungRugi))}
        icon={isProfit ? TrendingUp : TrendingDown}
        iconBg={isProfit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
        iconColor={isProfit ? 'text-emerald-400' : 'text-rose-400'}
        trend={isProfit ? 'Laba bersih' : 'Defisit'}
        trendUp={isProfit}
        showArrow
      />
    </div>
  )
}
