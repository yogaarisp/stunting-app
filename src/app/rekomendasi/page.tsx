'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Child, Menu } from '@/lib/types';
import { analisisPertumbuhan, filterMenuRekomendasi, AnalisisStatus, BADGE_CONFIG, BadgeType } from '@/lib/recommendations';
import {
  Utensils,
  Flame,
  Milk,
  Beef,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Baby,
  Info,
  Brain,
} from 'lucide-react';
import Link from 'next/link';

const kategoriConfig: Record<string, { label: string; icon: typeof Flame; color: string; bgColor: string }> = {
  tinggi_kalori: { label: 'Tinggi Kalori', icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  tinggi_protein: { label: 'Tinggi Protein', icon: Beef, color: 'text-red-600', bgColor: 'bg-red-50' },
  tinggi_kalsium: { label: 'Tinggi Kalsium', icon: Milk, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  probiotik: { label: 'Probiotik', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-50' },
  normal: { label: 'Seimbang', icon: Utensils, color: 'text-primary-600', bgColor: 'bg-primary-50' },
  nutrisi_otak: { label: 'Nutrisi Otak', icon: Brain, color: 'text-violet-600', bgColor: 'bg-violet-50' },
};

const badgeIcons: Record<string, typeof Flame> = {
  Flame,
  Brain,
};

export default function RekomendasiPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: menuData } = await supabase
      .from('menus')
      .select('*');

    if (childData && menuData) {
      setChild(childData);
      setMenus(menuData);
      const analisisResult = analisisPertumbuhan(childData);
      setAnalisis(analisisResult);
      setFilteredMenus(filterMenuRekomendasi(menuData, analisisResult.kategoriRekomendasi));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-96" />
        <div className="skeleton h-32 rounded-2xl mt-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
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
            Masukkan data fisik anak terlebih dahulu untuk mendapatkan rekomendasi menu makanan.
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
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
          Rekomendasi <span className="gradient-text">Menu</span>
        </h1>
        <p className="text-surface-500 mt-1">
          Rekomendasi makanan bergizi untuk {child.nama_anak} berdasarkan analisis pertumbuhan (Standar WHO — {analisis?.genderUsed})
        </p>
      </div>

      {/* Analysis Summary */}
      {analisis && (
        <div className={`glass-card p-6 animate-fade-in-up animate-delay-100 ${
          analisis.riskLevel === 'tinggi' ? 'risk-high' :
          analisis.riskLevel === 'sedang' ? 'risk-medium' : 'risk-low'
        }`}>
          <div className="flex items-start gap-4">
            {analisis.riskLevel === 'rendah' ? (
              <CheckCircle2 size={24} className="text-primary-600 mt-0.5" />
            ) : (
              <AlertTriangle size={24} className="text-amber-600 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-surface-800 mb-1">Hasil Analisis</h3>
              <p className="text-surface-600 text-sm leading-relaxed">{analisis.pesan}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {analisis.kategoriRekomendasi.map((kat) => {
                  const config = kategoriConfig[kat];
                  const Icon = config?.icon || Utensils;
                  return (
                    <span
                      key={kat}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${config?.bgColor || 'bg-surface-100'} ${config?.color || 'text-surface-600'}`}
                    >
                      <Icon size={14} />
                      {config?.label || kat}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === ACTIVE BADGES SECTION === */}
      {analisis && analisis.badges.length > 0 && (
        <div className="space-y-3 animate-fade-in-up animate-delay-100">
          <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={14} />
            Perhatian Khusus
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {analisis.badges.map((badgeType: BadgeType) => {
              const badge = BADGE_CONFIG[badgeType];
              const IconComponent = badgeIcons[badge.icon] || AlertTriangle;
              return (
                <div
                  key={badgeType}
                  className={`${badge.bgColor} border border-surface-200/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm ${badge.color}`}>
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${badge.color}`}>{badge.label}</p>
                    <p className="text-surface-600 text-xs mt-1 leading-relaxed">{badge.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {badge.menuKategori.map(k => {
                        const cat = kategoriConfig[k];
                        return (
                          <span key={k} className={`text-[10px] font-bold px-2 py-0.5 rounded ${cat?.bgColor || 'bg-surface-100'} ${cat?.color || 'text-surface-600'}`}>
                            Menu: {cat?.label || k}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stat Bars */}
      {analisis && (
        <div className="grid md:grid-cols-3 gap-5 animate-fade-in-up animate-delay-200">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-surface-600">Berat Badan / Standar</span>
              <span className={`badge ${analisis.bbStatus === 'normal' ? 'badge-success' : 'badge-danger'}`}>
                {analisis.bbPersentase}%
              </span>
            </div>
            <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  analisis.bbStatus === 'normal'
                    ? 'bg-gradient-to-r from-primary-400 to-primary-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(analisis.bbPersentase, 100)}%` }}
              />
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-surface-600">Tinggi Badan / Standar</span>
              <span className={`badge ${analisis.tbStatus === 'normal' ? 'badge-success' : 'badge-danger'}`}>
                {analisis.tbPersentase}%
              </span>
            </div>
            <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  analisis.tbStatus === 'normal'
                    ? 'bg-gradient-to-r from-primary-400 to-primary-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(analisis.tbPersentase, 100)}%` }}
              />
            </div>
          </div>
          {analisis.lkPersentase !== null && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-surface-600">Lingkar Kepala / Standar</span>
                <span className={`badge ${analisis.lkStatus === 'normal' ? 'badge-success' : 'badge-danger'}`}>
                  {analisis.lkPersentase}%
                </span>
              </div>
              <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    analisis.lkStatus === 'normal'
                      ? 'bg-gradient-to-r from-violet-400 to-violet-500'
                      : 'bg-gradient-to-r from-red-400 to-red-500'
                  }`}
                  style={{ width: `${Math.min(analisis.lkPersentase, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu Cards */}
      <div>
        <h2 className="text-xl font-bold text-surface-800 mb-5 animate-fade-in-up animate-delay-200">
          Menu yang Direkomendasikan
        </h2>
        {filteredMenus.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu, index) => {
              const config = kategoriConfig[menu.kategori];
              const Icon = config?.icon || Utensils;
              return (
                <div
                  key={menu.id}
                  className="glass-card overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  {/* Card Header Gradient */}
                  <div className={`h-2 bg-gradient-to-r ${
                    menu.kategori === 'tinggi_kalori' ? 'from-orange-400 to-amber-400' :
                    menu.kategori === 'tinggi_protein' ? 'from-red-400 to-rose-400' :
                    menu.kategori === 'tinggi_kalsium' ? 'from-blue-400 to-cyan-400' :
                    menu.kategori === 'probiotik' ? 'from-green-400 to-emerald-400' :
                    menu.kategori === 'nutrisi_otak' ? 'from-violet-400 to-purple-400' :
                    'from-primary-400 to-primary-500'
                  }`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${config?.bgColor || 'bg-surface-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={config?.color || 'text-surface-600'} />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${config?.bgColor || 'bg-surface-100'} ${config?.color || 'text-surface-600'}`}>
                        {config?.label || menu.kategori}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-surface-800 mb-2">{menu.nama_menu}</h3>
                    {menu.deskripsi && (
                      <p className="text-sm text-surface-500 mb-4 leading-relaxed">{menu.deskripsi}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-4">
                      <Info size={12} />
                      <span>{menu.nutrisi}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-surface-100">
                      {menu.kalori && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-surface-800">{menu.kalori}</p>
                          <p className="text-xs text-surface-400">kkal</p>
                        </div>
                      )}
                      {menu.protein && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-surface-800">{menu.protein}g</p>
                          <p className="text-xs text-surface-400">protein</p>
                        </div>
                      )}
                      {menu.kalsium && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-surface-800">{menu.kalsium}mg</p>
                          <p className="text-xs text-surface-400">kalsium</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Utensils size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-500">Tidak ada menu yang sesuai ditemukan.</p>
          </div>
        )}
      </div>

      {/* Note about allergies */}
      {child.alergi && (
        <div className="glass-card p-5 flex items-start gap-3 animate-fade-in-up">
          <AlertTriangle size={20} className="text-amber-500 mt-0.5" />
          <div>
            <p className="font-semibold text-surface-700 text-sm">Catatan Alergi</p>
            <p className="text-surface-500 text-sm mt-1">
              Anak Anda memiliki alergi terhadap: <span className="font-medium text-amber-700">{child.alergi}</span>.
              Pastikan menu yang dipilih tidak mengandung alergen tersebut.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
