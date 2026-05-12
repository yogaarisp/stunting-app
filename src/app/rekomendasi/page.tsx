'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Child, AIGeneratedMenu } from '@/lib/types';
import { analisisPertumbuhan, AnalisisStatus, BADGE_CONFIG, BadgeType } from '@/lib/recommendations';
import {
  Utensils,
  Flame,
  Milk,
  Beef,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Baby,
  Info,
  Brain,
  RefreshCw,
  ChefHat,
  Clock,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const kategoriConfig: Record<string, { label: string; icon: typeof Flame; color: string; bgColor: string; gradient: string }> = {
  tinggi_kalori: { label: 'Tinggi Kalori', icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-400 to-amber-400' },
  tinggi_protein: { label: 'Tinggi Protein', icon: Beef, color: 'text-red-600', bgColor: 'bg-red-50', gradient: 'from-red-400 to-rose-400' },
  tinggi_kalsium: { label: 'Tinggi Kalsium', icon: Milk, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-400 to-cyan-400' },
  probiotik: { label: 'Probiotik', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-400 to-emerald-400' },
  normal: { label: 'Seimbang', icon: Utensils, color: 'text-primary-600', bgColor: 'bg-primary-50', gradient: 'from-primary-400 to-primary-500' },
  nutrisi_otak: { label: 'Nutrisi Otak', icon: Brain, color: 'text-violet-600', bgColor: 'bg-violet-50', gradient: 'from-violet-400 to-purple-400' },
};

const badgeIcons: Record<string, typeof Flame> = {
  Flame,
  Brain,
};

interface CookingGuide {
  nama_menu: string;
  porsi: string;
  waktu_masak: string;
  bahan: { nama: string; jumlah: string }[];
  langkah: string[];
  tips: string[];
  catatan_gizi: string;
}

export default function RekomendasiPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [researchGroup, setResearchGroup] = useState<string | null>(null);
  const [aiMenus, setAiMenus] = useState<AIGeneratedMenu[]>([]);
  const [databaseMenus, setDatabaseMenus] = useState<any[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isCached, setIsCached] = useState(false);

  // Cooking guide modal
  const [cookingModal, setCookingModal] = useState(false);
  const [cookingGuide, setCookingGuide] = useState<CookingGuide | null>(null);
  const [cookingLoading, setCookingLoading] = useState(false);
  const [cookingMenuName, setCookingMenuName] = useState('');

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch profile for research group
    const { data: profile } = await supabase
      .from('profiles')
      .select('research_group')
      .eq('id', user.id)
      .single();

    if (profile) {
      setResearchGroup(profile.research_group);
    }

    // Fetch child data
    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (childData) {
      setChild(childData);
      const analisisResult = analisisPertumbuhan(childData, profile?.research_group);
      setAnalisis(analisisResult);
      
      // Fetch database menus based on criteria
      await fetchDatabaseMenus(analisisResult.kategoriRekomendasi, childData.umur_bulan);
    }
    setLoading(false);
  }, []);

  // Fetch menus from database based on criteria
  const fetchDatabaseMenus = async (kategoriRekomendasi: string[], umurBulan: number) => {
    const supabase = createClient();
    
    try {
      // Build query for matching categories
      let query = supabase
        .from('menus')
        .select('*');

      // Filter by categories (OR condition for multiple categories)
      if (kategoriRekomendasi.length > 0) {
        query = query.or(
          kategoriRekomendasi.map(kategori => `kategori.eq.${kategori}`).join(',')
        );
      }

      const { data: menus, error } = await query.limit(6);

      if (error) {
        console.error('Error fetching database menus:', error);
        return;
      }

      console.log('Database menus fetched:', menus); // Debug log
      setDatabaseMenus(menus || []);
    } catch (err) {
      console.error('Failed to fetch database menus:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (cookingModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [cookingModal]);

  // Generate AI menu
  const generateMenus = useCallback(async (forceRefresh = false) => {
    if (!child || !analisis) return;
    
    setGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childData: {
            nama_anak: child.nama_anak,
            umur_bulan: child.umur_bulan,
            jenis_kelamin: child.jenis_kelamin,
            berat_badan: child.berat_badan,
            tinggi_badan: child.tinggi_badan,
            lingkar_kepala: child.lingkar_kepala,
            alergi: child.alergi,
            has_mikrobiota_data: child.has_mikrobiota_data,
            mikrobiota: child.mikrobiota,
          },
          researchGroup: researchGroup || 'B',
          analisisResult: {
            bbStatus: analisis.bbStatus,
            tbStatus: analisis.tbStatus,
            lkStatus: analisis.lkStatus,
            kategoriRekomendasi: analisis.kategoriRekomendasi,
            riskLevel: analisis.riskLevel,
            pesan: analisis.pesan,
          },
          childId: child.id,
          forceRefresh,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Show detailed message from server if available (e.g. Quota Exceeded or Config Error)
        throw new Error(data.message || data.error || 'Gagal generate menu');
      }

      setAiMenus(data.menus || []);
      setIsCached(data.cached || false);
    } catch (err: unknown) {
      console.error('Menu generation error:', err);
      const message = err instanceof Error ? err.message : 'Gagal menghasilkan menu. Silakan coba lagi.';
      setError(message);
    } finally {
      setGenerating(false);
    }
  }, [child, analisis, researchGroup]);

  // Menu generation is now manual — user clicks "Generate Menu" button

  // Cooking guide handler - works for both database and AI menus
  const handleCookingGuide = async (menu: any) => {
    setCookingMenuName(menu.nama_menu);
    setCookingModal(true);
    setCookingLoading(true);
    setCookingGuide(null);

    try {
      const response = await fetch('/api/cooking-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuName: menu.nama_menu,
          deskripsi: menu.deskripsi,
          bahan_utama: menu.bahan_utama || (menu.nutrisi ? menu.nutrisi.split(',').map((n: string) => n.trim()) : []),
          childAge: child?.umur_bulan || 12,
          allergies: child?.alergi || '',
        }),
      });

      const data = await response.json();
      if (data.guide) {
        setCookingGuide(data.guide);
      }
    } catch (err) {
      console.error('Cooking guide error:', err);
    } finally {
      setCookingLoading(false);
    }
  };

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
          Rekomendasi <span className="gradient-text">Menu AI</span>
        </h1>
        <p className="text-surface-500 mt-1">
          Menu makanan bergizi untuk {child.nama_anak} yang di-generate otomatis oleh AI berdasarkan analisis pertumbuhan (Standar WHO — {analisis?.genderUsed})
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

      {/* Active Badges */}
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Database Menu Section - Muncul Otomatis */}
      {databaseMenus.length > 0 && (
        <div className="animate-fade-in-up animate-delay-200">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-surface-800">Menu Rekomendasi <span className="gradient-text"></span></h2>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Otomatis</span>
          </div>
          <p className="text-surface-500 text-sm mb-6">Menu yang sesuai dengan kriteria {child.nama_anak} berdasarkan database kami.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {databaseMenus.map((menu, index) => {
              const config = kategoriConfig[menu.kategori] || kategoriConfig.normal;
              const Icon = config?.icon || Utensils;
              return (
                <div
                  key={menu.id}
                  className="glass-card overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header Gradient */}
                  <div className={`h-2 bg-gradient-to-r ${config?.gradient || 'from-primary-400 to-primary-500'}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${config?.bgColor || 'bg-surface-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={config?.color || 'text-surface-600'} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${config?.bgColor || 'bg-surface-100'} ${config?.color || 'text-surface-600'}`}>
                          {config?.label || menu.kategori}
                        </span>
                        <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          Database
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-surface-800 mb-2">{menu.nama_menu}</h3>
                    <p className="text-sm text-surface-500 mb-3 leading-relaxed">{menu.deskripsi}</p>

                    {/* Bahan utama */}
                    {menu.nutrisi && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {menu.nutrisi.split(',').map((nutrisi: string, i: number) => (
                          <span key={i} className="text-[10px] font-medium bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">
                            {nutrisi.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-4">
                      <Info size={12} />
                      <span>Menu Database</span>
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

                    {/* Cara Masak Button */}
                    <button
                      onClick={() => handleCookingGuide(menu)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-100"
                    >
                      <ChefHat size={16} />
                      Cara Masak
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Generated Menu Section */}
      <div>
        <div className="flex items-center justify-between mb-5 animate-fade-in-up animate-delay-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-surface-800">Menu <span className="gradient-text">AI Generate</span></h2>
            {isCached && (
              <span className="text-[10px] font-bold text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full uppercase">Cache</span>
            )}
          </div>
          <button
            onClick={() => generateMenus(true)}
            disabled={generating}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {generating ? 'Generating...' : 'Generate Ulang'}
          </button>
        </div>

        <p className="text-surface-500 text-sm mb-6">Menu personal yang di-generate khusus oleh AI berdasarkan kondisi {child.nama_anak}.</p>

        {/* Generating state */}
        {generating && aiMenus.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 mb-4 animate-pulse">
              <Sparkles size={32} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">AI Sedang Menyiapkan Menu...</h3>
            <p className="text-surface-500 text-sm">Menganalisis kondisi anak dan memilih menu terbaik. Mohon tunggu beberapa detik.</p>
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass-card p-6 text-center border-red-200 bg-red-50/50 animate-fade-in-up">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium text-sm mb-4">{error}</p>
            <button onClick={() => generateMenus(true)} className="btn-primary px-6 py-2.5 text-sm">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Menu Cards */}
        {aiMenus.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiMenus.map((menu, index) => {
              const config = kategoriConfig[menu.kategori] || kategoriConfig.normal;
              const Icon = config?.icon || Utensils;
              return (
                <div
                  key={index}
                  className="glass-card overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  {/* Card Header Gradient */}
                  <div className={`h-2 bg-gradient-to-r ${config?.gradient || 'from-primary-400 to-primary-500'}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${config?.bgColor || 'bg-surface-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={config?.color || 'text-surface-600'} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${config?.bgColor || 'bg-surface-100'} ${config?.color || 'text-surface-600'}`}>
                          {config?.label || menu.kategori}
                        </span>
                        <span className="text-[10px] font-medium bg-gradient-to-r from-primary-50 to-accent-50 text-primary-600 px-2 py-0.5 rounded-full border border-primary-100">
                          AI Generated
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-surface-800 mb-2">{menu.nama_menu}</h3>
                    <p className="text-sm text-surface-500 mb-3 leading-relaxed">{menu.deskripsi}</p>

                    {/* Bahan utama */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {menu.bahan_utama?.map((bahan, i) => (
                        <span key={i} className="text-[10px] font-medium bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">
                          {bahan}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-4">
                      <Info size={12} />
                      <span>{menu.nutrisi}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-surface-100">
                      {menu.kalori_estimasi && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-surface-800">{menu.kalori_estimasi}</p>
                          <p className="text-xs text-surface-400">kkal</p>
                        </div>
                      )}
                      {menu.protein_estimasi && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-surface-800">{menu.protein_estimasi}g</p>
                          <p className="text-xs text-surface-400">protein</p>
                        </div>
                      )}
                      {menu.waktu_masak && (
                        <div className="flex items-center gap-1 text-xs text-surface-400 ml-auto">
                          <Clock size={12} />
                          <span>{menu.waktu_masak}</span>
                        </div>
                      )}
                    </div>

                    {/* Cara Masak Button */}
                    <button
                      onClick={() => handleCookingGuide(menu)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 rounded-xl text-sm font-semibold hover:from-primary-100 hover:to-accent-100 transition-all duration-200 border border-primary-100"
                    >
                      <ChefHat size={16} />
                      Cara Masak
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No menus — show generate CTA */}
        {aiMenus.length === 0 && !generating && !error && (
          <div className="glass-card p-12 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 mb-6">
              <Sparkles size={40} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-surface-800 mb-2">Siap Generate Menu AI</h3>
            <p className="text-surface-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Klik tombol di bawah untuk menghasilkan rekomendasi menu makanan yang dipersonalisasi berdasarkan kondisi {child.nama_anak}.
            </p>
            <button
              onClick={() => generateMenus(false)}
              className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 mx-auto shadow-lg shadow-primary-500/20"
            >
              <Sparkles size={20} />
              Generate Menu Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Allergy Note */}
      {child.alergi && (
        <div className="glass-card p-5 flex items-start gap-3 animate-fade-in-up">
          <AlertTriangle size={20} className="text-amber-500 mt-0.5" />
          <div>
            <p className="font-semibold text-surface-700 text-sm">Catatan Alergi</p>
            <p className="text-surface-500 text-sm mt-1">
              Anak Anda memiliki alergi terhadap: <span className="font-medium text-amber-700">{child.alergi}</span>.
              Menu yang dihasilkan AI sudah memperhitungkan alergi ini.
            </p>
          </div>
        </div>
      )}

      {cookingModal && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in-up">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white px-4 py-4 border-b border-surface-100 flex items-center gap-4 z-10 shrink-0 shadow-sm">
            <button onClick={() => setCookingModal(false)} className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-surface-800 truncate">🍳 Cara Masak</h2>
              <p className="text-sm text-surface-500 truncate">{cookingMenuName}</p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto flex-1 pb-safe">
              {cookingLoading ? (
                <div className="text-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-4" />
                  <p className="text-surface-500 text-sm">AI sedang menyiapkan resep...</p>
                </div>
              ) : cookingGuide ? (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="flex gap-4">
                    {cookingGuide.porsi && (
                      <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 px-3 py-2 rounded-xl">
                        <Utensils size={14} className="text-primary-500" />
                        {cookingGuide.porsi}
                      </div>
                    )}
                    {cookingGuide.waktu_masak && (
                      <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 px-3 py-2 rounded-xl">
                        <Clock size={14} className="text-primary-500" />
                        {cookingGuide.waktu_masak}
                      </div>
                    )}
                  </div>

                  {/* Bahan */}
                  {cookingGuide.bahan && cookingGuide.bahan.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-surface-800 mb-3 uppercase tracking-wider">Bahan-bahan</h3>
                      <div className="bg-surface-50 rounded-2xl p-4 space-y-2">
                        {cookingGuide.bahan.map((b, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-surface-700">{b.nama}</span>
                            <span className="text-surface-500 font-medium">{b.jumlah}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Langkah */}
                  {cookingGuide.langkah && cookingGuide.langkah.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-surface-800 mb-3 uppercase tracking-wider">Langkah Memasak</h3>
                      <div className="space-y-3">
                        {cookingGuide.langkah.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-sm text-surface-700 leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {cookingGuide.tips && cookingGuide.tips.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <h3 className="text-sm font-bold text-amber-800 mb-2">💡 Tips</h3>
                      {cookingGuide.tips.map((tip, i) => (
                        <p key={i} className="text-sm text-amber-700 leading-relaxed">{tip}</p>
                      ))}
                    </div>
                  )}

                  {/* Catatan Gizi */}
                  {cookingGuide.catatan_gizi && (
                    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
                      <h3 className="text-sm font-bold text-primary-800 mb-2">🥗 Catatan Gizi</h3>
                      <p className="text-sm text-primary-700 leading-relaxed">{cookingGuide.catatan_gizi}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-surface-500">Gagal memuat resep. Silakan coba lagi.</p>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
