import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { service, config } = await request.json();

    if (service === 'gemini') {
      const apiKey = config?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key tidak ditemukan');

      // Test with a very small prompt
      try {
        const result = await callGemini('Say "OK"', { apiKey, isJson: false });
        if (result.includes('OK')) {
          return NextResponse.json({ success: true, message: 'Koneksi Gemini API Berhasil!' });
        }
        throw new Error('Respon tidak sesuai: ' + result);
      } catch (err: any) {
        return NextResponse.json({ 
          success: false, 
          message: 'Gagal koneksi Gemini: ' + err.message 
        }, { status: 400 });
      }
    }

    if (service === 'supabase') {
      const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = config?.key || process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key) throw new Error('URL atau Key tidak ditemukan');

      const supabase = createClient(url, key);
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        message: 'Koneksi Supabase Berhasil! Terhubung ke database.' 
      });
    }

    return NextResponse.json({ error: 'Service tidak dikenali' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
