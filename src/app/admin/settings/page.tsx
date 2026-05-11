'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Settings as SettingsIcon, 
  Save, 
  Loader2, 
  ArrowLeft, 
  Layout, 
  Type, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Database,
  Download,
  RefreshCw,
  FileCode,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { AppSettings } from '@/lib/types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      setSettings(data);
      setBrandName(data.brand_name);
      setLogoUrl(data.logo_url || '');
      
      // If DB has values, use them. If not, fetch from ENV API
      if (data.gemini_api_key || data.supabase_url) {
        setGeminiKey(data.gemini_api_key || '');
        setSupabaseUrl(data.supabase_url || '');
        setSupabaseRoleKey(data.supabase_service_role_key || '');
      } else {
        fetchEnvVariables();
      }
    } else {
      fetchEnvVariables();
    }
    setLoading(false);
  }, []);

  const fetchEnvVariables = async () => {
    try {
      const res = await fetch('/api/admin/get-env');
      const envData = await res.json();
      if (!envData.error) {
        setGeminiKey(prev => prev || envData.gemini_api_key);
        setSupabaseUrl(prev => prev || envData.supabase_url);
        setSupabaseRoleKey(prev => prev || envData.supabase_service_role_key);
      }
    } catch (err) {
      console.error('Failed to fetch ENV', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Format file harus berupa gambar.' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('brand')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      setMessage({ type: 'success', text: 'Logo berhasil diunggah! Klik Simpan untuk menerapkan.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal unggah gambar: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const { error } = await supabase
      .from('settings')
      .update({
        brand_name: brandName,
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Pengaturan berhasil diperbarui!' });
      window.dispatchEvent(new Event('settingsUpdated'));
    }
    setSaving(false);
  };

  // CONNECTION TESTING
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; message: string; success: boolean | null }>>({
    gemini: { loading: false, message: '', success: null },
    supabase: { loading: false, message: '', success: null }
  });

  // CHART RECOMMENDATION TESTING
  const [testChartStatus, setTestChartStatus] = useState<{ loading: boolean; message: string; success: boolean | null }>({
    loading: false, message: '', success: null
  });

  // ENVIRONMENT CHECK
  const [envCheckStatus, setEnvCheckStatus] = useState<{ loading: boolean; message: string; success: boolean | null }>({
    loading: false, message: '', success: null
  });

  const checkEnvironment = async () => {
    setEnvCheckStatus({ loading: true, message: '', success: null });
    
    try {
      const response = await fetch('/api/admin/check-env');
      const data = await response.json();
      
      setEnvCheckStatus({ 
        loading: false, 
        message: data.message, 
        success: data.success 
      });
    } catch (err: any) {
      setEnvCheckStatus({ 
        loading: false, 
        message: 'Gagal memeriksa environment variables.', 
        success: false 
      });
    }
  };

  const testChartRecommendation = async () => {
    setTestChartStatus({ loading: true, message: '', success: null });
    
    try {
      // Sample data untuk test
      const testData = {
        childId: 'test-child-123',
        chartData: {
          berat_badan: [8.5, 9.0, 9.2],
          tinggi_badan: [70, 72, 73],
          umur_bulan: [12, 13, 14],
          dates: ['2024-01-01', '2024-02-01', '2024-03-01']
        },
        childInfo: {
          nama_anak: 'Test Child',
          jenis_kelamin: 'Laki-laki',
          umur_bulan: 14,
          alergi: 'Tidak ada'
        },
        currentStatus: {
          bbStatus: 'kurang',
          tbStatus: 'normal',
          trend: 'naik' as const
        }
      };

      const response = await fetch('/api/chart-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      
      if (data.success && data.recommendation) {
        setTestChartStatus({ 
          loading: false, 
          message: 'Rekomendasi grafik berhasil! AI dapat menganalisis data pertumbuhan anak.', 
          success: true 
        });
      } else {
        setTestChartStatus({ 
          loading: false, 
          message: data.error || 'Test gagal tanpa pesan error.', 
          success: false 
        });
      }
    } catch (err: any) {
      setTestChartStatus({ 
        loading: false, 
        message: 'Terjadi kesalahan sistem saat test rekomendasi grafik.', 
        success: false 
      });
    }
  };

  const testConnection = async (service: 'gemini' | 'supabase') => {
    setTestStatus(prev => ({ ...prev, [service]: { ...prev[service], loading: true, message: '' } }));
    
    try {
      const config = service === 'gemini' 
        ? { apiKey: geminiKey }
        : { url: supabaseUrl, key: supabaseRoleKey };

      const response = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, config }),
      });

      const data = await response.json();
      setTestStatus(prev => ({ 
        ...prev, 
        [service]: { loading: false, message: data.message, success: data.success } 
      }));
    } catch (err: any) {
      setTestStatus(prev => ({ 
        ...prev, 
        [service]: { loading: false, message: 'Terjadi kesalahan sistem.', success: false } 
      }));
    }
  };

  const [geminiKey, setGeminiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseRoleKey, setSupabaseRoleKey] = useState('');

  // Helper to format values for SQL
  const formatSQLValue = (value: any) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return value;
  };

  // BACKUP FUNCTION (SQL FORMAT)
  const handleFullBackup = async () => {
    setIsBackupLoading(true);
    try {
      const supabase = createClient();
      const tables = ['profiles', 'children', 'histori_perkembangan', 'menus', 'edukasi', 'settings'];
      let sqlContent = `-- NutriTrack Backup\n-- Generated on ${new Date().toLocaleString()}\n\n`;

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;

        if (data && data.length > 0) {
          sqlContent += `-- Table: ${table}\n`;
          const columns = Object.keys(data[0]).join(', ');
          
          data.forEach(row => {
            const values = Object.values(row).map(val => formatSQLValue(val)).join(', ');
            sqlContent += `INSERT INTO public.${table} (${columns}) VALUES (${values}) ON CONFLICT (id) DO UPDATE SET ${Object.keys(row).map(k => `${k} = EXCLUDED.${k}`).join(', ')};\n`;
          });
          sqlContent += '\n';
        }
      }

      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_nutritrack_${new Date().toISOString().split('T')[0]}.sql`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup SQL berhasil diunduh!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Gagal melakukan backup SQL: ' + err.message });
    } finally {
      setIsBackupLoading(false);
    }
  };

  // Update setSettings to populate these
  useEffect(() => {
    if (settings) {
      setGeminiKey(settings.gemini_api_key || '');
      setSupabaseUrl(settings.supabase_url || '');
      setSupabaseRoleKey(settings.supabase_service_role_key || '');
    }
  }, [settings]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const { error } = await supabase
      .from('settings')
      .update({
        brand_name: brandName,
        logo_url: logoUrl,
        gemini_api_key: geminiKey || null,
        supabase_url: supabaseUrl || null,
        supabase_service_role_key: supabaseRoleKey || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Pengaturan berhasil diperbarui!' });
      window.dispatchEvent(new Event('settingsUpdated'));
      fetchSettings();
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-primary-500" size={42} />
      <p className="text-surface-500 font-medium animate-pulse">Memuat pengaturan...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen pb-20">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-surface-400 hover:text-primary-600 transition-colors mb-2">
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-surface-800 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20">
            <SettingsIcon className="text-white" size={24} />
          </div>
          Pengaturan <span className="gradient-text">Aplikasi</span>
        </h1>
        <p className="text-surface-500 mt-1 max-w-md">Konfigurasi identitas, API, dan manajemen data SQL NutriTrack.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start animate-fade-in-up animate-delay-100">
        <div className="lg:col-span-2 space-y-8">
          
          <form onSubmit={handleSaveAll} className="space-y-8">
            {message.text && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            {/* Visual Settings */}
            <div className="glass-card p-8 border-surface-200">
              <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 mb-8 uppercase tracking-wider">
                <ImageIcon size={18} className="text-primary-500" />
                Identitas Visual
              </h3>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Type size={14} /> Nama Brand Aplikasi
                  </label>
                  <input 
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="form-input !py-4 !px-5 text-lg font-bold"
                    placeholder="Contoh: NutriTrack"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <ImageIcon size={14} /> Logo Aplikasi
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div onClick={() => fileInputRef.current?.click()} className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${uploading ? 'bg-surface-50 border-surface-300' : 'bg-white border-surface-200 hover:border-primary-400 hover:bg-primary-50/10'}`}>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                      {uploading ? <Loader2 size={32} className="animate-spin text-primary-500" /> : <><div className="p-3 bg-primary-50 text-primary-600 rounded-full mb-2"><Upload size={20} /></div><p className="text-xs font-bold text-surface-700">Ganti dengan Gambar</p></>}
                    </div>
                    <div className="relative group self-center">
                      <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="form-input !py-4 !px-5 text-xs h-full" placeholder="Atau URL logo..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System & API Configuration */}
            <div className="glass-card p-8 border-surface-200 bg-surface-50/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 uppercase tracking-wider">
                  <RefreshCw size={18} className="text-amber-500" />
                  Konfigurasi Sistem & API
                </h3>
                <button 
                  type="button"
                  onClick={checkEnvironment}
                  disabled={envCheckStatus.loading}
                  className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-all flex items-center gap-1.5"
                >
                  {envCheckStatus.loading ? <Loader2 size={10} className="animate-spin" /> : <Database size={10} />}
                  Check Environment
                </button>
              </div>

              {envCheckStatus.message && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm ${
                  envCheckStatus.success ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {envCheckStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  {envCheckStatus.message}
                </div>
              )}

              <div className="space-y-8">
                {/* Gemini API */}
                <div className="space-y-4 p-6 bg-white rounded-3xl border border-surface-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Sparkles size={14} className="text-primary-500" /> Google Gemini API Key
                    </label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => testConnection('gemini')}
                        disabled={testStatus.gemini.loading}
                        className="text-[10px] font-bold text-primary-600 hover:bg-primary-50 px-3 py-1 rounded-full border border-primary-100 transition-all flex items-center gap-1.5"
                      >
                        {testStatus.gemini.loading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                        Test Koneksi
                      </button>
                      <button 
                        type="button"
                        onClick={() => testChartRecommendation()}
                        disabled={testChartStatus.loading}
                        className="text-[10px] font-bold text-green-600 hover:bg-green-50 px-3 py-1 rounded-full border border-green-100 transition-all flex items-center gap-1.5"
                      >
                        {testChartStatus.loading ? <Loader2 size={10} className="animate-spin" /> : <BarChart3 size={10} />}
                        Test Grafik
                      </button>
                    </div>
                  </div>
                  <input 
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="form-input text-xs font-mono"
                    placeholder="AIzaSy..."
                  />
                  {testStatus.gemini.message && (
                    <p className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${testStatus.gemini.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {testStatus.gemini.message}
                    </p>
                  )}
                  {testChartStatus.message && (
                    <p className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${testChartStatus.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <strong>Test Grafik:</strong> {testChartStatus.message}
                    </p>
                  )}
                  <p className="text-[10px] text-surface-400 italic">Kosongkan untuk menggunakan API Key bawaan dari .env</p>
                </div>

                {/* Supabase */}
                <div className="space-y-4 p-6 bg-white rounded-3xl border border-surface-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Database size={14} className="text-blue-500" /> Supabase Connection
                    </label>
                    <button 
                      type="button"
                      onClick={() => testConnection('supabase')}
                      disabled={testStatus.supabase.loading}
                      className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-all flex items-center gap-1.5"
                    >
                      {testStatus.supabase.loading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                      Test Koneksi
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-surface-400 ml-1">SUPABASE URL</p>
                      <input 
                        type="text"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="form-input text-xs font-mono"
                        placeholder="https://xxx.supabase.co"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-surface-400 ml-1">SERVICE ROLE KEY</p>
                      <input 
                        type="password"
                        value={supabaseRoleKey}
                        onChange={(e) => setSupabaseRoleKey(e.target.value)}
                        className="form-input text-xs font-mono"
                        placeholder="sb_secret_..."
                      />
                    </div>
                  </div>
                  {testStatus.supabase.message && (
                    <p className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${testStatus.supabase.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {testStatus.supabase.message}
                    </p>
                  )}
                  <p className="text-[10px] text-surface-400 italic font-medium text-amber-600 flex items-center gap-1">
                    <AlertCircle size={10} /> Hati-hati: Key ini bersifat sangat rahasia.
                  </p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving || uploading} className="btn-primary w-full sm:w-auto px-10 py-4 text-sm font-bold shadow-xl shadow-primary-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>Simpan Semua Pengaturan</span>
            </button>
          </form>

          {/* SQL DATABASE MANAGEMENT SECTION */}
          <div className="glass-card p-8 sm:p-10 border-surface-200 bg-surface-50/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 uppercase tracking-wider">
                  <Database size={18} className="text-indigo-500" />
                  Manajemen Data (SQL)
                </h3>
                <p className="text-[11px] text-surface-500 mt-1">Ekspor data aplikasi ke format standar SQL.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-surface-100 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Download size={24} /></div>
                <div><h4 className="font-bold text-surface-800">Ekspor SQL</h4><p className="text-[10px] text-surface-400 mt-1">Unduh instruksi INSERT SQL untuk seluruh data aplikasi.</p></div>
                <button 
                  onClick={handleFullBackup}
                  disabled={isBackupLoading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isBackupLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Unduh .sql Sekarang
                </button>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center"><FileCode size={24} /></div>
                <div><h4 className="font-bold text-surface-800">Cara Restore</h4><p className="text-[10px] text-surface-500 mt-1">Anda dapat menjalankan isi file .sql yang diunduh langsung di **SQL Editor Supabase Dashboard**.</p></div>
                <div className="text-[9px] bg-white/50 p-3 rounded-lg text-blue-800 italic">
                  Catatan: Menggunakan .sql jauh lebih stabil untuk pemulihan database skala besar.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Preview Sticky */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="glass-card p-8 border-surface-200 bg-white shadow-xl">
            <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 mb-6">
              <Layout size={18} className="text-primary-500" />
              Pratinjau Sidebar
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="bg-surface-50 rounded-2xl p-4 flex items-center gap-3 border border-surface-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 overflow-hidden text-white font-black">
                    {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : brandName.substring(0, 1) || 'N'}
                  </div>
                  <div><h4 className="text-sm font-extrabold text-primary-600 leading-none">{brandName || 'NutriTrack'}</h4><p className="text-[10px] text-surface-400 mt-1">Stunting Tracker</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sparkles import needed for Gemini label
import { Sparkles } from 'lucide-react';
