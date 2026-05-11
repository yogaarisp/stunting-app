export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'user';
  research_group: 'A' | 'B' | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  nama_anak: string;
  tanggal_lahir: string | null;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | null;
  umur_bulan: number;
  berat_badan: number;
  tinggi_badan: number;
  lingkar_lengan: number | null;
  lingkar_kepala: number | null;
  alergi: string | null;
  has_mikrobiota_data: boolean;
  mikrobiota: string | null;
  created_at: string;
  updated_at: string;
}

export interface HistoriPerkembangan {
  id: string;
  child_id: string;
  berat_badan: number;
  tinggi_badan: number;
  lingkar_lengan: number | null;
  lingkar_kepala: number | null;
  umur_bulan: number;
  created_at: string;
}

export interface Menu {
  id: string;
  nama_menu: string;
  deskripsi: string | null;
  nutrisi: string;
  kalori: number | null;
  protein: number | null;
  kalsium: number | null;
  kategori: 'tinggi_kalori' | 'tinggi_protein' | 'tinggi_kalsium' | 'probiotik' | 'normal' | 'nutrisi_otak';
  gambar_url: string | null;
  created_at: string;
}

export interface ChildFormData {
  nama_anak: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  umur_bulan: number;
  berat_badan: number;
  tinggi_badan: number;
  lingkar_lengan: number;
  lingkar_kepala: number;
  alergi: string;
  has_mikrobiota_data: boolean;
  mikrobiota: string;
}

export interface Edukasi {
  id: string;
  tipe: 'artikel' | 'video';
  judul: string;
  deskripsi: string;
  link_url: string;
  thumbnail_url: string | null;
  created_at: string;
}
export interface AppSettings {
  id: number;
  brand_name: string;
  logo_url: string | null;
  gemini_api_key: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  supabase_service_role_key: string | null;
  updated_at: string;
}

export interface AIGeneratedMenu {
  nama_menu: string;
  deskripsi: string;
  bahan_utama: string[];
  nutrisi: string;
  kalori_estimasi: number;
  protein_estimasi: number;
  kategori: string;
  waktu_masak: string;
}

export interface FoodPhoto {
  id: string;
  child_id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  meal_type: 'sarapan' | 'makan_siang' | 'makan_malam' | 'snack';
  photo_date: string;
  created_at: string;
}

export interface MicrobiotaReference {
  id: string;
  nama_bakteri: string;
  makanan_disarankan: string | null;
  makanan_dihindari: string | null;
  penjelasan_medis: string | null;
  created_at: string;
  updated_at: string;
}
