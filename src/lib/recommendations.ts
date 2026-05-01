import { Child, Menu } from './types';

/**
 * ================================================================
 * STANDAR PERTUMBUHAN WHO (Simplified Median / Z-Score 0)
 * Dipisah per Jenis Kelamin: Laki-laki & Perempuan
 * Data: BB (kg), TB (cm), LK (cm) — Umur 0-60 bulan
 * Sumber: WHO Child Growth Standards (simplified)
 * ================================================================
 */

interface StandarEntry {
  bb_rata: number; // Berat Badan median (kg)
  tb_rata: number; // Tinggi/Panjang Badan median (cm)
  lk_rata: number; // Lingkar Kepala median (cm)
}

// ---- LAKI-LAKI ----
const STANDAR_LAKI: Record<number, StandarEntry> = {
  0:  { bb_rata: 3.3,  tb_rata: 49.9, lk_rata: 34.5 },
  1:  { bb_rata: 4.5,  tb_rata: 54.7, lk_rata: 37.3 },
  2:  { bb_rata: 5.6,  tb_rata: 58.4, lk_rata: 39.1 },
  3:  { bb_rata: 6.4,  tb_rata: 61.4, lk_rata: 40.5 },
  4:  { bb_rata: 7.0,  tb_rata: 63.9, lk_rata: 41.6 },
  5:  { bb_rata: 7.5,  tb_rata: 65.9, lk_rata: 42.6 },
  6:  { bb_rata: 7.9,  tb_rata: 67.6, lk_rata: 43.3 },
  7:  { bb_rata: 8.3,  tb_rata: 69.2, lk_rata: 44.0 },
  8:  { bb_rata: 8.6,  tb_rata: 70.6, lk_rata: 44.5 },
  9:  { bb_rata: 8.9,  tb_rata: 72.0, lk_rata: 45.0 },
  10: { bb_rata: 9.2,  tb_rata: 73.3, lk_rata: 45.4 },
  11: { bb_rata: 9.4,  tb_rata: 74.5, lk_rata: 45.8 },
  12: { bb_rata: 9.6,  tb_rata: 75.7, lk_rata: 46.1 },
  13: { bb_rata: 9.9,  tb_rata: 76.9, lk_rata: 46.3 },
  14: { bb_rata: 10.1, tb_rata: 77.9, lk_rata: 46.6 },
  15: { bb_rata: 10.2, tb_rata: 79.1, lk_rata: 46.8 },
  16: { bb_rata: 10.4, tb_rata: 80.2, lk_rata: 46.9 },
  17: { bb_rata: 10.6, tb_rata: 81.2, lk_rata: 47.1 },
  18: { bb_rata: 10.9, tb_rata: 82.3, lk_rata: 47.3 },
  19: { bb_rata: 11.0, tb_rata: 83.2, lk_rata: 47.4 },
  20: { bb_rata: 11.2, tb_rata: 84.2, lk_rata: 47.5 },
  21: { bb_rata: 11.5, tb_rata: 85.1, lk_rata: 47.7 },
  22: { bb_rata: 11.7, tb_rata: 86.0, lk_rata: 47.8 },
  23: { bb_rata: 11.9, tb_rata: 86.9, lk_rata: 47.9 },
  24: { bb_rata: 12.2, tb_rata: 87.8, lk_rata: 48.0 },
  30: { bb_rata: 13.3, tb_rata: 92.4, lk_rata: 48.7 },
  36: { bb_rata: 14.3, tb_rata: 96.1, lk_rata: 49.3 },
  42: { bb_rata: 15.3, tb_rata: 99.8, lk_rata: 49.7 },
  48: { bb_rata: 16.3, tb_rata: 103.3, lk_rata: 50.0 },
  54: { bb_rata: 17.3, tb_rata: 106.7, lk_rata: 50.3 },
  60: { bb_rata: 18.3, tb_rata: 110.0, lk_rata: 50.5 },
};

