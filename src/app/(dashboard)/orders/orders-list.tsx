'use client'

import { useState, useMemo, useEffect } from 'react'
import { getOrderStatus } from '@/lib/order-status'
import { Search, Plus, PackageOpen } from 'lucide-react'
import OrderCard from '@/components/order-card'
import CreateOrderSheet from '@/components/create-order-sheet'
import RecordDpSheet from '@/components/record-dp-sheet'
import RecordPaymentSheet from '@/components/record-payment-sheet'
import EditOrderSheet from '@/components/edit-order-sheet'
import { getPendingItems } from '@/lib/offline-db'
import type { PendingRecord } from '@/lib/offline-db'

type Customer = { id: string; name: string; phone: string | null }

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
  initialOrders: Order[]
  customers: Customer[]
}

const STATUSES = ['Semua', 'Masuk', 'Dikerjakan', 'Selesai'] as const

export default function OrdersList({ initialOrders, customers }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Semua')

  // Bottom sheet states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [dpOrder, setDpOrder] = useState<Order | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)

  // Auto-open create sheet jika URL memiliki ?new=true
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new') === 'true') {
      setCreateOpen(true)
    }
  }, [])

  // Ambil pending orders dari IndexedDB saat mount
  useEffect(() => {
    getPendingItems<Record<string, unknown>>('pending_orders').then((items) => {
      const mapped: Order[] = items.map(
        (item: PendingRecord<Record<string, unknown>>) => {
          const data = item.data as {
            customer_id: string
            sofa_type: string
            service_type: string
            price: number
          }
          // Cari nama customer dari prop customers
          const customerInfo = customers.find((c) => c.id === data.customer_id)
          return {
            id: item.id,
            customer_id: data.customer_id,
            sofa_type: data.sofa_type,
            service_type: data.service_type,
            price: data.price,
            dp_amount: null,
            dp_paid_at: null,
            paid_amount: null,
            paid_at: null,
            created_at: item.created_at,
            updated_at: item.created_at,
            customer: customerInfo
              ? { id: customerInfo.id, name: customerInfo.name, phone: customerInfo.phone, address: null }
              : null,
            _pending: true,
          }
        },
      )
      setPendingOrders(mapped)
    })
  }, [customers])

  // Filter + search (hanya data server)
  const filteredServer = useMemo(() => {
    return orders.filter((o) => {
      const computed = getOrderStatus(o)
      const matchesStatus = statusFilter === 'Semua' || computed === statusFilter
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        o.customer?.name.toLowerCase().includes(q) ||
        o.sofa_type.toLowerCase().includes(q) ||
        o.service_type.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [orders, searchQuery, statusFilter])

  // Gabung pending + server
  const merged = useMemo(
    () => [...pendingOrders, ...filteredServer],
    [pendingOrders, filteredServer],
  )

  // Bottom sheet close callbacks — sync local state after mutations
  function handleCreateClose() {
    setCreateOpen(false)
    window.history.replaceState(null, '', window.location.pathname)
    import('@/app/(dashboard)/orders/actions').then((m) =>
      m.getOrders().then(setOrders).catch(() => {}),
    )
  }

  function handleEditClose() {
    setEditOrder(null)
    import('@/app/(dashboard)/orders/actions').then((m) =>
      m.getOrders().then(setOrders).catch(() => {}),
    )
  }

  function handleDpClose() {
    setDpOrder(null)
    import('@/app/(dashboard)/orders/actions').then((m) =>
      m.getOrders().then(setOrders).catch(() => {}),
    )
  }

  function handlePaymentClose() {
    setPaymentOrder(null)
    import('@/app/(dashboard)/orders/actions').then((m) =>
      m.getOrders().then(setOrders).catch(() => {}),
    )
  }

  const isEmpty = orders.length === 0 && pendingOrders.length === 0
  const noResults = !isEmpty && merged.length === 0

  return (
    <>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-gradient-to-b from-background via-background to-background/95 px-4 pb-3 pt-4 backdrop-blur-sm sm:static sm:mx-0 sm:mt-0 sm:bg-none sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pesanan</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length + pendingOrders.length} pesanan
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            disabled={customers.length === 0}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Pesanan Baru</span>
          </button>
        </div>

        {/* Search & filter */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelanggan atau sofa..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'Semua' ? 'Semua' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No customers warning */}
      {customers.length === 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
          Tambah pelanggan dulu di halaman <strong>Pelanggan</strong> sebelum buat pesanan.
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Belum ada pesanan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Buat pesanan pertama untuk mulai mencatat servis sofa.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            disabled={customers.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Tambah Pesanan Pertama
          </button>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="mt-16 text-center text-sm text-muted-foreground">
          Tidak ada pesanan yang cocok dengan pencarian.
        </div>
      )}

      {/* Orders grid */}
      {!isEmpty && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {merged.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={(o) => setEditOrder(o)}
              onRecordDp={(o) => setDpOrder(o)}
              onRecordPayment={(o) => setPaymentOrder(o)}
            />
          ))}
        </div>
      )}

      {/* Bottom sheets */}
      <CreateOrderSheet
        open={createOpen}
        onClose={handleCreateClose}
        customers={customers}
      />

      {editOrder && (
        <EditOrderSheet
          open
          onClose={handleEditClose}
          order={editOrder}
          customers={customers}
        />
      )}

      {dpOrder && (
        <RecordDpSheet
          open
          onClose={handleDpClose}
          order={dpOrder}
        />
      )}

      {paymentOrder && (
        <RecordPaymentSheet
          open
          onClose={handlePaymentClose}
          order={paymentOrder}
        />
      )}
    </>
  )
}
