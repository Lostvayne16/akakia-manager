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
      <Card className="bg-[#161720] border-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#8a8f98]">Paid Invoices</p>
              <p className="text-xl font-bold text-white">{completedRevenue}</p>
              <p className="text-[11px] text-[#525866]">Current Financial Year</p>
            </div>
            <ProgressRing
              value={75}
              size={72}
              strokeWidth={8}
              color="#3b82f6"
            />
          </div>
        </CardContent>
      </Card>

      {/* Funds Received */}
      <Card className="bg-[#161720] border-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.15)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#8a8f98]">Funds Received</p>
              <p className="text-xl font-bold text-white">{potentialRevenue}</p>
              <p className="text-[11px] text-[#525866]">Current Financial Year</p>
            </div>
            <ProgressRing
              value={60}
              size={72}
              strokeWidth={8}
              color="#10b981"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
