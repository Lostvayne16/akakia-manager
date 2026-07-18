'use client'

import { useState } from 'react'
import { Plus, ClipboardList, Receipt, UserPlus } from 'lucide-react'
import { useQuickCreate } from './dashboard-shell'

const shortcuts = [
  {
    label: 'Pesanan Baru',
    sheet: 'order' as const,
    icon: ClipboardList,
    iconBg: 'bg-primary',
    iconColor: 'text-primary-foreground',
  },
  {
    label: 'Catat Pengeluaran',
    sheet: 'expense' as const,
    icon: Receipt,
    iconBg: 'bg-rose-500',
    iconColor: 'text-white',
  },
  {
    label: 'Tambah Pelanggan',
    sheet: 'customer' as const,
    icon: UserPlus,
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white',
  },
]

export function QuickActionFab() {
  const [open, setOpen] = useState(false)
  const { openOrderSheet, openExpenseSheet, openCustomerSheet } = useQuickCreate()

  function handleSheet(sheet: 'order' | 'expense' | 'customer') {
    setOpen(false)
    const actions = { order: openOrderSheet, expense: openExpenseSheet, customer: openCustomerSheet }
    actions[sheet]()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <div
        className="fixed bottom-0 right-0 z-50 flex flex-col items-end md:hidden"
        style={{
          padding: `0 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.25rem) 0`,
        }}
      >
        <div
          className={`mb-3 flex flex-col items-end gap-2 transition-all duration-200 ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0'
          }`}
        >
          {shortcuts.map((s) => (
            <button
              key={s.sheet}
              onClick={() => handleSheet(s.sheet)}
              className="flex cursor-pointer items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg transition-colors hover:bg-muted/60"
            >
              <span className="whitespace-nowrap text-sm font-medium text-foreground">
                {s.label}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${s.iconBg} ${s.iconColor}`}
              >
                <s.icon className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:bg-primary/90 active:scale-95 glow-primary"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          <Plus
            className={`h-6 w-6 transition-transform duration-200 ${
              open ? 'rotate-45' : 'rotate-0'
            }`}
          />
        </button>
      </div>
    </>
  )
}
