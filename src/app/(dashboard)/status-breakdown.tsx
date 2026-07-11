import { getStatusColor } from '@/lib/order-status'

type StatusBreakdownProps = {
  masuk: number
  dikerjakan: number
  selesai: number
}

export function StatusBreakdown({
  masuk,
  dikerjakan,
  selesai,
}: StatusBreakdownProps) {
  const total = masuk + dikerjakan + selesai

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">Belum ada pesanan</p>
    )
  }

  const items = [
    { label: 'Masuk', count: masuk, colors: getStatusColor('Masuk') },
    { label: 'Dikerjakan', count: dikerjakan, colors: getStatusColor('Dikerjakan') },
    { label: 'Selesai', count: selesai, colors: getStatusColor('Selesai') },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <span className={`font-semibold ${item.colors.text}`}>
            {item.count}
          </span>
          <span className="text-muted-foreground">{item.label}</span>
        </span>
      ))}
    </div>
  )
}
