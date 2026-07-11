import type { ExpenseCategory } from './constants'

type CategoryColorSet = {
  /** Class untuk background badge (transparan tipis) */
  bg: string
  /** Class untuk teks badge */
  text: string
}

/**
 * Kembalikan pasangan class Tailwind untuk badge kategori expense.
 * Warna konsisten di dark/light mode, hanya kepekatan berbeda.
 * CLAUDE.md §13 — badge style.
 */
export function getCategoryColor(category: ExpenseCategory): CategoryColorSet {
  switch (category) {
    case 'Makan':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400' }
    case 'Material':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400' }
    case 'Listrik':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400' }
    case 'Transportasi':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400' }
    case 'Gaji Karyawan':
      return { bg: 'bg-violet-500/10', text: 'text-violet-400' }
    case 'Lainnya':
      return { bg: 'bg-neutral-500/10', text: 'text-neutral-400' }
  }
}
