import { getOrders } from './orders/actions'
import { getCustomers } from './customers/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from './dashboard-stats'
import { SalesChart } from './sales-chart'
import { ActivityChart } from './activity-chart'
import { FinanceCards } from './finance-cards'
import { RecentOrdersTable } from './recent-orders-table'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [orders, customers] = await Promise.all([getOrders(), getCustomers()])

  const activeOrders = orders.filter((o) => o.status === 'Masuk' || o.status === 'Dikerjakan')
  const completedOrders = orders.filter((o) => o.status === 'Selesai' || o.status === 'Diambil')

  const completedRevenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.estimated_price), 0
  )
  const potentialRevenue = activeOrders.reduce(
    (sum, o) => sum + Number(o.estimated_price), 0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp')
  }

  const formattedCompletedRevenue = formatCurrency(completedRevenue)
  const formattedPotentialRevenue = formatCurrency(potentialRevenue)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Stats Row */}
      <DashboardStats
        activeOrders={activeOrders.length}
        completedOrders={completedOrders.length}
        totalCustomers={customers.length}
        completedRevenue={completedRevenue}
        potentialRevenue={potentialRevenue}
      />
      {/* Charts + Finance Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SalesChart orders={orders} />
          <ActivityChart orders={orders} />
        </div>
        <FinanceCards
          completedRevenue={formattedCompletedRevenue}
          potentialRevenue={formattedPotentialRevenue}
        />
      </div>
      {/* Recent Orders Table */}
      <RecentOrdersTable orders={activeOrders.slice(0, 5)} />
    </div>
  )
}