// ---- PEREMPUAN ----
const STANDAR_PEREMPUAN: Record<number, StandarEntry> = {
  0:  { bb_rata: 3.2,  tb_rata: 49.1, lk_rata: 33.9 },
  1:  { bb_rata: 4.2,  tb_rata: 53.7, lk_rata: 36.5 },
  2:  { bb_rata: 5.1,  tb_rata: 57.1, lk_rata: 38.3 },
  3:  { bb_rata: 5.8,  tb_rata: 59.8, lk_rata: 39.5 },
  4:  { bb_rata: 6.4,  tb_rata: 62.1, lk_rata: 40.6 },
  5:  { bb_rata: 6.9,  tb_rata: 64.0, lk_rata: 41.5 },
  6:  { bb_rata: 7.3,  tb_rata: 65.7, lk_rata: 42.2 },
  7:  { bb_rata: 7.6,  tb_rata: 67.3, lk_rata: 42.8 },
  8:  { bb_rata: 7.9,  tb_rata: 68.7, lk_rata: 43.4 },
  9:  { bb_rata: 8.2,  tb_rata: 70.1, lk_rata: 43.8 },
  10: { bb_rata: 8.5,  tb_rata: 71.5, lk_rata: 44.2 },
  11: { bb_rata: 8.7,  tb_rata: 72.8, lk_rata: 44.6 },
  12: { bb_rata: 8.9,  tb_rata: 74.0, lk_rata: 44.9 },
  13: { bb_rata: 9.2,  tb_rata: 75.2, lk_rata: 45.2 },
  14: { bb_rata: 9.4,  tb_rata: 76.4, lk_rata: 45.4 },
  15: { bb_rata: 9.6,  tb_rata: 77.5, lk_rata: 45.6 },
  16: { bb_rata: 9.8,  tb_rata: 78.6, lk_rata: 45.8 },
  17: { bb_rata: 10.0, tb_rata: 79.7, lk_rata: 46.0 },
  18: { bb_rata: 10.2, tb_rata: 80.7, lk_rata: 46.2 },
  19: { bb_rata: 10.4, tb_rata: 81.7, lk_rata: 46.3 },
  20: { bb_rata: 10.6, tb_rata: 82.7, lk_rata: 46.4 },
  21: { bb_rata: 10.9, tb_rata: 83.7, lk_rata: 46.5 },
  22: { bb_rata: 11.1, tb_rata: 84.6, lk_rata: 46.6 },
  23: { bb_rata: 11.3, tb_rata: 85.5, lk_rata: 46.7 },
  24: { bb_rata: 11.5, tb_rata: 86.4, lk_rata: 46.8 },
  30: { bb_rata: 12.7, tb_rata: 91.2, lk_rata: 47.5 },
  36: { bb_rata: 13.9, tb_rata: 95.1, lk_rata: 48.1 },
  42: { bb_rata: 15.0, tb_rata: 98.9, lk_rata: 48.5 },
  48: { bb_rata: 16.1, tb_rata: 102.7, lk_rata: 48.8 },
  54: { bb_rata: 17.2, tb_rata: 106.2, lk_rata: 49.1 },
  60: { bb_rata: 18.2, tb_rata: 109.4, lk_rata: 49.3 },
};

/**
 * Mendapatkan standar pertumbuhan berdasarkan umur dan jenis kelamin.
 * Menggunakan interpolasi linear jika umur tidak tepat di tabel.
 */
