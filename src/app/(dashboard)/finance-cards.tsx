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
  blobColor = 'primary',
  fullWidth = false,
}: {
  title: string
  value: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: string
  trendUp?: boolean
  showArrow?: boolean
  blobColor?: 'primary' | 'secondary'
  fullWidth?: boolean
}) {
  return (
    <Card
      className={`group relative @container rounded-2xl border border-border bg-card transition-all glow-primary-hover ${
        fullWidth ? 'min-[480px]:col-span-2 lg:col-span-1' : ''
      }`}
    >
      <div
        className={`card-blob ${blobColor === 'secondary' ? 'bg-secondary' : 'bg-primary'}`}
      />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <p
          className={`mt-3 truncate leading-[1.2] tracking-[-0.01em] font-bold text-foreground font-mono ${
            blobColor === 'secondary' ? 'glow-text-secondary' : 'glow-text-primary'
          }`}
          style={{ fontSize: 'clamp(1.25rem, 9cqw, 2rem)' }}
        >
          {value}
        </p>
        {trend && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm">
            {showArrow && (
              <span
                className={`font-medium ${
                  trendUp ? 'text-positive' : 'text-negative'
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
    <div className="grid gap-4 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Pendapatan"
        value={formatRupiah(totalPendapatan)}
        icon={Wallet}
        iconBg="bg-emerald-500/10"
        iconColor="text-positive"
        trend="Bulan ini"
        blobColor="primary"
      />
      <StatCard
        title="Total Pengeluaran"
        value={formatRupiah(totalPengeluaran)}
        icon={TrendingDown}
        iconBg="bg-rose-500/10"
        iconColor="text-negative"
        trend="Bulan ini"
        blobColor="secondary"
      />
      <StatCard
        title={isProfit ? 'Untung' : 'Rugi'}
        value={formatRupiah(Math.abs(untungRugi))}
        icon={isProfit ? TrendingUp : TrendingDown}
        iconBg={isProfit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
        iconColor={isProfit ? 'text-positive' : 'text-negative'}
        trend={isProfit ? 'Laba bersih' : 'Defisit'}
        trendUp={isProfit}
        showArrow
        blobColor={isProfit ? 'primary' : 'secondary'}
        fullWidth
      />
    </div>
  )
}
