import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { service, config } = await request.json();

    if (service === 'gemini') {
      const apiKey = config?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ 
          success: false, 
          message: 'API Key Gemini tidak ditemukan. Pastikan API Key sudah diisi.' 
        }, { status: 400 });
      }

      // Test with a very small prompt
      try {
        const result = await callGemini('Katakan "BERHASIL" dalam bahasa Indonesia', { apiKey, isJson: false });
        if (result.toLowerCase().includes('berhasil') || result.toLowerCase().includes('ok')) {
          return NextResponse.json({ 
            success: true, 
            message: 'Koneksi Gemini AI Berhasil! API Key valid dan siap digunakan.' 
          });
        }
        return NextResponse.json({ 
          success: false, 
          message: 'Koneksi berhasil tapi respon tidak sesuai: ' + result.substring(0, 100) 
        }, { status: 400 });
      } catch (err: any) {
        console.error('Gemini test error:', err);
        
        // Handle specific error cases
        if (err.message.includes('API_KEY_INVALID') || err.message.includes('403')) {
          return NextResponse.json({ 
            success: false, 
            message: 'API Key Gemini tidak valid. Periksa kembali API Key Anda.' 
          }, { status: 400 });
        }
        
        if (err.message.includes('429') || err.message.includes('quota')) {
          return NextResponse.json({ 
            success: false, 
            message: 'Kuota API Gemini habis. Coba lagi nanti atau periksa billing Google Cloud.' 
          }, { status: 400 });
        }

        if (err.message.includes('PERMISSION_DENIED')) {
          return NextResponse.json({ 
            success: false, 
            message: 'API Key tidak memiliki permission untuk Gemini API. Aktifkan Gemini API di Google Cloud Console.' 
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          success: false, 
          message: 'Gagal koneksi Gemini: ' + err.message 
        }, { status: 400 });
      }
    }

    if (service === 'supabase') {
      const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = config?.key || process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key) {
        return NextResponse.json({ 
          success: false, 
          message: 'URL atau Service Role Key Supabase tidak ditemukan.' 
        }, { status: 400 });
      }

      try {
        const supabase = createClient(url, key);
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (error) throw error;
        return NextResponse.json({ 
          success: true, 
          message: 'Koneksi Supabase Berhasil! Terhubung ke database.' 
        });
      } catch (err: any) {
        return NextResponse.json({ 
          success: false, 
          message: 'Gagal koneksi Supabase: ' + err.message 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Service tidak dikenali. Gunakan "gemini" atau "supabase".' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan sistem: ' + error.message 
    }, { status: 500 });
  }
}
