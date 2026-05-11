# 🚨 URGENT FIX - Vercel Environment Variables

## ❌ **Masalah Saat Ini:**
- ✅ Gemini AI: **BERHASIL** (API Key sudah dikonfigurasi)
- ❌ Supabase: **GAGAL** (Environment variables belum dikonfigurasi)
- ❌ Generate Menu: **ERROR** "supabaseKey is required"

## 🔧 **Solusi Langkah demi Langkah:**

### **STEP 1: Buka Vercel Dashboard**
1. Buka browser → https://vercel.com/dashboard
2. Login dengan akun Anda
3. Cari dan klik project **"nutritrack-smg"**

### **STEP 2: Masuk ke Environment Variables**
1. Di halaman project, klik tab **"Settings"**
2. Di sidebar kiri, klik **"Environment Variables"**

### **STEP 3: Tambahkan Environment Variables yang Hilang**

Klik **"Add New"** dan tambahkan satu per satu:

#### **Variable 1:**
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `[GUNAKAN VALUE DARI .env.local ANDA]`
- **Environment**: ✅ Production ✅ Preview ✅ Development
- Klik **"Save"**

#### **Variable 2:**
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `[GUNAKAN VALUE DARI .env.local ANDA]`
- **Environment**: ✅ Production ✅ Preview ✅ Development
- Klik **"Save"**

#### **Variable 3: (YANG PALING PENTING)**
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `[GUNAKAN VALUE DARI .env.local ANDA]`
- **Environment**: ✅ Production ✅ Preview ✅ Development
- **Klik "Save"**

### **STEP 4: Redeploy Aplikasi**
1. Klik tab **"Deployments"**
2. Cari deployment paling atas (terbaru)
3. Klik **"⋯"** (titik tiga) di sebelah kanan
4. Pilih **"Redeploy"**
5. **PENTING**: Uncheck ❌ "Use existing Build Cache"
6. Klik **"Redeploy"**

### **STEP 5: Tunggu Deployment Selesai**
- Tunggu sampai status berubah menjadi **"Ready"** (biasanya 2-3 menit)
- Jangan tutup browser sampai selesai

## 🧪 **Verifikasi Setelah Deployment:**

### **Test 1: Cek Environment Variables**
Buka: https://nutritrack-smg.vercel.app/api/admin/check-env
**Expected**: `{"success": true, "message": "Semua environment variables sudah dikonfigurasi dengan benar!"}`

### **Test 2: Test Supabase Connection**
```bash
curl -X POST https://nutritrack-smg.vercel.app/api/admin/test-connection \
  -H "Content-Type: application/json" \
  -d '{"service": "supabase", "config": {}}'
```
**Expected**: `{"success": true, "message": "Koneksi Supabase Berhasil!"}`

### **Test 3: Login dan Test Generate Menu**
1. Login dengan akun: `risnawatiwati10181@gmail.com`
2. Buka: https://nutritrack-smg.vercel.app/rekomendasi
3. Klik **"Generate Menu Sekarang"**
4. **Expected**: Muncul 3-5 menu rekomendasi dari AI

## 📋 **Checklist:**
- [ ] ✅ Buka Vercel Dashboard
- [ ] ✅ Masuk ke Settings → Environment Variables
- [ ] ✅ Tambahkan `NEXT_PUBLIC_SUPABASE_URL`
- [ ] ✅ Tambahkan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] ✅ Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ⭐ **PALING PENTING**
- [ ] ✅ Redeploy aplikasi (uncheck build cache)
- [ ] ✅ Tunggu deployment selesai
- [ ] ✅ Test generate menu

## 🎯 **Setelah Fix:**
- ✅ Generate Menu AI akan berfungsi
- ✅ Muncul 3-5 rekomendasi menu personal
- ✅ Berdasarkan analisis pertumbuhan anak
- ✅ Memperhitungkan alergi
- ✅ Panduan memasak step-by-step

---

**⏰ Estimasi waktu**: 5-10 menit
**🚨 Priority**: URGENT - Fitur utama tidak berfungsi tanpa ini