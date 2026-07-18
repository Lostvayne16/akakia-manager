@AGENTS.md



\# akakia-manager — Project Blueprint



\## 1. Konteks Bisnis

Aplikasi manajemen internal untuk bisnis sofa repair \& custom upholstery (Jabodetabek — hotel, kafe, rumah sakit). Digunakan oleh \*\*3 orang\*\* (owner + tim), semua user punya hak akses yang \*\*sama\*\* (full CRUD — tidak ada role/permission bertingkat). Produksi, bukan prototipe — data finansial harus akurat.



\## 2. Stack

\- Next.js (App Router) + TypeScript

\- Supabase (Auth + Postgres + RLS)

\- shadcn/ui (`components.json`)

\- PWA dengan \*\*offline support wajib\*\* (Serwist — `app/manifest.ts` + `app/sw.ts`)

\- Deploy: Vercel



\---



\## 3. Skema Database (FINAL — jangan diubah tanpa konfirmasi user)



\### customers

```sql

CREATE TABLE customers (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   name TEXT NOT NULL,

&#x20;   phone TEXT NOT NULL,

&#x20;   address TEXT,                          -- opsional

&#x20;   is\_active BOOLEAN DEFAULT true NOT NULL, -- soft-delete flag

&#x20;   created\_at TIMESTAMPTZ DEFAULT now() NOT NULL,

&#x20;   updated\_at TIMESTAMPTZ DEFAULT now() NOT NULL

);

```



\### orders

```sql

CREATE TABLE orders (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   customer\_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,

&#x20;   sofa\_type TEXT NOT NULL,

&#x20;   service\_type TEXT NOT NULL,

&#x20;   price NUMERIC NOT NULL CHECK (price >= 0),        -- harga FIX, ditentukan di awal (bukan estimasi)

&#x20;   dp\_amount NUMERIC CHECK (dp\_amount >= 0),          -- NULL = belum DP. Nominal bebas (bisa % atau fix, ditentukan manual per transaksi)

&#x20;   dp\_paid\_at TIMESTAMPTZ,

&#x20;   paid\_amount NUMERIC CHECK (paid\_amount >= 0),      -- NULL = belum lunas. Diisi penuh saat sofa diantar (delivery = pelunasan, satu momen yang sama)

&#x20;   paid\_at TIMESTAMPTZ,

&#x20;   created\_at TIMESTAMPTZ DEFAULT now() NOT NULL,

&#x20;   updated\_at TIMESTAMPTZ DEFAULT now() NOT NULL

);

```



\*\*Status order dihitung, TIDAK disimpan sebagai kolom manual:\*\*

```

dp\_amount IS NULL                    → "Masuk"       (belum ada pembayaran sama sekali)

dp\_amount SET, paid\_amount IS NULL   → "Dikerjakan"   (sudah DP, sedang proses)

paid\_amount SET                      → "Selesai"      (lunas = sudah diantar, final)

```

Tidak ada status "Batal" — kasus order batal (jarang terjadi) ditangani dengan \*\*hapus manual\*\* oleh user; refund DP (jika ada) diurus owner di luar sistem.



\### expenses

```sql

CREATE TYPE expense\_category AS ENUM (

&#x20;   'Makan', 'Material', 'Listrik', 'Transportasi', 'Gaji Karyawan', 'Lainnya'

);



CREATE TABLE expenses (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   expense\_date DATE NOT NULL,

&#x20;   category expense\_category NOT NULL,

&#x20;   amount NUMERIC NOT NULL CHECK (amount > 0),

&#x20;   notes TEXT,   -- WAJIB diisi kalau category = 'Lainnya' (validasi di app layer, bukan constraint DB)

&#x20;   created\_at TIMESTAMPTZ DEFAULT now() NOT NULL

);

```

Expenses \*\*tidak\*\* dikaitkan ke order tertentu — sifatnya operasional umum (misal stok bahan, bukan per-project).



