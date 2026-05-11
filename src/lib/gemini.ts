/**
 * Google Gemini API Helper
 * Komunikasi server-side dengan Gemini untuk generate menu & cooking guide
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY_MS = 4000;

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 4s, 8s
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

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

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    }

    // Handle rate limit (429) — retry
    if (response.status === 429 && attempt < MAX_RETRIES) {
      console.warn(`Gemini API rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`);
      lastError = new Error('Kuota API Gemini sedang penuh. Sistem sedang mencoba ulang...');
      continue;
    }

    // Final failure
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);

    if (response.status === 429) {
      throw new Error('Kuota API Gemini sudah habis untuk hari ini. Silakan coba lagi besok atau hubungi admin.');
    }
    
    throw new Error(`Gemini API request failed: ${response.status}`);
  }

  throw lastError || new Error('Gemini API request failed after retries');
}

/**
 * Parse JSON dari respons Gemini (kadang ada markdown wrapping)
 */
export function parseGeminiJSON<T>(text: string): T {
  // Hapus markdown code block jika ada
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  return JSON.parse(cleaned);
}
