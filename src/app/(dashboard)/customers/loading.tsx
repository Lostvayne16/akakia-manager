export default function Loading() {
  return (
    <div className="w-full animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-24 rounded-lg bg-muted" />
          <div className="h-4 w-32 rounded-md bg-muted" />
        </div>
        <div className="h-11 w-40 rounded-xl bg-muted" />
      </div>

      {/* Search + toggle */}
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-xl bg-muted" />
        <div className="h-11 w-24 rounded-xl bg-muted" />
      </div>

      {/* Card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4"
          >
            {/* Header row: avatar + name + badge */}
            <div className="mb-3 flex items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 rounded-md bg-muted" />
                <div className="h-3 w-20 rounded-md bg-muted" />
              </div>
              <div className="h-5 w-14 rounded-full bg-muted" />
            </div>

            {/* Phone bar */}
            <div className="h-3.5 w-44 rounded-md bg-muted" />

            {/* Address bar */}
            <div className="mt-2 h-3.5 w-56 rounded-md bg-muted" />

            {/* Footer */}
            <div className="mt-3 h-3 w-28 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
