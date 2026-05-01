'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edukasi } from '@/lib/types';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  PlayCircle,
  FileText,
  Heart,
  AlertTriangle,
  Apple,
  Baby,
  Stethoscope,
  Loader2,
  ArrowLeft
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  BookOpen,
  FileText,
  Heart,
  AlertTriangle,
  Apple,
  Baby,
  Stethoscope,
};

const COLOR_MAP = [
  { color: 'from-red-500 to-rose-500', shadow: 'shadow-red-500/15' },
  { color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/15' },
  { color: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/15' },
  { color: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/15' },
  { color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/15' },
  { color: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-500/15' },
  { color: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/15' }
];

export default function InfoStuntingPage() {
  const [edukasiList, setEdukasiList] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchEdukasi = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('edukasi').select('*').order('created_at', { ascending: true });
    setEdukasiList(data || []);
    setLoading(false);
    
    // Snappy transition: 200ms delay is enough to avoid layout flash
    setTimeout(() => {
      setMounted(true);
    }, 200); 
  }, []);

  useEffect(() => {
    fetchEdukasi();
  }, [fetchEdukasi]);

  const articles = edukasiList.filter(item => item.tipe === 'artikel');
  const videos = edukasiList.filter(item => item.tipe === 'video');

  return (
    <div className="relative min-h-screen bg-surface-50 overflow-x-hidden">
      
      {/* 
         Overlay Transisi: 
         Hanya tampil sesaat saat perpindahan halaman untuk menutup 'glitch' reposisi layout.
      */}
      <div className={`
        fixed inset-0 z-[100] bg-surface-50 transition-opacity duration-500 ease-in-out pointer-events-none
        ${mounted ? 'opacity-0' : 'opacity-100'}
      `} />

      <div className={`
        transition-all duration-500 ease-out
        ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'}
      `}>
        {/* Top Navbar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-surface-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-surface-500 hover:text-primary-600 font-medium transition-colors">
              <ArrowLeft size={20} />
              Kembali ke Beranda
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100">
                <Baby size={18} className="text-primary-600" />
              </div>
              <span className="font-bold text-surface-800 hidden sm:inline">NutriTrack Edu</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-10 pb-20">
          {/* Header */}
          <div className="mt-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-surface-800">
              Pusat Informasi <span className="gradient-text">Stunting</span>
            </h1>
            <p className="text-surface-500 mt-2 text-lg">
              Pelajari tentang stunting, pencegahan, dan nutrisi penting untuk masa depan anak.
            </p>
          </div>

          {/* Info Banner */}
          <div className="glass-card p-6 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200/50 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-surface-800">Tahukah Anda?</h3>
                <p className="text-surface-600 text-sm mt-1 leading-relaxed">
                  Menurut WHO, stunting mempengaruhi sekitar 22% anak balita di seluruh dunia.
                  Di Indonesia, prevalensi stunting mencapai 21.6% (2022). Deteksi dini dan nutrisi
                  yang tepat dapat mencegah kondisi ini.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mb-4" />
              <p className="text-surface-400 font-medium animate-pulse">Menyiapkan Informasi...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Articles */}
              {articles.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <FileText size={22} className="text-primary-600" />
                    <h2 className="text-xl font-bold text-surface-800">Artikel & Referensi</h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => {
                      const Icon = article.thumbnail_url && ICON_MAP[article.thumbnail_url] ? ICON_MAP[article.thumbnail_url] : FileText;
                      const theme = COLOR_MAP[index % COLOR_MAP.length];
                      
                      return (
                        <a
                          key={article.id}
                          href={article.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-card p-6 group block bg-white hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-lg ${theme.shadow} group-hover:scale-110 transition-transform duration-300`}>
                              <Icon size={22} className="text-white" />
                            </div>
                            <ExternalLink size={16} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
                          </div>
                          <h3 className="text-base font-bold text-surface-800 mb-2 group-hover:text-primary-700 transition-colors">
                            {article.judul}
                          </h3>
                          <p className="text-sm text-surface-500 leading-relaxed line-clamp-3">{article.deskripsi}</p>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <PlayCircle size={22} className="text-primary-600" />
                    <h2 className="text-xl font-bold text-surface-800">Video Edukasi</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {videos.map((video) => (
                      <a
                        key={video.id}
                        href={video.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-6 flex items-start gap-4 group bg-white hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <span className="text-2xl">{video.thumbnail_url || '📺'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-surface-800 mb-1 group-hover:text-primary-700 transition-colors text-sm lg:text-base">
                            {video.judul}
                          </h3>
                          <p className="text-xs lg:text-sm text-surface-500 leading-relaxed line-clamp-2">{video.deskripsi}</p>
                          <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-red-600">
                            <PlayCircle size={14} />
                            Tonton Video
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
