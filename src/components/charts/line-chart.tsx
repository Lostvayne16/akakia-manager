import { cn } from '@/lib/utils'

interface LineData {
  label: string
  value: number
}

interface LineChartProps {
  data: LineData[]
  height?: number
  lineColor?: string
  className?: string
}

export function LineChart({
  data,
  height = 200,
  lineColor,
  className,
}: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const padding = { top: 10, right: 5, bottom: 8, left: 5 }
  const chartWidth = 100 - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const color = lineColor || 'var(--chart-4)'
  const gradientId = 'lineGradient'

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight
    return { x, y, label: d.label }
  })

  // Smooth curve through the points (Catmull-Rom → cubic Bezier), so the
  // line reads as a gentle wave instead of straight connected segments.
  function smoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return pts.length === 1 ? `M ${pts[0].x} ${pts[0].y}` : ''

    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  const pathD = smoothPath(points)

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full" style={{ height }}>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={padding.top + chartHeight - ratio * chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight - ratio * chartHeight}
              stroke="var(--border)"
              strokeWidth="0.2"
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />
        </svg>

        {/* Line rendered in its own SVG layer, with the glow applied as a
            CSS filter on the <svg> element itself (not the <path> inside
            it). Filters attached to a path inherit the viewBox's internal
            coordinate space, which preserveAspectRatio="none" stretches
            non-uniformly — that smeared the blur sideways. A filter on the
            outer element runs on the already-rasterized, correctly-scaled
            pixels instead, so the glow stays tight and even. */}
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 overflow-visible"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        >
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Data points — rendered as HTML circles, not SVG, so they stay
          perfectly round regardless of the SVG's non-uniform x/y scaling
          from preserveAspectRatio="none" */}
      <div className="pointer-events-none relative w-full" style={{ height, marginTop: -height }}>
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${(p.y / height) * 100}%`,
              width: 6,
              height: 6,
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
      {/* Labels — rendered outside SVG to avoid stretch from preserveAspectRatio="none" */}
      <div className="relative w-full" style={{ height: 20 }}>
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute text-xs text-muted-foreground"
            style={{
              left: `${p.x}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {p.label}
          </div>
        ))}
      </div>
    </div>
  )
}
