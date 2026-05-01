# NutriTrack — Rencana Revisi Sistem Rekomendasi Menu Stunting

## Dokumen Teknis untuk Presentasi

**Tanggal**: 28 April 2026  
**Aplikasi**: NutriTrack — Sistem Pemantauan dan Pencegahan Stunting Anak  
**Teknologi**: Next.js, Supabase (PostgreSQL), Google Gemini AI  
**URL Produksi**: nutritrack-smg.vercel.app

---

## Latar Belakang

NutriTrack adalah aplikasi web yang digunakan untuk memantau pertumbuhan anak dan memberikan rekomendasi menu makanan bergizi berdasarkan standar WHO. Aplikasi ini digunakan dalam konteks penelitian stunting, di mana orang tua memasukkan data fisik anak (berat badan, tinggi badan, lingkar kepala, kondisi mikrobiota usus, dan alergi makanan), kemudian sistem menganalisis status pertumbuhan anak dan memberikan rekomendasi menu yang sesuai.

Saat ini, sistem rekomendasi NutriTrack berjalan dengan cara berikut:
1. Orang tua memasukkan data fisik anak melalui halaman Input.
2. Sistem membandingkan data anak dengan standar pertumbuhan WHO berdasarkan umur dan jenis kelamin.
3. Berdasarkan perbandingan tersebut, sistem menentukan kategori kebutuhan nutrisi anak (misalnya: tinggi kalori, tinggi protein, tinggi kalsium, probiotik, atau normal/seimbang).
4. Sistem kemudian menampilkan menu makanan dari database statis yang sudah diinput secara manual oleh admin. Menu difilter berdasarkan kategori kebutuhan nutrisi yang telah ditentukan.

Pendekatan ini memiliki beberapa keterbatasan yang perlu direvisi untuk mendukung tujuan penelitian dan memberikan pengalaman pengguna yang lebih baik.

---

## Tiga Revisi yang Direncanakan

### Revisi 1: Sistem Pembagian Kelompok Otomatis (A/B Group)

#### Masalah Saat Ini

Dalam konteks penelitian, diperlukan pembagian pengguna ke dalam dua kelompok (A dan B) untuk membandingkan efektivitas dua pendekatan rekomendasi yang berbeda. Saat ini, pembagian kelompok harus dilakukan secara manual oleh peneliti, yang tidak efisien dan rentan terhadap bias.

#### Solusi yang Direncanakan

Sistem akan secara otomatis memasukkan setiap pengguna baru ke dalam salah satu kelompok pada saat mereka mendaftar akun. Pembagian dilakukan secara acak dengan probabilitas 50 persen untuk masing-masing kelompok, seperti melempar koin.

Kelompok A diberi label "Mikrobiota" karena kelompok ini akan mendapat rekomendasi yang mempertimbangkan data mikrobiota usus anak. Kelompok B diberi label "Standar" karena kelompok ini mendapat rekomendasi berdasarkan standar WHO saja tanpa mempertimbangkan mikrobiota.

Tidak ada batasan jumlah anggota per kelompok. Target awal penelitian adalah 15 orang per kelompok (total 30 orang), tetapi sistem tetap menerima pengguna baru tanpa batas. Jika hasilnya 18 orang di kelompok A dan 12 di kelompok B, itu tidak masalah karena pembagiannya memang acak.

Pengguna akan mengetahui kelompok mereka. Informasi kelompok ditampilkan di sidebar navigasi dan di halaman dashboard dalam bentuk badge atau label kecil. Ini bukan double-blind study; pengguna tahu mereka di kelompok mana, tetapi mereka tidak bisa memilih atau mengubah kelompoknya.

#### Implementasi Teknis

Dari sisi database, perubahan yang dilakukan cukup sederhana. Tabel profil pengguna di Supabase akan ditambahkan satu kolom baru bernama "research_group" yang berisi nilai "A" atau "B". 

