# NutriTrack — Aplikasi Pelacakan & Analisa Stunting Anak

## 1. Latar Belakang

Stunting adalah kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis, terutama pada 1.000 Hari Pertama Kehidupan (HPK). Indonesia merupakan salah satu negara dengan prevalensi stunting yang tinggi. Menurut data WHO, anak dikatakan stunting jika tinggi badan menurut umur (TB/U) berada di bawah -2 standar deviasi dari median standar pertumbuhan WHO.

NutriTrack hadir sebagai solusi digital berbasis web untuk membantu orang tua dan tenaga kesehatan memantau pertumbuhan anak secara real-time, mendeteksi dini potensi stunting, dan memberikan rekomendasi nutrisi yang tepat sasaran.

## 2. Tujuan Aplikasi

1. **Pemantauan Pertumbuhan Anak** — Mencatat dan melacak berat badan (BB), tinggi badan (TB), lingkar kepala (LK), dan lingkar lengan atas (LILA) anak secara berkala.
2. **Deteksi Dini Stunting** — Membandingkan data anak dengan standar pertumbuhan WHO yang dipisahkan berdasarkan jenis kelamin (laki-laki dan perempuan).
3. **Rekomendasi Menu Gizi Otomatis** — Memberikan rekomendasi makanan yang spesifik sesuai kebutuhan nutrisi anak berdasarkan hasil analisis.
4. **Edukasi Orang Tua** — Menyediakan artikel dan video edukasi tentang stunting dan nutrisi anak.
5. **Dashboard Admin** — Memberikan ringkasan statistik distribusi status pertumbuhan seluruh anak yang terdaftar.

## 3. Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 16 + React 19 | Framework web modern dengan App Router |
| Bahasa | TypeScript | Type-safe JavaScript |
| Styling | Tailwind CSS 4 + CSS Custom | Glassmorphism design, responsive |
| Database | Supabase (PostgreSQL) | Backend-as-a-Service dengan Auth & RLS |
| Autentikasi | Supabase Auth | Email/password login dengan role management |
| Grafik | Recharts | Area chart, Pie chart untuk visualisasi data |
| Icons | Lucide React | Icon library modern |
| Deployment | Node.js Server / VPS | Bisa di-deploy ke Vercel atau VPS |

## 4. Arsitektur Sistem

### 4.1 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────┐
│                   BROWSER (Client)               │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Dashboard │  │  Input   │  │  Rekomendasi │   │
│  │   Page    │  │  Page    │  │     Page     │   │
│  └─────┬────┘  └─────┬────┘  └──────┬───────┘   │
│        │             │              │             │
│  ┌─────┴─────────────┴──────────────┴──────┐     │
│  │         Analysis Engine                  │     │
│  │   (recommendations.ts)                   │     │
│  │   - Standar WHO Laki-laki               │     │
│  │   - Standar WHO Perempuan               │     │
│  │   - Logika Badge & Risiko               │     │
│  └─────────────────┬───────────────────────┘     │
│                    │                              │
└────────────────────┼──────────────────────────────┘
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────┐
│              SUPABASE (Backend)                  │
│                                                   │
│  ┌────────────┐  ┌──────────────────────────┐    │
│  │   Auth     │  │      PostgreSQL DB        │    │
│  │  System    │  │                            │    │
│  │            │  │  profiles                  │    │
│  │  - Login   │  │  children                  │    │
│  │  - Signup  │  │  histori_perkembangan      │    │
│  │  - Roles   │  │  menus                     │    │
│  │            │  │  edukasi                    │    │
│  └────────────┘  │  settings                  │    │
│                  │                            │    │
│                  │  + Row Level Security (RLS) │    │
│                  └──────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 4.2 Struktur Database

Aplikasi menggunakan 6 tabel utama:

**Tabel `profiles`** — Data akun pengguna (orang tua atau admin)
- id, email, full_name, phone, address, role (user/admin)

