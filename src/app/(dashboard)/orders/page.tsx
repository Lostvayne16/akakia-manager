import { getOrders } from './actions'
import { getCustomers } from '../customers/actions'
import OrdersList from './orders-list'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const [orders, customers] = await Promise.all([getOrders(), getCustomers()])

  return (
    <div className="w-full">
      <OrdersList initialOrders={orders} customers={customers} />
    </div>
  )
}
