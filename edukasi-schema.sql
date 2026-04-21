-- =============================================
-- TABEL EDUKASI (Artikel & Video)
-- =============================================
CREATE TABLE IF NOT EXISTS public.edukasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe TEXT NOT NULL CHECK (tipe IN ('artikel', 'video')),
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  link_url TEXT NOT NULL,
  thumbnail_url TEXT, -- Untuk artikel (bisa nama icon), untuk video (bisa emoji/link gambar)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.edukasi ENABLE ROW LEVEL SECURITY;

-- Semua orang (termasuk yang belum login) bisa membaca edukasi
CREATE POLICY "Public read edukasi" ON public.edukasi FOR SELECT USING (true);

-- Hanya admin yang bisa mengubah data edukasi (Insert/Update/Delete)
CREATE POLICY "Admin manage edukasi" ON public.edukasi FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- SEED DATA AWAL (Migrasi dari hardcode)
-- =============================================
TRUNCATE TABLE public.edukasi CASCADE;

-- Insert Artikel Dasar
INSERT INTO public.edukasi (tipe, judul, deskripsi, link_url, thumbnail_url) VALUES
('artikel', 'Apa itu Stunting?', 'Stunting adalah kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis sehingga anak terlalu pendek untuk usianya.', 'https://www.who.int/news/item/19-11-2015-stunting-in-a-nutshell', 'AlertTriangle'),
('artikel', 'Cara Mendeteksi Stunting Sejak Dini', 'Pemantauan rutin tinggi badan anak dan membandingkannya dengan standar WHO adalah langkah awal mendeteksi stunting.', 'https://yankes.kemkes.go.id/view_artikel/2473/stunting', 'Stethoscope'),
('artikel', 'Nutrisi Penting untuk Mencegah Stunting', 'Protein, kalsium, zat besi, dan zinc adalah nutrisi kunci yang harus dipenuhi selama masa pertumbuhan anak.', 'https://www.unicef.org/nutrition', 'Apple'),
('artikel', 'Peran Mikrobiota Usus pada Pertumbuhan', 'Kesehatan saluran pencernaan sangat berperan dalam penyerapan nutrisi. Probiotik bisa membantu menjaga keseimbangan mikrobiota usus.', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6463098/', 'Heart'),
('artikel', '1000 Hari Pertama Kehidupan', 'Periode emas dari kehamilan hingga usia 2 tahun sangat menentukan pertumbuhan dan perkembangan anak.', 'https://www.1000hari.id/', 'Baby');

-- Insert Video Dasar
INSERT INTO public.edukasi (tipe, judul, deskripsi, link_url, thumbnail_url) VALUES
('video', 'Pencegahan Stunting - Kemenkes RI', 'Video edukasi dari Kementerian Kesehatan tentang langkah-langkah pencegahan stunting.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '🏥'),
('video', 'Cara Mengukur Tinggi Badan Anak dengan Benar', 'Panduan teknis pengukuran antropometri anak untuk orang tua.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '📏'),
('video', 'Resep MPASI Bergizi untuk Bayi 6-12 Bulan', 'Kumpulan resep MPASI yang kaya nutrisi untuk mendukung pertumbuhan optimal.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '🍲'),
('video', 'Kenali Tanda-Tanda Malnutrisi pada Anak', 'Pelajari cara mengenali gejala awal kekurangan gizi pada anak balita.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '⚠️');
