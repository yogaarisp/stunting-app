import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseGeminiJSON } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

interface MenuRequest {
  childData: {
    nama_anak: string;
    umur_bulan: number;
    jenis_kelamin: string;
    berat_badan: number;
    tinggi_badan: number;
    lingkar_kepala?: number;
    alergi?: string;
    has_mikrobiota_data: boolean;
    mikrobiota?: string;
  };
  researchGroup: string;
  analisisResult: {
    bbStatus: string;
    tbStatus: string;
    lkStatus: string;
    kategoriRekomendasi: string[];
    riskLevel: string;
    pesan: string;
  };
  childId: string;
  forceRefresh?: boolean;
}

interface MicrobiotaRule {
  nama_bakteri: string;
  makanan_disarankan: string | null;
  makanan_dihindari: string | null;
  penjelasan_medis: string | null;
}

function buildMenuPrompt(data: MenuRequest, microbiotaRules: MicrobiotaRule[] = []): string {
  const { childData, researchGroup, analisisResult } = data;

  const kebutuhanLabels: Record<string, string> = {
    tinggi_kalori: 'Tinggi Kalori (untuk menaikkan berat badan)',
    tinggi_protein: 'Tinggi Protein (untuk pertumbuhan)',
    tinggi_kalsium: 'Tinggi Kalsium (untuk tulang dan tinggi badan)',
    probiotik: 'Probiotik (untuk kesehatan pencernaan & mikrobiota)',
    nutrisi_otak: 'Nutrisi Otak (DHA, Omega-3, Zat Besi)',
    normal: 'Seimbang (pertahankan pola makan)',
  };

  const kebutuhan = analisisResult.kategoriRekomendasi
    .map(k => kebutuhanLabels[k] || k)
    .join(', ');

  let prompt = `Kamu adalah ahli gizi anak Indonesia yang berpengalaman. Buatkan 5 rekomendasi menu makanan berdasarkan data berikut:

DATA ANAK:
- Jenis kelamin: ${childData.jenis_kelamin || 'Tidak diketahui'}
- Umur: ${childData.umur_bulan} bulan (${Math.floor(childData.umur_bulan / 12)} tahun ${childData.umur_bulan % 12} bulan)
- Berat badan: ${childData.berat_badan} kg (Status: ${analisisResult.bbStatus === 'kurang' ? 'DI BAWAH standar WHO' : analisisResult.bbStatus === 'lebih' ? 'DI ATAS standar WHO' : 'Normal'})
- Tinggi badan: ${childData.tinggi_badan} cm (Status: ${analisisResult.tbStatus === 'kurang' ? 'DI BAWAH standar WHO' : analisisResult.tbStatus === 'lebih' ? 'DI ATAS standar WHO' : 'Normal'})`;

  if (childData.alergi) {
    prompt += `\n- ALERGI MAKANAN: ${childData.alergi} (WAJIB dihindari, jangan gunakan bahan ini sama sekali)`;
  }

  // Mikrobiota hanya untuk kelompok A
  if (researchGroup === 'A' && childData.has_mikrobiota_data && childData.mikrobiota) {
    prompt += `\n- Data Mikrobiota Usus: ${childData.mikrobiota}`;
    prompt += `\n- Berdasarkan data mikrobiota di atas, sesuaikan rekomendasi menu untuk mendukung keseimbangan mikrobiota usus anak.`;
  }

  // === KNOWLEDGE BASE: Aturan Referensi Mikrobiota dari Database ===
  if (researchGroup === 'A' && microbiotaRules.length > 0) {
    prompt += `\n\n=== KNOWLEDGE BASE MIKROBIOTA (dari Tim Riset) ===`;
    prompt += `\nGunakan aturan berikut sebagai acuan utama dalam menyusun menu. Cocokkan dengan data mikrobiota anak di atas:`;
    microbiotaRules.forEach((rule, idx) => {
      prompt += `\n\n[Aturan ${idx + 1}] ${rule.nama_bakteri}:`;
      if (rule.makanan_disarankan) prompt += `\n  ✅ Makanan disarankan: ${rule.makanan_disarankan}`;
      if (rule.makanan_dihindari) prompt += `\n  ❌ Makanan dihindari: ${rule.makanan_dihindari}`;
      if (rule.penjelasan_medis) prompt += `\n  📋 Penjelasan: ${rule.penjelasan_medis}`;
    });
    prompt += `\n\nPENTING: Prioritaskan makanan yang disarankan dan HINDARI makanan yang tercantum di daftar "dihindari" berdasarkan kondisi mikrobiota anak.`;
  }

  prompt += `\n\nKEBUTUHAN NUTRISI: ${kebutuhan}
TINGKAT RISIKO: ${analisisResult.riskLevel === 'tinggi' ? 'TINGGI - Perlu perhatian serius' : analisisResult.riskLevel === 'sedang' ? 'SEDANG' : 'RENDAH - Normal'}

SYARAT MENU:
1. Semua menu HARUS aman dari alergi yang disebutkan
2. Tekstur dan porsi HARUS sesuai untuk anak umur ${childData.umur_bulan} bulan
3. Gunakan bahan-bahan yang mudah ditemukan di Indonesia
4. Berikan variasi menu (jangan semua menu serupa)
5. Setiap menu harus praktis dan bisa dimasak di rumah

FORMAT OUTPUT (JSON array):
[
  {
    "nama_menu": "Nama menu dalam Bahasa Indonesia",
    "deskripsi": "Deskripsi singkat 1-2 kalimat",
    "bahan_utama": ["bahan1", "bahan2", "bahan3"],
    "nutrisi": "Nutrisi utama yang terkandung",
    "kalori_estimasi": 250,
    "protein_estimasi": 12,
    "kategori": "tinggi_kalori",
    "waktu_masak": "20 menit"
  }
]

Pastikan kategori sesuai salah satu dari: tinggi_kalori, tinggi_protein, tinggi_kalsium, probiotik, nutrisi_otak, normal.
Berikan HANYA JSON array, tanpa penjelasan tambahan.`;

  return prompt;
}

