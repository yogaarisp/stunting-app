'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edukasi } from '@/lib/types';
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
  Loader2
} from 'lucide-react';

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

export default function EdukasiPage() {
  const [edukasiList, setEdukasiList] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEdukasi = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('edukasi').select('*').order('created_at', { ascending: true });
    setEdukasiList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEdukasi();
  }, [fetchEdukasi]);

  const articles = edukasiList.filter(item => item.tipe === 'artikel');
  const videos = edukasiList.filter(item => item.tipe === 'video');

  return (
    <div className="p-6 lg:p-8 space-y-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
          Edukasi <span className="gradient-text">Stunting</span>
        </h1>
        <p className="text-surface-500 mt-1">
          Pelajari tentang stunting, pencegahan, dan nutrisi penting untuk pertumbuhan anak
        </p>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200/50 animate-fade-in-up animate-delay-100">
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
        <div className="flex justify-center p-12">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Articles */}
          {articles.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 animate-fade-in-up animate-delay-100">
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
                      className="glass-card p-6 group block animate-fade-in-up"
                      style={{ animationDelay: `${(index % 5 + 2) * 100}ms` }}
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
                      <p className="text-sm text-surface-500 leading-relaxed">{article.deskripsi}</p>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-2 mb-6 animate-fade-in-up">
                <PlayCircle size={22} className="text-primary-600" />
                <h2 className="text-xl font-bold text-surface-800">Video Edukasi</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <a
                    key={video.id}
                    href={video.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-6 flex items-start gap-4 group animate-fade-in-up"
                    style={{ animationDelay: `${(index % 4 + 2) * 100}ms` }}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="text-2xl">{video.thumbnail_url || '📺'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-surface-800 mb-1 group-hover:text-primary-700 transition-colors text-sm lg:text-base">
                        {video.judul}
                      </h3>
                      <p className="text-xs lg:text-sm text-surface-500 leading-relaxed">{video.deskripsi}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-red-500">
                        <PlayCircle size={14} />
                        Tonton Video
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Tips Section */}
      <section className="glass-card p-6 lg:p-8 animate-fade-in-up mt-8">
        <h2 className="text-xl font-bold text-surface-800 mb-6">💡 Tips Pencegahan Stunting</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Berikan ASI eksklusif selama 6 bulan pertama',
            'Mulai MPASI yang kaya nutrisi pada usia 6 bulan',
            'Pantau pertumbuhan anak secara rutin di Posyandu',
            'Pastikan imunisasi anak lengkap sesuai jadwal',
            'Berikan makanan tinggi protein hewani dan nabati',
            'Jaga kebersihan makanan dan lingkungan anak',
            'Berikan suplemen vitamin dan mineral sesuai anjuran dokter',
            'Konsultasikan ke dokter jika pertumbuhan anak terhambat',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary-700">{i + 1}</span>
              </div>
              <p className="text-sm text-surface-600 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
