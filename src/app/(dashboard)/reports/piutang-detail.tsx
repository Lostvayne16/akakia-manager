'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStatusColor } from '@/lib/order-status'
import type { PiutangItem } from '@/app/(dashboard)/reports/actions'

type PiutangDetailProps = {
  piutangList: PiutangItem[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export function PiutangDetail({ piutangList }: PiutangDetailProps) {
  const totalPiutang = piutangList.reduce((s, p) => s + p.sisaTagihan, 0)
  const badgeColors = getStatusColor('Dikerjakan')

  return (
    <Card className="group relative rounded-2xl border border-border bg-card transition-all glow-primary-hover">
      <div className="card-blob bg-amber-500" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Piutang
          </CardTitle>
          {piutangList.length > 0 && (
            <span className="text-lg font-bold tabular-nums text-foreground font-mono">
              {formatRupiah(totalPiutang)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {piutangList.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Semua pesanan sudah lunas, tidak ada piutang
          </p>
        ) : (
          <div className="divide-y divide-border">
            {piutangList.map((item) => (
              <div
                key={item.orderId}
                className="flex items-center justify-between gap-4 py-3"
              >
                {/* Kiri: identitas */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.customerName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.sofaType}
                  </p>
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground font-mono">
                    <span>Total: {formatRupiah(item.price)}</span>
                    <span>DP: {formatRupiah(item.dpAmount)}</span>
                  </div>
                </div>

                {/* Kanan: sisa tagihan — paling ditonjolkan */}
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-sm font-bold tabular-nums text-foreground font-mono">
                    {formatRupiah(item.sisaTagihan)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeColors.bg} ${badgeColors.text}`}
                  >
                    Belum Lunas
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
