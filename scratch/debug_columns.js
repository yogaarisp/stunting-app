
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
    console.error('User not logged in');
    return;
  }
  
  // Ensure profile
  await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: 'user' });

  const minimalData = { 
    user_id: user.id, 
    nama_anak: 'Debug Child', 
    umur_bulan: 24, 
    berat_badan: 10, 
    tinggi_badan: 80 
  };
  
  const { data, error } = await supabase.from('children').insert(minimalData).select();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Available columns:', Object.keys(data[0]));
    // Cleanup
    await supabase.from('children').delete().eq('id', data[0].id);
  }
}

run();
