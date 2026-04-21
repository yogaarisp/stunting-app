-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  brand_name TEXT NOT NULL DEFAULT 'NutriTrack',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial settings if not exists
INSERT INTO public.settings (id, brand_name)
VALUES (1, 'NutriTrack')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view settings
CREATE POLICY "Anyone can view settings" 
ON public.settings FOR SELECT 
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" 
ON public.settings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
