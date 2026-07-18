import { ReactNode } from 'react'

export type DonutSegment = {
  label: string
  value: number
  color: string
}

interface MultiDonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  children?: ReactNode
}

/**
 * Multi-segment donut chart — each segment gets its own arc proportional
 * to its share of the total, drawn in sequence around the ring.
 * Use for category breakdowns (e.g. expense categories), not single
 * value-vs-total progress (see DonutChart for that).
 */
export function MultiDonutChart({
  segments,
  size = 180,
  strokeWidth = 22,
  children,
}: MultiDonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let cumulativeLength = 0

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {total === 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
        ) : (
          segments.map((seg, i) => {
            const fraction = seg.value / total
            const segLength = fraction * circumference
            const dashArray = `${segLength} ${circumference}`
            const dashOffset = -cumulativeLength
            cumulativeLength += segLength

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                style={{
                  transition: 'stroke-dasharray 0.6s ease-out',
                }}
              />
            )
          })
        )}
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
