import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, CheckCircle2, TrendingUp, DollarSign, Layers } from 'lucide-react'
import { DonutChart } from '@/components/charts/donut-chart'

interface DashboardStatsProps {
  activeOrders: number
  completedOrders: number
  totalCustomers: number
  completedRevenue: number
  potentialRevenue: number
  formatCurrency: (amount: number) => string
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
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
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
  formatCurrency,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Orders"
        value={activeOrders}
        subtitle="Active in queue"
        icon={ClipboardList}
        iconColor="text-[var(--chart-2)]"
      />
      <StatCard
        title="Approved"
        value={completedOrders}
        subtitle="Completed orders"
        icon={CheckCircle2}
        iconColor="text-[var(--chart-1)]"
      />
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
              <p className="text-[11px] text-muted-foreground">Total customers</p>
            </div>
            <DonutChart
              value={totalCustomers}
              total={totalCustomers + 50}
              color="var(--chart-2)"
              size={56}
              strokeWidth={8}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Subscriptions</p>
              <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
              <p className="text-[11px] text-muted-foreground">Completed orders</p>
            </div>
            <DonutChart
              value={completedOrders}
              total={completedOrders + activeOrders}
              color="var(--chart-3)"
              size={56}
              strokeWidth={8}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
