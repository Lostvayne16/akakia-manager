'use client'

import { useState, useMemo, useEffect } from 'react'

type DatePreset = 'today' | 'week' | 'month' | 'year' | 'custom'

type DateFilterProps = {
  /** Default preset, default 'month' */
  defaultPreset?: DatePreset
  /** Dipanggil setiap kali preset atau range custom berubah */
  onChange: (dateFrom: string, dateTo: string, preset: DatePreset) => void
}

const PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Hari ini',
  week: 'Minggu ini',
  month: 'Bulan ini',
  year: 'Tahun ini',
  custom: 'Custom',
}

const ALL_PRESETS: DatePreset[] = ['today', 'week', 'month', 'year', 'custom']

/** Hari ini 00:00 WIB */
function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Senin minggu ini */
function startOfWeek(): Date {
  const d = startOfToday()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

function startOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfYear(): Date {
  const d = new Date()
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Hitung dateFrom/dateTo untuk preset */
function computeRange(preset: DatePreset, customFrom: string, customTo: string) {
  if (preset === 'custom') {
    return { dateFrom: customFrom, dateTo: customTo }
  }
  let start: Date
  switch (preset) {
    case 'today': start = startOfToday(); break
    case 'week': start = startOfWeek(); break
    case 'month': start = startOfMonth(); break
    case 'year': start = startOfYear(); break
    default: start = startOfMonth()
  }
  return { dateFrom: toISODate(start), dateTo: toISODate(startOfToday()) }
}

export function DateFilter({
  defaultPreset = 'month',
  onChange,
}: DateFilterProps) {
  const [preset, setPreset] = useState<DatePreset>(defaultPreset)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // Hitung range aktif — tetap reaktif
  const range = useMemo(
    () => computeRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  function handlePresetChange(p: DatePreset) {
    setPreset(p)
    // Range akan di-recompute via useMemo di render berikutnya,
    // tapi kita langsung hitung dan panggil onChange biar parent dapet data segera
    const newRange = computeRange(p, customFrom, customTo)
    if (newRange.dateFrom && newRange.dateTo) {
      onChange(newRange.dateFrom, newRange.dateTo, p)
    }
  }

  function handleCustomChange(from: string, to: string) {
    setCustomFrom(from)
    setCustomTo(to)
    if (from && to) {
      onChange(from, to, 'custom')
    }
  }

  // Panggil onChange sekali saat mount (Strict Mode-safe)
  useEffect(() => {
    if (range.dateFrom && range.dateTo) {
      onChange(range.dateFrom, range.dateTo, preset)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Preset tanggal */}
      <div className="flex flex-wrap gap-2">
        {ALL_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => handlePresetChange(p)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              preset === p
                ? 'bg-primary/15 text-primary'
                : 'border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {preset === 'custom' && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => handleCustomChange(e.target.value, customTo)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground">s.d.</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => handleCustomChange(customFrom, e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
    </div>
  )
}
