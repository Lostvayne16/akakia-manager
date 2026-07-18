/**
 * Utilitas normalisasi nomor telepon.
 *
 * Data `customers.phone` disimpan sebagai free text tanpa validasi format
 * (lihat CLAUDE.md §5 & customers/actions.ts) — jadi bisa muncul dalam
 * banyak variasi: "08123456789", "+62 812-3456-789", "62812.3456.789",
 * "(0812) 3456789", atau bahkan "8123456789" tanpa awalan sama sekali.
 * Fungsi di sini WAJIB dipakai setiap kali nomor telepon customer perlu
 * diubah jadi link (wa.me atau tel:) — jangan hardcode logic serupa ulang
 * di komponen lain (CLAUDE.md §10.5).
 */

/**
 * Ubah nomor telepon (format apa pun) jadi format internasional tanpa
 * simbol, siap dipakai untuk link `https://wa.me/{nomor}`.
 *
 * Aturan:
 * - Buang semua karakter selain digit.
 * - "620..." (typo umum: kode negara + trunk 0 kepakai bareng) → "62..."
 * - "0..." → ganti awalan jadi "62..."
 * - "8..." (nomor HP tanpa kode negara/trunk sama sekali) → tambah "62"
 * - Selain itu (termasuk yang sudah diawali "62" dengan benar) → dibiarkan
 */
export function toWhatsAppNumber(rawPhone: string): string {
  let digits = rawPhone.replace(/[^0-9]/g, '')

  if (digits.startsWith('620')) {
    digits = '62' + digits.slice(3)
  } else if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1)
  } else if (digits.startsWith('8')) {
    digits = '62' + digits
  }

  return digits
}

/**
 * Ubah nomor telepon (format apa pun) jadi href `tel:` yang valid.
 * Dialer HP cukup toleran, jadi cukup buang simbol non-digit (pertahankan
 * "+" di depan kalau ada) tanpa perlu normalisasi kode negara sekeras wa.me.
 */
export function toTelHref(rawPhone: string): string {
  const hasPlus = rawPhone.trim().startsWith('+')
  const digits = rawPhone.replace(/[^0-9]/g, '')
  return `tel:${hasPlus ? '+' : ''}${digits}`
}
