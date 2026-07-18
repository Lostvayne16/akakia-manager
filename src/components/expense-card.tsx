'use client'

import { Receipt } from 'lucide-react'
import { toast } from 'sonner'
import type { ExpenseCategory } from '@/lib/constants'
import { getCategoryColor } from '@/lib/expense-category'

type Expense = {
  id: string
  expense_date: string
  category: ExpenseCategory
  amount: number
  notes: string | null
  created_at: string
  _pending?: boolean
}

type Props = {
  expense: Expense
  onEdit: (expense: Expense) => void
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
    new Date(iso),
  )
}

export default function ExpenseCard({ expense, onEdit }: Props) {
  const colors = getCategoryColor(expense.category)

  function handleClick() {
    if (expense._pending) {
      toast.error('Data ini masih menunggu sinkronisasi, belum bisa diedit')
      return
    }
    onEdit(expense)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-colors ${
        expense._pending
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer group hover:bg-muted/40'
      }`}
      onClick={handleClick}
    >
      {!expense._pending && (
        <span className="absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />
      )}
      {/* Header: date + category badge */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {formatDate(expense.expense_date)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {expense._pending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              ⏳ Belum tersinkron
            </span>
          )}
          <span
            className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-5"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {expense.category}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-1">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {formatRupiah(Number(expense.amount))}
        </span>
      </div>

      {/* Notes — only if present */}
      {expense.notes && (
        <div className="mt-1 text-sm text-muted-foreground">
          <p className="line-clamp-2">{expense.notes}</p>
        </div>
      )}
    </div>
  )
}
