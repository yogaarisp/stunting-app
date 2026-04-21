-- =============================================
-- FIX TABEL CHILDREN (Misiing Columns)
-- =============================================

-- Tambahkan kolom yang mungkin terlewat di tabel children
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS tanggal_lahir DATE,
ADD COLUMN IF NOT EXISTS jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan'));

-- Tambahkan index untuk optimasi jika diperlukan
CREATE INDEX IF NOT EXISTS idx_children_user_id ON public.children(user_id);
