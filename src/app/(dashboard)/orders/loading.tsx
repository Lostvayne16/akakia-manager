export default function Loading() {
  return (
    <div className="w-full animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-24 rounded-lg bg-muted" />
          <div className="h-4 w-32 rounded-md bg-muted" />
        </div>
        <div className="h-11 w-40 rounded-xl bg-muted" />
      </div>

      {/* Search & filter skeleton */}
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-xl bg-muted" />
        <div className="h-11 w-32 rounded-xl bg-muted" />
      </div>

      {/* Card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="space-y-2">
                <div className="h-4 w-36 rounded-md bg-muted" />
                <div className="h-3 w-24 rounded-md bg-muted" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>

            {/* Service lines */}
            <div className="mb-3 space-y-2">
              <div className="h-3.5 w-48 rounded-md bg-muted" />
              <div className="h-3.5 w-40 rounded-md bg-muted" />
            </div>

            {/* Price */}
            <div className="mb-4 h-6 w-28 rounded-md bg-muted" />

            {/* Action button */}
            <div className="h-10 w-full rounded-xl bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
