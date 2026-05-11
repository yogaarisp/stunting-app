const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserEmail() {
  const wrongEmail = 'isnawatiwati10181@gmail.com';
  const correctEmail = 'risnawatiwati10181@gmail.com';
  const fullName = 'Risnawati';
  const password = 'password123';

  console.log(`Fixing user: ${wrongEmail} -> ${correctEmail}`);

  // 1. Delete wrong user if exists
  const { data: listData } = await supabase.auth.admin.listUsers();
  const wrongUser = listData.users.find(u => u.email === wrongEmail);
  if (wrongUser) {
    console.log(`Deleting wrong user ${wrongEmail} (ID: ${wrongUser.id})...`);
    await supabase.auth.admin.deleteUser(wrongUser.id);
  }

  // 2. Delete correct user if exists (to re-seed)
  const correctUser = listData.users.find(u => u.email === correctEmail);
  if (correctUser) {
    console.log(`Deleting existing ${correctEmail} to re-seed...`);
    await supabase.auth.admin.deleteUser(correctUser.id);
  }

  // 3. Create Correct User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: correctEmail,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    console.error('Error creating correct auth user:', authError.message);
    return;
  }
  const userId = authData.user.id;
  console.log('Correct Auth user created:', userId);

  // 4. Create Profile (Trigger usually handles this, but upsert for safety)
  // Ensure research_group is set (e.g. Group A)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: correctEmail,
      full_name: fullName,
      role: 'user',
      research_group: 'A'
    });

  if (profileError) console.error('Error creating profile:', profileError.message);
  else console.log('Profile created/updated.');

  // 5. Create Child
  const childId = require('crypto').randomUUID();
  const { error: childError } = await supabase
    .from('children')
    .insert({
      id: childId,
      user_id: userId,
      nama_anak: 'Putra Risna',
      tanggal_lahir: '2022-05-11',
      jenis_kelamin: 'Laki-laki',
      umur_bulan: 24,
      berat_badan: 9.5,
      tinggi_badan: 81.0,
      lingkar_lengan: 13.0,
      lingkar_kepala: 46.0,
      alergi: 'None',
      mikrobiota: 'Kurang',
      has_mikrobiota_data: true
    });

  if (childError) console.error('Error creating child:', childError.message);
  else console.log('Child "Putra Risna" created:', childId);

  // 6. Create History
  await supabase.from('histori_perkembangan').insert([
    { child_id: childId, berat_badan: 8.0, tinggi_badan: 75.0, lingkar_lengan: 12.0, lingkar_kepala: 44.0, umur_bulan: 12 },
    { child_id: childId, berat_badan: 8.5, tinggi_badan: 78.0, lingkar_lengan: 12.5, lingkar_kepala: 45.0, umur_bulan: 18 },
    { child_id: childId, berat_badan: 9.5, tinggi_badan: 81.0, lingkar_lengan: 13.0, lingkar_kepala: 46.0, umur_bulan: 24 }
  ]);

  console.log('✅ Fix complete!');
  console.log(`Login Email: ${correctEmail}`);
  console.log(`Password: ${password}`);
}

fixUserEmail();