**Tabel `children`** — Data identitas dan fisik anak
- nama_anak, tanggal_lahir, jenis_kelamin
- umur_bulan, berat_badan, tinggi_badan
- lingkar_lengan, lingkar_kepala
- alergi, mikrobiota

**Tabel `histori_perkembangan`** — Catatan pengukuran bulanan
- berat_badan, tinggi_badan, lingkar_lengan, lingkar_kepala, umur_bulan per tanggal

**Tabel `menus`** — Daftar rekomendasi makanan bergizi
- nama_menu, deskripsi, nutrisi, kalori, protein, kalsium
- kategori: tinggi_kalori, tinggi_protein, tinggi_kalsium, probiotik, nutrisi_otak, normal

**Tabel `edukasi`** — Artikel dan video tentang stunting

**Tabel `settings`** — Konfigurasi branding aplikasi

### 4.3 Keamanan Data (Row Level Security)

Setiap tabel dilindungi oleh Row Level Security (RLS):
- **User biasa** hanya bisa mengakses data anak miliknya sendiri.
- **Admin** bisa mengakses seluruh data untuk keperluan monitoring.
- **Menu dan Edukasi** bisa dibaca oleh semua user, tapi hanya admin yang bisa mengelola.

## 5. Fitur Utama

### 5.1 Dashboard Pengguna (Orang Tua)

Dashboard menampilkan ringkasan kondisi anak secara real-time:

- **Kartu Statistik** — Berat Badan, Tinggi Badan, Lingkar Kepala, dan Umur anak dengan perbandingan terhadap standar WHO.
- **Alert Risiko** — Indikator visual yang menunjukkan level risiko stunting (Rendah, Sedang, atau Tinggi).
- **Sistem Badge** — Badge khusus yang muncul berdasarkan kondisi anak:
  - 🔥 **"Butuh Kalori Tambahan"** — Muncul jika Berat Badan anak kurang dari 85% standar WHO.
  - 🧠 **"Fokus Nutrisi Otak"** — Muncul jika Lingkar Kepala anak kurang dari 95% standar WHO.
- **Riwayat Pengukuran** — Tabel 5 pengukuran terakhir.
- **Tombol Download Ringkasan** — Mencetak dashboard sebagai laporan PDF yang rapi melalui fungsi print browser.

### 5.2 Input Data Anak

- Form input lengkap: nama, tanggal lahir, jenis kelamin, BB, TB, LILA, LK, alergi, mikrobiota.
- **Kalkulasi umur otomatis** dari tanggal lahir.
- Mode update rutin: saat data sudah ada, identitas dikunci dan hanya data fisik yang bisa diperbarui.
- Setiap update otomatis menyimpan catatan ke histori perkembangan.

### 5.3 Grafik Pertumbuhan

- **Area Chart** interaktif menampilkan tren BB dan TB dari waktu ke waktu.
- Filter tampilan: Semua, hanya BB, atau hanya TB.
- **Kartu ringkasan** perubahan BB dan TB dari pengukuran pertama ke terakhir.
- Manajemen riwayat: edit dan hapus data pengukuran langsung dari halaman grafik.

### 5.4 Rekomendasi Menu (Fitur Inti Analisa Stunting)

Ini adalah fitur utama yang membedakan NutriTrack dari aplikasi pencatatan biasa. Alur kerjanya:

**Langkah 1: Pengambilan Data**
Sistem mengambil data fisik anak (BB, TB, LK) beserta umur dan jenis kelamin dari database.

**Langkah 2: Perbandingan dengan Standar WHO**
Data anak dibandingkan dengan tabel standar pertumbuhan WHO yang telah diintegrasikan ke dalam kode. Standar ini:
- Dipisahkan per jenis kelamin (Laki-laki dan Perempuan).
- Mencakup umur 0 sampai 60 bulan.
- Memiliki data median untuk BB, TB, dan Lingkar Kepala.
- Menggunakan interpolasi linear untuk umur yang tidak ada di tabel.

