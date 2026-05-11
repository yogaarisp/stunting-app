require('dotenv').config({ path: '.env.local' });

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt, isJson = false) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
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

function parseGeminiJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  return JSON.parse(cleaned);
}

async function debugChartPrompt() {
  console.log('🔍 Debug Chart Recommendation Prompt...');
  
  const simplePrompt = `Buat JSON rekomendasi nutrisi anak 15 bulan:

{
  "analisis": "singkat",
  "menu": [{"nama": "Bubur", "kalori": 200}],
  "tips": ["tip1"]
}

Hanya JSON.`;

  try {
    console.log('📤 Sending simple prompt...');
    const response = await callGemini(simplePrompt, true);
    console.log('📥 Raw response:');
    console.log(response);
    console.log('\n🔧 Parsing JSON...');
    
    const parsed = parseGeminiJSON(response);
    console.log('✅ Parsed successfully:');
    console.log(JSON.stringify(parsed, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugChartPrompt();