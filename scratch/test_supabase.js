require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: URL atau Anon Key tidak ditemukan di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Mencoba koneksi ke Supabase...');
  
  const { data, error } = await supabase
    .from('menus')
    .select('nama_menu')
    .limit(1);

  if (error) {
    console.error('❌ Koneksi Gagal!');
    console.error('Pesan Error:', error.message);
    console.error('Detail Error:', error);
  } else {
    console.log('✅ Koneksi Berhasil!');
    console.log('Data dari tabel menus ditemukan:', data);
  }
}

testConnection();
