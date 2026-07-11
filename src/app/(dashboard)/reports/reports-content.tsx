'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { DateFilter } from '@/components/date-filter'
import { ProfitLossCard } from './profit-loss-card'
import { BreakdownCard } from './breakdown-card'
import { PiutangDetail } from './piutang-detail'
import {
  getProfitLossReport,
  getPeriodComparison,
  getExpenseBreakdownByCategory,
  type ProfitLossReport,
  type PeriodComparison,
  type ExpenseCategoryTotal,
  type PiutangItem,
} from './actions'

type ReportsContentProps = {
  initialPiutang: PiutangItem[]
}

export function ReportsContent({ initialPiutang }: ReportsContentProps) {
  const [profitLoss, setProfitLoss] = useState<ProfitLossReport | null>(null)
  const [comparison, setComparison] = useState<PeriodComparison | null>(null)
  const [breakdown, setBreakdown] = useState<ExpenseCategoryTotal[]>([])
  const [piutang] = useState(initialPiutang)
  const [loading, setLoading] = useState(false)

  // Ref untuk race condition guard
  const fetchIdRef = useRef(0)

  const fetchReports = useCallback(async (from: string, to: string) => {
    const fetchId = ++fetchIdRef.current
    setLoading(true)

    try {
      const [pl, comp, bd] = await Promise.all([
        getProfitLossReport(from, to),
        getPeriodComparison(from, to),
        getExpenseBreakdownByCategory(from, to),
      ])

      // Abaikan response stale jika user ganti filter sebelum fetch selesai
      if (fetchId !== fetchIdRef.current) return

      setProfitLoss(pl)
      setComparison(comp)
      setBreakdown(bd)
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return
      console.error('Gagal mengambil data laporan:', err)
      toast.error('Gagal memuat laporan. Silakan coba lagi.')
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false)
    }
  }, [])

  function handleFilterChange(from: string, to: string) {
    fetchReports(from, to)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header + Filter */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Laporan Keuangan
        </h1>
        <div className="mt-3">
          <DateFilter
            defaultPreset="month"
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Loading skeleton saat fetch */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : profitLoss && comparison ? (
        <>
          <ProfitLossCard profitLoss={profitLoss} comparison={comparison} />
          <BreakdownCard breakdown={breakdown} />
        </>
      ) : null}

      {/* Piutang — tidak terikat filter, sudah dari SSR */}
      <PiutangDetail piutangList={piutang} />
    </div>
  )
}
