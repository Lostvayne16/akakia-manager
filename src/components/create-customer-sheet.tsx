'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Loader2, Contact } from 'lucide-react'
import BottomSheet from '@/components/bottom-sheet'
import { createCustomer } from '@/app/(dashboard)/customers/actions'
import { useOnlineStatus } from '@/lib/use-online-status'
import { addPendingItem } from '@/lib/offline-db'
import { useContactPicker } from '@/lib/use-contact-picker'

type Props = {
  open: boolean
  onClose: () => void
}

export default function CreateCustomerSheet({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const online = useOnlineStatus()
  const { isSupported: canPickContact, isPicking, pickContact } = useContactPicker()

  async function handlePickContact() {
    const picked = await pickContact()
    if (!picked) return
    if (picked.name) setName(picked.name)
    if (picked.phone) setPhone(picked.phone)
  }

  function reset() {
    setName('')
    setPhone('')
    setAddress('')
    setErrors({})
  }

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
      await addPendingItem('pending_customers', {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        action: 'create',
      })
      setLoading(false)
      toast.success(
        'Pelanggan disimpan secara lokal, akan disinkronkan saat online kembali',
      )
      reset()
      onClose()
      return
    }

    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('phone', phone.trim())
    fd.set('address', address.trim())

    const result = await createCustomer(fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pelanggan berhasil ditambahkan')
    reset()
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">Pelanggan Baru</h2>

      {canPickContact && (
        <button
          type="button"
          onClick={handlePickContact}
          disabled={isPicking}
          className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Contact className="h-4 w-4" />
          {isPicking ? 'Membuka kontak...' : 'Pilih dari Kontak HP'}
        </button>
      )}

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
