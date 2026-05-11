const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

function parseGeminiJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

async function testGenerate() {
  const childId = 'e83c939a-52bd-4a97-9afa-4c955ba180a2';
  
  const { data: child } = await supabase.from('children').select('*').eq('id', childId).single();
  const { data: rules } = await supabase.from('microbiota_references').select('*');

  console.log('Testing generation for:', child.nama_anak);

  const prompt = `Kamu adalah ahli gizi. Buatkan 3 menu untuk anak stunting:
  - Umur: ${child.umur_bulan} bulan
  - BB: ${child.berat_badan} kg
  - Mikrobiota: ${child.mikrobiota}
  
  Referensi: ${JSON.stringify(rules)}
  
  Output JSON array: [{"nama_menu": "...", "deskripsi": "..."}]`;

  try {
    const raw = await callGemini(prompt);
    const menus = parseGeminiJSON(raw);
    console.log('--- REKOMENDASI MENU ---');
    console.table(menus);

    // Save to cache for the user to see when they log in
    await supabase.from('ai_menu_cache').insert({
      child_id: childId,
      research_group: 'A',
      condition_hash: 'manual-qa-' + Date.now(),
      menus: menus
    });
    console.log('Berhasil disimpan ke cache!');
  } catch (e) {
    console.error(e.message);
  }
}

testGenerate();
