-- =============================================
-- TABEL REFERENSI MIKROBIOTA
-- =============================================
CREATE TABLE IF NOT EXISTS public.microbiota_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_bakteri TEXT NOT NULL,
    makanan_disarankan TEXT,
    makanan_dihindari TEXT,
    penjelasan_medis TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.microbiota_references ENABLE ROW LEVEL SECURITY;

-- Pengguna yang login (untuk menu generation) bisa membaca referensi
CREATE POLICY "Auth users can read microbiota_references" ON public.microbiota_references 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Hanya admin yang bisa mengelola data (Insert/Update/Delete)
CREATE POLICY "Admin manage microbiota_references" ON public.microbiota_references 
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_microbiota_references_updated_at
    BEFORE UPDATE ON public.microbiota_references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA AWAL
INSERT INTO public.microbiota_references (nama_bakteri, makanan_disarankan, makanan_dihindari, penjelasan_medis) VALUES
('Lactobacillus', 'Yogurt, Tempe, Pisang, Bawang Putih', 'Gula tinggi, Makanan olahan berlebih', 'Lactobacillus membantu penyerapan kalsium dan meningkatkan sistem imun.'),
('Bifidobacterium', 'Gandum utuh, Apel, Bluberi, Almond', 'Antibiotik berlebih (konsultasikan dokter), Lemak jenuh tinggi', 'Bifidobacterium penting untuk memecah karbohidrat kompleks dan serat.'),
('Akkermansia', 'Delima, Cranberry, Kacang-kacangan, Teh Hijau', 'Diet rendah serat, Alkohol', 'Membantu menjaga lapisan mukosa usus dan mencegah peradangan.');
