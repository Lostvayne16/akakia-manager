'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { toast } from 'sonner'
import BottomSheet from '@/components/bottom-sheet'
import { updateOrder, deleteOrder, getAutocompleteValues } from '@/app/(dashboard)/orders/actions'
import { Check, Loader2, Trash2 } from 'lucide-react'
import { useOnlineStatus } from '@/lib/use-online-status'

type Customer = { id: string; name: string; phone: string | null }

type Order = {
  id: string
  customer_id: string
  sofa_type: string
  service_type: string
  price: number
  dp_amount: number | null
  paid_amount: number | null
  customer: { id: string; name: string; phone: string | null; address: string | null } | null
}

type Props = {
  open: boolean
  onClose: () => void
  order: Order
  customers: Customer[]
}

export default function EditOrderSheet({ open, onClose, order, customers }: Props) {
  const selectedCustomer = customers.find((c) => c.id === order.customer_id) || null

  const [sofaType, setSofaType] = useState(order.sofa_type)
  const [serviceType, setServiceType] = useState(order.service_type)
  const [price, setPrice] = useState(Number(order.price).toLocaleString('id-ID'))

  const [sofaSuggestions, setSofaSuggestions] = useState<string[]>([])
  const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([])
  const [showSofaSuggestions, setShowSofaSuggestions] = useState(false)
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false)

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sofaRef = useRef<HTMLDivElement>(null)
  const serviceRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const hasPayment = order.dp_amount !== null || order.paid_amount !== null
  const online = useOnlineStatus()

  // Autocomplete
  const fetchSuggestions = useCallback(async (field: 'sofa_type' | 'service_type', query: string) => {
    if (query.length < 1) return
    const results = await getAutocompleteValues(field, query)
    if (field === 'sofa_type') setSofaSuggestions(results)
    else setServiceSuggestions(results)
  }, [])

  const debouncedFetch = useCallback(
    (field: 'sofa_type' | 'service_type', query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchSuggestions(field, query), 300)
    },
    [fetchSuggestions],
  )

  // Sync state when order changes
  useEffect(() => {
    if (open) {
      setSofaType(order.sofa_type)
      setServiceType(order.service_type)
      setPrice(Number(order.price).toLocaleString('id-ID'))
      setErrors({})
    }
  }, [open, order])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!sofaType.trim()) errs.sofaType = 'Tipe sofa wajib diisi'
    if (!serviceType.trim()) errs.serviceType = 'Tipe layanan wajib diisi'
    if (!hasPayment) {
      const priceNum = Number(price.replace(/\./g, ''))
      if (!price.trim() || isNaN(priceNum) || priceNum <= 0) errs.price = 'Harga harus lebih dari 0'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (!online) {
      toast.error('Edit tidak tersedia saat offline')
      return
    }

    setLoading(true)
    const fd = new FormData()
    fd.set('sofa_type', sofaType.trim())
    fd.set('service_type', serviceType.trim())
    if (!hasPayment) {
      fd.set('price', String(Number(price.replace(/\./g, ''))))
    }

    const result = await updateOrder(order.id, fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pesanan berhasil diperbarui')
    onClose()
  }

  async function handleDelete() {
    if (!online) {
      toast.error('Hapus tidak tersedia saat offline')
      return
    }

    setDeleting(true)
    const result = await deleteOrder(order.id)
    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.requiresConfirmation) {
      const ok = window.confirm(result.warning)
      if (!ok) return

      setDeleting(true)
      const confirmResult = await deleteOrder(order.id, true)
      setDeleting(false)

      if (confirmResult.error) {
        toast.error(confirmResult.error)
        return
      }
    }

    toast.success('Pesanan dihapus')
    onClose()
  }

  function handlePriceInput(val: string) {
    const digits = val.replace(/\D/g, '')
    if (!digits) { setPrice(''); return }
    setPrice(Number(digits).toLocaleString('id-ID'))
  }

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sofaRef.current && !sofaRef.current.contains(e.target as Node)) setShowSofaSuggestions(false)
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setShowServiceSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">Edit Pesanan</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer — readonly */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Pelanggan</label>
          <div className="flex w-full items-center rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            <span className="flex-1">{selectedCustomer?.name || '(tanpa nama)'}</span>
            <Check className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </div>
        </div>

        {/* Sofa type */}
        <div className="relative" ref={sofaRef}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Tipe Sofa</label>
          <input
            value={sofaType}
            onChange={(e) => {
              setSofaType(e.target.value)
              setShowSofaSuggestions(true)
              debouncedFetch('sofa_type', e.target.value)
            }}
            onFocus={() => setShowSofaSuggestions(true)}
            placeholder="Contoh: Sofa 3 Dudukan"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.sofaType && <p className="mt-1 text-xs text-destructive">{errors.sofaType}</p>}
          {showSofaSuggestions && sofaSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card shadow-xl">
              {sofaSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSofaType(s); setShowSofaSuggestions(false) }}
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
              setShowServiceSuggestions(true)
              debouncedFetch('service_type', e.target.value)
            }}
            onFocus={() => setShowServiceSuggestions(true)}
            placeholder="Contoh: Ganti Busa"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.serviceType && <p className="mt-1 text-xs text-destructive">{errors.serviceType}</p>}
          {showServiceSuggestions && serviceSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card shadow-xl">
              {serviceSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setServiceType(s); setShowServiceSuggestions(false) }}
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
          {hasPayment ? (
            <>
              <div className="flex w-full items-center rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                {Number(order.price).toLocaleString('id-ID')}
              </div>
              <p className="mt-1.5 text-xs text-amber-400">
                Harga tidak dapat diubah karena sudah ada pembayaran tercatat
              </p>
            </>
          ) : (
            <>
              <input
                value={price}
                onChange={(e) => handlePriceInput(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || deleting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

        {/* Hapus */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || deleting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Menghapus...' : 'Hapus Pesanan'}
        </button>
      </form>
    </BottomSheet>
  )
}
