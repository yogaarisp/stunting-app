
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = 'kotak.melbu@gmail.com';
  const password = 'password123';

  console.log(`Logging in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    console.log('Login failed, user might not exist. Please register first.');
    return;
  }

  const user = authData.user;
  console.log('Login successful.');

  // ENSURE PROFILE EXISTS
  console.log('Ensuring profile in public.profiles...');
  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: 'Budi Santoso (Sample)',
    role: 'user'
  });

  // INSERT CHILD DATA (Using only available columns found by debug script)
  console.log('Inserting child data...');
  const childData = {
    user_id: user.id,
    nama_anak: 'Andi Pratama (Sample)',
    umur_bulan: 24,
    berat_badan: 10.5,
    tinggi_badan: 82.5,
    lingkar_lengan: 14.5,
    lingkar_kepala: 48.0,
    alergi: 'Kacang',
    mikrobiota: 'Baik'
  };

  const { data: child, error: childError } = await supabase
    .from('children')
    .upsert(childData, { onConflict: 'user_id' })
    .select()
    .single();

  if (childError) {
    console.error('Insert failed:', childError.message);
    return;
  }

  console.log('Child created with ID:', child.id);

  // INSERT HISTORY
  console.log('Adding growth history...');
  await supabase.from('histori_perkembangan').delete().eq('child_id', child.id);

  const entries = [
    { child_id: child.id, berat_badan: 8.5, tinggi_badan: 72, umur_bulan: 12, created_at: '2023-10-01' },
    { child_id: child.id, berat_badan: 9.2, tinggi_badan: 76, umur_bulan: 18, created_at: '2024-04-01' },
    { child_id: child.id, berat_badan: 10.5, tinggi_badan: 82.5, umur_bulan: 24, created_at: new Date().toISOString() }
  ];

  const { error: histError } = await supabase.from('histori_perkembangan').insert(entries);

  if (histError) {
    console.error('History fail:', histError.message);
  } else {
    console.log('Sample data successfully injected!');
  }
}

run();
