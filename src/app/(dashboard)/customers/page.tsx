import { getCustomers, getCustomerOrderCounts } from './actions'
import CustomersList from './customers-list'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const [customers, orderCounts] = await Promise.all([
    getCustomers(),
    getCustomerOrderCounts(),
  ])

  return (
    <div className="w-full">
      <CustomersList initialCustomers={customers} orderCounts={orderCounts} />
    </div>
  )
}
