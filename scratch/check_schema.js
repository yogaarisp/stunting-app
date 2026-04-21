
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = 'kotak.melbu@gmail.com';
  const password = 'password123';

  const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
  const user = authData.user;
  if (!user) {
    console.error('Could not log in.');
    return;
  }

  // Attempt to insert with minimal columns to check schema
  const minimalData = {
    user_id: user.id,
    nama_anak: 'Andi Pratama',
    umur_bulan: 24,
    berat_badan: 10.5,
    tinggi_badan: 82.5
  };

  console.log('Attempting minimal insert...');
  const { data, error } = await supabase.from('children').insert(minimalData).select();
  
  if (error) {
    console.error('Minimal insert failed:', error.message);
  } else {
    console.log('Minimal insert success:', data[0].id);
  }
}

run();
