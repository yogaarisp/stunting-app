-- 1. Buat fungsi pembantu untuk cek admin (Security Definer untuk bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Hapus kebijakan lama yang membatasi/bermasalah
DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Children access" ON public.children;
DROP POLICY IF EXISTS "History access" ON public.histori_perkembangan;
DROP POLICY IF EXISTS "Public profile access for users" ON public.profiles;
DROP POLICY IF EXISTS "Public children access for users" ON public.children;
DROP POLICY IF EXISTS "Public history access for users" ON public.histori_perkembangan;

-- 3. Kebijakan Profil Baru
CREATE POLICY "Profiles access" ON public.profiles FOR ALL 
USING (auth.uid() = id OR is_admin());

-- 4. Kebijakan Data Anak Baru
CREATE POLICY "Children access" ON public.children FOR ALL 
USING (auth.uid() = user_id OR is_admin());

-- 5. Kebijakan Histori Baru
CREATE POLICY "History access" ON public.histori_perkembangan FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.children c 
    WHERE c.id = child_id AND (c.user_id = auth.uid() OR is_admin())
  )
);

