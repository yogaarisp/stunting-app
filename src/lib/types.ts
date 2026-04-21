export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'user';
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
  mikrobiota: 'Baik' | 'Cukup' | 'Kurang';
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
  mikrobiota: 'Baik' | 'Cukup' | 'Kurang';
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
  updated_at: string;
}