function generateConditionHash(data: MenuRequest): string {
  const key = JSON.stringify({
    umur: data.childData.umur_bulan,
    bb: data.childData.berat_badan,
    tb: data.childData.tinggi_badan,
    alergi: data.childData.alergi || '',
    mikrobiota: data.researchGroup === 'A' ? data.childData.mikrobiota || '' : '',
    group: data.researchGroup,
    kategori: data.analisisResult.kategoriRekomendasi.sort(),
  });
  return crypto.createHash('md5').update(key).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body: MenuRequest = await request.json();
    
    // Create admin client for cache operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const conditionHash = generateConditionHash(body);

    // Check cache (unless force refresh)
    if (!body.forceRefresh) {
      const { data: cached } = await supabase
        .from('ai_menu_cache')
        .select('menus')
        .eq('child_id', body.childId)
        .eq('condition_hash', conditionHash)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        return NextResponse.json({ menus: cached.menus, cached: true });
      }
    }

    // Fetch aturan mikrobiota dari database (Knowledge Base dinamis)
    let microbiotaRules: MicrobiotaRule[] = [];
    if (body.researchGroup === 'A') {
      const { data: rules } = await supabase
        .from('microbiota_references')
        .select('nama_bakteri, makanan_disarankan, makanan_dihindari, penjelasan_medis');
      microbiotaRules = rules || [];
    }

    // Generate via Gemini
    const prompt = buildMenuPrompt(body, microbiotaRules);
    const rawResponse = await callGemini(prompt);
    const menus = parseGeminiJSON<any[]>(rawResponse);

    // Save to cache
    await supabase.from('ai_menu_cache').insert({
      child_id: body.childId,
      research_group: body.researchGroup,
      condition_hash: conditionHash,
      menus: menus,
    });

    return NextResponse.json({ menus, cached: false });

  } catch (error: any) {
    console.error('CRITICAL: Generate menu error:', error);
    return NextResponse.json(
      { 
        error: 'Gagal generate menu. Silakan coba lagi.', 
        message: error.message,
        details: error.stack || 'No stack trace'
      },
      { status: 500 }
    );
  }
}