Proses pembagian kelompok terjadi secara otomatis melalui trigger database PostgreSQL. Trigger ini sudah ada sebelumnya (bernama "handle_new_user") dan bertugas membuat profil pengguna saat ada akun baru terdaftar. Trigger ini akan dimodifikasi agar juga menentukan kelompok secara acak dan menyimpannya ke kolom research_group.

Logikanya sangat sederhana: saat pengguna baru mendaftar, trigger menghasilkan angka acak. Jika angka tersebut kurang dari 0.5, pengguna masuk kelompok A. Jika 0.5 atau lebih, masuk kelompok B.

Di sisi admin, halaman panel admin akan ditambahkan statistik yang menampilkan jumlah pengguna di masing-masing kelompok. Admin juga bisa melihat daftar pengguna beserta kelompoknya dalam tabel manajemen pengguna.

---

### Revisi 2: Basis Data Rekomendasi Berbeda untuk Kelompok A dan B

#### Masalah Saat Ini

Saat ini semua pengguna mendapat rekomendasi dengan logika yang sama, termasuk mempertimbangkan data mikrobiota usus. Untuk tujuan penelitian, diperlukan pemisahan pendekatan agar bisa membandingkan apakah personalisasi berbasis mikrobiota memberikan hasil yang lebih baik dibandingkan rekomendasi standar.

#### Solusi yang Direncanakan

Kedua kelompok tetap menggunakan mesin rekomendasi yang sama (fungsi "analisisPertumbuhan" di kode sumber). Yang berbeda hanya basis data yang dipertimbangkan.

Untuk Kelompok A (Mikrobiota/Personalized), sistem mempertimbangkan seluruh faktor: berat badan vs standar WHO, tinggi badan vs standar WHO, lingkar kepala vs standar WHO, dan juga kondisi mikrobiota usus anak. Jika mikrobiota anak dalam kategori "Kurang", sistem akan secara otomatis menambahkan rekomendasi menu probiotik. Prompt ke AI juga akan menyertakan informasi mikrobiota.

Untuk Kelompok B (Standar), sistem hanya mempertimbangkan perbandingan terhadap standar WHO: berat badan, tinggi badan, dan lingkar kepala. Data mikrobiota tetap dikumpulkan dan disimpan di database (untuk keperluan analisis penelitian), tetapi tidak digunakan dalam logika rekomendasi. Prompt ke AI tidak menyertakan informasi mikrobiota.

Dengan kata lain, seorang anak dengan mikrobiota "Kurang" di kelompok A akan mendapat rekomendasi menu probiotik tambahan, sedangkan anak dengan kondisi yang persis sama di kelompok B tidak akan mendapat rekomendasi probiotik karena faktor mikrobiota diabaikan dalam logika rekomendasi mereka.

#### Implementasi Teknis

Perubahan kode terjadi di file "recommendations.ts" yang berisi seluruh logika analisis pertumbuhan. Fungsi utama "analisisPertumbuhan" akan menerima parameter tambahan berupa kelompok penelitian pengguna. Pada bagian logika yang memproses data mikrobiota (Rule 4 dalam kode), akan ditambahkan pengecekan: jika pengguna berada di kelompok B, langkah ini dilewati. Seluruh logika lainnya (analisis berat badan, tinggi badan, lingkar kepala) tetap identik untuk kedua kelompok.

Halaman Dashboard dan Rekomendasi akan dimodifikasi agar mengambil data kelompok pengguna dari tabel profil, lalu meneruskan informasi tersebut ke fungsi analisis.

---

### Revisi 3: Menu yang Di-generate AI secara Otomatis

#### Masalah Saat Ini

Menu makanan di NutriTrack saat ini bersifat statis. Admin harus memasukkan setiap menu secara manual melalui panel admin, lengkap dengan nama, deskripsi, nutrisi, kalori, protein, kalsium, dan kategori. Sistem kemudian hanya memfilter menu-menu tersebut berdasarkan kategori kebutuhan anak.

