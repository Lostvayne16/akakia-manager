'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import BottomSheet from '@/components/bottom-sheet'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/constants'
import { useOnlineStatus } from '@/lib/use-online-status'
import { addPendingItem } from '@/lib/offline-db'
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/app/(dashboard)/expenses/actions'

type Expense = {
  id: string
  expense_date: string
  category: ExpenseCategory
  amount: number
  notes: string | null
  created_at: string
}

type Props = {
  open: boolean
  onClose: () => void
  /** Jika ada → mode edit. Jika undefined → mode create. */
  expense?: Expense | null
}

function todayISO(): string {
  // Ambil tanggal lokal (bukan UTC) untuk default date picker
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function ExpenseSheet({ open, onClose, expense }: Props) {
  const isEdit = !!expense

  const [expenseDate, setExpenseDate] = useState(todayISO())
  const [category, setCategory] = useState<ExpenseCategory>('Makan')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const online = useOnlineStatus()
  const amountRef = useRef<HTMLInputElement>(null)

  // Sync state saat sheet buka
  useEffect(() => {
    if (!open) return
    if (expense) {
      // Mode edit — isi dari data
      setExpenseDate(expense.expense_date)
      setCategory(expense.category)
      setAmount(Number(expense.amount).toLocaleString('id-ID'))
      setNotes(expense.notes || '')
    } else {
      // Mode create — tanggal default hari ini, field lain kosong
      setExpenseDate(todayISO())
      setCategory('Makan')
      setAmount('')
      setNotes('')
    }
    setErrors({})
  }, [open, expense])

  // Notes wajib hanya jika kategori Lainnya
  const notesRequired = category === 'Lainnya'

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!expenseDate) errs.expenseDate = 'Tanggal wajib diisi'
    const amountNum = Number(amount.replace(/\./g, ''))
    if (!amount.trim() || isNaN(amountNum) || amountNum <= 0) {
      errs.amount = 'Jumlah harus lebih dari 0'
    }
    if (notesRequired && !notes.trim()) {
      errs.notes = 'Catatan wajib diisi jika kategori Lainnya'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Format amount dengan pemisah ribuan saat mengetik
  function handleAmountInput(val: string) {
    const digits = val.replace(/\D/g, '')
    if (!digits) {
      setAmount('')
      return
    }
    setAmount(Number(digits).toLocaleString('id-ID'))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const fd = new FormData()
    fd.set('expense_date', expenseDate)
    fd.set('category', category)
    fd.set('amount', String(Number(amount.replace(/\./g, ''))))
    fd.set('notes', notes.trim())

    if (!isEdit && !online) {
      // Offline — simpan ke IndexedDB
      await addPendingItem('pending_expenses', {
        data: {
          expense_date: expenseDate,
          category,
          amount: Number(amount.replace(/\./g, '')),
          notes: notes.trim(),
        },
        action: 'create',
      })
      setLoading(false)
      toast.success('Pengeluaran disimpan secara lokal, akan disinkronkan saat online kembali')
      setCategory('Makan')
      setAmount('')
      setNotes('')
      setErrors({})
      requestAnimationFrame(() => amountRef.current?.focus())
      return
    }

    if (isEdit && !online) {
      setLoading(false)
      toast.error('Edit tidak tersedia saat offline')
      return
    }

    const result = isEdit
      ? await updateExpense(expense!.id, fd)
      : await createExpense(fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (isEdit) {
      // Mode edit — tutup sheet seperti biasa
      toast.success('Pengeluaran berhasil diperbarui')
      onClose()
    } else {
      // Mode create — sheet tetap terbuka, form dikosongkan KECUALI tanggal
      toast.success('Pengeluaran berhasil dicatat')
      setCategory('Makan')
      setAmount('')
      setNotes('')
      setErrors({})
      // Fokus pindah ke input amount untuk input beruntun berikutnya
      requestAnimationFrame(() => amountRef.current?.focus())
    }
  }

  async function handleDelete() {
    if (!expense) return

    if (!online) {
      toast.error('Hapus tidak tersedia saat offline')
      return
    }

    setDeleting(true)
    const result = await deleteExpense(expense.id)
    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pengeluaran dihapus')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-5 text-lg font-semibold">
        {isEdit ? 'Edit Pengeluaran' : 'Pengeluaran Baru'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tanggal */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Tanggal <span className="text-destructive">*</span>
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.expenseDate && (
            <p className="mt-1 text-xs text-destructive">{errors.expenseDate}</p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Kategori <span className="text-destructive">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Nominal */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nominal (Rp) <span className="text-destructive">*</span>
          </label>
          <input
            ref={amountRef}
            value={amount}
            onChange={(e) => handleAmountInput(e.target.value)}
            placeholder="0"
            inputMode="numeric"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-destructive">{errors.amount}</p>
          )}
        </div>

        {/* Catatan */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Catatan
            {notesRequired && <span className="text-destructive"> *</span>}
            {!notesRequired && (
              <span className="text-muted-foreground/50"> (opsional)</span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              notesRequired
                ? 'Wajib diisi — jelaskan pengeluaran ini...'
                : 'Catatan tambahan...'
            }
            rows={2}
            className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring ${
              notesRequired ? 'border-amber-500/40' : 'border-input'
            }`}
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-destructive">{errors.notes}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || deleting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? 'Menyimpan...'
            : isEdit
              ? 'Simpan Perubahan'
              : 'Simpan'}
        </button>

        {/* Hapus — hanya mode edit */}
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? 'Menghapus...' : 'Hapus Pengeluaran'}
          </button>
        )}
      </form>
    </BottomSheet>
  )
}
