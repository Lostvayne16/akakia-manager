-- Buat bucket untuk foto pesanan jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-images', 'order-images', true)
ON CONFLICT (id) DO NOTHING;

-- Hapus kebijakan yang sudah ada jika ada (mencegah error duplikasi saat dijalankan ulang)
DROP POLICY IF EXISTS "Allow public read access on order-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload in order-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete in order-images" ON storage.objects;

-- Kebijakan RLS untuk Storage
CREATE POLICY "Allow public read access on order-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'order-images');

CREATE POLICY "Allow authenticated users to upload in order-images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'order-images');

CREATE POLICY "Allow authenticated users to delete in order-images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'order-images');
