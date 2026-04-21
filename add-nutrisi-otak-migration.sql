-- ============================================
-- MIGRASI: Tambah Kategori 'nutrisi_otak'
-- Tanggal: 2026-04-17
-- Desc: Menambah opsi kategori menu baru untuk
--       rekomendasi nutrisi perkembangan otak.
-- ============================================

-- 1. Update constraint kategori di tabel menus
ALTER TABLE public.menus DROP CONSTRAINT IF EXISTS menus_kategori_check;
ALTER TABLE public.menus ADD CONSTRAINT menus_kategori_check 
  CHECK (kategori IN ('tinggi_kalori', 'tinggi_protein', 'tinggi_kalsium', 'probiotik', 'normal', 'nutrisi_otak'));

-- 2. Seed menu nutrisi otak
INSERT INTO public.menus (nama_menu, deskripsi, nutrisi, kalori, protein, kalsium, kategori) VALUES
  ('Puree Ikan Tongkol + Bayam', 'Ikan tongkol halus dengan bayam merah, kaya DHA dan zat besi untuk perkembangan otak.', 'DHA, Zat Besi, Omega-3, Vitamin A', 220, 16, 60, 'nutrisi_otak'),
  ('Bubur Hati Ayam Wortel', 'Hati ayam kaya zat besi dikombinasikan dengan wortel untuk mendukung perkembangan otak.', 'Zat Besi, Vitamin A, Protein, Folat', 190, 14, 40, 'nutrisi_otak'),
  ('Smoothie Alpukat Pisang', 'Alpukat yang kaya lemak sehat dikombinasikan dengan pisang untuk energi dan perkembangan otak.', 'Lemak Sehat, Kalium, Vitamin E, Vitamin B6', 200, 4, 30, 'nutrisi_otak'),
  ('Sup Ikan Kembung Tahu', 'Ikan kembung kaya omega-3 dengan tahu lembut dan sayuran hijau.', 'Omega-3, DHA, Protein, Kalsium', 240, 18, 90, 'nutrisi_otak'),
  ('Nasi Tim Telur Puyuh Brokoli', 'Telur puyuh kaya kolin untuk perkembangan otak dengan brokoli sumber vitamin.', 'Kolin, Protein, Vitamin C, Zat Besi', 230, 12, 50, 'nutrisi_otak');