\### RLS (semua tabel — single-role, semua authenticated user akses penuh)

```sql

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;



CREATE POLICY "authenticated\_full\_access" ON customers

&#x20;   FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated\_full\_access" ON orders

&#x20;   FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated\_full\_access" ON expenses

&#x20;   FOR ALL TO authenticated USING (true) WITH CHECK (true);

```



\### Kenapa UUID (bukan serial/identity)

Wajib karena ada offline mode — ID harus bisa di-generate di client (HP) saat tidak ada koneksi, tanpa resiko tabrakan saat sync ke server nanti.



\---



\## 4. Delete Policy (berlaku untuk customers \& orders)



\*\*Prinsip umum:\*\* kalau ada uang fisik yang sudah tercatat masuk, data TIDAK BOLEH dihapus permanen — hanya boleh disembunyikan (soft-delete). Kalau belum ada uang sama sekali, boleh dihapus bebas.



| Entitas | Kondisi | Aksi yang diizinkan |

|---|---|---|

| Customer | Belum punya order sama sekali | Hard delete (boleh dihapus permanen) |

| Customer | Sudah punya order (riwayat apa pun) | TIDAK boleh hard delete → set `is\_active = false` (nonaktifkan) |

| Order | Belum ada `dp\_amount` (belum bayar apa pun) | Hard delete (boleh dihapus permanen) |

| Order | Sudah ada `dp\_amount` dan/atau `paid\_amount` | Hard delete tetap \*\*diizinkan secara UI\*\* hanya untuk kasus order batal (jarang) — user secara sadar menerima bahwa data pemasukan itu akan hilang dari laporan; refund DP diurus manual oleh owner di luar sistem |



\*\*Duplikat data (khusus mode offline):\*\* kalau 2 device input customer baru dengan nama sama secara bersamaan saat offline, JANGAN auto-merge. Biarkan tercatat sebagai 2 baris terpisah — user membersihkan manual lewat fitur hapus jika perlu.



\*\*Conflict resolution saat sync:\*\* last-write-wins (data yang terakhir disimpan yang menang). Tidak perlu UI konfirmasi conflict.



\---



\## 5. Auth



\- Metode: \*\*Google OAuth only\*\* (Supabase Auth provider Google). Tidak ada email+password custom, tidak ada magic link.

\- User pakai email pribadi masing-masing (Gmail yang sudah login di device mereka) — bukan akun khusus kerja.

\- Halaman Login dan Register tetap ada terpisah secara UI, tapi keduanya memicu flow Google OAuth yang sama (klik pertama kali = otomatis buat akun, klik berikutnya = login biasa).

\- \*\*Tidak ada sistem approval/whitelist di dalam app.\*\* Kontrol akses dilakukan manual oleh owner lewat Supabase Dashboard → Authentication → Users (ban/delete akun asing jika ditemukan).

\- Alasan memilih ini: menghindari user harus mengingat password terpisah dari email pribadi (salah satu user sering lupa kredensial dan berpotensi membuat akun duplikat).



\---



\## 6. Fitur Foto Before/After (aktif — diaktifkan kembali 16 Juli 2026)

Dipakai untuk dokumentasi tiap pesanan (before/after servis), sekaligus mengumpulkan materi foto untuk kebutuhan website company profile di masa depan (owner sempat tertunda bikin web karena kekurangan data foto — sekarang dikumpulkan lewat app ini).

\### order_images
```sql
CREATE TABLE order_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('before', 'after')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_full_access" ON order_images
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tabel baru dari SQL manual butuh GRANT eksplisit, RLS policy saja tidak cukup:
GRANT SELECT, INSERT, UPDATE, DELETE ON order_images TO authenticated;
GRANT SELECT ON order_images TO anon;
```

\### Storage
Bucket \*\*`order-images`\*\* (strip, bukan underscore — konsisten di semua kode), `public: true` (dipakai `getPublicUrl`), dengan storage policy CRUD untuk `authenticated` + read untuk `anon`.

