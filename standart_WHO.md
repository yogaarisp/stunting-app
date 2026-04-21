# Standar Pertumbuhan Anak (WHO Growth Standards)

Dokumen ini berisi data acuan pertumbuhan anak (Berat Badan, Tinggi Badan, dan Lingkar Kepala) yang digunakan dalam aplikasi NutriTrack. Data ini mengacu pada standar median (Z-Score 0) dari **WHO Child Growth Standards**.

## 1. Standar Laki-laki (0 - 60 Bulan)

| Umur (Bulan) | Berat Badan (Median kg) | Tinggi Badan (Median cm) | Lingkar Kepala (Median cm) |
| :--- | :--- | :--- | :--- |
| 0 | 3.3 | 49.9 | 34.5 |
| 1 | 4.5 | 54.7 | 37.3 |
| 2 | 5.6 | 58.4 | 39.1 |
| 3 | 6.4 | 61.4 | 40.5 |
| 4 | 7.0 | 63.9 | 41.6 |
| 5 | 7.5 | 65.9 | 42.6 |
| 6 | 7.9 | 67.6 | 43.3 |
| 7 | 8.3 | 69.2 | 44.0 |
| 8 | 8.6 | 70.6 | 44.5 |
| 9 | 8.9 | 72.0 | 45.0 |
| 10 | 9.2 | 73.3 | 45.4 |
| 11 | 9.4 | 74.5 | 45.8 |
| 12 | 9.6 | 75.7 | 46.1 |
| 13 | 9.9 | 76.9 | 46.3 |
| 14 | 10.1 | 77.9 | 46.6 |
| 15 | 10.2 | 79.1 | 46.8 |
| 16 | 10.4 | 80.2 | 46.9 |
| 17 | 10.6 | 81.2 | 47.1 |
| 18 | 10.9 | 82.3 | 47.3 |
| 19 | 11.0 | 83.2 | 47.4 |
| 20 | 11.2 | 84.2 | 47.5 |
| 21 | 11.5 | 85.1 | 47.7 |
| 22 | 11.7 | 86.0 | 47.8 |
| 23 | 11.9 | 86.9 | 47.9 |
| 24 | 12.2 | 87.8 | 48.0 |
| 30 | 13.3 | 92.4 | 48.7 |
| 36 | 14.3 | 96.1 | 49.3 |
| 42 | 15.3 | 99.8 | 49.7 |
| 48 | 16.3 | 103.3 | 50.0 |
| 54 | 17.3 | 106.7 | 50.3 |
| 60 | 18.3 | 110.0 | 50.5 |

## 2. Standar Perempuan (0 - 60 Bulan)

| Umur (Bulan) | Berat Badan (Median kg) | Tinggi Badan (Median cm) | Lingkar Kepala (Median cm) |
| :--- | :--- | :--- | :--- |
| 0 | 3.2 | 49.1 | 33.9 |
| 1 | 4.2 | 53.7 | 36.5 |
| 2 | 5.1 | 57.1 | 38.3 |
| 3 | 5.8 | 59.8 | 39.5 |
| 4 | 6.4 | 62.1 | 40.6 |
| 5 | 6.9 | 64.0 | 41.5 |
| 6 | 7.3 | 65.7 | 42.2 |
| 7 | 7.6 | 67.3 | 42.8 |
| 8 | 7.9 | 68.7 | 43.4 |
| 9 | 8.2 | 70.1 | 43.8 |
| 10 | 8.5 | 71.5 | 44.2 |
| 11 | 8.7 | 72.8 | 44.6 |
| 12 | 8.9 | 74.0 | 44.9 |
| 13 | 9.2 | 75.2 | 45.2 |
| 14 | 9.4 | 76.4 | 45.4 |
| 15 | 9.6 | 77.5 | 45.6 |
| 16 | 9.8 | 78.6 | 45.8 |
| 17 | 10.0 | 79.7 | 46.0 |
| 18 | 10.2 | 80.7 | 46.2 |
| 19 | 10.4 | 81.7 | 46.3 |
| 20 | 10.6 | 82.7 | 46.4 |
| 21 | 10.9 | 83.7 | 46.5 |
| 22 | 11.1 | 84.6 | 46.6 |
| 23 | 11.3 | 85.5 | 46.7 |
| 24 | 11.5 | 86.4 | 46.8 |
| 30 | 12.7 | 91.2 | 47.5 |
| 36 | 13.9 | 95.1 | 48.1 |
| 42 | 15.0 | 98.9 | 48.5 |
| 48 | 16.1 | 102.7 | 48.8 |
| 54 | 17.2 | 106.2 | 49.1 |
| 60 | 18.2 | 109.4 | 49.3 |

## 3. Ambang Batas (Threshold) Analisis

Aplikasi menggunakan rumus persentase terhadap median untuk menentukan status pertumbuhan:

| Indikator | Kategori | Ambang Batas (Persentase terhadap Median) |
| :--- | :--- | :--- |
| **Berat Badan (BB)** | Kurang | < 85% |
| | Normal | 85% - 115% |
| | Lebih | > 115% |
| **Tinggi Badan (TB)** | Kurang | < 90% |
| | Normal | 90% - 110% |
| | Lebih | > 110% |
| **Lingkar Kepala (LK)** | Kurang | < 95% |
| | Normal | 95% - 105% |
| | Lebih | > 105% |

### Logika Badge Peringatan:
- **Badge 🔥 "Butuh Kalori Tambahan"**: Muncul jika Berat Badan anak **< 85%** standar.
- **Badge 🧠 "Fokus Nutrisi Otak"**: Muncul jika Lingkar Kepala anak **< 95%** standar.

---
*Catatan: Data ini digunakan untuk memberikan rekomendasi nutrisi. Untuk diagnosa klinis yang akurat, harap berkonsultasi dengan dokter anak atau tenaga medis profesional.*
