import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/charts/bar-chart'

interface SalesChartProps {
  orders: Array<{ created_at: string; status: string }>
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function SalesChart({ orders }: SalesChartProps) {
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
          <CardTitle className="text-base font-semibold text-foreground">Sales Dynamics</CardTitle>
          <span className="text-xs text-muted-foreground">{currentYear}</span>
        </div>
      </CardHeader>
      <CardContent>
        <BarChart data={monthlyData} height={220} />
      </CardContent>
    </Card>
  )
}