Path foto: `{order_id}/{type}_{timestamp}.jpg`. Kompresi client-side (canvas, max width 1200px, JPEG 80%) sebelum upload.



\---



\## 7. Expenses — UX requirements

\- Form input: `expense\_date`, `category` (dropdown dari enum + opsi "Lainnya"), `amount`, `notes` (wajib jika kategori "Lainnya" — validasi di Server Action).

\- Kategori tetap didefinisikan \*\*satu tempat\*\* (enum database), jangan hardcode ulang di form/filter/laporan secara terpisah.

\- Filter wajib ada: rentang tanggal (dengan preset: Hari ini / Minggu ini / Bulan ini / Tahun ini / Custom range), filter kategori (multi-select), search teks bebas (untuk kolom `notes`).

\- Tampilkan ringkasan total otomatis (dan breakdown per kategori) di atas hasil filter — bukan cuma daftar mentah.



\---



\## 8. Laporan Keuangan — requirements

Harus mencakup semua ini, dengan filter tanggal (preset sama seperti expenses) di setiap bagian:

1\. \*\*Untung-rugi per periode\*\* (pemasukan dari `orders.paid\_amount` dikurangi total `expenses.amount`), bisa dilihat per hari/minggu/bulan/tahun.

2\. \*\*Perbandingan periode\*\* (mis. bulan ini vs bulan lalu).

3\. \*\*Breakdown pengeluaran per kategori\*\* (chart, mis. pie/donut).

4\. \*\*Piutang belum lunas\*\* — total `price - dp\_amount` dari semua order yang statusnya "Dikerjakan" (sudah DP, belum lunas).



Boleh ditaruh di dashboard utama atau halaman terpisah — yang penting kedalaman datanya lengkap, bukan cuma angka total dangkal.



\---



\## 9. Offline Mode — requirement wajib

Aplikasi harus tetap bisa dipakai input data (order, customer, expense) tanpa koneksi internet (lokasi kerja seperti hotel/rumah sakit kadang sinyal buruk).



\- Data yang diinput offline disimpan dulu secara lokal (IndexedDB), lalu otomatis sync ke Supabase begitu koneksi kembali.

\- Harus ada indikator visual yang jelas: mana data yang "masih tersimpan lokal, belum ke-sync" vs "sudah tersimpan di server".

\- ID dibuat sebagai UUID di client saat input (bukan menunggu server), agar aman saat sync belakangan.

\- Conflict saat sync: last-write-wins (lihat bagian 4).

\- Duplikat entitas akibat input paralel saat offline dibiarkan (tidak di-auto-merge) — dibersihkan manual oleh user.



\---



\## 10. Aturan Syntax \& Kualitas Kode (WAJIB — berlaku untuk semua AI/agent yang mengerjakan project ini)



1\. \*\*Tidak boleh ada `any`\*\* di TypeScript. Kalau tipe belum jelas, gunakan `unknown` dan validasi, jangan `any`.

2\. \*\*Semua input form wajib divalidasi dengan Zod di dalam Server Action\*\* (bukan cuma validasi HTML/frontend). Ini penting khususnya untuk data finansial (`orders`, `expenses`).

3\. \*\*Semua mutasi data (insert/update/delete) wajib lewat Server Actions\*\* (`'use server'`). Dilarang memanggil Supabase client langsung dari Client Component untuk operasi tulis.

4\. \*\*Error handling eksplisit\*\* — setiap panggilan Supabase harus mengecek `error` dan menampilkannya ke user (toast/alert), tidak boleh gagal diam-diam.

5\. \*\*Kategori/konstanta didefinisikan satu tempat\*\* (single source of truth — enum database atau satu file constants), dipakai ulang di form, filter, dan laporan. Jangan hardcode berulang di banyak file.

