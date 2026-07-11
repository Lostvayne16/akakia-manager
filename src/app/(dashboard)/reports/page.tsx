import { getPiutangDetail } from './actions'
import { ReportsContent } from './reports-content'

export default async function ReportsPage() {
  const piutang = await getPiutangDetail()

  return <ReportsContent initialPiutang={piutang} />
}
