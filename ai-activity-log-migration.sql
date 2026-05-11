-- Migration: Add AI Activity Log Table
-- Untuk tracking penggunaan AI dan monitoring

-- Create ai_activity_log table
CREATE TABLE IF NOT EXISTS public.ai_activity_log (
    id BIGSERIAL PRIMARY KEY,
    child_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'menu_generation', 'chart_recommendation', 'cooking_guide'
    input_data JSONB, -- Data input yang dikirim ke AI
    ai_response JSONB, -- Response dari AI
    processing_time_ms INTEGER, -- Waktu pemrosesan dalam milliseconds
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_child_id ON public.ai_activity_log(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_activity_type ON public.ai_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_ai_activity_log_created_at ON public.ai_activity_log(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can see all logs
CREATE POLICY "Admin can view all AI activity logs" ON public.ai_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admin can insert logs (for system operations)
CREATE POLICY "Admin can insert AI activity logs" ON public.ai_activity_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT, INSERT ON public.ai_activity_log TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.ai_activity_log_id_seq TO authenticated;

-- Add comment
COMMENT ON TABLE public.ai_activity_log IS 'Log aktivitas AI untuk monitoring dan debugging';
COMMENT ON COLUMN public.ai_activity_log.activity_type IS 'Jenis aktivitas: menu_generation, chart_recommendation, cooking_guide';
COMMENT ON COLUMN public.ai_activity_log.input_data IS 'Data input yang dikirim ke AI (JSONB)';
COMMENT ON COLUMN public.ai_activity_log.ai_response IS 'Response dari AI (JSONB)';