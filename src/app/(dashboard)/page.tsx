import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import {
  getDashboardStats,
  getPiutangTotal,
  getOrderStatusBreakdown,
  getRecentOrders,
  getMonthlyRevenueTrend,
} from './actions'
import { FinanceCards } from './finance-cards'
import { PiutangCard } from './piutang-card'
import { StatusBreakdown } from './status-breakdown'
import { IncomeChart } from './income-chart'
import { RecentOrdersList } from './recent-orders-list'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, piutang, statusBreakdown, recentOrders, revenueTrend] =
    await Promise.all([
      getDashboardStats(),
      getPiutangTotal(),
      getOrderStatusBreakdown(),
      getRecentOrders(5),
      getMonthlyRevenueTrend(),
    ])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* 1. Quick action buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/orders"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Pesanan Baru
        </Link>
        <Link
          href="/expenses"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          <Receipt className="h-4 w-4" />
          Catat Pengeluaran
        </Link>
      </div>

      {/* 2. Finance cards */}
      <FinanceCards
        totalPendapatan={stats.totalPendapatan}
        totalPengeluaran={stats.totalPengeluaran}
        untungRugi={stats.untungRugi}
      />

      {/* 3. Piutang card */}
      <PiutangCard
        totalPiutang={piutang.totalPiutang}
        orderCount={piutang.orderCount}
      />

      {/* 4. Status breakdown */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Status Pesanan
        </p>
        <StatusBreakdown
          masuk={statusBreakdown.masuk}
          dikerjakan={statusBreakdown.dikerjakan}
          selesai={statusBreakdown.selesai}
        />
      </div>

      {/* 5. Income chart */}
      <IncomeChart data={revenueTrend} />

      {/* 6. Recent orders */}
      <RecentOrdersList orders={recentOrders} />
    </div>
  )
}
