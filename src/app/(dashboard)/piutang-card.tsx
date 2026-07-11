'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

type PiutangCardProps = {
  totalPiutang: number
  orderCount: number
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export function PiutangCard({ totalPiutang, orderCount }: PiutangCardProps) {
  const hasPiutang = orderCount > 0

  return (
    <Card
      className={`rounded-2xl border bg-card transition-all ${
        hasPiutang
          ? 'border-amber-500/20 hover:shadow-[0_0_20px_-8px_rgba(245,158,11,0.3)]'
          : 'border-border hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Piutang Belum Lunas
              </p>
              {hasPiutang && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                  {orderCount} pesanan
                </span>
              )}
            </div>

            {hasPiutang ? (
              <>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                  {formatRupiah(totalPiutang)}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  dari {orderCount} pesanan belum lunas
                </p>
              </>
            ) : (
              <>
                <p className="mt-1.5 text-lg font-semibold text-foreground">
                  Tidak ada piutang saat ini
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Semua pesanan sudah lunas
                </p>
              </>
            )}
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              hasPiutang ? 'bg-amber-500/10' : 'bg-emerald-500/10'
            }`}
          >
            <Clock
              className={`h-5 w-5 ${
                hasPiutang ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
