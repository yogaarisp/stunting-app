'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adminCreateUser(formData: {
  addName: string;
  addEmail: string;
  addPassword: string;
  addRole: 'admin' | 'user';
}) {
  try {
    // 1. Verify that the requester is actually an admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized: No user session' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { error: 'Unauthorized: Only admins can create users' };
    }

    // 2. Create the user using the Admin Client
    const adminClient = createAdminClient();
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: formData.addEmail,
      password: formData.addPassword,
      email_confirm: true, // This bypasses the email confirmation step!
      user_metadata: {
        full_name: formData.addName
      }
    });

    if (authError) {
      return { error: authError.message };
    }

    if (authData.user) {
      // 3. Update the profiles table
      // The trigger might have already created a row, so we use upsert or update
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: formData.addName,
          email: formData.addEmail,
          role: formData.addRole,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        return { error: 'Akun berhasil dibuat, namun gagal mengatur profil: ' + profileError.message };
      }
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Admin Create User Error:', err);
    return { error: 'Terjadi kesalahan sistem: ' + err.message };
  }
}
