-- =============================================
-- MIGRATION: NutriTrack Revisi
-- Tanggal: 2026-05-01
-- Deskripsi: A/B Group, Mikrobiota Free Text,
--            Food Photos, AI Menu Cache
-- =============================================

-- =============================================
-- 1. TAMBAH KOLOM research_group DI PROFILES
-- =============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS research_group TEXT CHECK (research_group IN ('A', 'B'));

-- =============================================
-- 2. UPDATE TRIGGER: Auto-assign group saat register
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, research_group)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    'user', 
    CASE WHEN random() < 0.5 THEN 'A' ELSE 'B' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang ulang trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 3. UBAH KOLOM MIKROBIOTA DI CHILDREN
-- =============================================
-- Tambah kolom has_mikrobiota_data
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS has_mikrobiota_data BOOLEAN DEFAULT false;

-- Hapus constraint enum lama pada mikrobiota
ALTER TABLE public.children 
DROP CONSTRAINT IF EXISTS children_mikrobiota_check;

-- Ubah kolom mikrobiota jadi free text nullable
ALTER TABLE public.children 
ALTER COLUMN mikrobiota DROP NOT NULL;

ALTER TABLE public.children 
ALTER COLUMN mikrobiota DROP DEFAULT;

-- =============================================
-- 4. TABEL FOOD PHOTOS (Upload foto makanan harian)
-- =============================================
CREATE TABLE IF NOT EXISTS public.food_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  meal_type TEXT CHECK (meal_type IN ('sarapan', 'makan_siang', 'makan_malam', 'snack')),
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS untuk food_photos
ALTER TABLE public.food_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manage own food photos" ON public.food_photos 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin full access food photos" ON public.food_photos 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage bucket untuk foto makanan
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-photos', 'food-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users upload food photos" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'food-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public read food photos" ON storage.objects 
  FOR SELECT USING (bucket_id = 'food-photos');

CREATE POLICY "Users delete own food photos" ON storage.objects 
  FOR DELETE USING (bucket_id = 'food-photos' AND auth.role() = 'authenticated');

-- =============================================
-- 5. TABEL AI MENU CACHE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_menu_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  research_group TEXT NOT NULL,
  condition_hash TEXT NOT NULL,
  menus JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- RLS
ALTER TABLE public.ai_menu_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own cache" ON public.ai_menu_cache 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.children WHERE children.id = ai_menu_cache.child_id AND children.user_id = auth.uid())
  );

CREATE POLICY "Server manage cache" ON public.ai_menu_cache 
  FOR ALL USING (true);

-- =============================================
-- 6. ASSIGN GROUP KE USER YANG SUDAH ADA (tanpa group)
-- =============================================
UPDATE public.profiles 
SET research_group = CASE WHEN random() < 0.5 THEN 'A' ELSE 'B' END
WHERE research_group IS NULL AND role = 'user';
