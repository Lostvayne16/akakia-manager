export default function Loading() {
  return (
    <div className="w-full animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded-lg bg-muted" />
          <div className="h-4 w-24 rounded-md bg-muted" />
        </div>
        <div className="h-11 w-44 rounded-xl bg-muted" />
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-xl bg-muted" />
        <div className="h-11 w-28 rounded-xl bg-muted" />
      </div>

      {/* Summary skeleton */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="space-y-2">
          <div className="h-3.5 w-28 rounded-md bg-muted" />
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-3.5 w-full rounded-md bg-muted" />
        </div>
      </div>

      {/* Card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4"
          >
            {/* Header row: date + badge */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
                <div className="h-4 w-28 rounded-md bg-muted" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>

            {/* Amount */}
            <div className="h-5 w-36 rounded-md bg-muted" />

            {/* Notes line */}
            <div className="mt-2 h-3.5 w-full rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
