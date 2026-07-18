'use client'

import { User, Phone, MapPin, Package } from 'lucide-react'
import { toast } from 'sonner'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  is_active: boolean
  created_at: string
  _pending?: boolean
}

type Props = {
  customer: Customer
  orderCount: number
  onEdit: (customer: Customer) => void
}

export default function CustomerCard({ customer, orderCount, onEdit }: Props) {
  function handleClick() {
    if (customer._pending) {
      toast.error('Data ini masih menunggu sinkronisasi, belum bisa diedit')
      return
    }
    onEdit(customer)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-colors ${
        customer._pending
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer group hover:bg-muted/40'
      }`}
      onClick={handleClick}
    >
      {!customer._pending && (
        <span className="absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />
      )}
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{customer.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(customer.created_at))}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {customer._pending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              ⏳ Belum tersinkron
            </span>
          )}
          {!customer.is_active && !customer._pending && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400">
              Nonaktif
            </span>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-3.5 w-3.5 shrink-0" />
        <a
          href={`tel:${customer.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="truncate hover:text-primary transition-colors"
        >
          {customer.phone}
        </a>
      </div>

      {/* Address — only if present */}
      {customer.address && (
        <div className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{customer.address}</span>
        </div>
      )}

      {/* Total orders — subtle indicator */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <Package className="h-3 w-3" />
        <span>{orderCount === 0 ? 'Belum ada pesanan' : `${orderCount} pesanan tercatat`}</span>
      </div>
    </div>
  )
}
