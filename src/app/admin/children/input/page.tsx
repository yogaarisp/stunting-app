'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Child, ChildFormData, Profile } from '@/lib/types';
import {
  Save,
  Loader2,
  CheckCircle2,
  Baby,
  Weight,
  Ruler,
  Activity,
  Brain,
  AlertCircle,
  Stethoscope,
  ArrowLeft,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const initialFormData: ChildFormData = {
  nama_anak: '',
  tanggal_lahir: '',
  jenis_kelamin: 'Laki-laki',
  umur_bulan: 0,
  berat_badan: 0,
  tinggi_badan: 0,
  lingkar_lengan: 0,
  lingkar_kepala: 0,
  alergi: '',
  has_mikrobiota_data: false,
  mikrobiota: '',
};

export default function AdminInputChildPage() {
  const router = useRouter();
  
  // State for Admin
  const [parents, setParents] = useState<Profile[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  
  // Standard Form States
  const [formData, setFormData] = useState<ChildFormData>(initialFormData);
  const [existingChild, setExistingChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch all parents for dropdown
  const fetchParents = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('full_name', { ascending: true });
    
    if (data) setParents(data);
    setLoading(false);
  }, []);

  // 2. Fetch existing child when parent is selected
  const fetchChildForParent = useCallback(async (parentId: string) => {
    if (!parentId) {
      setExistingChild(null);
      setFormData(initialFormData);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', parentId)
      .maybeSingle();

    if (data) {
      setExistingChild(data);
      setFormData({
        nama_anak: data.nama_anak || '',
        tanggal_lahir: data.tanggal_lahir || '',
        jenis_kelamin: (data.jenis_kelamin as 'Laki-laki' | 'Perempuan') || 'Laki-laki',
        umur_bulan: data.umur_bulan || 0,
        berat_badan: data.berat_badan || 0,
        tinggi_badan: data.tinggi_badan || 0,
        lingkar_lengan: data.lingkar_lengan || 0,
        lingkar_kepala: data.lingkar_kepala || 0,
        alergi: data.alergi || '',
        has_mikrobiota_data: data.has_mikrobiota_data || false,
        mikrobiota: data.mikrobiota || '',
      });
    } else {
      setExistingChild(null);
      setFormData(initialFormData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  useEffect(() => {
    if (selectedParentId) {
      fetchChildForParent(selectedParentId);
    }
  }, [selectedParentId, fetchChildForParent]);

  const calculateAgeInMonths = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    const val = type === 'number' 
      ? (value === '' ? 0 : parseFloat(value))
      : value;

    setFormData((prev) => {
      const newState = { 
        ...prev, 
        [name]: val 
      } as ChildFormData;
      
      if (name === 'tanggal_lahir' && typeof val === 'string') {
        newState.umur_bulan = calculateAgeInMonths(val);
      }
      
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) {
      setError('Harap pilih Orang Tua terlebih dahulu.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    const supabase = createClient();

    const cleanData = {
      nama_anak: formData.nama_anak.trim(),
      tanggal_lahir: formData.tanggal_lahir || null,
      jenis_kelamin: formData.jenis_kelamin,
      umur_bulan: Math.floor(Number(formData.umur_bulan)) || 0,
      berat_badan: Number(formData.berat_badan) || 0,
      tinggi_badan: Number(formData.tinggi_badan) || 0,
      lingkar_lengan: formData.lingkar_lengan ? Number(formData.lingkar_lengan) : null,
      lingkar_kepala: formData.lingkar_kepala ? Number(formData.lingkar_kepala) : null,
      alergi: formData.alergi?.trim() || null,
      has_mikrobiota_data: formData.has_mikrobiota_data,
      mikrobiota: formData.has_mikrobiota_data ? (formData.mikrobiota?.trim() || null) : null,
    };

    try {
      let childId = existingChild?.id;

      if (existingChild) {
        // UPDATE
        const { error: updateError } = await supabase
          .from('children')
          .update(cleanData)
          .eq('id', existingChild.id);

        if (updateError) throw updateError;
      } else {
        // INSERT
        const { data: newChild, error: insertError } = await supabase
          .from('children')
          .insert({
            user_id: selectedParentId,
            ...cleanData
          })
          .select()
          .single();

        if (insertError) throw insertError;
        childId = newChild.id;
        setExistingChild(newChild);
      }

      // Save to history
      if (childId) {
        const { error: histError } = await supabase
          .from('histori_perkembangan')
          .insert({
            child_id: childId,
            berat_badan: cleanData.berat_badan,
            tinggi_badan: cleanData.tinggi_badan,
            lingkar_lengan: cleanData.lingkar_lengan,
            lingkar_kepala: cleanData.lingkar_kepala,
            umur_bulan: cleanData.umur_bulan,
          });

        if (histError) throw histError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Database Error:', err);
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link href="/admin/children" className="text-sm font-medium text-surface-500 hover:text-primary-600 flex items-center gap-1 mb-2">
          <ArrowLeft size={16} /> Kembali ke Manajemen Anak
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
          Admin <span className="gradient-text">Input Data Anak</span>
        </h1>
        <p className="text-surface-500 mt-1">
          Bantu Orang Tua memasukkan atau memperbarui data fisik anak.
        </p>
      </div>

      {/* Parent Selection */}
      <div className="glass-card p-6 lg:p-8 border-primary-100 bg-primary-50/30 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-800">Pilih Orang Tua</h2>
            <p className="text-xs text-surface-500">Data akan dihubungkan ke akun yang dipilih.</p>
          </div>
        </div>

        <div className="max-w-md">
          <label htmlFor="parent_id" className="form-label text-primary-700">Akun Orang Tua *</label>
          <select
            id="parent_id"
            value={selectedParentId}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className="form-input border-primary-200 focus:border-primary-500 focus:ring-primary-500/20"
            required
          >
            <option value="">-- Pilih Orang Tua --</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || 'Tanpa Nama'} ({p.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && selectedParentId ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="animate-spin text-primary-500" size={32} />
          <p className="text-surface-500 font-medium">Memeriksa data anak...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up animate-delay-100">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-primary-50 border border-primary-200 text-primary-700 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={18} />
              Data berhasil disimpan! Riwayat perkembangan telah diperbarui.
            </div>
          )}

          {selectedParentId ? (
            <>
              {/* Identitas Anak */}
              <div className="glass-card p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                    <Baby size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-surface-800">Identitas Anak</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nama_anak" className="form-label">Nama Anak *</label>
                    <input
                      id="nama_anak"
                      name="nama_anak"
                      type="text"
                      value={formData.nama_anak}
                      onChange={handleChange}
                      placeholder="Nama lengkap anak"
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="tanggal_lahir" className="form-label">Tanggal Lahir</label>
                    <input
                      id="tanggal_lahir"
                      name="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="jenis_kelamin" className="form-label">Jenis Kelamin *</label>
                    <select
                      id="jenis_kelamin"
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="umur_bulan" className="form-label">Umur (Bulan) *</label>
                    <input
                      id="umur_bulan"
                      name="umur_bulan"
                      type="number"
                      value={formData.umur_bulan || ''}
                      onChange={handleChange}
                      placeholder="Contoh: 24"
                      className="form-input"
                      min="0"
                      max="60"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Data Fisik */}
              <div className="glass-card p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-accent-500/20">
                    <Stethoscope size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-surface-800">Data Fisik</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="berat_badan" className="form-label">
                      <span className="flex items-center gap-1.5">
                        <Weight size={14} className="text-blue-500" />
                        Berat Badan (kg) *
                      </span>
                    </label>
                    <input
                      id="berat_badan"
                      name="berat_badan"
                      type="number"
                      step="0.1"
                      value={formData.berat_badan || ''}
                      onChange={handleChange}
                      placeholder="Contoh: 10.5"
                      className="form-input"
                      min="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="tinggi_badan" className="form-label">
                      <span className="flex items-center gap-1.5">
                        <Ruler size={14} className="text-primary-500" />
                        Tinggi Badan (cm) *
                      </span>
                    </label>
                    <input
                      id="tinggi_badan"
                      name="tinggi_badan"
                      type="number"
                      step="0.1"
                      value={formData.tinggi_badan || ''}
                      onChange={handleChange}
                      placeholder="Contoh: 75.5"
                      className="form-input"
                      min="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lingkar_lengan" className="form-label">
                      <span className="flex items-center gap-1.5">
                        <Activity size={14} className="text-purple-500" />
                        Lingkar Lengan (cm)
                      </span>
                    </label>
                    <input
                      id="lingkar_lengan"
                      name="lingkar_lengan"
                      type="number"
                      step="0.1"
                      value={formData.lingkar_lengan || ''}
                      onChange={handleChange}
                      placeholder="Contoh: 14.0"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="lingkar_kepala" className="form-label">
                      <span className="flex items-center gap-1.5">
                        <Brain size={14} className="text-amber-500" />
                        Lingkar Kepala (cm)
                      </span>
                    </label>
                    <input
                      id="lingkar_kepala"
                      name="lingkar_kepala"
                      type="number"
                      step="0.1"
                      value={formData.lingkar_kepala || ''}
                      onChange={handleChange}
                      placeholder="Contoh: 42.0"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Tambahan */}
              <div className="glass-card p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <AlertCircle size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-surface-800">Informasi Tambahan</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Data Mikrobiota *</label>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 cursor-pointer p-2 px-4 rounded-lg border ${formData.has_mikrobiota_data ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-surface-200'}`}>
                        <input type="radio" checked={formData.has_mikrobiota_data} onChange={() => setFormData(p => ({...p, has_mikrobiota_data: true}))} className="hidden" />
                        <span>Ya</span>
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer p-2 px-4 rounded-lg border ${!formData.has_mikrobiota_data ? 'bg-surface-50 border-surface-500 text-surface-700' : 'bg-white border-surface-200'}`}>
                        <input type="radio" checked={!formData.has_mikrobiota_data} onChange={() => setFormData(p => ({...p, has_mikrobiota_data: false, mikrobiota: ''}))} className="hidden" />
                        <span>Tidak</span>
                      </label>
                    </div>
                  </div>
                  {formData.has_mikrobiota_data && (
                    <div>
                      <label className="form-label">Hasil Mikrobiota</label>
                      <textarea value={formData.mikrobiota} onChange={handleChange} name="mikrobiota" className="form-input h-20" placeholder="Hasil pemeriksaan..." />
                    </div>
                  )}
                  <div>
                    <label className="form-label">Alergi Makanan</label>
                    <input type="text" value={formData.alergi} onChange={handleChange} name="alergi" className="form-input" placeholder="Misal: Telur, Ikan" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-10 py-3.5 text-base flex items-center gap-2 shadow-xl shadow-primary-500/20"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  <span>{existingChild ? 'Update Data Anak' : 'Simpan Data Anak'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Users size={48} className="text-surface-300 mx-auto mb-4" />
              <p className="text-surface-500 font-medium italic">Silakan pilih akun Orang Tua terlebih dahulu untuk mengisi data.</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