**Langkah 3: Perhitungan Persentase**
```
Persentase BB = (BB Anak ÷ BB Standar WHO) × 100%
Persentase TB = (TB Anak ÷ TB Standar WHO) × 100%
Persentase LK = (LK Anak ÷ LK Standar WHO) × 100%
```

**Langkah 4: Penentuan Status**

| Pengukuran | Threshold Kurang | Threshold Normal | Threshold Lebih |
|---|---|---|---|
| Berat Badan | < 85% | 85% — 115% | > 115% |
| Tinggi Badan | < 90% | 90% — 110% | > 110% |
| Lingkar Kepala | < 95% | 95% — 105% | > 105% |

**Langkah 5: Penentuan Badge dan Kategori Menu**

| Kondisi | Badge | Kategori Menu |
|---|---|---|
| BB < 85% standar | 🔥 Butuh Kalori Tambahan | `tinggi_kalori` |
| TB < 90% standar | (tidak ada badge khusus) | `tinggi_protein` + `tinggi_kalsium` |
| LK < 95% standar | 🧠 Fokus Nutrisi Otak | `nutrisi_otak` |
| Mikrobiota = "Kurang" | - | `probiotik` |
| Semua normal | - | `normal` |

**Langkah 6: Filter Menu**
Sistem mengambil menu dari database yang kategori-nya cocok dengan hasil analisis. Hanya menu yang relevan dengan kebutuhan spesifik anak yang ditampilkan.

**Langkah 7: Penentuan Level Risiko**

| Kondisi | Level Risiko |
|---|---|
| BB dan TB sama-sama kurang | 🔴 TINGGI |
| BB atau TB atau LK kurang (salah satu) | 🟡 SEDANG |
| Semua normal | 🟢 RENDAH |

### 5.5 Halaman Edukasi

- Menampilkan artikel dan video edukasi tentang stunting.
- Konten dikelola oleh admin melalui dashboard admin.

### 5.6 Dashboard Admin (Super Admin)

Admin memiliki akses ke seluruh data dengan fitur:

- **Statistik Umum** — Total pengguna, anak terdaftar, menu gizi, dan artikel edukasi.
- **Ringkasan Statistik Stunting** — Analitik distribusi status pertumbuhan:
  - Berapa persen anak yang masuk kategori Normal.
  - Berapa persen yang Butuh Perhatian (BB atau TB rendah).
  - Berapa persen yang Risiko Tinggi (BB dan TB rendah).
  - Divisualisasikan dengan Donut Chart (Pie Chart) dan kartu persentase.
- **Kelola Data Anak** — Melihat seluruh data anak dengan status risiko masing-masing.
- **Kelola Menu Makanan** — CRUD (Create, Read, Update, Delete) menu rekomendasi dengan kategori.
- **Kelola Materi Edukasi** — CRUD artikel dan video edukasi.
- **Pengaturan** — Branding aplikasi, manajemen role user.

### 5.7 Export Laporan (Download Ringkasan)

- Tombol "Download Ringkasan" di dashboard user.
- Menggunakan CSS Print-Friendly yang dirancang khusus:
  - Sidebar dan navigasi disembunyikan.
  - Konten diformat untuk kertas A4.
  - Badge dan warna dipertahankan dalam cetakan.
  - Header dan footer laporan ditambahkan otomatis.
  - Disclaimer medis dicantumkan di footer.
- User bisa menyimpan sebagai file PDF langsung dari dialog print browser.

## 6. Data Standar WHO yang Digunakan

Aplikasi mengintegrasikan data standar pertumbuhan WHO (simplified median) langsung di dalam kode. Data mencakup umur 0 hingga 60 bulan.

### 6.1 Contoh Data Standar Laki-laki (Umur 6—24 Bulan)

| Umur (Bulan) | BB Median (kg) | TB Median (cm) | LK Median (cm) |
|---|---|---|---|
| 6 | 7.9 | 67.6 | 43.3 |
| 9 | 8.9 | 72.0 | 45.0 |
| 12 | 9.6 | 75.7 | 46.1 |
| 15 | 10.2 | 79.1 | 46.8 |
| 18 | 10.9 | 82.3 | 47.3 |
| 21 | 11.5 | 85.1 | 47.7 |
| 24 | 12.2 | 87.8 | 48.0 |

