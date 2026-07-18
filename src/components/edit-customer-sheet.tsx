'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import BottomSheet from '@/components/bottom-sheet'
import {
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer,
  deleteCustomer,
} from '@/app/(dashboard)/customers/actions'
import { useOnlineStatus } from '@/lib/use-online-status'

type Customer = {
  id: string
  name: string
  phone: string
  address: string | null
  is_active: boolean
  created_at: string
}

type Props = {
  open: boolean
  onClose: () => void
  customer: Customer
  orderCount: number
}

export default function EditCustomerSheet({ open, onClose, customer, orderCount }: Props) {
  const [name, setName] = useState(customer.name)
  const [phone, setPhone] = useState(customer.phone)
  const [address, setAddress] = useState(customer.address || '')
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const online = useOnlineStatus()

  // Sync when customer changes
  useEffect(() => {
    if (open) {
      setName(customer.name)
      setPhone(customer.phone)
      setAddress(customer.address || '')
      setErrors({})
    }
  }, [open, customer])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Nama wajib diisi'
    if (!phone.trim()) errs.phone = 'Nomor telepon wajib diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    if (!online) {
      setLoading(false)
      toast.error('Edit tidak tersedia saat offline')
      return
    }

    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('phone', phone.trim())
    fd.set('address', address.trim())

    const result = await updateCustomer(customer.id, fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pelanggan berhasil diperbarui')
    onClose()
  }

  async function handleToggleActive() {
    if (!online) {
      toast.error('Nonaktifkan tidak tersedia saat offline')
      return
    }

    setToggling(true)
    const fn = customer.is_active ? deactivateCustomer : reactivateCustomer
    const result = await fn(customer.id)
    setToggling(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(customer.is_active ? 'Pelanggan dinonaktifkan' : 'Pelanggan diaktifkan kembali')
    onClose()
  }

  async function handleDelete() {
    if (!online) {
      toast.error('Hapus tidak tersedia saat offline')
      return
    }

    if (!window.confirm('Hapus permanen pelanggan ini?')) return

    setDeleting(true)
    const result = await deleteCustomer(customer.id)
    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pelanggan dihapus')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">Edit Pelanggan</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nama <span className="text-destructive">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Budi Santoso"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nomor HP <span className="text-destructive">*</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
            inputMode="tel"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Alamat <span className="text-muted-foreground/50">(opsional)</span>
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contoh: Jl. Sudirman No. 25"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Simpan */}
        <button
          type="submit"
          disabled={loading || toggling || deleting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

        {/* Nonaktifkan / Aktifkan Kembali */}
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={loading || toggling || deleting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-500/30 px-4 py-3 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
        >
          {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
          {toggling
            ? 'Memproses...'
            : customer.is_active
              ? 'Nonaktifkan'
              : 'Aktifkan Kembali'}
        </button>

        {/* Hapus Permanen — hanya jika belum punya order */}
        {orderCount === 0 ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || toggling || deleting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? 'Menghapus...' : 'Hapus Permanen'}
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Tidak dapat dihapus karena memiliki {orderCount} pesanan tercatat, gunakan
            nonaktifkan sebagai gantinya.
          </p>
        )}
      </form>
    </BottomSheet>
  )
}
