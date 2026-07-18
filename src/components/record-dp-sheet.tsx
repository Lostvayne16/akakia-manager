'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import BottomSheet from '@/components/bottom-sheet'
import { recordDp } from '@/app/(dashboard)/orders/actions'
import { Loader2 } from 'lucide-react'
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

export default function RecordDpSheet({ open, onClose, order }: Props) {
  const [dpAmount, setDpAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const online = useOnlineStatus()
  const customerName = order.customer?.name || '(tanpa nama)'
  const price = Number(order.price)

  function handleDpInput(val: string) {
    const digits = val.replace(/\D/g, '')
    if (!digits) { setDpAmount(''); return }
    setDpAmount(Number(digits).toLocaleString('id-ID'))
    setError('')
  }

  function validate(): boolean {
    const dpNum = Number(dpAmount.replace(/\./g, ''))
    if (!dpAmount.trim() || isNaN(dpNum) || dpNum <= 0) {
      setError('Jumlah DP harus lebih dari 0')
      return false
    }
    if (dpNum > price) {
      setError(`DP tidak boleh melebihi harga (${formatRupiah(price)})`)
      return false
    }
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (!online) {
      toast.error('Catat DP tidak tersedia saat offline')
      return
    }

    setLoading(true)
    const fd = new FormData()
    fd.set('dp_amount', String(Number(dpAmount.replace(/\./g, ''))))

    const result = await recordDp(order.id, fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('DP berhasil dicatat')
    setDpAmount('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">Catat DP</h2>

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
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DP input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Jumlah DP (Rp)</label>
          <input
            value={dpAmount}
            onChange={(e) => handleDpInput(e.target.value)}
            placeholder="0"
            inputMode="numeric"
            autoFocus
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan DP'}
        </button>
      </form>
    </BottomSheet>
  )
}
