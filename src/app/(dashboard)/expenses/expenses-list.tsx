'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Wallet, Receipt } from 'lucide-react'
import ExpenseCard from '@/components/expense-card'
import ExpenseSheet from '@/components/expense-sheet'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/constants'
import { getCategoryColor } from '@/lib/expense-category'
import { getExpenses, type Expense } from '@/app/(dashboard)/expenses/actions'
import { getPendingItems } from '@/lib/offline-db'
import type { PendingRecord } from '@/lib/offline-db'

type ExpenseWithPending = Expense & { _pending?: boolean }

type DatePreset = 'today' | 'week' | 'month' | 'year' | 'custom'

type Props = {
  initialExpenses: Expense[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

/** Hitung start hari ini (00:00) */
function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Start minggu ini (Senin) */
function startOfWeek(): Date {
  const d = startOfToday()
  const day = d.getDay() // 0=Min, 1=Sen
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

/** Start bulan ini */
function startOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Start tahun ini */
function startOfYear(): Date {
  const d = new Date()
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Hari ini',
  week: 'Minggu ini',
  month: 'Bulan ini',
  year: 'Tahun ini',
  custom: 'Custom',
}

export default function ExpensesList({ initialExpenses }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [pendingExpenses, setPendingExpenses] = useState<ExpenseWithPending[]>([])

  const [preset, setPreset] = useState<DatePreset>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)


  // Ambil pending expenses dari IndexedDB saat mount
  useEffect(() => {
    getPendingItems<Record<string, unknown>>('pending_expenses').then((items) => {
      const mapped: ExpenseWithPending[] = items.map((item: PendingRecord<Record<string, unknown>>) => ({
        id: item.id,
        expense_date: (item.data.expense_date as string) || '',
        category: (item.data.category as ExpenseCategory) || 'Lainnya',
        amount: Number(item.data.amount) || 0,
        notes: (item.data.notes as string) || null,
        created_at: item.created_at,
        _pending: true as const,
      }))
      setPendingExpenses(mapped)
    })
  }, [])

  // --- Rentang tanggal aktif ---
  const { dateFrom, dateTo } = useMemo(() => {
    if (preset === 'custom') {
      return { dateFrom: customFrom || '', dateTo: customTo || '' }
    }
    let start: Date
    switch (preset) {
      case 'today': start = startOfToday(); break
      case 'week': start = startOfWeek(); break
      case 'month': start = startOfMonth(); break
      case 'year': start = startOfYear(); break
      default: start = startOfMonth()
    }
    return { dateFrom: toISODate(start), dateTo: toISODate(startOfToday()) }
  }, [preset, customFrom, customTo])

  // --- Filter ---
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      // Date filter
      if (dateFrom && e.expense_date < dateFrom) return false
      if (dateTo && e.expense_date > dateTo) return false
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false
      // Search notes
      if (searchQuery && !(e.notes || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [expenses, dateFrom, dateTo, selectedCategories, searchQuery])

  // --- Ringkasan total + breakdown ---
  const { total, breakdown } = useMemo(() => {
    let sum = 0
    const perCat: Record<string, number> = {}
    for (const e of filtered) {
      const amt = Number(e.amount)
      sum += amt
      perCat[e.category] = (perCat[e.category] || 0) + amt
    }
    // Sort breakdown by amount desc
    const bd = Object.entries(perCat)
      .map(([cat, amt]) => ({ category: cat as ExpenseCategory, amount: amt }))
      .sort((a, b) => b.amount - a.amount)
    return { total: sum, breakdown: bd }
  }, [filtered])

  // Toggle kategori
  function toggleCategory(cat: ExpenseCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  // Refresh data dari server
  function refresh() {
    getExpenses().then(setExpenses).catch(() => {})
  }

  function handlePresetChange(p: DatePreset) {
    setPreset(p)
  }

  // Gabungkan pending (di atas) + data server, lalu filter
  const merged = useMemo(() => {
    // Pending items tidak ikut filter server (muncul selalu di atas)
    return [...pendingExpenses, ...filtered]
  }, [pendingExpenses, filtered])

  const isEmpty = expenses.length === 0 && pendingExpenses.length === 0
  const noResults = !isEmpty && merged.length === 0

  return (
    <>
      {/* Header sticky */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-gradient-to-b from-background via-background to-background/95 px-4 pb-3 pt-4 backdrop-blur-sm sm:static sm:mx-0 sm:mt-0 sm:bg-none sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengeluaran</h1>
            <p className="text-sm text-muted-foreground">{expenses.length} catatan tercatat</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Catat Pengeluaran</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan pengeluaran..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Preset tanggal */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(['today', 'week', 'month', 'year', 'custom'] as DatePreset[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                preset === p
                  ? 'bg-primary/15 text-primary'
                  : 'border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {preset === 'custom' && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">sampai</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* Filter kategori (multi-select chips) */}
        <div className="mt-3 flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat)
            const colors = getCategoryColor(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  active
                    ? `${colors.bg} ${colors.text} border-transparent`
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ringkasan total + breakdown */}
      {!noResults && filtered.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>Total Pengeluaran</span>
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {formatRupiah(total)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filtered.length} transaksi
          </p>

          {/* Breakdown per kategori */}
          {breakdown.length > 1 && (
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              {breakdown.map(({ category, amount }) => {
                const colors = getCategoryColor(category)
                return (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center gap-1.5 ${colors.text}`}>
                      <span className={`h-2 w-2 rounded-full ${colors.bg}`} />
                      {category}
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatRupiah(amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state — belum ada data sama sekali */}
      {isEmpty && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Belum ada pengeluaran</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Catat pengeluaran pertama untuk mulai melacak arus kas operasional.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Catat Pengeluaran Pertama
          </button>
        </div>
      )}

      {/* No results — ada data tapi filter kosong */}
      {noResults && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Tidak ada pengeluaran pada periode ini</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Coba ubah filter tanggal, kategori, atau kata kunci pencarian.
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      {!isEmpty && merged.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {merged.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={(e) => setEditExpense(e)}
            />
          ))}
        </div>
      )}
      <ExpenseSheet
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          refresh()
        }}
      />

      {editExpense && (
        <ExpenseSheet
          open
          expense={editExpense}
          onClose={() => {
            setEditExpense(null)
            refresh()
          }}
        />
      )}
    </>
  )
}
