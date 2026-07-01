import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'

interface ActivityChartProps {
  orders: Array<{ created_at: string }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ActivityChart({ orders }: ActivityChartProps) {
  const currentYear = new Date().getFullYear()

  const monthlyData = MONTHS.map((label, i) => {
    const count = orders.filter((o) => {
      const d = new Date(o.created_at)
      return d.getFullYear() === currentYear && d.getMonth() === i
    }).length
    return { label, value: count }
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Overall User Activity</CardTitle>
          <span className="text-xs text-muted-foreground">{currentYear}</span>
        </div>
      </CardHeader>
      <CardContent>
        <LineChart data={monthlyData} height={180} lineColor="var(--chart-4)" />
      </CardContent>
    </Card>
  )
}
