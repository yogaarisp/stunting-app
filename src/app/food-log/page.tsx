'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Child, FoodPhoto } from '@/lib/types';
import {
  Camera,
  Upload,
  Loader2,
  Trash2,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Baby,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

const MEAL_TYPES = [
  { value: 'sarapan', label: 'Sarapan', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'makan_siang', label: 'Makan Siang', icon: Sun, color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'makan_malam', label: 'Makan Malam', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'snack', label: 'Snack', icon: Cookie, color: 'text-pink-600', bg: 'bg-pink-50' },
];

export default function FoodLogPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [photos, setPhotos] = useState<FoodPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMealType, setUploadMealType] = useState<string>('sarapan');
  const [uploadCaption, setUploadCaption] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (childData) {
      setChild(childData);

      const { data: photoData } = await supabase
        .from('food_photos')
        .select('*')
        .eq('child_id', childData.id)
        .eq('photo_date', selectedDate)
        .order('created_at', { ascending: true });

      setPhotos(photoData || []);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !child) return;

    setUploading(true);
    setError('');
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Tidak terautentikasi');

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('food-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from('food_photos').insert({
        child_id: child.id,
        user_id: user.id,
        photo_url: urlData.publicUrl,
        caption: uploadCaption.trim() || null,
        meal_type: uploadMealType,
        photo_date: selectedDate,
      });

      if (dbError) throw dbError;

      setSuccess('Foto berhasil diupload!');
      setUploadCaption('');
      setShowUploadModal(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal mengupload foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photo: FoodPhoto) => {
    if (!confirm('Hapus foto ini?')) return;
    
    const supabase = createClient();
    
    // Extract file path from URL
    const url = new URL(photo.photo_url);
    const pathParts = url.pathname.split('/food-photos/');
    if (pathParts[1]) {
      await supabase.storage.from('food-photos').remove([pathParts[1]]);
    }

    await supabase.from('food_photos').delete().eq('id', photo.id);
    fetchData();
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-64 rounded-2xl mt-6" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 mb-6">
            <Baby size={40} className="text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-800 mb-3">Data Belum Tersedia</h2>
          <p className="text-surface-500 mb-8 leading-relaxed">
            Masukkan data anak terlebih dahulu sebelum menggunakan log makanan.
          </p>
          <Link href="/input" className="btn-primary px-8 py-3.5 text-lg">
            Input Data Anak
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
          Log <span className="gradient-text">Makanan</span>
        </h1>
        <p className="text-surface-500 mt-1">
          Dokumentasi makanan harian {child.nama_anak} untuk pemantauan gizi
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 bg-primary-50 border border-primary-200 text-primary-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-up">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Date Navigation */}
      <div className="glass-card p-4 flex items-center justify-between animate-fade-in-up animate-delay-100">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-surface-600" />
        </button>
        <div className="text-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="text-center bg-transparent text-lg font-bold text-surface-800 border-none outline-none cursor-pointer"
          />
          {isToday && <p className="text-xs text-primary-600 font-semibold">Hari Ini</p>}
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className={`p-2 rounded-xl transition-colors ${isToday ? 'opacity-30' : 'hover:bg-surface-100'}`}
        >
          <ChevronRight size={20} className="text-surface-600" />
        </button>
      </div>

      {/* Meal Type Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-200">
        {MEAL_TYPES.map((meal) => {
          const mealPhotos = photos.filter(p => p.meal_type === meal.value);
          const Icon = meal.icon;
          return (
            <div key={meal.value} className="glass-card p-5 text-center group">
              <div className={`w-12 h-12 rounded-xl ${meal.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={meal.color} />
              </div>
              <p className="text-sm font-bold text-surface-800">{meal.label}</p>
              <p className="text-xs text-surface-400 mt-1">
                {mealPhotos.length > 0 ? `${mealPhotos.length} foto` : 'Belum ada'}
              </p>
              {mealPhotos.length === 0 && (
                <button
                  onClick={() => {
                    setUploadMealType(meal.value);
                    setShowUploadModal(true);
                  }}
                  className="mt-3 text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider"
                >
                  + Upload
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 ? (
        <div className="space-y-4 animate-fade-in-up animate-delay-300">
          <h2 className="text-lg font-bold text-surface-800 flex items-center gap-2">
            <Camera size={20} className="text-primary-500" />
            Foto Makanan Hari Ini
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => {
              const meal = MEAL_TYPES.find(m => m.value === photo.meal_type);
              return (
                <div key={photo.id} className="glass-card overflow-hidden group">
                  <div className="aspect-square relative overflow-hidden bg-surface-100">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Foto makanan'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => handleDelete(photo)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-3">
                    {meal && (
                      <span className={`text-[10px] font-bold ${meal.color} ${meal.bg} px-2 py-0.5 rounded-full uppercase`}>
                        {meal.label}
                      </span>
                    )}
                    {photo.caption && (
                      <p className="text-xs text-surface-600 mt-2 line-clamp-2">{photo.caption}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center animate-fade-in-up animate-delay-300">
          <ImageIcon size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500 text-sm font-medium">
            Belum ada foto makanan untuk tanggal ini
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary mt-4 px-6 py-2.5 text-sm"
          >
            <Camera size={16} />
            Upload Foto Pertama
          </button>
        </div>
      )}

      {/* FAB Upload Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-20 right-20 lg:bottom-6 lg:right-24 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/30 hover:scale-110 transition-transform"
      >
        <Camera size={24} className="text-white" />
      </button>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-800">📸 Upload Foto Makanan</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-surface-400 hover:text-surface-700 rounded-xl">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Meal type selection */}
              <div>
                <label className="form-label">Waktu Makan</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {MEAL_TYPES.map((meal) => {
                    const Icon = meal.icon;
                    return (
                      <button
                        key={meal.value}
                        type="button"
                        onClick={() => setUploadMealType(meal.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all ${
                          uploadMealType === meal.value
                            ? `${meal.bg} ${meal.color} border-2 border-current shadow-sm`
                            : 'bg-surface-50 text-surface-600 border-2 border-transparent hover:bg-surface-100'
                        }`}
                      >
                        <Icon size={16} />
                        {meal.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="form-label">Keterangan (opsional)</label>
                <input
                  id="caption"
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Contoh: Nasi tim ayam sayur"
                  className="form-input"
                />
              </div>

              {/* File Input */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Pilih & Upload Foto
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
