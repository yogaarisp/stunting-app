'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Child, ChildFormData } from '@/lib/types';
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
} from 'lucide-react';

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
  mikrobiota: 'Baik',
};

export default function InputPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ChildFormData>(initialFormData);
  const [existingChild, setExistingChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchExisting = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .single();

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
        mikrobiota: data.mikrobiota || 'Baik',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExisting();
  }, [fetchExisting]);

  const calculateAgeInMonths = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    
    // Jika hari ini belum mencapai hari lahir di bulan ini, kurangi 1 bulan
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Konversi nilai angka secara aman, lainnya string
    const val = type === 'number' 
      ? (value === '' ? 0 : parseFloat(value))
      : value;

    setFormData((prev) => {
      const newState = { 
        ...prev, 
        [name]: val 
      } as ChildFormData;
      
      // Jika yang berubah adalah tanggal lahir, hitung umur otomatis
      if (name === 'tanggal_lahir' && typeof val === 'string') {
        newState.umur_bulan = calculateAgeInMonths(val);
      }
      
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Sesi login telah berakhir. Silakan login ulang.');
      setSaving(false);
      return;
    }

    // Pembersihan data sebelum dikirim ke database (Mencegah Error 400)
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
      mikrobiota: formData.mikrobiota,
    };

    try {
      if (existingChild) {
        // UPDATE existing child (Upsert behavior)
        const { error: updateError } = await supabase
          .from('children')
          .update(cleanData)
          .eq('id', existingChild.id);

        if (updateError) throw updateError;

        // Save to history
        const { error: histError } = await supabase
          .from('histori_perkembangan')
          .insert({
            child_id: existingChild.id,
            berat_badan: cleanData.berat_badan,
            tinggi_badan: cleanData.tinggi_badan,
            lingkar_lengan: cleanData.lingkar_lengan,
            lingkar_kepala: cleanData.lingkar_kepala,
            umur_bulan: cleanData.umur_bulan,
          });

        if (histError) throw histError;
      } else {
        // INSERT new child
        const { data: newChild, error: insertError } = await supabase
          .from('children')
          .insert({
            user_id: user.id,
            ...cleanData
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Save first history entry
        if (newChild) {
          await supabase.from('histori_perkembangan').insert({
            child_id: newChild.id,
            berat_badan: cleanData.berat_badan,
            tinggi_badan: cleanData.tinggi_badan,
            lingkar_lengan: cleanData.lingkar_lengan,
            lingkar_kepala: cleanData.lingkar_kepala,
            umur_bulan: cleanData.umur_bulan,
          });
          setExistingChild(newChild);
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Database Error:', err);
      const message = err.details || err.message || 'Terjadi kesalahan saat menyimpan data.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-[600px] rounded-2xl mt-8" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
          {existingChild ? 'Update' : 'Input'} <span className="gradient-text">Data Anak</span>
        </h1>
        <p className="text-surface-500 mt-1">
          {existingChild
            ? 'Perbarui data fisik anak untuk mendapatkan analisis terbaru.'
            : 'Masukkan data fisik anak Anda untuk memulai pemantauan.'}
        </p>
        {existingChild && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium animate-shake">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="font-bold">Mode Update Rutin Aktif</p>
                <p className="text-amber-600 text-xs">Identitas utama dikunci untuk menjaga integritas grafik.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-white text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors shadow-sm text-xs font-bold"
            >
              Ubah Identitas Utama di Profil
            </button>
          </div>
        )}
      </div>

      {/* Form */}
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

        {/* Identitas Anak */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Baby size={20} className="text-white" />
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
                className={`form-input ${existingChild ? 'bg-surface-100 cursor-not-allowed opacity-70' : ''}`}
                required
                readOnly={!!existingChild}
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
                className={`form-input ${existingChild ? 'bg-surface-100 cursor-not-allowed opacity-70' : ''}`}
                readOnly={!!existingChild}
              />
            </div>
            <div>
              <label htmlFor="jenis_kelamin" className="form-label">Jenis Kelamin *</label>
              <select
                id="jenis_kelamin"
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className={`form-input ${existingChild ? 'bg-surface-100 cursor-not-allowed opacity-70' : ''}`}
                required
                disabled={!!existingChild}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Stethoscope size={20} className="text-white" />
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
                  Lingkar Lengan Atas (cm)
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
                min="0"
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
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Informasi Tambahan */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <AlertCircle size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-surface-800">Informasi Tambahan</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="mikrobiota" className="form-label">Kondisi Mikrobiota Usus *</label>
              <select
                id="mikrobiota"
                name="mikrobiota"
                value={formData.mikrobiota}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Baik">Baik - Pencernaan lancar</option>
                <option value="Cukup">Cukup - Kadang bermasalah</option>
                <option value="Kurang">Kurang - Sering bermasalah</option>
              </select>
            </div>
            <div>
              <label htmlFor="alergi" className="form-label">Alergi Makanan</label>
              <input
                id="alergi"
                name="alergi"
                type="text"
                value={formData.alergi}
                onChange={handleChange}
                placeholder="Contoh: Kacang, Susu Sapi"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            id="btn-submit-form"
            type="submit"
            disabled={saving}
            className="btn-primary px-10 py-3.5 text-base"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{existingChild ? 'Update Data' : 'Simpan Data'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
