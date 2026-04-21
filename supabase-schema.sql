-- =============================================
-- RESET & CLEANUP (Membersihkan sisa error lama)
-- =============================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS set_updated_at_children ON public.children CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Hapus user yoga yang korup jika masih ada
DELETE FROM public.profiles WHERE email = 'yoga99se@gmail.com';
DELETE FROM auth.identities WHERE email = 'yoga99se@gmail.com';
DELETE FROM auth.users WHERE email = 'yoga99se@gmail.com';

-- =============================================
-- 1. PROFILES TABLE
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
-- 2. CHILDREN TABLE
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
-- 3. HISTORI PERKEMBANGAN TABLE
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
-- 4. MENUS TABLE
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
-- SEED DATA: Menu Rekomendasi
-- =============================================
-- Kosongkan dulu jika sudah ada agar tidak kembar
TRUNCATE TABLE public.menus CASCADE; 
INSERT INTO public.menus (nama_menu, deskripsi, nutrisi, kalori, protein, kalsium, kategori) VALUES
  ('Bubur Ayam Sayur', 'Bubur lembut dengan ayam suwir dan wortel', 'Karbohidrat, Protein, Vitamin A', 250, 12, 30, 'tinggi_kalori'),
  ('Nasi Tim Ikan Salmon', 'Nasi tim dengan ikan salmon dan brokoli', 'Omega-3, Protein, Kalsium', 300, 18, 80, 'tinggi_protein'),
  ('Puree Kentang Keju', 'Kentang halus dengan keju cheddar', 'Karbohidrat, Kalsium, Lemak', 280, 8, 150, 'tinggi_kalsium'),
  ('Smoothie Pisang Yogurt', 'Pisang blend dengan yogurt dan madu', 'Probiotik, Kalium, Kalsium', 180, 6, 120, 'probiotik'),
  ('Telur Dadar Bayam', 'Telur dadar dengan bayam dan keju', 'Protein, Zat Besi, Kalsium', 200, 15, 100, 'tinggi_kalsium');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.histori_perkembangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Policy (Semua diringkas demi kelancaran dev)
-- PROFILES: Users see own, Admins see all
CREATE POLICY "Profiles access" ON public.profiles FOR ALL 
USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- CHILDREN: Users see own, Admins see all
CREATE POLICY "Children access" ON public.children FOR ALL 
USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- HISTORY: Users see own, Admins see all
CREATE POLICY "History access" ON public.histori_perkembangan FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM children c 
    WHERE c.id = child_id AND (c.user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  )
);

CREATE POLICY "Public menu read" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Admin manage menus" ON public.menus FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- AKUN SUPER ADMIN OTOMATIS
-- Email: yoga99se@gmail.com
-- Password: password123
-- =============================================
DO $$ 
DECLARE 
  admin_id uuid := gen_random_uuid();
BEGIN
  -- 1. Insert ke sistem Auth Supabase (Email confirmed otomatis = now())
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    'yoga99se@gmail.com', crypt('password123', gen_salt('bf')), now(),
    now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Yoga Super Admin"}', 
    now(), now()
  );

  -- 2. Tautkan Identitas Email
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), admin_id, admin_id::text, 
    format('{"sub":"%s","email":"%s"}', admin_id::text, 'yoga99se@gmail.com')::jsonb, 
    'email', now(), now(), now()
  );

  -- 3. Masukkan ke tabel profil kita dengan role 'admin'
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (admin_id, 'yoga99se@gmail.com', 'Yoga Super Admin', 'admin');

END $$;
