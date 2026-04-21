'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Baby, ArrowRight, BarChart3, Utensils, Shield, Sparkles, BookOpen } from 'lucide-react';

import { Menu } from '@/lib/types';

function MenuSlider() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('menus').select('*').limit(6);
      setMenus(data || []);
      setLoading(false);
    };
    fetchMenus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (menus.length === 0) {
    return <p className="text-center text-surface-500 py-8">Belum ada data menu. Hubungi Admin.</p>;
  }

  return (
    <div className="w-full overflow-hidden">
      {/* 
        Mobile Layout: 1 Baris, Horizontal Slider 
        Desktop Layout: Grid 3 Columns
      */}
      <div className="
        flex md:grid gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-1
        md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:snap-none md:px-0
        scrollbar-hide
      ">
        {menus.map((menu, index) => (
          <div 
            key={menu.id} 
            className="w-[85%] sm:w-[45%] md:w-auto flex-shrink-0 md:flex-shrink glass-card p-5 group snap-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-4 flex-shrink-0">
              <span className="text-2xl">🍲</span>
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2 group-hover:text-primary-700 transition-colors">
              {menu.nama_menu}
            </h3>
            <p className="text-sm text-surface-500 line-clamp-2 mb-4 flex-1">
              {menu.deskripsi || menu.nutrisi}
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="text-[10px] font-bold px-2 py-1 bg-surface-100 text-surface-600 rounded-md uppercase tracking-wider">
                {menu.kategori.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-md uppercase tracking-wider">
                {menu.kalori} kcal
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [brandName, setBrandName] = useState('NutriTrack');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Auth Check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/dashboard');
      } else {
        setChecking(false);
      }
    });

    // Fetch Settings
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('brand_name, logo_url')
        .eq('id', 1)
        .single();
      
      if (data) {
        setBrandName(data.brand_name);
        setLogoUrl(data.logo_url);
      }
    };
    fetchSettings();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-primary-500/80 to-accent-500/90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Baby size={22} className="text-white" />
              )}
            </div>
            <span className="text-xl font-bold text-white">{brandName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              id="nav-login"
              className="px-5 py-2.5 text-sm font-semibold text-white/90 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              id="nav-register"
              className="px-5 py-2.5 text-sm font-semibold bg-white text-primary-700 rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-black/10"
            >
              Daftar Gratis
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-16 lg:pt-14 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Side: Headlines & CTA */}
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-[11px] font-bold uppercase tracking-wider mb-6 border border-white/10 shadow-lg animate-fade-in-up">
                <Sparkles size={14} className="text-yellow-300" />
                <span>Teknologi Pemantauan Cerdas</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.2] mb-4 animate-fade-in-up animate-delay-100 tracking-tight">
                Pondasi Sehat untuk <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-200 drop-shadow-sm">Masa Depan Anak</span>
              </h1>
              
              <p className="text-base lg:text-lg text-white/80 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up animate-delay-200">
                {brandName} membantu orang tua memantau tumbuh kembang anak secara real-time 
                dengan formulasi nutrisi akurat sesuai standar medis WHO.
              </p>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up animate-delay-300">
                <Link
                  href="/register"
                  id="hero-register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-700 rounded-xl font-bold text-base hover:bg-surface-50 transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
                >
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/info-stunting"
                  id="hero-edukasi"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-base hover:bg-white/20 transition-all border border-white/20 hover:-translate-y-1 w-full sm:w-auto"
                >
                  <BookOpen size={18} />
                  Pelajari Stunting
                </Link>
              </div>
            </div>

            {/* Right Side: Floating Visuals (Hidden on Mobile) */}
            <div className="hidden lg:block relative w-full h-[450px]">
              
              {/* Center Glow Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px]" />

              {/* Main Center Element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-white/10 to-white/30 backdrop-blur-xl rounded-full flex flex-col items-center justify-center border border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.15)] animate-float-delayed z-10">
                <div className="bg-white/20 p-6 rounded-full mb-3 shadow-inner">
                  <Baby size={64} className="text-white drop-shadow-md" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white font-semibold tracking-wide text-sm">Sistem Aktif</span>
                </div>
              </div>

              {/* Floating Card 1: Data Chart */}
              <div className="absolute top-[10%] xl:top-[15%] right-[5%] xl:right-[10%] p-5 glass-card !bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl animate-float shadow-2xl z-20 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-inner">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold uppercase tracking-wider opacity-80">Akurasi Grafik</p>
                    <p className="text-white font-extrabold text-2xl tracking-tight">Real-time</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2: AI / Shield */}
              <div className="absolute bottom-[10%] xl:bottom-[15%] left-[5%] xl:left-[10%] p-5 glass-card !bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl animate-float-delayed shadow-2xl z-20 hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-inner">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold uppercase tracking-wider opacity-80">Rasio Sukses</p>
                    <p className="text-white font-extrabold text-2xl tracking-tight">Standar WHO</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 3: Food / Utensils */}
              <div className="absolute top-[40%] left-0 xl:-left-[5%] p-4 glass-card !bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl animate-float shadow-2xl z-20 hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-inner">
                    <Utensils size={18} className="text-white" />
                  </div>
                  <div className="pr-2">
                    <p className="text-white font-bold text-sm tracking-tight">+50 Menu Sehat</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-surface-800 mb-4">
              Fitur <span className="gradient-text">Unggulan</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk memastikan pertumbuhan optimal anak
            </p>
          </div>

          <div className="
            flex md:grid gap-6 overflow-x-auto snap-x snap-mandatory pb-6 px-1
            md:grid-cols-3 md:overflow-x-visible md:snap-none md:px-0
            scrollbar-hide
          ">
            {[
              {
                icon: BarChart3,
                title: 'Grafik Pertumbuhan',
                desc: 'Pantau tren berat badan dan tinggi badan anak dengan visualisasi grafik yang mudah dipahami.',
                color: 'from-primary-500 to-primary-600',
                shadow: 'shadow-primary-500/20',
              },
              {
                icon: Utensils,
                title: 'Rekomendasi Menu',
                desc: 'Dapatkan rekomendasi menu makanan bergizi berdasarkan kondisi pertumbuhan anak.',
                color: 'from-accent-500 to-accent-600',
                shadow: 'shadow-accent-500/20',
              },
              {
                icon: Shield,
                title: 'Deteksi Dini',
                desc: 'Sistem analisis otomatis untuk mendeteksi risiko stunting dan memberikan saran pencegahan.',
                color: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/20',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="w-[85%] sm:w-[50%] md:w-auto flex-shrink-0 md:flex-shrink glass-card p-8 text-center group snap-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg ${feature.shadow} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-800 mb-3">{feature.title}</h3>
                <p className="text-surface-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menus Section */}
      <section className="py-20 px-6 bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-surface-800 mb-4">
              Pilihan <span className="gradient-text">Menu Sehat</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              Beragam rekomendasi hidangan bergizi yang dirancang khusus untuk memenuhi standar nutrisi pertumbuhan anak.
            </p>
          </div>

          <MenuSlider />

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-surface-200/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-400 text-sm">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-4 h-4 rounded-sm object-cover" /> : <Baby size={16} />}
            <span>{brandName} © 2026. Studi Kasus Stunting.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-surface-400">
            <Link href="/info-stunting" className="hover:text-primary-600 transition-colors">Edukasi</Link>
            <Link href="/login" className="hover:text-primary-600 transition-colors">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
