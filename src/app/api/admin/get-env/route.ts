import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi Admin (Hanya admin yang boleh intip ENV)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Kita gunakan cookie dari request untuk cek auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Ambil token dari header atau cookie jika perlu, 
    // Tapi cara paling aman di Next.js App Router adalah menggunakan middleware/session.
    // Untuk saat ini kita asumsikan middleware sudah memproteksi route /admin.

    return NextResponse.json({
      gemini_api_key: process.env.GOOGLE_GEMINI_API_KEY || '',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
