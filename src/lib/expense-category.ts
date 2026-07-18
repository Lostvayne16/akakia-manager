import { EXPENSE_CATEGORIES, type ExpenseCategory } from './constants'

type CategoryColorSet = {
  /** Warna solid (untuk teks / titik legend) */
  text: string
  /** Warna translucent (untuk background badge/chip) */
  bg: string
}

/**
 * Posisi persentase (0-100) tiap kategori di sepanjang gradient brand
 * Obsidian Kinetic (secondary ungu → primary cyan), dibagi rata berdasarkan
 * urutan index di EXPENSE_CATEGORIES (bukan hash). EXPENSE_CATEGORIES adalah
 * set tertutup (union type, cuma 6 kategori) — jadi index-based ini menjamin
 * tiap kategori kepisah rata & nggak ada 2 kategori numpuk di posisi gradient
 * yang berdekatan (yang terjadi di hash-based lama, mis. "Material" 95% vs
 * "Transportasi" 99% jadi keliatan warna yang sama).
 * Kategori di luar EXPENSE_CATEGORIES (fallback string) tetap kebagian slot
 * lewat modulo, walau nggak dijamin beda dari kategori lain di luar list.
 *
 * Interpolasi warnanya pakai `in oklch` (bukan `in srgb`) — oklch itu
 * perceptually uniform, jadi jarak antar kategori kerasa beda secara visual
 * yang lebih konsisten di sepanjang gradient, termasuk di ujung ungu yang
 * sebelumnya (srgb) numpuk keliatan mirip walau angka persennya udah beda.
 * Tetap gradient brand yang sama persis (secondary → primary), cuma cara
 * ngeblend-nya yang lebih perceptually akurat — nggak keluar dari tema.
 */
function categoryToPercent(category: string): number {
  const idx = EXPENSE_CATEGORIES.indexOf(category as ExpenseCategory)
  const total = EXPENSE_CATEGORIES.length
  if (idx === -1) {
    // Fallback untuk kategori di luar list resmi — tetap deterministik.
    let hash = 0
    for (let i = 0; i < category.length; i++) {
      hash = (hash << 5) - hash + category.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash) % 101
  }
  return Math.round((idx / total) * 100)
}

/**
 * Index kategori (dari EXPENSE_CATEGORIES) — dipakai buat nentuin
 * apakah kategori kebagian "band" genap atau ganjil (lihat getCategoryColor).
 * Kategori di luar list resmi fallback ke hash mod 2, tetap deterministik.
 */
function categoryIndex(category: string): number {
  const idx = EXPENSE_CATEGORIES.indexOf(category as ExpenseCategory)
  if (idx !== -1) return idx
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash << 5) - hash + category.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Kembalikan pasangan warna untuk kategori expense — dipakai di badge,
 * filter chip, dan donut chart breakdown (satu sumber kebenaran warna,
 * konsisten di semua tempat). Nilai yang dikembalikan adalah CSS color
 * string (untuk dipakai lewat inline `style`, bukan className Tailwind).
 *
 * Selain posisi hue di gradient (secondary ungu → primary cyan), kategori
 * dengan index ganjil digelapkan sedikit (`color-mix ... black`) — ini
 * nambah 1 sumbu pembeda visual (value/kepekatan) tanpa nambah hue baru
 * di luar 2 warna brand, jadi kategori yang posisinya berdekatan di
 * gradient (mis. hue mirip) tetap kerasa beda karena satu lebih gelap
 * dari yang sebelah.
 */
export function getCategoryColor(category: ExpenseCategory | string): CategoryColorSet {
  const pct = categoryToPercent(category)
  const isOdd = categoryIndex(category) % 2 === 1
  const base = `color-mix(in oklch, var(--secondary), var(--primary) ${pct}%)`
  const text = isOdd ? `color-mix(in oklch, ${base}, black 18%)` : base
  const bg = `color-mix(in srgb, ${text} 14%, transparent)`
  return { text, bg }
}
