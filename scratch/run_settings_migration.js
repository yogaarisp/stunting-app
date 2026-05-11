const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  const sql = `
    ALTER TABLE public.settings 
    ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
    ADD COLUMN IF NOT EXISTS supabase_url TEXT,
    ADD COLUMN IF NOT EXISTS supabase_anon_key TEXT,
    ADD COLUMN IF NOT EXISTS supabase_service_role_key TEXT;
  `;

  console.log('Running settings migration...');
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error (RPC exec_sql might not exist):', error.message);
    console.log('Trying manual alter via direct query (if allowed)...');
    // RPC is usually the way for arbitrary SQL in Supabase if enabled
  } else {
    console.log('Migration successful!');
  }
}

runMigration();