Pendekatan ini memiliki beberapa keterbatasan. Pertama, variasi menu terbatas pada apa yang sudah diinput admin. Kedua, menu tidak menyesuaikan dengan alergi anak secara otomatis. Sistem hanya menampilkan catatan peringatan tentang alergi, tetapi menu yang mengandung alergen tetap muncul. Ketiga, tidak ada instruksi cara memasak.

#### Solusi yang Direncanakan

Menu akan di-generate secara dinamis oleh AI (Google Gemini) berdasarkan kondisi spesifik setiap anak. Setiap kali pengguna membuka halaman Rekomendasi, sistem mengirimkan informasi lengkap tentang kondisi anak ke AI, dan AI menghasilkan 5 rekomendasi menu yang dipersonalisasi.

Fitur utama dari pendekatan baru ini:

Pertama, menu otomatis menyesuaikan alergi. Jika anak alergi kacang tanah, maka semua menu yang dihasilkan AI dijamin tidak mengandung kacang tanah. Tidak perlu lagi peringatan manual; sistem benar-benar menghindari bahan alergen.

Kedua, menu disesuaikan dengan umur dan tekstur makanan. Untuk anak 6 bulan, AI akan menyarankan puree atau bubur halus. Untuk anak 2 tahun, AI bisa menyarankan makanan dengan tekstur yang lebih padat.

Ketiga, menu menggunakan bahan lokal Indonesia. AI diinstruksikan secara spesifik untuk hanya menggunakan bahan-bahan yang mudah ditemukan di Indonesia.

Keempat, ada fitur "Cara Masak". Setiap menu yang ditampilkan memiliki tombol yang bisa diklik untuk melihat instruksi memasak sederhana. Instruksi ini juga dihasilkan oleh AI, ditulis dalam bahasa yang mudah dipahami, dengan langkah-langkah yang ringkas.

Kelima, ada fitur "Generate Ulang". Jika pengguna ingin variasi menu lain, mereka bisa menekan tombol untuk meminta AI menghasilkan set menu baru yang berbeda.

#### Mengapa Google Gemini

Google Gemini dipilih sebagai provider AI karena menyediakan tier gratis yang sangat memadai untuk kebutuhan penelitian ini. Dalam tier gratis, Gemini mengizinkan hingga 1.500 permintaan per hari. Dengan asumsi setiap pengguna melakukan rata-rata 3 permintaan per hari (satu kali generate menu dan satu sampai dua kali bertanya cara masak), maka:

Untuk 30 pengguna, dibutuhkan sekitar 90 permintaan per hari, yang hanya 6 persen dari limit harian.
Untuk 100 pengguna, dibutuhkan sekitar 300 permintaan per hari, yang masih hanya 20 persen dari limit.
Untuk 500 pengguna aktif, dibutuhkan sekitar 1.500 permintaan per hari, baru mencapai batas.

Model yang digunakan adalah Gemini 2.0 Flash, yang merupakan model terbaru Google dengan kecepatan respons tinggi dan kualitas output yang baik untuk tugas-tugas seperti pembuatan rekomendasi menu.

#### Sistem Cache untuk Efisiensi

Untuk menghindari pemborosan kuota API, sistem menerapkan mekanisme cache. Ketika AI menghasilkan menu untuk kondisi anak tertentu, hasilnya disimpan di database. Jika pengguna membuka halaman Rekomendasi lagi dan kondisi anak belum berubah (berat badan, tinggi badan, umur, alergi masih sama), sistem akan menampilkan menu dari cache alih-alih meminta AI membuat menu baru. Cache berlaku selama 7 hari, setelah itu akan di-generate ulang.

Dengan sistem cache ini, jumlah permintaan ke API menjadi jauh lebih rendah dari estimasi, karena sebagian besar pengguna akan mendapat menu dari cache.

#### Fallback ke Menu Statis

Jika karena alasan tertentu API Gemini tidak tersedia (misalnya gangguan layanan Google atau koneksi internet bermasalah), sistem akan otomatis menampilkan menu dari database statis yang sudah ada sebagai cadangan. Pengalaman pengguna tidak terganggu; mereka tetap mendapat rekomendasi menu, hanya saja dari database manual, bukan dari AI.