6\. \*\*Naming convention:\*\* kebab-case untuk nama file (`dashboard-stats.tsx`), camelCase untuk function/variable, PascalCase untuk nama komponen React.

7\. \*\*Logic pembayaran (`dp\_amount`, `paid\_amount`) wajib dibungkus try/catch\*\* — pastikan tidak ada kondisi data "setengah tersimpan" (mis. DP tercatat tapi status order tidak konsisten).

8\. \*\*Jangan membuat top-level folder baru di `src/`\*\* tanpa konfirmasi. Struktur yang ada (`app/`, `components/`, `lib/`, `utils/`) sudah final.

9\. \*\*Jangan menambah kolom/tabel baru di database\*\* tanpa konfirmasi eksplisit dari user — skema di bagian 3 adalah hasil diskusi mendalam dan final untuk versi awal.



\---



\## 11. Yang BELUM diputuskan (agent harus TANYA user, jangan menebak)

\- Detail UI/flow approval akun tidak relevan lagi (sudah diputuskan: tidak ada approval, kontrol lewat Supabase Dashboard manual).

\- Belum ada keputusan soal notifikasi (reminder follow-up customer, dll) — di luar scope untuk saat ini kecuali diminta.

\- Belum ada keputusan soal ekspor data (PDF/Excel untuk laporan) — tanyakan dulu jika muncul kebutuhan ini.

## 12. UI / Frontend — Layout & Navigasi

- **Target device:** Mobile-first + tablet. Desktop bukan prioritas (asal tidak rusak tampilannya, tidak perlu dioptimasi khusus).
- **Navigasi utama:** Hamburger icon di header → membuka drawer/side panel dari kiri (bukan bottom navigation bar).
- **Isi drawer (urutan tetap):**
  1. Dashboard
  2. Pesanan
  3. Pelanggan
  4. Pengeluaran
  5. Laporan Keuangan
  6. Pengaturan
  7. Profil / Logout (di bagian bawah drawer, tampilkan email Google user yang sedang login)

---

## 13. Tema Visual (WAJIB diikuti persis — jangan improvisasi warna sendiri)

### Dark mode (default match system preference)
Terinspirasi gaya "Linear" — sleek, obsidian, aksen indigo:
```css
--color-bg: #0c0d0e;
--color-text: #f7f8f8;
--color-muted: #8a8f98;
--color-border: rgba(255, 255, 255, 0.08);
--color-accent: #5e6ad2; /* indigo — dipakai HEMAT, hanya untuk elemen penting (tombol utama, active state) */
```
- Font: **Geist** (teks umum), **Geist Mono** (label kecil/badge/monospace angka)
- Card: border tipis + `backdrop-filter: blur(12px)` + subtle glow saat hover (`box-shadow` warna indigo transparan). TIDAK memakai box-shadow berlapis.
- Badge: background transparan tipis (contoh: `bg-emerald-500/10`, teks `text-emerald-400`)

### Light mode
Turunan dari dark mode, **mekanisme visual harus sama** (border tipis, bukan box-shadow berlapis ala Vercel), hanya warnanya yang dibalik:
- Card tetap pakai border tipis (abu-abu muda) + shadow sangat halus, BUKAN box-shadow berlapis
- Badge tetap transparan tipis tapi sedikit lebih pekat dari dark mode agar tetap terbaca di atas putih (contoh: `bg-emerald-50`, teks `text-emerald-700`)
- Aksen utama tetap keluarga **indigo** (`#5e6ad2` atau variannya) — JANGAN diganti ke biru generik atau warna lain

### Badge Status Order (warna sama di kedua mode, hanya kepekatan beda)
| Status | Warna | Kapan |
|---|---|---|
| Masuk | Abu-abu netral | `dp_amount IS NULL` |
| Dikerjakan | Amber/kuning | `dp_amount` ada, `paid_amount` belum |
| Selesai | Emerald/hijau | `paid_amount` ada |

