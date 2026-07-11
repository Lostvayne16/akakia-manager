'use server'

import { createClient } from '@/utils/supabase/server'
import { getOrderStatus } from '@/lib/order-status'
import type { ExpenseCategory } from '@/lib/constants'

const jakartaOffsetMs = 7 * 60 * 60 * 1000

/**
 * Helper: convert YYYY-MM-DD (masuk WIB) → ISO string (UTC instant) untuk
 * menjangkau seluruh hari WIB penuh.
 *
 * Strategi: 
 *  `dateStr` (YYYY-MM-DD) adalah tanggal WIB.
 *  Start = 00:00:00 WIB = Date.UTC(.... 0,0,0) - 7jam
 *  End   = 23:59:59 WIB = Date.UTC(.... 23,59,59) - 7jam
 */
function wibDayToUtcRange(dateFrom: string, dateTo: string) {
  // Split YYYY-MM-DD
  const [fy, fm, fd] = dateFrom.split('-').map(Number)
  const [ty, tm, td] = dateTo.split('-').map(Number)

  const startUTC = new Date(
    Date.UTC(fy, fm - 1, fd, 0, 0, 0) - jakartaOffsetMs,
  ).toISOString()

  const endUTC = new Date(
    Date.UTC(ty, tm - 1, td, 23, 59, 59) - jakartaOffsetMs,
  ).toISOString()

  return { startISO: startUTC, endISO: endUTC }
}

// --- Types ---

export type ProfitLossReport = {
  totalPendapatan: number
  totalPengeluaran: number
  untungRugi: number
}

export type PeriodComparison = {
  periodeSekarang: number // untung/rugi periode ini
  periodeSebelum: number // untung/rugi periode sebelumnya (durasi sama)
  selisihRupiah: number
  selisihPersen: number | null // null jika periode sebelumnya = 0
}

export type ExpenseCategoryTotal = {
  category: ExpenseCategory
  total: number
}

export type PiutangItem = {
  orderId: string
  customerName: string
  sofaType: string
  price: number
  dpAmount: number
  sisaTagihan: number
}

type PiutangRow = {
  id: string
  sofa_type: string
  price: number
  dp_amount: number
  customer: { id: string; name: string } | null
}

// --- Functions ---

/**
 * Laporan laba/rugi untuk rentang tanggal tertentu.
 * dateFrom, dateTo dalam format YYYY-MM-DD (WIB).
 */
export async function getProfitLossReport(
  dateFrom: string,
  dateTo: string,
): Promise<ProfitLossReport> {
  const supabase = await createClient()

  // Konversi ke UTC untuk paid_at (TIMESTAMPTZ)
  const { startISO, endISO } = wibDayToUtcRange(dateFrom, dateTo)

  // expense_date (DATE) — pakai YYYY-MM-DD langsung
  const startDateStr = dateFrom
  const endDateStr = dateTo

  // Total pendapatan: orders dengan paid_amount tidak null dan paid_at dalam rentang
  const { data: paidOrders, error: paidError } = await supabase
    .from('orders')
    .select('paid_amount')
    .not('paid_amount', 'is', null)
    .gte('paid_at', startISO)
    .lte('paid_at', endISO)

  if (paidError) throw new Error(paidError.message)

  const totalPendapatan = (paidOrders || []).reduce(
    (sum, o) => sum + Number(o.paid_amount),
    0,
  )

  // Total pengeluaran: expenses dengan expense_date dalam rentang
  const { data: expenses, error: expenseError } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', startDateStr)
    .lte('expense_date', endDateStr)

  if (expenseError) throw new Error(expenseError.message)

  const totalPengeluaran = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  )

  return {
    totalPendapatan,
    totalPengeluaran,
    untungRugi: totalPendapatan - totalPengeluaran,
  }
}

/**
 * Bandingkan untung/rugi periode ini dengan periode sebelumnya (durasi sama).
 *
 * Contoh: dateFrom="2026-07-01", dateTo="2026-07-09" → periode sebelumnya =
 * 2026-06-22 s.d. 2026-06-30.
 *
 * dateFrom, dateTo dalam format YYYY-MM-DD (WIB).
 */