### 6.2 Contoh Data Standar Perempuan (Umur 6—24 Bulan)

| Umur (Bulan) | BB Median (kg) | TB Median (cm) | LK Median (cm) |
|---|---|---|---|
| 6 | 7.3 | 65.7 | 42.2 |
| 9 | 8.2 | 70.1 | 43.8 |
| 12 | 8.9 | 74.0 | 44.9 |
| 15 | 9.6 | 77.5 | 45.6 |
| 18 | 10.2 | 80.7 | 46.2 |
| 21 | 10.9 | 83.7 | 46.5 |
| 24 | 11.5 | 86.4 | 46.8 |

## 7. Studi Kasus: Ahmad Fajar Santoso

Untuk mendemonstrasikan kemampuan analisa aplikasi, berikut contoh kasus nyata:

**Profil Anak:**
- Nama: Ahmad Fajar Santoso
- Orang Tua: Budi Santoso
- Jenis Kelamin: Laki-laki
- Umur: 18 bulan
- Alergi: Susu Sapi
- Kondisi Mikrobiota: Kurang

**Data Pengukuran Terakhir:**

| Pengukuran | Nilai Anak | Standar WHO (L, 18bln) | Persentase | Status |
|---|---|---|---|---|
| Berat Badan | 8.5 kg | 10.9 kg | 78% | 🔴 KURANG |
| Tinggi Badan | 73.0 cm | 82.3 cm | 88.7% | 🔴 KURANG |
| Lingkar Kepala | 44.0 cm | 47.3 cm | 93% | 🔴 KURANG |

**Hasil Analisis Sistem:**
- Level Risiko: **TINGGI** (BB dan TB sama-sama di bawah standar)
- Badge Aktif:
  - 🔥 **Butuh Kalori Tambahan** (BB 78% < threshold 85%)
  - 🧠 **Fokus Nutrisi Otak** (LK 93% < threshold 95%)
- Kategori Menu yang Direkomendasikan:
  - `tinggi_kalori` — Makanan padat energi
  - `tinggi_protein` — Makanan kaya protein untuk pertumbuhan
  - `tinggi_kalsium` — Makanan kaya kalsium untuk tulang
  - `nutrisi_otak` — Makanan kaya DHA, Omega-3, Zat Besi
  - `probiotik` — Makanan fermentasi untuk mikrobiota usus

**Histori Pertumbuhan (6 Bulan Terakhir):**

| Umur | BB (kg) | TB (cm) | LK (cm) | Catatan |
|---|---|---|---|---|
| 6 bulan | 6.8 | 63.0 | 41.5 | Awal MPASI |
| 9 bulan | 7.2 | 66.0 | 42.0 | Pertumbuhan lambat |
| 12 bulan | 7.8 | 69.0 | 42.8 | Di bawah standar |
| 14 bulan | 8.0 | 70.5 | 43.2 | Masih di bawah |
| 16 bulan | 8.2 | 71.5 | 43.5 | Stagnan |
| 18 bulan | 8.5 | 73.0 | 44.0 | Risiko tinggi |

Dari data histori terlihat bahwa pertumbuhan Ahmad **konsisten di bawah standar WHO** dan grafiknya menunjukkan **tren pertumbuhan yang lebih lambat** dari yang seharusnya. Ini merupakan indikasi kuat stunting yang memerlukan intervensi nutrisi segera.

## 8. Kategori Menu Makanan

Aplikasi mengelompokkan menu makanan ke dalam 6 kategori berdasarkan kebutuhan nutrisi:

