import { getExpenses } from './actions'
import ExpensesList from './expenses-list'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const expenses = await getExpenses()

  return (
    <div className="w-full">
      <ExpensesList initialExpenses={expenses} />
    </div>
  )
}
