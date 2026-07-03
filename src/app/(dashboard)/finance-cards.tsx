'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressRing } from '@/components/charts/progress-ring'

interface FinanceCardsProps {
  completedRevenue: string
  potentialRevenue: string
}

export function FinanceCards({
  completedRevenue,
  potentialRevenue,
}: FinanceCardsProps) {
  return (
    <div className="space-y-6">
      {/* Paid Invoices */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Paid Invoices</p>
              <p className="text-xl font-bold text-foreground">{completedRevenue}</p>
              <p className="text-[11px] text-muted-foreground">Current Financial Year</p>
            </div>
            <ProgressRing
              value={75}
              size={72}
              strokeWidth={8}
              color="var(--chart-4)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Funds Received */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Funds Received</p>
              <p className="text-xl font-bold text-foreground">{potentialRevenue}</p>
              <p className="text-[11px] text-muted-foreground">Current Financial Year</p>
            </div>
            <ProgressRing
              value={60}
              size={72}
              strokeWidth={8}
              color="var(--chart-1)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
