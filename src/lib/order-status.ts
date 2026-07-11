export type OrderStatus = 'Masuk' | 'Dikerjakan' | 'Selesai'

type OrderWithPayments = {
  dp_amount: number | null
  paid_amount: number | null
}

/**
 * Hitung status order dari dp_amount dan paid_amount.
 * Lihat CLAUDE.md §3.
 */
export function getOrderStatus(order: OrderWithPayments): OrderStatus {
  if (order.paid_amount !== null) return 'Selesai'
  if (order.dp_amount !== null) return 'Dikerjakan'
  return 'Masuk'
}

type StatusColorSet = {
  /** Class untuk background badge (transparan tipis) */
  bg: string
  /** Class untuk teks badge */
  text: string
}

/**
 * Kembalikan pasangan class Tailwind untuk badge status.
 * Warna konsisten di dark/light mode, hanya kepekatan berbeda.
 * CLAUDE.md §13 — Badge Status Order.
 */
export function getStatusColor(status: OrderStatus): StatusColorSet {
  switch (status) {
    case 'Masuk':
      return { bg: 'bg-neutral-500/10', text: 'text-neutral-400' }
    case 'Dikerjakan':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400' }
    case 'Selesai':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
  }
}
