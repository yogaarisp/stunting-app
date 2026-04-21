-- ==========================================
-- STUNTING APP - FULL DATABASE SCHEMA & RLS
-- ==========================================

-- 1. FUNCTIONS
-- Fungsi is_admin() untuk mengecek role user secara aman tanpa rekursi RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLES
-- Profiles: Informasi akun pengguna (Orang Tua / Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  address text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Children: Identitas utama anak
CREATE TABLE IF NOT EXISTS public.children (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nama_anak text NOT NULL,
  tanggal_lahir date NOT NULL,
  jenis_kelamin text CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  berat_badan float8,
  tinggi_badan float8,
  lingkar_lengan float8,
  lingkar_kepala float8,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Histori Perkembangan: Rekam jejak bulanan anak
CREATE TABLE IF NOT EXISTS public.histori_perkembangan (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  berat_badan float8 NOT NULL,
  tinggi_badan float8 NOT NULL,
  umur_bulan int NOT NULL,
  lingkar_lengan float8,
  lingkar_kepala float8,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menus: Rekomendasi makanan gizi (Admin Only)
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Edukasi: Artikel literasi stunting (Admin Only)
CREATE TABLE IF NOT EXISTS public.edukasi (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.histori_perkembangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edukasi ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- PROFILES Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- CHILDREN Policies
CREATE POLICY "Users can view their own children" ON public.children
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert their own children" ON public.children
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update their own children" ON public.children
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- HISTORI PERKEMBANGAN Policies
CREATE POLICY "Users can view history of their children" ON public.histori_perkembangan
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = histori_perkembangan.child_id 
      AND (children.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert history for their children" ON public.histori_perkembangan
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = histori_perkembangan.child_id 
      AND (children.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can update performance history" ON public.histori_perkembangan
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = histori_perkembangan.child_id 
      AND (children.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can delete performance history" ON public.histori_perkembangan
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = histori_perkembangan.child_id 
      AND (children.user_id = auth.uid() OR is_admin())
    )
  );

-- MENUS & EDUKASI Policies (Public read, Admin manage)
CREATE POLICY "Public can view menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Admins can manage menus" ON public.menus ALL USING (is_admin());

CREATE POLICY "Public can view edukasi" ON public.edukasi FOR SELECT USING (true);
CREATE POLICY "Admins can manage edukasi" ON public.edukasi ALL USING (is_admin());

-- 5. TRIGGER FOR NEW USER
-- Otomatis membuat profil saat ada user baru sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger jika sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Pasang Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
