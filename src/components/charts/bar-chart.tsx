import { cn } from '@/lib/utils'

interface BarData {
  label: string
  value: number
}

interface BarChartProps {
  data: BarData[]
  height?: number
  barColor?: string
  className?: string
}

export function BarChart({
  data,
  height = 200,
  barColor,
  className,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = Math.min(40, (100 / data.length) * 0.6)
  const gap = (100 - barWidth * data.length) / (data.length + 1)

  const color = barColor || 'var(--chart-1)'

  return (
    <div className={cn('w-full', className)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1="0"
            y1={height - ratio * height}
            x2="100"
            y2={height - ratio * height}
            stroke="var(--border)"
            strokeWidth="0.2"
          />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * height * 0.85
          const x = gap + i * (barWidth + gap)
          const y = height - barHeight
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="2"
                fill={color}
                className="transition-all duration-700 ease-out"
              />
            </g>
          )
        })}
      </svg>
      {/* Labels — rendered outside SVG to avoid stretch from preserveAspectRatio="none" */}
      <div className="relative w-full" style={{ height: 20 }}>
        {data.map((d, i) => {
          const centerX = gap + i * (barWidth + gap) + barWidth / 2
          return (
            <div
              key={i}
              className="absolute text-xs text-muted-foreground"
              style={{
                left: `${centerX}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {d.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
