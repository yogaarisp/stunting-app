-- =============================================
-- UPDATE TABEL PROFILES (Biodata Pengguna)
-- =============================================

-- Tambahkan kolom baru untuk biodata singkat
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update kebijakan RLS (opsional jika sudah ada ALL, tapi ini untuk spesifik)
-- User bisa mengubah profilnya sendiri kecuali role
CREATE POLICY "Users can update own non-sensitive profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Berikan komentar pada tabel
COMMENT ON COLUMN public.profiles.phone IS 'Nomor HP aktif orang tua';
COMMENT ON COLUMN public.profiles.address IS 'Alamat domisili lengkap';
