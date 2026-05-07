# Rencana Pengembangan: Sistem Referensi Mikrobiota Dinamis

Dokumen ini menjelaskan rencana untuk membangun sistem manajemen pengetahuan (Knowledge Management System) terkait hubungan mikrobiota dan nutrisi yang dapat dikelola langsung oleh Admin.

## 1. Tujuan
Memungkinkan tim riset untuk memperbarui aturan hubungan mikrobiota dan makanan melalui Dashboard Admin tanpa perlu mengubah kode program. Data ini akan menjadi acuan utama bagi AI dalam memberikan rekomendasi menu.

## 2. Skema Database (Supabase)
Kita akan membuat tabel baru bernama `microbiota_references`:

```sql
CREATE TABLE public.microbiota_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kondisi_mikrobiota TEXT NOT NULL, -- Contoh: "Lactobacillus Rendah"
    makanan_disarankan TEXT,         -- Contoh: "Tempe, Yogurt, Pisang"
    makanan_dihindari TEXT,           -- Contoh: "Gula pasir, Tepung terigu"
    catatan_medis TEXT,               -- Penjelasan ilmiah singkat
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 3. Manajemen Admin (UI/UX)
Kita akan menambahkan halaman baru di `/admin/microbiota`:
- **Fitur List:** Tabel yang menampilkan semua aturan yang sudah diinput.
- **Fitur Search:** Memudahkan pencarian berdasarkan nama bakteri/kondisi.
- **Fitur CRUD:** Modal untuk menambah, mengedit, atau menghapus aturan referensi.

## 4. Integrasi dengan AI (Gemini)
Saat sistem men-generate menu (`/api/generate-menu`), alur logikanya akan berubah menjadi:
1. **Fetch Rules:** Sistem mengambil semua data dari tabel `microbiota_references`.
2. **Inject to Prompt:** Data tersebut disusun menjadi format teks (Markdown) dan dimasukkan ke dalam instruksi AI sebagai "Knowledge Base".
3. **Reasoning:** AI akan membandingkan data mikrobiota anak dengan tabel referensi tersebut untuk menyusun menu yang paling tepat.

## 5. Keuntungan
- **Fleksibilitas:** Tim riset bisa melakukan iterasi data kapan saja.
- **Akurasi:** Rekomendasi AI selalu berbasis pada data riset terbaru yang diinput admin.
- **Scalability:** Sistem bisa menampung ratusan aturan mikrobiota tanpa memperlambat performa aplikasi.

---
*Dibuat oleh Antigravity AI - NutriTrack Project*
