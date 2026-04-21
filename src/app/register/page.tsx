'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Baby, Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center px-4 overflow-hidden bg-surface-50">
      {/* Decorative Background Elements - Perfectly Balanced */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-accent-200/20 rounded-full blur-[120px] animate-pulse animate-delay-500" />
      </div>

      <div className="relative w-full max-w-[420px] z-10 flex flex-col items-center">
        {/* Logo Section - Symmetric Header */}
        <div className="text-center mb-6 animate-fade-in-up flex-shrink-0">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Baby size={26} className="text-white" />
              )}
            </div>
            <span className="text-3xl font-extrabold gradient-text tracking-tight">{brandName}</span>
          </Link>
          <div className="mt-2 h-px w-8 bg-gradient-to-r from-transparent via-surface-300 to-transparent mx-auto" />
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-[0.2em] mt-3">Daftar Akun Baru</h2>
        </div>

        {/* Register Card - Symmetrical & Compact */}
        <div className="glass-card p-6 sm:p-8 shadow-2xl shadow-primary-500/5 animate-fade-in-up animate-delay-100 bg-white/80 w-full border-white/40">
          {success ? (
            <div className="text-center py-6 animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4 shadow-inner shadow-primary-500/10">
                <CheckCircle2 size={32} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-surface-800 mb-2">Pendaftaran Berhasil!</h3>
              <p className="text-surface-500 text-sm leading-relaxed px-4">
                Akun Anda telah dibuat. <br />
                <span className="font-bold text-primary-600">Cek email Anda</span> untuk verifikasi akun sebelum masuk.
              </p>
              <div className="mt-8">
                <Link href="/login" className="btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2">
                  Kembali ke Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 animate-shake text-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                <div className="relative group">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="form-input !pl-11 !py-3 text-sm bg-white/50 border-surface-200 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Email</label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@anda.com"
                    className="form-input !pl-11 !py-3 text-sm bg-white/50 border-surface-200 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Password</label>
                  <div className="relative group">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="form-input !pl-11 !py-3 text-sm bg-white/50 border-surface-200 focus:bg-white"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Konfirmasi</label>
                  <div className="relative group">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="form-input !pl-11 !py-3 text-sm bg-white/50 border-surface-200 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all mt-1"
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'BUAT AKUN SEKARANG'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 pt-6 border-t border-surface-100 text-center">
              <p className="text-xs text-surface-500 font-medium">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-bold text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline transition-all">
                  Masuk Sekarang
                </Link>
              </p>
              <div className="mt-4">
                <Link href="/" className="inline-flex items-center justify-center gap-2 text-[10px] font-bold text-surface-400 hover:text-primary-500 transition-colors uppercase tracking-widest w-full">
                  <ArrowLeft size={12} />
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info - Perfect centering */}
        <p className="text-center text-[9px] text-surface-300 mt-8 tracking-[0.3em] font-medium uppercase">
          &copy; 2026 NutriTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
