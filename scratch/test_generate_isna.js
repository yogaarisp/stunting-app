const { callGemini, parseGeminiJSON } = require('../src/lib/gemini');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGenerate() {
  const childId = 'e83c939a-52bd-4a97-9afa-4c955ba180a2';
  
  // 1. Fetch child data
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (childError) {
    console.error('Error fetching child:', childError.message);
    return;
  }

  console.log('Child data loaded:', child.nama_anak);

  // 2. Prepare mock analysis result (normally done in frontend)
  const analysisResult = {
    bbStatus: 'kurang',
    tbStatus: 'kurang',
    lkStatus: 'normal',
    kategoriRekomendasi: ['tinggi_kalori', 'probiotik', 'nutrisi_otak'],
    riskLevel: 'sedang',
    pesan: 'Anak menunjukkan indikasi stunting pada berat dan tinggi badan.'
  };

  const menuRequest = {
    childData: {
      nama_anak: child.nama_anak,
      umur_bulan: child.umur_bulan,
      jenis_kelamin: child.jenis_kelamin,
      berat_badan: child.berat_badan,
      tinggi_badan: child.tinggi_badan,
      lingkar_kepala: child.lingkar_kepala,
      alergi: child.alergi,
      has_mikrobiota_data: !!child.mikrobiota,
      mikrobiota: child.mikrobiota
    },
    researchGroup: 'A',
    analisisResult: analysisResult,
    childId: childId
  };

  // 3. Fetch microbiota rules
  const { data: rules } = await supabase
    .from('microbiota_references')
    .select('nama_bakteri, makanan_disarankan, makanan_dihindari, penjelasan_medis');

  // 4. Build prompt (copied logic from route.ts)
  function buildPrompt(data, microbiotaRules) {
      const { childData, researchGroup, analisisResult } = data;
      const kebutuhanLabels = {
        tinggi_kalori: 'Tinggi Kalori (untuk menaikkan berat badan)',
        tinggi_protein: 'Tinggi Protein (untuk pertumbuhan)',
        tinggi_kalsium: 'Tinggi Kalsium (untuk tulang dan tinggi badan)',
        probiotik: 'Probiotik (untuk kesehatan pencernaan & mikrobiota)',
        nutrisi_otak: 'Nutrisi Otak (DHA, Omega-3, Zat Besi)',
        normal: 'Seimbang (pertahankan pola makan)',
      };
      const kebutuhan = analisisResult.kategoriRekomendasi.map(k => kebutuhanLabels[k] || k).join(', ');
      
      let prompt = `Kamu adalah ahli gizi anak Indonesia yang berpengalaman. Buatkan 5 rekomendasi menu makanan berdasarkan data berikut:\n\nDATA ANAK:\n- Nama: ${childData.nama_anak}\n- Umur: ${childData.umur_bulan} bulan\n- BB: ${childData.berat_badan} kg (Kurang)\n- TB: ${childData.tinggi_badan} cm (Kurang)\n- Mikrobiota: ${childData.mikrobiota}`;
      
      if (microbiotaRules.length > 0) {
        prompt += `\n\n=== KNOWLEDGE BASE MIKROBIOTA ===`;
        microbiotaRules.forEach((rule, idx) => {
          prompt += `\n[${rule.nama_bakteri}] disarankan: ${rule.makanan_disarankan}`;
        });
      }
      
      prompt += `\n\nFORMAT OUTPUT (JSON array): [{"nama_menu": "...", "deskripsi": "...", "nutrisi": "..."}]`;
      return prompt;
  }

  const prompt = buildPrompt(menuRequest, rules || []);
  console.log('Sending prompt to Gemini...');

  try {
    const rawResponse = await callGemini(prompt);
    const menus = parseGeminiJSON(rawResponse);
    console.log('Gemini Response (Menus):', JSON.stringify(menus, null, 2));

    // 5. Save to cache
    const { error: cacheError } = await supabase.from('ai_menu_cache').insert({
      child_id: childId,
      research_group: 'A',
      condition_hash: 'test-hash-' + Date.now(),
      menus: menus
    });

    if (cacheError) console.error('Cache error:', cacheError.message);
    else console.log('Successfully saved to cache!');

  } catch (e) {
    console.error('Gemini call failed:', e.message);
  }
}

testGenerate();
