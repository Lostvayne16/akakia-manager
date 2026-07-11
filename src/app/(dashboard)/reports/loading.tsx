export default function ReportsLoading() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-7 w-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* ProfitLossCard skeleton */}
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />

      {/* BreakdownCard skeleton */}
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />

      {/* PiutangDetail skeleton */}
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}
