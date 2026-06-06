-- =============================================
-- MIGRATION: Remove A/B Research Groups
-- =============================================

-- 1. HAPUS KOLOM research_group DARI PROFILES
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS research_group;

-- 2. UBAH KEMBALI TRIGGER (Tanpa group assignment)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HAPUS KOLOM research_group DARI ai_menu_cache
ALTER TABLE public.ai_menu_cache
DROP COLUMN IF EXISTS research_group;
