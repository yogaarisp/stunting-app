# NutriTrack: Sistem Cerdas Analisa Stunting

## 1. Fokus Utama
NutriTrack membantu orang tua mendeteksi stunting secara mandiri dengan membandingkan data fisik anak terhadap **Standar Pertumbuhan WHO** (Z-Score 0).

## 2. Parameter Pengukuran
Aplikasi menganalisis tiga indikator pertumbuhan berdasarkan usia dan jenis kelamin:
*   **Berat Badan (BB)**: Standar gizi harian anak.
*   **Tinggi Badan (TB)**: Indikator utama stunting (gizi kronis).
*   **Lingkar Kepala (LK)**: Indikator perkembangan fungsi otak.

## 3. Logika Penentuan Level Risiko
Ini adalah "Otak" dari NutriTrack yang menentukan tindakan apa yang harus diambil:

| Level Risiko | Kondisi Fisik Anak | Tindakan Sistem |
| :--- | :--- | :--- |
| 🔴 **TINGGI** | Berat Badan **DAN** Tinggi Badan di bawah standar | Muncul peringatan bahaya & saran intervensi medis segera. |
| 🟡 **SEDANG** | Salah satu (BB, TB, atau LK) di bawah standar | Muncul Badge khusus untuk fokus perbaikan nutrisi tertentu. |
| 🟢 **RENDAH** | Seluruh indikator (BB, TB, LK) dalam rentang normal | Saran untuk mempertahankan pola makan seimbang. |

## 4. Ambang Batas (Threshold) Analisis
System akan mengkategorikan "Kurang" jika angka anak berada di bawah persentase berikut:
*   **BB Kurang**: < 85% dari standar median WHO.
*   **TB Kurang**: < 90% dari standar median WHO.
*   **LK Kurang**: < 95% dari standar median WHO.

## 5. Sistem Badge & Rekomendasi Menu
Jika risiko terdeteksi Sedang/Tinggi, sistem memicu solusi instan:
*   **Badge 🔥 Butuh Kalori**: Jika BB rendah. Memberikan menu tinggi lemak sehat & energi.
*   **Badge 🧠 Fokus Nutrisi Otak**: Jika LK rendah. Memberikan menu kaya DHA & Zat Besi.
*   **Rekomendasi Menu**: Aplikasi memfilter database `menus` untuk hanya menampilkan resep yang mengandung nutrisi yang sedang kurang pada anak.

## 6. Contoh Kasus (Demo)
Anak Laki-laki, 18 Bulan:
*   **BB**: 8.5kg (Standar: 10.9kg) → **78% (Kurang)**
*   **TB**: 73cm (Standar: 82.3cm) → **88% (Kurang)**
*   **Hasil**: Level Risiko **🔴 TINGGI**.
*   **Solusi**: Dashboard otomatis menampilkan badge instruksi dan menu makanan tinggi protein & kalori.

## 7. Kesimpulan
NutriTrack memastikan tidak ada anak yang "terlambat" ditangani. Dengan analisa level risiko yang presisi, orang tua memiliki panduan pasti untuk masa depan buah hati mereka.
