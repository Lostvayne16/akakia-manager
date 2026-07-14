export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 pb-20 md:pb-0">
      {/* Finance cards (3) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-24 rounded-md bg-muted" />
                <div className="h-7 w-32 rounded-lg bg-muted" />
                <div className="h-3.5 w-16 rounded-md bg-muted" />
              </div>
              <div className="h-11 w-11 shrink-0 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Piutang card */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-36 rounded-md bg-muted" />
            <div className="h-7 w-48 rounded-lg bg-muted" />
            <div className="h-3.5 w-28 rounded-md bg-muted" />
          </div>
          <div className="h-11 w-11 shrink-0 rounded-xl bg-muted" />
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 h-3.5 w-24 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted" />
      </div>

      {/* Income chart */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-md bg-muted" />
            <div className="h-3 w-20 rounded-md bg-muted" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-12 rounded-md bg-muted" />
            <div className="h-4 w-28 rounded-md bg-muted" />
          </div>
        </div>
        {/* Bar chart skeleton */}
        <div className="flex h-[200px] items-end justify-around gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-muted"
              style={{ height: `${20 + ((i * 13) % 70)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6 pb-3">
          <div className="h-4 w-32 rounded-md bg-muted" />
          <div className="h-3 w-20 rounded-md bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 rounded-md bg-muted" />
                <div className="h-3 w-24 rounded-md bg-muted" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="h-3.5 w-20 rounded-md bg-muted" />
                <div className="h-4 w-14 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
