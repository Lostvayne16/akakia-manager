'use server'

import { createClient } from '@/utils/supabase/server'
import { getOrderStatus } from '@/lib/order-status'

// --- Types ---

export type DashboardStats = {
  totalPendapatan: number
  totalPengeluaran: number
  untungRugi: number
}

export type PiutangTotal = {
  totalPiutang: number
  orderCount: number
}

export type OrderStatusBreakdown = {
  masuk: number
  dikerjakan: number
  selesai: number
}

export type RecentOrder = {
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
}

/**
 * Ambil statistik dashboard bulan berjalan (WIB/UTC+7):
 * - Total Pendapatan = sum paid_amount dari orders dengan paid_at di bulan ini
 * - Total Pengeluaran = sum amount dari expenses dengan expense_date di bulan ini
 * - Untung/Rugi = selisih
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  // Hitung batas bulan di WIB (UTC+7) secara eksplisit
  const now = new Date()
  const jakartaOffsetMs = 7 * 60 * 60 * 1000 // 7 jam dalam ms

  // Dapatkan komponen tanggal WIB dari current instant
  const wibTime = now.getTime() + jakartaOffsetMs
  const wibDate = new Date(wibTime)
  const wibYear = wibDate.getUTCFullYear()
  const wibMonth = wibDate.getUTCMonth()

  // Boundary WIB → convert ke UTC instant yang benar
  // Start: 1 bulan ini 00:00:00 WIB = (Date.UTC WIB) - 7 jam
  const startOfMonthUTC = new Date(
    Date.UTC(wibYear, wibMonth, 1, 0, 0, 0) - jakartaOffsetMs,
  )
  // End: akhir bulan ini 23:59:59 WIB = (Date.UTC hari 0 bulan depan) - 7 jam
  const endOfMonthUTC = new Date(
    Date.UTC(wibYear, wibMonth + 1, 0, 23, 59, 59) - jakartaOffsetMs,
  )

  const startISO = startOfMonthUTC.toISOString()
  const endISO = endOfMonthUTC.toISOString()

  // Total pendapatan: paid_amount dari orders yang paid_at di bulan ini (WIB)
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

  // Total pengeluaran: expense_date (DATE) — pakai tanggal kalender WIB langsung,
  // JANGAN lewat konversi UTC karena kolom ini tipe DATE tanpa timezone
  const startDateStr = `${wibYear}-${String(wibMonth + 1).padStart(2, '0')}-01`
  const lastDayOfMonth = new Date(Date.UTC(wibYear, wibMonth + 1, 0)).getUTCDate()
  const endDateStr = `${wibYear}-${String(wibMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`

  const { data: { user } } = await supabase.auth.getUser()
  console.log('DEBUG - user di getDashboardStats:', user?.id, user?.email)

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
 * Total piutang belum lunas = sum (price - dp_amount) dari semua order
 * dengan status "Dikerjakan" (ada dp_amount, belum ada paid_amount)
 */
export async function getPiutangTotal(): Promise<PiutangTotal> {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('price, dp_amount, paid_amount')
    .not('dp_amount', 'is', null)
    .is('paid_amount', null)

  if (error) throw new Error(error.message)

  let totalPiutang = 0
  let orderCount = 0

  for (const o of orders || []) {
    const price = Number(o.price)
    const dp = Number(o.dp_amount)
    const sisa = price - dp
    if (sisa > 0) {
      totalPiutang += sisa
      orderCount++
    }
  }

  return { totalPiutang, orderCount }
}

/**
 * Breakdown jumlah order per status (Masuk/Dikerjakan/Selesai)
 * Menggunakan getOrderStatus() dari lib/order-status.ts
 */
export async function getOrderStatusBreakdown(): Promise<OrderStatusBreakdown> {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('dp_amount, paid_amount')

  if (error) throw new Error(error.message)

  const breakdown: OrderStatusBreakdown = {
    masuk: 0,
    dikerjakan: 0,
    selesai: 0,
  }

  for (const o of orders || []) {
    const status = getOrderStatus({
      dp_amount: o.dp_amount,
      paid_amount: o.paid_amount,
    })
    if (status === 'Masuk') breakdown.masuk++
    else if (status === 'Dikerjakan') breakdown.dikerjakan++
    else if (status === 'Selesai') breakdown.selesai++
  }

  return breakdown
}

/**
 * Order terbaru (default 5), diurutkan created_at desc
 */
export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:customers(id, name, phone, address)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data || []) as RecentOrder[]
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export type MonthlyRevenue = {
  month: string
  total: number
}

/**
 * Tren pemasukan 6 bulan terakhir (WIB/UTC+7).
 * Sum paid_amount dari orders dengan paid_at di tiap bulan.
 */
export async function getMonthlyRevenueTrend(): Promise<MonthlyRevenue[]> {
  const supabase = await createClient()
  const jakartaOffsetMs = 7 * 60 * 60 * 1000

  // Tentukan "sekarang" dalam WIB
  const now = new Date()
  const wibNow = new Date(now.getTime() + jakartaOffsetMs)
  const wibYear = wibNow.getUTCFullYear()
  const wibMonth = wibNow.getUTCMonth()

  // Bangun array 6 bulan terakhir (termasuk bulan ini)
  const months: { year: number; month: number; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(wibYear, wibMonth - i, 1))
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth()
    months.push({ year: y, month: m, label: MONTH_LABELS[m] })
  }

  // Fetch semua orders dengan paid_at tidak null (satu query saja)
  // Boundary paling awal = start of 6 bulan lalu dalam UTC
  const earliestStart = new Date(
    Date.UTC(months[0].year, months[0].month, 1, 0, 0, 0) - jakartaOffsetMs,
  ).toISOString()

  const { data: paidOrders, error } = await supabase
    .from('orders')
    .select('paid_amount, paid_at')
    .not('paid_amount', 'is', null)
    .not('paid_at', 'is', null)
    .gte('paid_at', earliestStart)

  if (error) throw new Error(error.message)

  // Kelompokkan per bulan WIB
  const result: MonthlyRevenue[] = months.map((m) => ({
    month: m.label,
    total: 0,
  }))

  for (const o of paidOrders || []) {
    const paidAt = new Date(o.paid_at as string)
    // Konversi ke WIB untuk menentukan bulan
    const wibPaid = new Date(paidAt.getTime() + jakartaOffsetMs)
    const paidYear = wibPaid.getUTCFullYear()
    const paidMonth = wibPaid.getUTCMonth()

    // Cari index bulan di array result
    const idx = months.findIndex(
      (m) => m.year === paidYear && m.month === paidMonth,
    )
    if (idx !== -1) {
      result[idx].total += Number(o.paid_amount)
    }
  }

  return result
}
