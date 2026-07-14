'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, PackageOpen, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import CustomerCard from '@/components/customer-card'
import CreateCustomerSheet from '@/components/create-customer-sheet'
import EditCustomerSheet from '@/components/edit-customer-sheet'
import { getCustomers } from '@/app/(dashboard)/customers/actions'
import { getPendingItems } from '@/lib/offline-db'
import type { PendingRecord } from '@/lib/offline-db'

type CustomerWithPending = Customer & { _pending?: boolean }

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  is_active: boolean
  created_at: string
}

type Props = {
  initialCustomers: Customer[]
  orderCounts: Record<string, number>
}

export default function CustomersList({ initialCustomers, orderCounts }: Props) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [pendingCustomers, setPendingCustomers] = useState<CustomerWithPending[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)

  // Auto-open create sheet jika URL memiliki ?new=true
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new') === 'true') {
      setCreateOpen(true)
    }
  }, [])

  // Ambil pending customers dari IndexedDB saat mount
  useEffect(() => {
    getPendingItems<Record<string, unknown>>('pending_customers').then((items) => {
      const mapped: CustomerWithPending[] = items.map(
        (item: PendingRecord<Record<string, unknown>>) => ({
          id: item.id,
          name: (item.data.name as string) || '',
          phone: (item.data.phone as string) || '',
          address: (item.data.address as string) || null,
          is_active: true,
          created_at: item.created_at,
          _pending: true,
        }),
      )
      setPendingCustomers(mapped)
    })
  }, [])

  // Tampilkan nonaktif (hanya data server)
  const displayCustomers = useMemo(() => {
    return customers.filter((c) => showInactive || c.is_active)
  }, [customers, showInactive])

  // Search — hanya untuk data server, pending items selalu muncul di atas
  const filteredServer = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return displayCustomers
    return displayCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
    )
  }, [displayCustomers, searchQuery])

  // Gabung pending + server
  const merged = useMemo(
    () => [...pendingCustomers, ...filteredServer],
    [pendingCustomers, filteredServer],
  )

  async function handleToggleShowInactive() {
    const next = !showInactive
    setShowInactive(next)
    // fetch ulang dari server
    const result = await getCustomers(next)
    setCustomers(result)
  }

  function handleCloseEdit() {
    setEditCustomer(null)
    // refresh
    getCustomers(showInactive).then(setCustomers).catch(() => {})
  }

  function handleCreateClose() {
    setCreateOpen(false)
    window.history.replaceState(null, '', window.location.pathname)
    getCustomers(showInactive).then(setCustomers).catch(() => {})
  }

  const isEmpty = customers.length === 0 && pendingCustomers.length === 0
  const noResults = !isEmpty && merged.length === 0

  return (
    <>
      {/* Header sticky */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-gradient-to-b from-background via-background to-background/95 px-4 pb-3 pt-4 backdrop-blur-sm sm:static sm:mx-0 sm:mt-0 sm:bg-none sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pelanggan</h1>
            <p className="text-sm text-muted-foreground">{customers.length + pendingCustomers.length} pelanggan</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Pelanggan Baru</span>
          </button>
        </div>

        {/* Search + toggle */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau nomor HP..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleToggleShowInactive}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
              showInactive
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-input text-muted-foreground hover:text-foreground'
            }`}
          >
            {showInactive ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            Nonaktif
          </button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Belum ada pelanggan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambah pelanggan pertama untuk mulai mencatat servis sofa.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Tambah Pelanggan Pertama
          </button>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="mt-16 text-center text-sm text-muted-foreground">
          Tidak ada pelanggan yang cocok dengan pencarian.
        </div>
      )}

      {/* Cards */}
      {!isEmpty && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {merged.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              orderCount={orderCounts[customer.id] || 0}
              onEdit={(c) => setEditCustomer(c)}
            />
          ))}
        </div>
      )}

      {/* Bottom sheets — conditional mount */}
      <CreateCustomerSheet open={createOpen} onClose={handleCreateClose} />

      {editCustomer && (
        <EditCustomerSheet
          open
          onClose={handleCloseEdit}
          customer={editCustomer}
          orderCount={orderCounts[editCustomer.id] || 0}
        />
      )}
    </>
  )
}
