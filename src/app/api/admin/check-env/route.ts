import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check all required environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 
          'NOT SET'
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 
          'NOT SET'
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
          process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 
          'NOT SET'
      },
      GOOGLE_GEMINI_API_KEY: {
        exists: !!process.env.GOOGLE_GEMINI_API_KEY,
        value: process.env.GOOGLE_GEMINI_API_KEY ? 
          process.env.GOOGLE_GEMINI_API_KEY.substring(0, 20) + '...' : 
          'NOT SET'
      }
    };

    // Count missing variables
    const missingVars = Object.entries(envCheck)
      .filter(([_, config]) => !config.exists)
      .map(([name, _]) => name);

    const allConfigured = missingVars.length === 0;

    return NextResponse.json({
      success: allConfigured,
      environment: process.env.NODE_ENV || 'unknown',
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      variables: envCheck,
      missing: missingVars,
      message: allConfigured 
        ? 'Semua environment variables sudah dikonfigurasi dengan benar!'
        : `${missingVars.length} environment variables belum dikonfigurasi: ${missingVars.join(', ')}`
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Gagal memeriksa environment variables',
      message: error.message
    }, { status: 500 });
  }
}