export async function getPeriodComparison(
  dateFrom: string,
  dateTo: string,
): Promise<PeriodComparison> {
  // Hitung durasi dalam hari (WIB)
  const [fy, fm, fd] = dateFrom.split('-').map(Number)
  const [ty, tm, td] = dateTo.split('-').map(Number)

  const startFrom = new Date(Date.UTC(fy, fm - 1, fd))
  const endTo = new Date(Date.UTC(ty, tm - 1, td))
  const durationDays = Math.round(
    (endTo.getTime() - startFrom.getTime()) / (24 * 60 * 60 * 1000),
  ) + 1 // +1 agar inklusif

  // Hitung tanggal mulai periode sebelumnya: dateFrom - durationDays
  const prevEnd = new Date(startFrom.getTime() - 24 * 60 * 60 * 1000) // sehari sebelum dateFrom
  const prevStart = new Date(
    prevEnd.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000,
  )

  const pad = (n: number) => String(n).padStart(2, '0')
  const prevDateFrom = `${prevStart.getUTCFullYear()}-${pad(prevStart.getUTCMonth() + 1)}-${pad(prevStart.getUTCDate())}`
  const prevDateTo = `${prevEnd.getUTCFullYear()}-${pad(prevEnd.getUTCMonth() + 1)}-${pad(prevEnd.getUTCDate())}`

  // Ambil laporan kedua periode paralel
  const [current, previous] = await Promise.all([
    getProfitLossReport(dateFrom, dateTo),
    getProfitLossReport(prevDateFrom, prevDateTo),
  ])

  const currentProfit = current.untungRugi
  const previousProfit = previous.untungRugi
  const selisihRupiah = currentProfit - previousProfit
  const selisihPersen =
    previousProfit === 0
      ? null
      : Math.round((selisihRupiah / Math.abs(previousProfit)) * 100 * 100) / 100

  return {
    periodeSekarang: currentProfit,
    periodeSebelum: previousProfit,
    selisihRupiah,
    selisihPersen,
  }
}

/**
 * Total pengeluaran per kategori dalam rentang tanggal.
 * Diurutkan dari nominal terbesar.
 *
 * dateFrom, dateTo dalam format YYYY-MM-DD (WIB).
 */
export async function getExpenseBreakdownByCategory(
  dateFrom: string,
  dateTo: string,
): Promise<ExpenseCategoryTotal[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .gte('expense_date', dateFrom)
    .lte('expense_date', dateTo)
    .order('amount', { ascending: false })

  if (error) throw new Error(error.message)

  // Kelompokkan manual karena Supabase sum+groupby bisa tricky
  const map = new Map<string, number>()
  for (const e of data || []) {
    map.set(e.category, (map.get(e.category) || 0) + Number(e.amount))
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({ category: category as ExpenseCategory, total }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Daftar order yang masih piutang (status Dikerjakan = dp ada, paid belum).
 * Tampilkan nama customer, sofa_type, price, dp_amount, dan sisa tagihan.
 */
export async function getPiutangDetail(): Promise<PiutangItem[]> {
  const supabase = await createClient()

  // Cari order: dp_amount IS NOT NULL (ada DP) dan paid_amount IS NULL (belum lunas)
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      sofa_type,
      price,
      dp_amount,
      customer:customers(id, name)
    `,
    )
    .not('dp_amount', 'is', null)
    .is('paid_amount', null)

  if (error) throw new Error(error.message)

  return (data as any[] || []).map((o: any) => {
    const customerObj = Array.isArray(o.customer) ? o.customer[0] : o.customer
    return {
      orderId: o.id,
      customerName: customerObj?.name || 'Tidak diketahui',
      sofaType: o.sofa_type,
      price: Number(o.price),
      dpAmount: Number(o.dp_amount),
      sisaTagihan: Number(o.price) - Number(o.dp_amount),
    }
  })
}
