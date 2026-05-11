/**
 * Google Gemini API Helper
 * Komunikasi server-side dengan Gemini untuk generate menu & cooking guide
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY_MS = 4000;

export async function callGemini(prompt: string, options?: { apiKey?: string; isJson?: boolean }): Promise<string> {
  const apiKey = options?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
  
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

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            ...(options?.isJson ? { responseMimeType: 'application/json' } : {}),
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

      // Handle specific HTTP errors
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);

      if (response.status === 400) {
        if (errorText.includes('API_KEY_INVALID')) {
          throw new Error('API_KEY_INVALID: API Key tidak valid atau salah format');
        }
        throw new Error(`Bad Request: ${errorText}`);
      }

      if (response.status === 403) {
        if (errorText.includes('PERMISSION_DENIED')) {
          throw new Error('PERMISSION_DENIED: API Key tidak memiliki akses ke Gemini API');
        }
        throw new Error(`Forbidden: ${errorText}`);
      }

      // Handle rate limit (429) — retry
      if (response.status === 429 && attempt < MAX_RETRIES) {
        console.warn(`Gemini API rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`);
        lastError = new Error('Kuota API Gemini sedang penuh. Sistem sedang mencoba ulang...');
        continue;
      }

      if (response.status === 429) {
        throw new Error('Kuota API Gemini sudah habis untuk hari ini. Silakan coba lagi besok atau hubungi admin.');
      }
      
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);

    } catch (fetchError: any) {
      // Handle network errors
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Tidak dapat terhubung ke Gemini API. Periksa koneksi internet.');
      }
      
      // Re-throw our custom errors
      if (fetchError.message.includes('API_KEY_INVALID') || 
          fetchError.message.includes('PERMISSION_DENIED') ||
          fetchError.message.includes('Bad Request') ||
          fetchError.message.includes('Forbidden')) {
        throw fetchError;
      }

      lastError = fetchError;
      if (attempt === MAX_RETRIES) {
        throw fetchError;
      }
    }
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