| Kategori | Deskripsi | Kapan Direkomendasikan | Contoh Menu |
|---|---|---|---|
| **tinggi_kalori** | Makanan padat energi | BB di bawah 85% standar | Bubur Ayam Sayur (250 kkal) |
| **tinggi_protein** | Makanan kaya protein | TB di bawah 90% standar | Nasi Tim Ikan Salmon (18g protein) |
| **tinggi_kalsium** | Makanan kaya kalsium | TB di bawah 90% standar | Puree Kentang Keju (150mg kalsium) |
| **probiotik** | Makanan fermentasi | Mikrobiota usus kurang | Smoothie Pisang Yogurt |
| **nutrisi_otak** | Makanan kaya DHA & Zat Besi | LK di bawah 95% standar | Puree Ikan Tongkol + Bayam |
| **normal** | Makanan seimbang | Semua indikator normal | Menu gizi seimbang umum |

## 9. Keunggulan Aplikasi

1. **Analisis Berbasis Standar WHO** — Bukan sekadar pencatatan, tetapi perbandingan real-time dengan standar internasional yang diakui secara global.
2. **Gender-Specific** — Data standar dipisahkan antara laki-laki dan perempuan karena pola pertumbuhan keduanya berbeda.
3. **Sistem Badge Otomatis** — Memberikan peringatan visual yang jelas dan actionable kepada orang tua.
4. **Rekomendasi Menu Targeted** — Menu yang ditampilkan 100% relevan dengan kebutuhan spesifik anak, bukan generik.
5. **Histori & Grafik** — Memungkinkan pemantauan tren pertumbuhan jangka panjang.
6. **Dashboard Admin dengan Analytics** — Tenaga kesehatan bisa melihat distribusi status stunting seluruh anak dalam satu tampilan.
7. **Export Laporan** — Data bisa dicetak atau di-download sebagai PDF untuk keperluan konsultasi medis.
8. **Keamanan Data** — Row Level Security memastikan data anak hanya bisa diakses oleh orang tuanya.

## 10. Alur Penggunaan Aplikasi

### 10.1 Untuk Orang Tua

1. **Registrasi** — Buat akun dengan email dan password.
2. **Input Data Anak** — Isi data identitas dan fisik anak pertama kali.
3. **Lihat Dashboard** — Cek status risiko, badge peringatan, dan perbandingan dengan standar WHO.
4. **Lihat Rekomendasi** — Dapatkan daftar menu makanan yang sesuai kebutuhan anak.
5. **Update Berkala** — Setiap bulan, update data fisik anak untuk memantau perkembangan.
6. **Lihat Grafik** — Pantau tren pertumbuhan anak dari waktu ke waktu.
7. **Download Laporan** — Cetak ringkasan untuk dibawa ke Posyandu atau dokter.

### 10.2 Untuk Admin/Tenaga Kesehatan

1. **Login sebagai Admin** — Akses dashboard dengan role admin.
2. **Pantau Statistik** — Lihat distribusi persentase anak normal vs butuh perhatian.
3. **Kelola Menu** — Tambah, edit, atau hapus rekomendasi menu gizi.
4. **Kelola Edukasi** — Publikasikan artikel dan video edukasi stunting.
5. **Monitor Data Anak** — Lihat data seluruh anak terdaftar beserta status risikonya.

## 11. Kesimpulan

NutriTrack adalah aplikasi web yang dirancang khusus untuk **mendeteksi dini dan menanggulangi stunting** pada anak usia 0-60 bulan. Dengan mengintegrasikan data standar pertumbuhan WHO, sistem analisis otomatis, dan rekomendasi menu gizi yang targeted, aplikasi ini menjembatani gap antara pencatatan data kesehatan anak yang sering dilakukan secara manual di Posyandu dengan kebutuhan analisis yang cepat dan akurat.

Fitur unggulan berupa sistem badge ("Butuh Kalori Tambahan" dan "Fokus Nutrisi Otak") memberikan peringatan yang mudah dipahami oleh orang tua awam, sementara dashboard analytics di sisi admin membantu tenaga kesehatan mengambil keputusan berbasis data untuk intervensi nutrisi di tingkat komunitas.