#### Implementasi Teknis

Dari sisi arsitektur, ada tiga komponen baru yang dibuat.

Komponen pertama adalah file helper Gemini ("gemini.ts") yang menangani komunikasi dengan API Google Gemini. File ini berisi fungsi untuk mengirim prompt dan menerima respons, serta menangani error.

Komponen kedua adalah API Route untuk generate menu ("/api/generate-menu"). Ini adalah endpoint server-side yang menerima data kondisi anak dari frontend, membangun prompt yang sesuai (berbeda untuk kelompok A dan B), memanggil Gemini, lalu mengembalikan hasil dalam format JSON. API key Gemini tersimpan di server dan tidak pernah terekspos ke browser pengguna.

Komponen ketiga adalah API Route untuk cara masak ("/api/cooking-guide"). Endpoint ini menerima nama menu dan informasi anak, lalu meminta Gemini memberikan instruksi memasak yang ringkas dan mudah dipahami.

Halaman Rekomendasi akan di-rewrite secara signifikan. Alur baru halaman ini adalah: saat pengguna membuka halaman, sistem pertama-tama menjalankan analisis pertumbuhan lokal. Kemudian sistem mengirim hasilnya ke API generate menu. Sementara menunggu respons AI, halaman menampilkan animasi loading dengan pesan "AI sedang menyiapkan menu...". Setelah menu diterima, ditampilkan dalam bentuk kartu-kartu (cards) yang menarik, lengkap dengan informasi nutrisi, estimasi kalori, bahan utama, dan tombol "Cara Masak".

---

## Alur Pengguna Setelah Revisi

Berikut adalah pengalaman pengguna dari awal hingga mendapat rekomendasi menu setelah ketiga revisi diterapkan:

Langkah 1: Pengguna baru membuka aplikasi NutriTrack dan mendaftar akun dengan mengisi nama, email, dan password.

Langkah 2: Saat akun dibuat, sistem secara otomatis dan acak memasukkan pengguna ke Kelompok A atau Kelompok B. Pengguna langsung tahu kelompoknya dari badge yang muncul di sidebar.

Langkah 3: Pengguna memasukkan data anak melalui halaman Input, termasuk nama, tanggal lahir, jenis kelamin, berat badan, tinggi badan, lingkar kepala, kondisi mikrobiota usus, dan alergi makanan.

Langkah 4: Di halaman Dashboard, pengguna melihat analisis pertumbuhan anaknya. Jika pengguna di Kelompok A dan mikrobiota anak "Kurang", dashboard menampilkan rekomendasi tambahan terkait probiotik. Jika di Kelompok B, faktor mikrobiota tidak mempengaruhi analisis.

Langkah 5: Pengguna membuka halaman Rekomendasi Menu. Sistem memanggil AI Gemini dengan data kondisi anak. Dalam beberapa detik, muncul 5 rekomendasi menu yang dipersonalisasi. Menu ini sudah memperhitungkan alergi anak (bahan alergen tidak muncul), umur anak (tekstur sesuai), dan kebutuhan nutrisi (berdasarkan analisis pertumbuhan).

Langkah 6: Pengguna tertarik dengan salah satu menu, misalnya "Bubur Ayam Bayam Keju". Pengguna menekan tombol "Cara Masak" dan muncul popup berisi instruksi memasak yang singkat dan jelas.

Langkah 7: Jika pengguna ingin pilihan lain, mereka menekan tombol "Generate Ulang" dan AI menghasilkan 5 menu baru yang berbeda.

---

## Perbedaan Pengalaman Kelompok A vs Kelompok B

Untuk memperjelas perbedaan kedua kelompok, berikut contoh kasus:

Seorang anak laki-laki berusia 18 bulan dengan berat badan 8.5 kg (di bawah standar WHO 10.9 kg), tinggi badan 78 cm (di bawah standar WHO 82.3 cm), mikrobiota usus "Kurang", dan alergi kacang tanah.

