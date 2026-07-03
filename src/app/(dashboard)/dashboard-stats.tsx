import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, CheckCircle2, TrendingUp, DollarSign, Layers } from 'lucide-react'
import { DonutChart } from '@/components/charts/donut-chart'

interface DashboardStatsProps {
  activeOrders: number
  completedOrders: number
  totalCustomers: number
  completedRevenue: number
  potentialRevenue: number
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconColor: string
}) {
  return (
    <Card className="bg-[#161720] border-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#8a8f98]">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-[#525866]">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-[#5e6ad2]/10 p-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats({
  activeOrders,
  completedOrders,
  totalCustomers,
  completedRevenue,
  potentialRevenue,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Orders"
        value={activeOrders}
        subtitle="Active in queue"
        icon={ClipboardList}
        iconColor="text-[#3b82f6]"
      />
      <StatCard
        title="Approved"
        value={completedOrders}
        subtitle="Completed orders"
        icon={CheckCircle2}
        iconColor="text-[#10b981]"
      />
      <Card className="bg-[#161720] border-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#8a8f98]">Users</p>
              <p className="text-2xl font-bold text-white">{totalCustomers}</p>
              <p className="text-[11px] text-[#525866]">Total customers</p>
            </div>
            <DonutChart
              value={totalCustomers}
              total={totalCustomers + 50}
              color="#3b82f6"
              size={56}
              strokeWidth={8}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#161720] border-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#8a8f98]">Subscriptions</p>
              <p className="text-2xl font-bold text-white">{completedOrders}</p>
              <p className="text-[11px] text-[#525866]">Completed orders</p>
            </div>
            <DonutChart
              value={completedOrders}
              total={completedOrders + activeOrders}
              color="#10b981"
              size={56}
              strokeWidth={8}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
