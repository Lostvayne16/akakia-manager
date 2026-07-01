import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Order {
  id: string
  customer: { name: string }
  service_type: string
  sofa_type: string
  estimated_price: number
  created_at: string
  status: string
}

interface RecentOrdersTableProps {
  orders: Order[]
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Masuk: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Dikerjakan: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Selesai: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Diambil: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        colorMap[status] || 'bg-muted text-muted-foreground border-border'
      }`}
    >
      {status}
    </span>
  )
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Customer Order</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Profile</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Address/Service</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {order.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                          {order.customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{order.service_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(order.estimated_price)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No active orders at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