Jika orang tuanya masuk Kelompok A (Mikrobiota), analisis sistem akan menunjukkan: berat badan kurang (butuh kalori tambahan), tinggi badan kurang (butuh protein dan kalsium), dan mikrobiota kurang (butuh probiotik). AI akan di-prompt untuk menghasilkan menu tinggi kalori, tinggi protein, dan probiotik, tanpa kacang tanah. Contoh menu yang mungkin muncul: "Bubur Beras Merah dengan Ikan Salmon dan Yogurt" atau "Sup Ayam Sayur dengan Tempe dan Kimchi Anak".

Jika orang tuanya masuk Kelompok B (Standar), analisis sistem akan menunjukkan: berat badan kurang (butuh kalori tambahan) dan tinggi badan kurang (butuh protein dan kalsium). Mikrobiota diabaikan. AI akan di-prompt untuk menghasilkan menu tinggi kalori dan tinggi protein, tanpa kacang tanah, tanpa menyebut probiotik. Contoh menu: "Nasi Tim Ayam dengan Wortel dan Brokoli" atau "Telur Dadar Bayam dengan Keju".

Data mikrobiota anak tetap dikumpulkan dan disimpan untuk kedua kelompok. Perbedaannya hanya pada apakah data tersebut digunakan dalam logika rekomendasi atau tidak.

---

## Keamanan dan Privasi

API key Google Gemini disimpan di sisi server (environment variable) dan tidak pernah terekspos ke browser pengguna. Semua komunikasi dengan AI melalui API Route Next.js yang berjalan di server.

Data anak yang dikirim ke AI hanya berupa informasi generik (umur, berat badan, tinggi badan, kategori mikrobiota, dan daftar alergi). Tidak ada data identitas pribadi (nama anak, nama orang tua, email, atau alamat) yang dikirim ke AI.

Row Level Security (RLS) di Supabase memastikan setiap pengguna hanya bisa mengakses data anaknya sendiri. Admin bisa melihat semua data untuk keperluan penelitian.

---

## Estimasi Biaya

Seluruh revisi ini tidak memerlukan biaya tambahan:

Google Gemini API: Gratis (tier gratis mendukung hingga 1.500 request per hari).
Supabase: Sudah digunakan, tidak ada perubahan tier yang diperlukan.
Vercel: Sudah digunakan untuk hosting, API Routes termasuk dalam tier yang sama.

Total biaya tambahan: Rp 0.

---

## Timeline Implementasi

Revisi 1 (Sistem A/B Group): Estimasi 1 sampai 2 jam. Meliputi perubahan database, trigger, dan tampilan di sidebar, dashboard, serta admin panel.

Revisi 2 (Basis Data Berbeda): Estimasi 1 sampai 2 jam. Meliputi modifikasi logika rekomendasi dan penyesuaian halaman yang memanggil fungsi tersebut.

Revisi 3 (AI Menu Generation): Estimasi 4 sampai 6 jam. Meliputi pembuatan helper Gemini, dua API Route baru, sistem cache, dan rewrite halaman Rekomendasi.

Testing dan penyempurnaan: Estimasi 1 sampai 2 jam.

Total estimasi: 7 sampai 12 jam kerja.

---

## Kesimpulan

Ketiga revisi ini memungkinkan NutriTrack bertransformasi dari sistem rekomendasi statis berbasis database manual menjadi sistem rekomendasi dinamis berbasis AI yang dipersonalisasi. Pembagian kelompok A/B secara otomatis mendukung metodologi penelitian tanpa memerlukan intervensi manual. Penggunaan Google Gemini sebagai provider AI memastikan biaya tetap nol rupiah untuk skala penelitian ini.

Setelah implementasi, peneliti dapat membandingkan efektivitas pendekatan personalisasi berbasis mikrobiota (Kelompok A) versus pendekatan standar WHO (Kelompok B) dalam konteks pencegahan stunting, dengan data yang dikumpulkan secara otomatis oleh sistem.
