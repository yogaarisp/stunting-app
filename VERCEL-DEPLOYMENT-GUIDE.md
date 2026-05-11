# Panduan Deploy ke Vercel - NutriTrack

## 🚀 Setup Environment Variables di Vercel

Untuk menjalankan fitur AI di production, Anda perlu mengkonfigurasi environment variables di Vercel Dashboard.

### 1. **Buka Vercel Dashboard**
1. Login ke [vercel.com](https://vercel.com)
2. Pilih project `nutritrack-smg` 
3. Klik tab **Settings**
4. Pilih **Environment Variables** di sidebar

### 2. **Tambahkan Environment Variables**

Tambahkan variable berikut satu per satu:

#### **Google Gemini AI**
- **Name**: `GOOGLE_GEMINI_API_KEY`
- **Value**: `YOUR_GEMINI_API_KEY_HERE`
- **Environment**: Production, Preview, Development (pilih semua)

#### **Supabase Configuration**
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `YOUR_SUPABASE_URL_HERE`
- **Environment**: Production, Preview, Development (pilih semua)

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `YOUR_SUPABASE_ANON_KEY_HERE`
- **Environment**: Production, Preview, Development (pilih semua)

- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE`
- **Environment**: Production, Preview, Development (pilih semua)

### 3. **Redeploy Aplikasi**

Setelah menambahkan environment variables:

1. Klik tab **Deployments**
2. Klik **Redeploy** pada deployment terbaru
3. Pilih **Use existing Build Cache** (unchecked)
4. Klik **Redeploy**

### 4. **Verifikasi Setup**

Setelah deployment selesai:

1. Buka `https://nutritrack-smg.vercel.app/admin/settings`
2. Login sebagai admin
3. Scroll ke "Konfigurasi Sistem & API"
4. Klik **Test Koneksi** - harus menampilkan "Koneksi Gemini AI Berhasil!"
5. Klik **Test Grafik** - harus menampilkan "Rekomendasi grafik berhasil!"

## 🔧 Troubleshooting

### Error: "supabaseKey is required"
**Penyebab**: Environment variable `SUPABASE_SERVICE_ROLE_KEY` belum dikonfigurasi di Vercel

**Solusi**:
1. Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah ditambahkan di Vercel Environment Variables
2. Redeploy aplikasi
3. Clear browser cache dan coba lagi

### Error: "API Key tidak valid"
**Penyebab**: Environment variable `GOOGLE_GEMINI_API_KEY` belum dikonfigurasi atau salah

**Solusi**:
1. Pastikan `GOOGLE_GEMINI_API_KEY` sudah ditambahkan dengan value yang benar
2. Redeploy aplikasi
3. Test koneksi via admin settings

### Error: "Quota exceeded"
**Penyebab**: API Key Gemini sudah mencapai quota limit

**Solusi**:
1. Tunggu quota reset (biasanya 24 jam)
2. Atau upgrade ke paid plan di Google Cloud Console
3. Monitor usage di [Google AI Studio](https://aistudio.google.com/)

## 📋 Checklist Deployment

- [ ] ✅ Environment variables sudah ditambahkan di Vercel
- [ ] ✅ Aplikasi sudah di-redeploy
- [ ] ✅ Test koneksi Gemini berhasil
- [ ] ✅ Test fitur generate menu berhasil
- [ ] ✅ Database migration sudah dijalankan
- [ ] ✅ Fitur chart recommendation berfungsi

## 🎯 Fitur yang Akan Berfungsi Setelah Setup

### 1. **Generate Menu AI** (`/rekomendasi`)
- Klik "Generate Menu Sekarang"
- AI akan menghasilkan 3-5 menu rekomendasi
- Berdasarkan analisis pertumbuhan anak
- Memperhitungkan alergi dan mikrobiota (grup A)

### 2. **Analisis Grafik Pertumbuhan** (API)
- Endpoint: `/api/chart-recommendation`
- Analisis trend pertumbuhan dari data historis
- Rekomendasi strategis berdasarkan grafik

### 3. **Panduan Memasak** (`/rekomendasi`)
- Klik "Cara Masak" pada menu yang dihasilkan AI
- AI akan memberikan resep step-by-step
- Disesuaikan dengan umur anak

## 🔐 Security Notes

- Environment variables di Vercel sudah encrypted
- Service Role Key hanya digunakan di server-side
- API Key Gemini tidak pernah exposed ke client
- Semua request AI di-log untuk monitoring

## 📞 Support

Jika masih ada masalah setelah mengikuti panduan ini:

1. **Check Vercel Function Logs**:
   - Buka Vercel Dashboard > Functions
   - Lihat error logs untuk detail masalah

2. **Check Browser Console**:
   - Buka Developer Tools (F12)
   - Lihat error di Console tab

3. **Test Manual**:
   - Buka `/admin/settings`
   - Test koneksi satu per satu

---

**Update**: Januari 2025  
**Status**: Ready for Production 🚀