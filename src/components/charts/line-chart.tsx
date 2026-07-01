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
  const padding = { top: 10, right: 5, bottom: 20, left: 5 }
  const chartWidth = 100 - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const color = lineColor || 'var(--chart-4)'
  const gradientId = 'lineGradient'

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight
    return { x, y, label: d.label }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <svg
        width="100%"
        height="100%"
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

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.2" fill={color} />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 2}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize="3"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
