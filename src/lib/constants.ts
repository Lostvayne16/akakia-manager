export const EXPENSE_CATEGORIES = [
  'Makan',
  'Material',
  'Listrik',
  'Transportasi',
  'Gaji Karyawan',
  'Lainnya',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
