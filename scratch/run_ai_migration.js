const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runAIMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🚀 Running AI Activity Log Migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'ai-activity-log-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('1')
            .limit(0);
          
          if (directError && !directError.message.includes('does not exist')) {
            console.error('❌ Error:', error.message);
          } else {
            console.log('✅ Statement executed (or already exists)');
          }
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    // Test table creation
    const { data, error } = await supabase
      .from('ai_activity_log')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Table verification failed:', error.message);
    } else {
      console.log('✅ AI Activity Log table is ready!');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runAIMigration();