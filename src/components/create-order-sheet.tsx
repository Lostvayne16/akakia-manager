'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { toast } from 'sonner'
import BottomSheet from '@/components/bottom-sheet'
import { createOrder, getAutocompleteValues } from '@/app/(dashboard)/orders/actions'
import { Search, ChevronsUpDown, Check, Loader2 } from 'lucide-react'
import { useOnlineStatus } from '@/lib/use-online-status'
import { addPendingItem } from '@/lib/offline-db'

type Customer = { id: string; name: string; phone: string | null; _pending?: boolean }

type Props = {
  open: boolean
  onClose: () => void
  customers: Customer[]
  customersLoading?: boolean
}

export default function CreateOrderSheet({ open, onClose, customers, customersLoading = false }: Props) {
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [sofaType, setSofaType] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [price, setPrice] = useState('')

  const [sofaSuggestions, setSofaSuggestions] = useState<string[]>([])
  const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([])
  const [showSofaSuggestions, setShowSofaSuggestions] = useState(false)
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sofaRef = useRef<HTMLDivElement>(null)
  const serviceRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const online = useOnlineStatus()

  // Filter customers — buang yang masih pending (ID belum fix di server)
  const activeCustomers = customers.filter((c) => !c._pending)

  // Search hanya dari activeCustomers
  const filteredCustomers = activeCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  )

  // Autocomplete debounced (CLAUDE.md §17 — ≥300ms) — hanya jika online
  const fetchSuggestions = useCallback(async (field: 'sofa_type' | 'service_type', query: string) => {
    if (query.length < 1) return
    const results = await getAutocompleteValues(field, query)
    if (field === 'sofa_type') {
      setSofaSuggestions(results)
    } else {
      setServiceSuggestions(results)
    }
  }, [])

  const debouncedFetch = useCallback(
    (field: 'sofa_type' | 'service_type', query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchSuggestions(field, query), 300)
    },
    [fetchSuggestions],
  )

  // Reset form
  function reset() {
    setCustomerSearch('')
    setCustomerOpen(false)
    setSelectedCustomer(null)
    setSofaType('')
    setServiceType('')
    setPrice('')
    setSofaSuggestions([])
    setServiceSuggestions([])
    setErrors({})
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!selectedCustomer) errs.customer = 'Pilih pelanggan'
    if (!sofaType.trim()) errs.sofaType = 'Tipe sofa wajib diisi'
    if (!serviceType.trim()) errs.serviceType = 'Tipe layanan wajib diisi'
    const priceNum = Number(price.replace(/\./g, ''))
    if (!price.trim() || isNaN(priceNum) || priceNum <= 0) errs.price = 'Harga harus lebih dari 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    // Pastikan selectedCustomer bukan pending (guard, seharusnya sudah difilter)
    if (selectedCustomer?._pending) {
      toast.error('Pelanggan ini belum tersinkron, pilih pelanggan lain')
      return
    }

    setLoading(true)

    if (!online) {
      await addPendingItem('pending_orders', {
        data: {
          customer_id: selectedCustomer!.id,
          sofa_type: sofaType.trim(),
          service_type: serviceType.trim(),
          price: Number(price.replace(/\./g, '')),
        },
        action: 'create',
      })
      setLoading(false)
      toast.success('Pesanan disimpan secara lokal, akan disinkronkan saat online kembali')
      reset()
      onClose()
      return
    }

    const fd = new FormData()
    fd.set('customer_id', selectedCustomer!.id)
    fd.set('sofa_type', sofaType.trim())
    fd.set('service_type', serviceType.trim())
    fd.set('price', String(Number(price.replace(/\./g, ''))))

    const result = await createOrder(fd)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pesanan berhasil dibuat')
    reset()
    onClose()
  }

  // Format price with dot separators while typing
  function handlePriceInput(val: string) {
    const digits = val.replace(/\D/g, '')
    if (!digits) {
      setPrice('')
      return
    }
    setPrice(Number(digits).toLocaleString('id-ID'))
  }

  // Close suggestions on outside click
  useEffect(() => {
    if (!open) reset()
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sofaRef.current && !sofaRef.current.contains(e.target as Node)) {
        setShowSofaSuggestions(false)
      }
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
        setShowServiceSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">Pesanan Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer combobox */}
        <div className="relative">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Pelanggan</label>
          <button
            type="button"
            onClick={() => setCustomerOpen(!customerOpen)}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-left"
          >
            <span className={selectedCustomer ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedCustomer ? selectedCustomer.name : 'Pilih pelanggan...'}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
          {errors.customer && <p className="mt-1 text-xs text-destructive">{errors.customer}</p>}

          {customerOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Cari pelanggan..."
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-44 overflow-y-auto p-1">
                {activeCustomers.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    {customersLoading
                      ? 'Memuat daftar pelanggan...'
                      : !online
                        ? 'Tidak ada pelanggan yang bisa dipilih saat offline — pelanggan yang baru dibuat perlu disinkronkan dulu'
                        : 'Belum ada pelanggan, tambahkan dulu di menu Pelanggan'}
                  </p>
                ) : filteredCustomers.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    Pelanggan tidak ditemukan
                  </p>
                ) : (
                  filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(c)
                        setCustomerOpen(false)
                        setCustomerSearch('')
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <span className="flex-1 text-left">{c.name}</span>
                      {selectedCustomer?.id === c.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sofa type */}
        <div className="relative" ref={sofaRef}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Tipe Sofa</label>
          <input
            value={sofaType}
            onChange={(e) => {
              setSofaType(e.target.value)
              if (online) {
                setShowSofaSuggestions(true)
                debouncedFetch('sofa_type', e.target.value)
              }
            }}
            onFocus={() => online && setShowSofaSuggestions(true)}
            placeholder={`Contoh: Sofa 3 Dudukan${!online ? ' (autocomplete tidak tersedia)' : ''}`}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.sofaType && <p className="mt-1 text-xs text-destructive">{errors.sofaType}</p>}
          {online && showSofaSuggestions && sofaSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card shadow-xl">
              {sofaSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSofaType(s)
                    setShowSofaSuggestions(false)
                  }}
                  className="w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service type */}
        <div className="relative" ref={serviceRef}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Tipe Layanan</label>
          <input
            value={serviceType}
            onChange={(e) => {
              setServiceType(e.target.value)
              if (online) {
                setShowServiceSuggestions(true)
                debouncedFetch('service_type', e.target.value)
              }
            }}
            onFocus={() => online && setShowServiceSuggestions(true)}
            placeholder={`Contoh: Ganti Busa${!online ? ' (autocomplete tidak tersedia)' : ''}`}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.serviceType && <p className="mt-1 text-xs text-destructive">{errors.serviceType}</p>}
          {online && showServiceSuggestions && serviceSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card shadow-xl">
              {serviceSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setServiceType(s)
                    setShowServiceSuggestions(false)
                  }}
                  className="w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Harga (Rp)</label>
          <input
            value={price}
            onChange={(e) => handlePriceInput(e.target.value)}
            placeholder="0"
            inputMode="numeric"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </BottomSheet>
  )
}
