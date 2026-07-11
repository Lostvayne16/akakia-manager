'use client'

import { getOrderStatus, getStatusColor } from '@/lib/order-status'
import { ClipboardList } from 'lucide-react'
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
  const status = getOrderStatus(order)
  const colors = getStatusColor(status)
  const customerName = order.customer?.name || '(tanpa nama)'

  function handleClick() {
    if (order._pending) {
      toast.error('Data ini masih menunggu sinkronisasi, belum bisa diedit')
      return
    }
    onEdit(order)
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-[0_0_20px_-8px_rgba(94,106,210,0.3)] ${
        order._pending
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer group'
      }`}
      onClick={handleClick}
    >
      {/* Header: customer + badge */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{customerName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {order._pending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              ⏳ Belum tersinkron
            </span>
          )}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <ClipboardList className="h-4 w-4" />
          Catat DP
        </button>
      )}
      {!order._pending && status === 'Dikerjakan' && (
        <button
          onClick={(e) => { e.stopPropagation(); onRecordPayment(order) }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${colors.bg} ${colors.text} hover:opacity-80`}
        >
          <ClipboardList className="h-4 w-4" />
          Catat Pelunasan
        </button>
      )}
    </div>
  )
}
