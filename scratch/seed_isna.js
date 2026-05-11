const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIsnaData() {
  const email = 'isnawatiwati10181@gmail.com';
  const fullName = 'Isnawati';
  const password = 'password123';

  console.log(`Starting seeding for ${email}...`);

  // 1. Create User in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('User already registered in Auth, proceeding to find ID...');
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(u => u.email === email);
        var userId = existing.id;
    } else {
        console.error('Error creating auth user:', authError.message);
        return;
    }
  } else {
    userId = authData.user.id;
    console.log('Auth user created:', userId);
  }

  // 2. Create Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      full_name: fullName,
      role: 'user'
    });

  if (profileError) {
    console.error('Error creating profile:', profileError.message);
  } else {
    console.log('Profile created/updated.');
  }

  // 3. Create Child
  const childId = require('crypto').randomUUID();
  const { error: childError } = await supabase
    .from('children')
    .insert({
      id: childId,
      user_id: userId,
      nama_anak: 'Putra Isna',
      tanggal_lahir: '2022-05-11', // Exactly 2 years old today
      jenis_kelamin: 'Laki-laki',
      umur_bulan: 24,
      berat_badan: 9.5, // Low (WHO ~12.2kg)
      tinggi_badan: 81.0, // Low (WHO ~87cm)
      lingkar_lengan: 13.0,
      lingkar_kepala: 46.0,
      alergi: 'None',
      mikrobiota: 'Kurang'
    });

  if (childError) {
    console.error('Error creating child:', childError.message);
  } else {
    console.log('Child "Putra Isna" created:', childId);
  }

  // 4. Create History
  const { error: historyError } = await supabase
    .from('histori_perkembangan')
    .insert([
      { child_id: childId, berat_badan: 8.0, tinggi_badan: 75.0, lingkar_lengan: 12.0, lingkar_kepala: 44.0, umur_bulan: 12 },
      { child_id: childId, berat_badan: 8.5, tinggi_badan: 78.0, lingkar_lengan: 12.5, lingkar_kepala: 45.0, umur_bulan: 18 },
      { child_id: childId, berat_badan: 9.5, tinggi_badan: 81.0, lingkar_lengan: 13.0, lingkar_kepala: 46.0, umur_bulan: 24 }
    ]);

  if (historyError) {
    console.error('Error creating history:', historyError.message);
  } else {
    console.log('History data added.');
  }

  console.log('✅ Seeding complete!');
  console.log(`Login Email: ${email}`);
  console.log(`Password: ${password}`);
}

seedIsnaData();
