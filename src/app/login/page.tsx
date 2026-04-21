'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Baby, Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [brandName, setBrandName] = useState('NutriTrack');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Auth Check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    };
    checkUser();

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
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email atau password salah.'
        : error.message);
      setLoading(false);
    } else {
      // Get role for redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
      router.refresh();
    }
  };

  return (
    <div className="relative h-screen min-h-[550px] flex items-center justify-center px-4 overflow-hidden bg-surface-50">
      {/* Decorative Background Elements - Better Balanced */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-accent-200/20 rounded-full blur-[120px] animate-pulse animate-delay-500" />
      </div>

      <div className="relative w-full max-w-[400px] z-10 flex flex-col items-center">
        {/* Logo Section - Perfect Symmetry */}
        <div className="text-center mb-8 animate-fade-in-up flex-shrink-0">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Baby size={28} className="text-white" />
              )}
            </div>
            <span className="text-3xl font-extrabold gradient-text tracking-tight">{brandName}</span>
          </Link>
          <div className="mt-2 h-px w-8 bg-gradient-to-r from-transparent via-surface-300 to-transparent mx-auto" />
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-[0.2em] mt-3">Selamat Datang</h2>
        </div>

        {/* Login Card - Symmetrical Design */}
        <div className="glass-card p-8 sm:p-10 shadow-2xl shadow-primary-500/5 animate-fade-in-up animate-delay-100 bg-white/80 w-full border-white/40">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 animate-shake text-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Alamat Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="masukkan@email.com"
                  className="form-input !pl-11 !py-4 text-sm bg-white/50 border-surface-200 focus:bg-white text-center sm:text-left"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label htmlFor="password" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors">Lupa Password?</Link>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input !pl-11 !pr-11 !py-4 text-sm bg-white/50 border-surface-200 focus:bg-white text-center sm:text-left"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-bold shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 size={18} className="animate-spin" />
                  <span>MEMPROSES...</span>
                </div>
              ) : (
                'MASUK SEKARANG'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-100 text-center">
            <p className="text-xs text-surface-500 font-medium">
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline transition-all">
                Daftar Gratis
              </Link>
            </p>
            <div className="mt-4">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-surface-400 hover:text-primary-500 transition-colors uppercase tracking-widest">
                <ArrowLeft size={12} />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info - Perfect centering */}
        <p className="text-center text-[9px] text-surface-300 mt-10 tracking-[0.3em] font-medium uppercase">
          &copy; 2026 NutriTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