function getStandar(umurBulan: number, jenisKelamin?: string | null): StandarEntry {
  const tabel = jenisKelamin === 'Perempuan' ? STANDAR_PEREMPUAN : STANDAR_LAKI;

  // Direct match
  if (tabel[umurBulan]) {
    return tabel[umurBulan];
  }

  // Interpolasi
  const ages = Object.keys(tabel).map(Number).sort((a, b) => a - b);

  let lower = ages[0];
  let upper = ages[ages.length - 1];

  for (let i = 0; i < ages.length - 1; i++) {
    if (umurBulan >= ages[i] && umurBulan <= ages[i + 1]) {
      lower = ages[i];
      upper = ages[i + 1];
      break;
    }
  }

  if (umurBulan <= lower) return tabel[lower];
  if (umurBulan >= upper) return tabel[upper];

  const ratio = (umurBulan - lower) / (upper - lower);
  const lowerStd = tabel[lower];
  const upperStd = tabel[upper];

  return {
    bb_rata: lowerStd.bb_rata + ratio * (upperStd.bb_rata - lowerStd.bb_rata),
    tb_rata: lowerStd.tb_rata + ratio * (upperStd.tb_rata - lowerStd.tb_rata),
    lk_rata: lowerStd.lk_rata + ratio * (upperStd.lk_rata - lowerStd.lk_rata),
  };
}

/**
 * Badge types yang bisa muncul di dashboard
 */
export type BadgeType = 'butuh_kalori' | 'fokus_nutrisi_otak';

export interface BadgeInfo {
  type: BadgeType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string; // lucide icon name
  menuKategori: string[]; // kategori menu yang relevan
}

export const BADGE_CONFIG: Record<BadgeType, BadgeInfo> = {
  butuh_kalori: {
    type: 'butuh_kalori',
    label: 'Butuh Kalori Tambahan',
    description: 'Berat badan anak di bawah standar WHO. Tingkatkan asupan kalori harian.',
    color: 'text-orange-700',
    bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
    icon: 'Flame',
    menuKategori: ['tinggi_kalori'],
  },
  fokus_nutrisi_otak: {
    type: 'fokus_nutrisi_otak',
    label: 'Fokus Nutrisi Otak',
    description: 'Lingkar kepala anak di bawah standar WHO. Perbanyak makanan kaya DHA, Omega-3, dan Zat Besi.',
    color: 'text-violet-700',
    bgColor: 'bg-gradient-to-r from-violet-50 to-purple-50',
    icon: 'Brain',
    menuKategori: ['nutrisi_otak'],
  },
};

export interface AnalisisStatus {
  bbStatus: 'kurang' | 'normal' | 'lebih';
  tbStatus: 'kurang' | 'normal' | 'lebih';
  lkStatus: 'kurang' | 'normal' | 'lebih' | 'tidak_ada_data';
  bbPersentase: number;
  tbPersentase: number;
  lkPersentase: number | null;
  kategoriRekomendasi: string[];
  badges: BadgeType[];
  pesan: string;
  riskLevel: 'rendah' | 'sedang' | 'tinggi';
  genderUsed: string;
}

/**
 * Menganalisis status pertumbuhan anak berdasarkan standar WHO
 * (Gender-specific dengan analisis BB, TB, dan Lingkar Kepala)
 */
