import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

interface CookingRequest {
  menuName: string;
  deskripsi: string;
  bahan_utama: string[];
  childAge: number;
  allergies?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CookingRequest = await request.json();

    const prompt = `Kamu adalah chef sekaligus ahli gizi anak Indonesia yang berpengalaman dengan masakan rumahan sederhana dan terjangkau. Jelaskan cara memasak menu berikut untuk anak kecil.

MENU: ${body.menuName}
DESKRIPSI: ${body.deskripsi}
BAHAN UTAMA: ${body.bahan_utama.join(', ')}
UMUR ANAK: ${body.childAge} bulan
${body.allergies ? `ALERGI (HINDARI): ${body.allergies}` : ''}

Berikan resep dalam format JSON:
{
  "nama_menu": "${body.menuName}",
  "porsi": "1 porsi untuk anak ${body.childAge} bulan",
  "waktu_masak": "estimasi waktu",
  "bahan": [
    { "nama": "nama bahan", "jumlah": "takaran" }
  ],
  "langkah": [
    "Langkah 1: ...",
    "Langkah 2: ...",
    "Langkah 3: ..."
  ],
  "tips": [
    "Tips penyajian atau penyimpanan"
  ],
  "catatan_gizi": "Catatan singkat tentang manfaat gizi menu ini"
}

SYARAT MASAKAN RUMAHAN TERJANGKAU:
1. Langkah-langkah harus SINGKAT dan MUDAH dipahami ibu rumah tangga
2. Gunakan bahasa yang sederhana dan praktis
3. Maksimal 6 langkah memasak
4. Perhatikan tekstur makanan sesuai umur anak (${body.childAge} bulan)
5. Pastikan TIDAK menggunakan bahan alergen
6. WAJIB gunakan bahan-bahan murah dan mudah didapat di pasar tradisional
7. Hindari peralatan masak yang mahal atau rumit
8. Total biaya bahan maksimal 10-15 ribu rupiah
9. Fokus pada teknik memasak sederhana: rebus, kukus, tumis, goreng biasa
10. Berikan tips hemat dan praktis untuk ibu rumah tangga

CONTOH BAHAN TERJANGKAU:
- Protein: ayam kampung, telur, ikan air tawar, tahu, tempe
- Sayuran: bayam, kangkung, wortel, labu kuning, tomat
- Bumbu dasar: bawang merah/putih, garam, gula, minyak goreng

Berikan HANYA JSON, tanpa penjelasan tambahan`;

    const rawResponse = await callGemini(prompt, { isJson: true });
    
    // Parse response — handle markdown wrapping
    let guide;
    try {
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      guide = JSON.parse(cleaned);
    } catch {
      guide = { langkah: [rawResponse], tips: [], bahan: [] };
    }

    return NextResponse.json({ guide });

  } catch (error: any) {
    console.error('Cooking guide error:', error);
    return NextResponse.json(
      { error: 'Gagal mendapatkan panduan memasak.', details: error.message },
      { status: 500 }
    );
  }
}
