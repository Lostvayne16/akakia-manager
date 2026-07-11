-- Restrukturasi database sesuai blueprint CLAUDE.md bagian 3
--
-- Perubahan:
--   1. Buat ENUM expense_category + tabel expenses
--   2. Ubah orders: hapus estimated_price & status, tambah price, dp_amount, dp_paid_at, paid_amount, paid_at
--   3. Ubah customers: tambah is_active
--   4. Ubah FK customer_id: CASCADE → RESTRICT
--   5. Hapus order_images (tabel)
--   6. RLS untuk expenses

-- 1. EXPENSES TABLE
CREATE TYPE expense_category AS ENUM (
    'Makan',
    'Material',
    'Listrik',
    'Transportasi',
    'Gaji Karyawan',
    'Lainnya'
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date DATE NOT NULL,
    category expense_category NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. ALTER ORDERS
-- Tambah kolom baru dulu (nullable agar bisa migrasi data dari kolom lama)
ALTER TABLE orders
    ADD COLUMN price NUMERIC CHECK (price >= 0),
    ADD COLUMN dp_amount NUMERIC CHECK (dp_amount >= 0),
    ADD COLUMN dp_paid_at TIMESTAMPTZ,
    ADD COLUMN paid_amount NUMERIC CHECK (paid_amount >= 0),
    ADD COLUMN paid_at TIMESTAMPTZ;

-- Migrasi data: isi price dari estimated_price
UPDATE orders SET price = estimated_price;

-- Setel NOT NULL setelah data terisi, lalu hapus kolom lama
ALTER TABLE orders
    ALTER COLUMN price SET NOT NULL,
    DROP COLUMN estimated_price,
    DROP COLUMN status;

-- 3. ALTER CUSTOMERS
ALTER TABLE customers
    ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- 4. UBAH FK CONSTRAINT CASCADE → RESTRICT
ALTER TABLE orders
    DROP CONSTRAINT orders_customer_id_fkey,
    ADD CONSTRAINT orders_customer_id_fkey
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE RESTRICT;

-- 5. HAPUS ORDER_IMAGES
DROP TABLE IF EXISTS order_images;

DROP POLICY IF EXISTS "Allow public read access on order-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload in order-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete in order-images" ON storage.objects;

-- 6. RLS UNTUK EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access"
    ON expenses FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- 7. HAPUS ENUM TYPE LAMA YANG TIDAK DIPAKAI LAGI
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS image_type;

