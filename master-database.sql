-- =============================================================
-- MASTER DATABASE SCRIPT: NUTRI-TRACK STUNTING APP
-- Dibuat: 2026-04-16
-- Deskripsi: Skema lengkap, Kebijakan Keamanan (RLS), 
--            Penyimpanan (Storage), dan Data Awal (Seed).
-- =============================================================

-- =============================================
-- 1. CLEANUP (Hapus sisa error lama jika ada)
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =============================================
-- 2. TABEL PROFIL (Integrasi Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. TABEL ANAK (Informasi Metadata)
-- =============================================
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nama_anak TEXT NOT NULL,
  tanggal_lahir DATE,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  umur_bulan INTEGER NOT NULL CHECK (umur_bulan >= 0 AND umur_bulan <= 60),
  berat_badan REAL NOT NULL CHECK (berat_badan > 0),
  tinggi_badan REAL NOT NULL CHECK (tinggi_badan > 0),
  lingkar_lengan REAL CHECK (lingkar_lengan >= 0),
  lingkar_kepala REAL CHECK (lingkar_kepala >= 0),
  alergi TEXT,
  mikrobiota TEXT NOT NULL DEFAULT 'Baik' CHECK (mikrobiota IN ('Baik', 'Cukup', 'Kurang')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id) 
);

-- =============================================
-- 4. TABEL HISTORI PERKEMBANGAN
-- =============================================
CREATE TABLE IF NOT EXISTS public.histori_perkembangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  berat_badan REAL NOT NULL,
  tinggi_badan REAL NOT NULL,
  lingkar_lengan REAL,
  lingkar_kepala REAL,
  umur_bulan INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 5. TABEL MENUS (Rekomendasi Makanan)
-- =============================================
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_menu TEXT NOT NULL,
  deskripsi TEXT,
  nutrisi TEXT NOT NULL,
  kalori INTEGER,
  protein REAL,
  kalsium REAL,
  kategori TEXT NOT NULL CHECK (kategori IN ('tinggi_kalori', 'tinggi_protein', 'tinggi_kalsium', 'probiotik', 'normal')),
  gambar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. TABEL EDUKASI (Artikel & Video)
-- =============================================
CREATE TABLE IF NOT EXISTS public.edukasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe TEXT NOT NULL CHECK (tipe IN ('artikel', 'video')),
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  link_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 7. TABEL SETTINGS (Branding & Konfigurasi)
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  brand_name TEXT NOT NULL DEFAULT 'NutriTrack',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 8. STORAGE SETUP (Buckets & Policies)
-- =============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand', 'brand', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage
CREATE POLICY "Public Read Logo" ON storage.objects FOR SELECT USING (bucket_id = 'brand');
CREATE POLICY "Admin Manage Logo" ON storage.objects FOR ALL USING (bucket_id = 'brand');

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS) & POLICIES
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.histori_perkembangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edukasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 9.1 Profiles
CREATE POLICY "User view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9.2 Children
CREATE POLICY "User manage own color" ON public.children FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin full access children" ON public.children FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9.3 History
CREATE POLICY "User manage own history" ON public.histori_perkembangan FOR ALL USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Admin full access history" ON public.histori_perkembangan FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9.4 Menus
CREATE POLICY "Public read menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Admin manage menus" ON public.menus FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9.5 Edukasi
CREATE POLICY "Public read edukasi" ON public.edukasi FOR SELECT USING (true);
CREATE POLICY "Admin manage edukasi" ON public.edukasi FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9.6 Settings
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings" ON public.settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 10. SEED DATA (Data Awal Aplikasi)
-- =============================================

-- 10.1 Menus Seed
TRUNCATE TABLE public.menus CASCADE;
INSERT INTO public.menus (nama_menu, deskripsi, nutrisi, kalori, protein, kalsium, kategori) VALUES
  ('Bubur Ayam Sayur', 'Bubur lembut dengan ayam suwir dan wortel', 'Karbohidrat, Protein, Vitamin A', 250, 12, 30, 'tinggi_kalori'),
  ('Nasi Tim Ikan Salmon', 'Nasi tim dengan ikan salmon dan brokoli', 'Omega-3, Protein, Kalsium', 300, 18, 80, 'tinggi_protein'),
  ('Puree Kentang Keju', 'Kentang halus dengan keju cheddar', 'Karbohidrat, Kalsium, Lemak', 280, 8, 150, 'tinggi_kalsium'),
  ('Smoothie Pisang Yogurt', 'Pisang blend dengan yogurt dan madu', 'Probiotik, Kalium, Kalsium', 180, 6, 120, 'probiotik'),
  ('Tel telur Dadar Bayam', 'Telur dadar dengan bayam dan keju', 'Protein, Zat Besi, Kalsium', 200, 15, 100, 'tinggi_kalsium');

-- 10.2 Edukasi Seed
TRUNCATE TABLE public.edukasi CASCADE;
INSERT INTO public.edukasi (tipe, judul, deskripsi, link_url, thumbnail_url) VALUES
  ('artikel', 'Apa itu Stunting?', 'Gagal tumbuh pada anak akibat kekurangan gizi kronis.', 'https://www.who.int/news/item/19-11-2015-stunting-in-a-nutshell', 'AlertTriangle'),
  ('artikel', 'Nutrisi Penting', 'Protein dan Kalsium adalah kunci utama.', 'https://www.unicef.org/nutrition', 'Apple'),
  ('video', 'Panduan Pengukuran Tubuh', 'Cara mengukur tinggi badan anak dengan benar.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '📏'),
  ('video', 'Resep MPASI Sehat', 'Kumpulan resep MPASI bergizi untuk tumbuh kembang.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '🍲');

-- 10.3 Settings Seed
INSERT INTO public.settings (id, brand_name) VALUES (1, 'NutriTrack') ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 11. AKUN SUPER ADMIN OTOMATIS
-- Email: yoga99se@gmail.com
-- Password: password123
-- =============================================
DO $$ 
DECLARE 
  admin_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'yoga99se@gmail.com') THEN
    -- Insert ke sistem Auth Supabase
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
      'yoga99se@gmail.com', crypt('password123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Yoga Super Admin"}', 
      now(), now()
    );

    -- Tautkan profil admin
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (admin_id, 'yoga99se@gmail.com', 'Yoga Super Admin', 'admin');
  END IF;
END $$;
