'use client'

import { useRouter } from 'next/navigation'
import { getOrderStatus, getStatusColor } from '@/lib/order-status'
import { ClipboardList, Pencil } from 'lucide-react'
import { toast } from 'sonner'

type Order = {
  id: string
  customer_id: string
  sofa_type: string
  service_type: string
  price: number
  dp_amount: number | null
  dp_paid_at: string | null
  paid_amount: number | null
  paid_at: string | null
  created_at: string
  updated_at: string
  customer: { id: string; name: string; phone: string | null; address: string | null } | null
  _pending?: boolean
}

type Props = {
  order: Order
  onRecordDp: (order: Order) => void
  onRecordPayment: (order: Order) => void
  onEdit: (order: Order) => void
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(iso))
}

export default function OrderCard({ order, onRecordDp, onRecordPayment, onEdit }: Props) {
  const router = useRouter()
  const status = getOrderStatus(order)
  const colors = getStatusColor(status)
  const customerName = order.customer?.name || '(tanpa nama)'

  function handleClick() {
    if (order._pending) {
      toast.error('Data ini masih menunggu sinkronisasi, belum bisa dibuka')
      return
    }
    router.push(`/orders/${order.id}`)
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    if (order._pending) {
      toast.error('Data ini masih menunggu sinkronisasi, belum bisa diedit')
      return
    }
    onEdit(order)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-colors ${
        order._pending
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer group hover:bg-muted/40'
      }`}
      onClick={handleClick}
    >
      {!order._pending && (
        <span className="absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />
      )}
      {/* Header: customer + badge + edit */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{customerName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {order._pending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              ⏳ Belum tersinkron
            </span>
          )}
          <button
            onClick={handleEdit}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Edit pesanan"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-5 ${colors.bg} ${colors.text}`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Service details */}
      <div className="mb-3 space-y-1">
        <p className="text-sm text-foreground">
          <span className="text-muted-foreground">Sofa:</span> {order.sofa_type}
        </p>
        <p className="text-sm text-foreground">
          <span className="text-muted-foreground">Servis:</span> {order.service_type}
        </p>
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {formatRupiah(Number(order.price))}
        </span>
      </div>

      {/* Action — hanya tampil jika bukan pending */}
      {!order._pending && status === 'Masuk' && (
        <button
          onClick={(e) => { e.stopPropagation(); onRecordDp(order) }}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <ClipboardList className="h-4 w-4" />
          Catat DP
        </button>
      )}
      {!order._pending && status === 'Dikerjakan' && (
        <button
          onClick={(e) => { e.stopPropagation(); onRecordPayment(order) }}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${colors.bg} ${colors.text} hover:opacity-80`}
        >
          <ClipboardList className="h-4 w-4" />
          Catat Pelunasan
        </button>
      )}
    </div>
  )
}