Warna badge status **harus** diatur lewat satu helper function terpusat (misal `getStatusColor(status)` di `lib/`), TIDAK boleh di-hardcode ulang di tiap komponen yang menampilkan badge.

### Lain-lain
- Icon set: **Lucide** (`lucide-react`) saja. Jangan campur dengan emoji atau icon set lain.
- `theme_color` di `manifest.ts` dan meta tag di `layout.tsx` harus ikut menyesuaikan warna background aktif (dark: `#0c0d0e`, light: warna bg terang yang dipakai) — supaya status bar HP menyatu dengan aplikasi (PWA immersive), bukan warna default browser.
- Safe-area: gunakan `env(safe-area-inset-*)` di CSS agar konten tidak tertimpa notch/gesture bar HP.

---

## 14. Komponen & Pattern (WAJIB reusable, jangan duplikat logic)

### Card list
Satu komponen reusable per jenis entity — jangan di-inline langsung di halaman:
- `OrderCard` — menampilkan: nama customer, jenis sofa & jenis servis (teks bebas detail, bukan generik — misal "Sofa 3 Dudukan" / "Ganti Busa", bukan cuma "Sofa" / "Reparasi"), harga, badge status, tanggal dibuat, tombol aksi kontekstual (lihat di bawah)
- `CustomerCard` — nama, nomor telepon, alamat (tampilkan hanya jika diisi), total jumlah order
- `ExpenseCard` — tanggal, kategori, nominal, catatan (jika ada)

### Input teks jenis sofa & servis (`sofa_type`, `service_type`)
- **Free text**, BUKAN dropdown (belum cukup data untuk menentukan daftar pilihan tetap)
- WAJIB ada **autocomplete** yang menyarankan dari nilai-nilai yang sudah pernah diinput sebelumnya (query distinct values dari tabel `orders`)
- Autocomplete WAJIB di-debounce (≥300ms) dan idealnya di-cache lokal — JANGAN query database di setiap ketikan (boros, dan berat di koneksi lambat/offline)
- **Catatan untuk masa depan (belum diputuskan, jangan diimplementasikan sekarang):** setelah data terkumpul cukup banyak dari pemakaian nyata, akan dievaluasi untuk diubah menjadi dropdown + checklist tetap.

### Tombol aksi kontekstual di `OrderCard`
Berubah sesuai status, langsung di card (tidak perlu buka halaman detail dulu):
- Status "Masuk" → tombol "Catat DP"
- Status "Dikerjakan" → tombol "Catat Pelunasan"
- Status "Selesai" → tidak ada tombol aksi

### Form input
- **Semua form (create/edit Order, Customer, Expense) menggunakan bottom sheet**, bukan halaman penuh terpisah.
- Gunakan **satu komponen wrapper bottom sheet** yang reusable (misal `components/bottom-sheet.tsx`) — jangan tiap form mengimplementasikan bottom sheet dengan cara berbeda-beda.
- Animasi buka/tutup bottom sheet WAJIB menggunakan `transform: translateY()` (GPU-accelerated), BUKAN animasi yang mengubah `height`/`margin` (menyebabkan reflow, berat di HP low-end).
- Perilaku setelah submit berhasil:
  - **Order & Customer** → bottom sheet otomatis tertutup, kembali ke card list
  - **Expense** → bottom sheet tetap terbuka dan form dikosongkan kembali (mendukung input beruntun, karena volume expense biasanya lebih tinggi)
- Perilaku setelah submit gagal: bottom sheet TETAP TERBUKA (tidak tertutup), snackbar menampilkan pesan error, user memperbaiki input di form yang sama.

### Notifikasi (Snackbar, bukan toast biasa)
- Gaya Google Material Design: muncul di bagian bawah layar, pesan singkat, TANPA tombol aksi/undo.
- Dipanggil lewat satu sistem terpusat (misal library `sonner`, kompatibel dengan shadcn/ui) — jangan tiap komponen membuat state toast sendiri-sendiri.

