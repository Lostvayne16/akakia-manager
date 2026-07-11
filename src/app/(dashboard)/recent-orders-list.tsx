import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { getOrderStatus, getStatusColor } from '@/lib/order-status'
import type { RecentOrder } from '@/app/(dashboard)/actions'

type RecentOrdersListProps = {
  orders: RecentOrder[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card transition-all hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Pesanan Terbaru
          </CardTitle>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Lihat semua
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            Belum ada pesanan
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order) => {
              const status = getOrderStatus(order)
              const colors = getStatusColor(status)

              return (
                <li key={order.id}>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-6"
                  >
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {(order.customer?.name || '?').charAt(0).toUpperCase()}
                    </div>

                    {/* Middle: name + sofa_type */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {order.customer?.name || 'Pelanggan tidak diketahui'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.sofa_type}
                      </p>
                    </div>

                    {/* Right: price + badge */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatRupiah(Number(order.price))}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}
                      >
                        {status}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
