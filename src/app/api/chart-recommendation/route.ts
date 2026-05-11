import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJSON } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';

interface ChartRecommendationRequest {
  childId: string;
  chartData: {
    berat_badan: number[];
    tinggi_badan: number[];
    lingkar_kepala?: number[];
    umur_bulan: number[];
    dates: string[];
  };
  childInfo: {
    nama_anak: string;
    jenis_kelamin: string;
    umur_bulan: number;
    alergi?: string;
  };
  currentStatus: {
    bbStatus: string;
    tbStatus: string;
    lkStatus?: string;
    trend: 'naik' | 'turun' | 'stabil';
  };
}

function buildChartAnalysisPrompt(data: ChartRecommendationRequest): string {
  const { chartData, childInfo, currentStatus } = data;
  
  // Analisis trend dari data grafik
  const latestBB = chartData.berat_badan[chartData.berat_badan.length - 1];
  const latestTB = chartData.tinggi_badan[chartData.tinggi_badan.length - 1];
  const previousBB = chartData.berat_badan[chartData.berat_badan.length - 2] || latestBB;
  const previousTB = chartData.tinggi_badan[chartData.tinggi_badan.length - 2] || latestTB;
  
  const bbTrend = latestBB > previousBB ? 'meningkat' : latestBB < previousBB ? 'menurun' : 'stabil';
  const tbTrend = latestTB > previousTB ? 'meningkat' : latestTB < previousTB ? 'menurun' : 'stabil';

  let prompt = `Kamu adalah ahli gizi anak Indonesia yang berpengalaman dalam analisis grafik pertumbuhan. Berikan rekomendasi menu dan strategi nutrisi berdasarkan data grafik pertumbuhan berikut:

DATA ANAK:
- Nama: ${childInfo.nama_anak}
- Jenis kelamin: ${childInfo.jenis_kelamin}
- Umur saat ini: ${childInfo.umur_bulan} bulan (${Math.floor(childInfo.umur_bulan / 12)} tahun ${childInfo.umur_bulan % 12} bulan)`;

  if (childInfo.alergi) {
    prompt += `\n- ALERGI: ${childInfo.alergi} (WAJIB dihindari dalam semua rekomendasi)`;
  }

  prompt += `\n\nDATA GRAFIK PERTUMBUHAN (${chartData.berat_badan.length} titik data):
- Berat badan saat ini: ${latestBB} kg (trend: ${bbTrend})
- Tinggi badan saat ini: ${latestTB} cm (trend: ${tbTrend})
- Status BB menurut WHO: ${currentStatus.bbStatus}
- Status TB menurut WHO: ${currentStatus.tbStatus}`;

  if (chartData.lingkar_kepala && chartData.lingkar_kepala.length > 0) {
    const latestLK = chartData.lingkar_kepala[chartData.lingkar_kepala.length - 1];
    prompt += `\n- Lingkar kepala saat ini: ${latestLK} cm
- Status LK menurut WHO: ${currentStatus.lkStatus}`;
  }

  prompt += `\n- Trend pertumbuhan keseluruhan: ${currentStatus.trend}

RIWAYAT PERTUMBUHAN (3 bulan terakhir):`;
  
  // Ambil 3 data terakhir untuk analisis trend
  const recentData = Math.min(3, chartData.berat_badan.length);
  for (let i = chartData.berat_badan.length - recentData; i < chartData.berat_badan.length; i++) {
    const date = new Date(chartData.dates[i]).toLocaleDateString('id-ID');
    prompt += `\n- ${date}: BB ${chartData.berat_badan[i]} kg, TB ${chartData.tinggi_badan[i]} cm`;
  }

  prompt += `\n\nBerdasarkan analisis grafik pertumbuhan di atas, berikan rekomendasi yang mencakup:

1. ANALISIS KONDISI: Interpretasi pola pertumbuhan dari grafik
2. STRATEGI NUTRISI: Pendekatan nutrisi yang tepat berdasarkan trend
3. MENU REKOMENDASI: 5 menu spesifik yang sesuai kondisi anak
4. TARGET PERTUMBUHAN: Target realistis untuk 1-2 bulan ke depan
5. TANDA BAHAYA: Kapan harus konsultasi ke dokter

SYARAT REKOMENDASI:
- Semua menu HARUS aman dari alergi yang disebutkan
- Tekstur dan porsi sesuai umur ${childInfo.umur_bulan} bulan
- Fokus pada masalah utama berdasarkan grafik (BB kurang/TB pendek/dll)
- Berikan tips praktis untuk orang tua
- Sertakan estimasi kalori dan protein per menu

FORMAT OUTPUT (JSON):
{
  "analisis_kondisi": "Interpretasi pola pertumbuhan berdasarkan grafik (maksimal 2 kalimat)",
  "strategi_nutrisi": "Pendekatan nutrisi yang tepat (maksimal 2 kalimat)",
  "menu_rekomendasi": [
    {
      "nama_menu": "Nama menu",
      "deskripsi": "Deskripsi singkat",
      "bahan_utama": ["bahan1", "bahan2"],
      "kalori_estimasi": 250,
      "protein_estimasi": 12,
      "alasan_dipilih": "Alasan singkat"
    }
  ],
  "target_pertumbuhan": {
    "berat_badan_target": "Target BB",
    "tinggi_badan_target": "Target TB",
    "timeline": "1-2 bulan"
  },
  "tanda_bahaya": ["Tanda1", "Tanda2"],
  "tips_orang_tua": ["Tips1", "Tips2"]
}

PENTING: 
- Berikan HANYA JSON yang valid, tanpa penjelasan tambahan
- Pastikan semua field diisi dengan lengkap
- Jangan gunakan karakter khusus yang bisa merusak JSON
- Maksimal 3 menu rekomendasi untuk menghemat token`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChartRecommendationRequest = await request.json();
    
    // Validasi input
    if (!body.childId || !body.chartData || !body.childInfo) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Diperlukan childId, chartData, dan childInfo.' },
        { status: 400 }
      );
    }

    if (body.chartData.berat_badan.length === 0 || body.chartData.tinggi_badan.length === 0) {
      return NextResponse.json(
        { error: 'Data grafik kosong. Diperlukan minimal 1 data berat dan tinggi badan.' },
        { status: 400 }
      );
    }

    // Create admin client untuk logging
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate rekomendasi via Gemini
    const prompt = buildChartAnalysisPrompt(body);
    const rawResponse = await callGemini(prompt, { isJson: true });
    
    // Parse response
    let recommendation;
    try {
      recommendation = parseGeminiJSON(rawResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', rawResponse);
      throw new Error('Gagal memproses respons AI. Silakan coba lagi.');
    }

    // Log aktivitas untuk monitoring
    await supabase.from('ai_activity_log').insert({
      child_id: body.childId,
      activity_type: 'chart_recommendation',
      input_data: {
        chart_points: body.chartData.berat_badan.length,
        current_status: body.currentStatus,
        child_age: body.childInfo.umur_bulan
      },
      ai_response: recommendation,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      recommendation,
      metadata: {
        data_points: body.chartData.berat_badan.length,
        analysis_date: new Date().toISOString(),
        child_age_months: body.childInfo.umur_bulan
      }
    });

  } catch (error: any) {
    console.error('CRITICAL: Chart recommendation error:', error);
    
    // Handle specific Gemini errors
    if (error.message.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: 'Konfigurasi AI tidak valid. Hubungi administrator.' },
        { status: 500 }
      );
    }

    if (error.message.includes('quota') || error.message.includes('429')) {
      return NextResponse.json(
        { error: 'Layanan AI sedang sibuk. Silakan coba lagi dalam beberapa menit.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Gagal menganalisis grafik pertumbuhan. Silakan coba lagi.',
        message: error.message
      },
      { status: 500 }
    );
  }
}