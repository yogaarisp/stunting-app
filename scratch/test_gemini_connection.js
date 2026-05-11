require('dotenv').config({ path: '.env.local' });

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt, isJson = false) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        ...(isJson ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }
  
  return text;
}

async function testGeminiConnection() {
  console.log('🧪 Testing Gemini AI Connection...');
  console.log('API Key:', process.env.GOOGLE_GEMINI_API_KEY ? 
    process.env.GOOGLE_GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
  
  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Basic Connection');
    const basicResponse = await callGemini('Katakan "BERHASIL" dalam bahasa Indonesia', false);
    console.log('✅ Response:', basicResponse);
    
    // Test 2: JSON response
    console.log('\n📊 Test 2: JSON Response');
    const jsonPrompt = `Berikan response dalam format JSON:
    {
      "status": "success",
      "message": "Koneksi Gemini berhasil",
      "timestamp": "${new Date().toISOString()}"
    }`;
    
    const jsonResponse = await callGemini(jsonPrompt, true);
    console.log('✅ JSON Response:', jsonResponse);
    
    // Test 3: Chart recommendation simulation
    console.log('\n📈 Test 3: Chart Recommendation Simulation');
    const chartPrompt = `Kamu adalah ahli gizi anak. Berikan rekomendasi singkat untuk anak:
    - Umur: 14 bulan
    - Berat: 9.2 kg (kurang dari standar)
    - Tinggi: 73 cm (normal)
    - Trend: naik
    
    Berikan dalam format JSON:
    {
      "analisis": "Analisis singkat kondisi anak",
      "rekomendasi": "Rekomendasi nutrisi utama"
    }`;
    
    const chartResponse = await callGemini(chartPrompt, true);
    console.log('✅ Chart Response:', chartResponse);
    
    console.log('\n🎉 Semua test berhasil! Gemini AI siap digunakan.');
    
  } catch (error) {
    console.error('\n❌ Test gagal:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('400')) {
      console.log('\n💡 Solusi: Periksa API Key Gemini di .env.local');
    } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('403')) {
      console.log('\n💡 Solusi: Aktifkan Generative Language API di Google Cloud Console');
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('\n💡 Solusi: Periksa kuota API atau billing Google Cloud');
    }
  }
}

testGeminiConnection();