export function analisisPertumbuhan(child: Child, researchGroup?: string | null): AnalisisStatus {
  const gender = child.jenis_kelamin || 'Laki-laki';
  const standar = getStandar(child.umur_bulan, gender);

  const bbPersentase = (child.berat_badan / standar.bb_rata) * 100;
  const tbPersentase = (child.tinggi_badan / standar.tb_rata) * 100;

  const bbStatus: 'kurang' | 'normal' | 'lebih' =
    bbPersentase < 85 ? 'kurang' : bbPersentase > 115 ? 'lebih' : 'normal';

  const tbStatus: 'kurang' | 'normal' | 'lebih' =
    tbPersentase < 90 ? 'kurang' : tbPersentase > 110 ? 'lebih' : 'normal';

  // Analisis Lingkar Kepala
  let lkStatus: 'kurang' | 'normal' | 'lebih' | 'tidak_ada_data' = 'tidak_ada_data';
  let lkPersentase: number | null = null;

  if (child.lingkar_kepala && child.lingkar_kepala > 0) {
    lkPersentase = (child.lingkar_kepala / standar.lk_rata) * 100;
    lkStatus = lkPersentase < 95 ? 'kurang' : lkPersentase > 105 ? 'lebih' : 'normal';
  }

  const kategoriRekomendasi: string[] = [];
  const pesanList: string[] = [];
  const badges: BadgeType[] = [];

  // === BADGE & RECOMMENDATION LOGIC ===

  // Rule 1: BB di bawah standar → Badge "Butuh Kalori Tambahan"
  if (bbStatus === 'kurang') {
    badges.push('butuh_kalori');
    kategoriRekomendasi.push('tinggi_kalori');
    pesanList.push('Berat badan anak di bawah standar WHO. Direkomendasikan makanan tinggi kalori.');
  }

  // Rule 2: TB di bawah standar → protein & kalsium
  if (tbStatus === 'kurang') {
    kategoriRekomendasi.push('tinggi_protein');
    kategoriRekomendasi.push('tinggi_kalsium');
    pesanList.push('Tinggi badan anak di bawah standar. Direkomendasikan makanan tinggi protein dan kalsium.');
  }

  // Rule 3: Lingkar Kepala di bawah standar → Badge "Fokus Nutrisi Otak"
  if (lkStatus === 'kurang') {
    badges.push('fokus_nutrisi_otak');
    kategoriRekomendasi.push('nutrisi_otak');
    pesanList.push('Lingkar kepala anak di bawah standar WHO. Perbanyak makanan kaya DHA dan Zat Besi untuk perkembangan otak.');
  }

  // Rule 4: Mikrobiota — HANYA untuk Kelompok A yang punya data
  if (researchGroup === 'A' && child.has_mikrobiota_data && child.mikrobiota) {
    kategoriRekomendasi.push('probiotik');
    pesanList.push('Data mikrobiota tersedia. Makanan probiotik direkomendasikan untuk mendukung kesehatan usus.');
  }

  // Default: Normal
  if (kategoriRekomendasi.length === 0) {
    kategoriRekomendasi.push('normal');
    pesanList.push('Pertumbuhan anak normal sesuai standar WHO. Pertahankan pola makan seimbang!');
  }

  // Risk level
  let riskLevel: 'rendah' | 'sedang' | 'tinggi' = 'rendah';
  if (bbStatus === 'kurang' && tbStatus === 'kurang') {
    riskLevel = 'tinggi';
  } else if (bbStatus === 'kurang' || tbStatus === 'kurang' || lkStatus === 'kurang') {
    riskLevel = 'sedang';
  }

  // Jika BB & TB kurang DAN lingkar kepala juga kurang → tetap tinggi
  if (riskLevel === 'tinggi' && lkStatus === 'kurang') {
    pesanList.push('⚠️ Perhatian serius: seluruh indikator pertumbuhan di bawah standar.');
  }

  return {
    bbStatus,
    tbStatus,
    lkStatus,
    bbPersentase: Math.round(bbPersentase * 10) / 10,
    tbPersentase: Math.round(tbPersentase * 10) / 10,
    lkPersentase: lkPersentase !== null ? Math.round(lkPersentase * 10) / 10 : null,
    kategoriRekomendasi: [...new Set(kategoriRekomendasi)],
    badges,
    pesan: pesanList.join(' '),
    riskLevel,
    genderUsed: gender,
  };
}

/**
 * Filter menu berdasarkan kategori rekomendasi
 */
export function filterMenuRekomendasi(menus: Menu[], kategori: string[]): Menu[] {
  const filtered = menus.filter((menu) => kategori.includes(menu.kategori));

  // Return max 6 unique menus
  return filtered.slice(0, 6);
}

/**
 * Get standar for display purposes (gender-aware)
 */
export function getStandarForAge(umurBulan: number, jenisKelamin?: string | null) {
  return getStandar(umurBulan, jenisKelamin);
}
