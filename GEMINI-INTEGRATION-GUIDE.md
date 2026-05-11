# Panduan Integrasi Google Gemini AI

## Overview
Aplikasi NutriTrack telah diintegrasikan dengan Google Gemini AI untuk memberikan rekomendasi menu dan analisis grafik pertumbuhan anak yang lebih cerdas dan personal.

## Fitur AI yang Tersedia

### 1. Rekomendasi Menu Berdasarkan Data Anak
- **Endpoint**: `/api/generate-menu`
- **Fungsi**: Generate 5 menu rekomendasi berdasarkan data anak, status gizi, dan mikrobiota
- **Input**: Data anak, analisis hasil, grup penelitian
- **Output**: Array menu dengan estimasi kalori, protein, dan kategori nutrisi

### 2. Analisis Grafik Pertumbuhan (BARU!)
- **Endpoint**: `/api/chart-recommendation`
- **Fungsi**: Analisis trend pertumbuhan dari grafik dan berikan rekomendasi strategis
- **Input**: Data grafik historis, info anak, status pertumbuhan
- **Output**: Analisis kondisi, strategi nutrisi, menu rekomendasi, target pertumbuhan

### 3. Panduan Memasak
- **Endpoint**: `/api/cooking-guide`
- **Fungsi**: Panduan step-by-step memasak menu tertentu
- **Input**: Nama menu, umur anak
- **Output**: Langkah memasak, tips, variasi

## Konfigurasi API Key

### 1. Melalui Admin Settings
1. Login sebagai admin
2. Buka **Admin > Settings**
3. Di bagian "Konfigurasi Sistem & API", masukkan Google Gemini API Key
4. Klik **Test Koneksi** untuk memastikan API key valid
5. Klik **Test Grafik** untuk test fitur analisis grafik
6. Klik **Simpan Semua Pengaturan**

### 2. Melalui Environment Variables
```bash
# .env.local
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

## Cara Mendapatkan API Key Google Gemini

1. **Buka Google AI Studio**
   - Kunjungi: https://aistudio.google.com/
   - Login dengan akun Google

2. **Generate API Key**
   - Klik "Get API Key" di sidebar
   - Pilih "Create API Key in new project" atau pilih project existing
   - Copy API Key yang dihasilkan

3. **Aktifkan Gemini API**
   - Buka Google Cloud Console: https://console.cloud.google.com/
   - Pilih project yang sama
   - Buka "APIs & Services" > "Library"
   - Cari "Generative Language API" dan aktifkan

## Testing & Troubleshooting

### Test Koneksi Dasar
```bash
# Test via admin settings atau manual:
curl -X POST /api/admin/test-connection \
  -H "Content-Type: application/json" \
  -d '{"service": "gemini", "config": {"apiKey": "YOUR_API_KEY"}}'
```

### Test Rekomendasi Grafik
```bash
curl -X POST /api/chart-recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "test-123",
    "chartData": {
      "berat_badan": [8.5, 9.0, 9.2],
      "tinggi_badan": [70, 72, 73],
      "umur_bulan": [12, 13, 14],
      "dates": ["2024-01-01", "2024-02-01", "2024-03-01"]
    },
    "childInfo": {
      "nama_anak": "Test Child",
      "jenis_kelamin": "Laki-laki",
      "umur_bulan": 14
    },
    "currentStatus": {
      "bbStatus": "kurang",
      "tbStatus": "normal", 
      "trend": "naik"
    }
  }'
```

### Error Messages & Solutions

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `API_KEY_INVALID` | API Key salah format | Periksa API Key, pastikan dimulai dengan `AIzaSy` |
| `PERMISSION_DENIED` | API tidak aktif | Aktifkan Generative Language API di Google Cloud |
| `Quota exceeded` | Kuota habis | Periksa billing atau tunggu reset kuota |
| `Network error` | Koneksi internet | Periksa koneksi internet server |

## Monitoring & Logging

### AI Activity Log
Semua aktivitas AI dicatat di tabel `ai_activity_log`:
- Input data yang dikirim ke AI
- Response dari AI
- Waktu pemrosesan
- Status success/error

### Query Monitoring
```sql
-- Lihat aktivitas AI terbaru
SELECT * FROM ai_activity_log 
ORDER BY created_at DESC 
LIMIT 10;

-- Statistik penggunaan per hari
SELECT 
  DATE(created_at) as date,
  activity_type,
  COUNT(*) as total_requests,
  AVG(processing_time_ms) as avg_processing_time
FROM ai_activity_log 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), activity_type
ORDER BY date DESC;
```

## Best Practices

### 1. Caching
- Menu recommendations di-cache berdasarkan kondisi anak
- Cache expires setelah 24 jam
- Gunakan `forceRefresh: true` untuk bypass cache

### 2. Error Handling
- Semua API call memiliki retry mechanism (max 2 retries)
- Exponential backoff untuk rate limiting
- Graceful degradation jika AI tidak tersedia

### 3. Security
- API Key disimpan encrypted di database
- Tidak pernah expose API Key ke client-side
- Input validation untuk semua AI endpoints

## Pengembangan Selanjutnya

### Fitur yang Bisa Ditambahkan:
1. **Analisis Foto Makanan**: Upload foto makanan untuk estimasi nutrisi
2. **Chatbot Konsultasi**: Chat interaktif dengan AI untuk konsultasi gizi
3. **Prediksi Pertumbuhan**: Machine learning untuk prediksi pertumbuhan
4. **Rekomendasi Aktivitas**: Saran aktivitas fisik berdasarkan umur anak

### Optimisasi:
1. **Prompt Engineering**: Improve prompt untuk hasil yang lebih akurat
2. **Response Caching**: Cache response berdasarkan similarity
3. **Batch Processing**: Process multiple requests sekaligus
4. **Model Fine-tuning**: Custom model untuk domain stunting

## Support

Jika ada masalah dengan integrasi Gemini AI:
1. Periksa API Key di admin settings
2. Test koneksi menggunakan tombol "Test Koneksi"
3. Lihat log error di browser console atau server logs
4. Periksa tabel `ai_activity_log` untuk debugging

---

**Update Terakhir**: Januari 2025
**Versi**: 1.0.0
**Status**: Production Ready ✅