'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import BottomSheet from '@/components/bottom-sheet'
import { recordPayment } from '@/app/(dashboard)/orders/actions'
import { Loader2 } from 'lucide-react'
import { getStatusColor } from '@/lib/order-status'
import { useOnlineStatus } from '@/lib/use-online-status'

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
}

type Props = {
  open: boolean
  onClose: () => void
  order: Order
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default function RecordPaymentSheet({ open, onClose, order }: Props) {
  const [loading, setLoading] = useState(false)

  const online = useOnlineStatus()
  const customerName = order.customer?.name || '(tanpa nama)'
  const statusColor = getStatusColor('Dikerjakan')
  const price = Number(order.price)
  const dpAmount = order.dp_amount !== null ? Number(order.dp_amount) : 0
  const remaining = price - dpAmount

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!online) {
      toast.error('Catat pelunasan tidak tersedia saat offline')
      return
    }

    setLoading(true)
    const fd = new FormData()
    fd.set('paid_amount', String(remaining))

    const result = await recordPayment(order.id, fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pelunasan berhasil dicatat')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">Catat Pelunasan</h2>

      {/* Info order */}
      <div className="mb-5 space-y-2 rounded-xl bg-accent/50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pelanggan</span>
          <span className="font-medium text-foreground">{customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Layanan</span>
          <span className="font-medium text-foreground">{order.sofa_type} — {order.service_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Harga</span>
          <span className="font-semibold text-foreground">{formatRupiah(price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">DP Dibayar</span>
          <span className="font-medium text-foreground">{formatRupiah(dpAmount)}</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-foreground">Sisa Tagihan</span>
            <span className={`text-base font-bold ${statusColor.text}`}>{formatRupiah(remaining)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-center text-sm text-muted-foreground">
            Jumlah pelunasan akan dicatat sebesar <span className="font-semibold text-foreground">{formatRupiah(remaining)}</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl ${statusColor.bg} px-4 py-3 text-sm font-semibold ${statusColor.text} transition-colors hover:opacity-90 disabled:opacity-50 border-0`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : 'Konfirmasi Pelunasan'}
        </button>
      </form>
    </BottomSheet>
  )
}
