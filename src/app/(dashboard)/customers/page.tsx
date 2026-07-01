import { getCustomers } from './actions'
import { CustomersClient } from './customers-client'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="w-full">
      <CustomersClient initialCustomers={customers} />
    </div>
  )
}