### Empty state & Loading state
- Setiap halaman list (Pesanan, Pelanggan, Pengeluaran) WAJIB punya empty state yang didesain (ilustrasi/icon + teks singkat + tombol aksi, misal "Belum ada pesanan" + "+ Tambah Pesanan Pertama") — JANGAN dibiarkan halaman kosong polos.
- Loading state pakai **skeleton** yang bentuknya menyerupai card asli (bukan spinner generik di tengah layar).

### Bahasa
Semua teks UI (label, tombol, pesan error/sukses) WAJIB berbahasa Indonesia konsisten. Tidak boleh campur dengan istilah Inggris di label yang terlihat user (contoh: gunakan "Simpan" bukan "Save", di SEMUA tempat, bukan campur-campur).

---

## 15. Dashboard — Urutan Layout (dari atas ke bawah)

1. **Quick action buttons** — "+ Pesanan Baru" dan "+ Catat Pengeluaran", ditempatkan tepat di bawah header agar mudah dijangkau
2. **Indikator sync offline** — banner kecil, HANYA muncul jika ada data yang belum ter-sync (lihat bagian 16)
3. **Finance cards** — Total Pendapatan, Total Pengeluaran, Untung/Rugi (bulan berjalan)
4. **Piutang belum lunas** — kartu highlight terpisah (total `price - dp_amount` dari semua order berstatus "Dikerjakan")
5. **Breakdown jumlah order per status** — compact, misal "3 Masuk · 5 Dikerjakan · 12 Selesai"
6. **Grafik tren pemasukan** — beberapa bulan terakhir
7. **Reminder pengeluaran belum dicatat hari ini** — banner kondisional (opsional, boleh di-nonaktifkan jika terasa mengganggu)
8. **Daftar order terbaru** — 5-10 item terakhir, paling bawah (area yang wajar di-scroll)

Halaman ini boleh panjang dan memerlukan scroll — itu wajar untuk dashboard mobile, jangan dipaksa muat dalam satu layar.

---

## 16. Offline Sync — Indikator UI
- Tampilkan badge/banner kecil di Dashboard jika ada data yang tersimpan lokal (IndexedDB) tapi belum berhasil ter-sync ke server, misal: "3 data belum tersinkron".
- Item yang belum ter-sync harus punya penanda visual yang jelas di card list-nya sendiri (misal ikon kecil atau warna border berbeda), supaya user tahu mana data yang "masih lokal" vs "sudah tersimpan di server".

---

## 17. Performa Form — Aturan Kritis (WAJIB, sering jadi sumber UX berat)

1. Autocomplete WAJIB di-debounce, JANGAN query ke database di setiap ketikan.
2. Bottom sheet TIDAK BOLEH memicu re-render/reload data pada halaman/card list di belakangnya saat dibuka atau ditutup.
3. Animasi bottom sheet WAJIB pakai `transform`, bukan properti yang memicu reflow (`height`, `margin`, `top`).
4. Validasi ringan (required, format dasar) dilakukan di client-side dulu untuk feedback instan, SEBELUM submit ke server — validasi Zod penuh di Server Action tetap wajib berjalan sebagai lapisan keamanan (bukan pengganti, tapi lapisan kedua).
5. Loading state saat submit HANYA di tombol submit (misal teks berubah jadi "Menyimpan..." + disable sementara) — JANGAN memakai blocking spinner full-screen yang membekukan seluruh layar.

---

## 18. Yang BELUM diputuskan (agent harus TANYA user, jangan menebak)
- Daftar dropdown tetap untuk `sofa_type` dan `service_type` — menunggu data terkumpul dari pemakaian nyata terlebih dahulu.
- Detail lebih lanjut soal reminder pengeluaran (jadwal, kondisi kapan muncul) belum di-spesifikasi detail — implementasikan versi sederhana dulu, tanyakan jika perlu detail lebih lanjut.

