import { getOrders } from './actions'
import { getCustomers } from '../customers/actions'
import { OrdersClient } from './orders-client'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  // Ambil data pesanan dan pelanggan secara paralel
  const [orders, customers] = await Promise.all([getOrders(), getCustomers()])

  return (
    <div className="w-full">
      <OrdersClient initialOrders={orders} customers={customers} />
    </div>
  )
}
