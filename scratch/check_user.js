const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = 'isnawatiwati10181@gmail.com';
  console.log(`Checking user: ${email}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    // Try checking auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    const targetUser = authData?.users?.find(u => u.email === email);
    if (targetUser) {
        console.log('User found in auth but not in profiles:', targetUser.id);
    } else {
        console.log('User not found in auth either.');
    }
  } else {
    console.log('User profile found:', data);
  }
}

checkUser();
