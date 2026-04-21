'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Baby,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Child State
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childGender, setChildGender] = useState('Laki-laki');
  const [childLoading, setChildLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
        setRole(profile.role || 'user');
      }

      // 2. Fetch Child Data
      const { data: child } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (child) {
        setChildId(child.id);
        setChildName(child.nama_anak || '');
        setChildDob(child.tanggal_lahir || '');
        setChildGender(child.jenis_kelamin || 'Laki-laki');
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        address: address,
        updated_at: new Date().toISOString()
      })
      .eq('id', user?.id);

    if (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui profil: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }

    setPassLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: 'error', text: 'Gagal ubah password: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setPassLoading(false);
  };

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    
    setChildLoading(true);
    setMessage({ type: '', text: '' });

    const supabase = createClient();
    const { error } = await supabase
      .from('children')
      .update({
        nama_anak: childName,
        tanggal_lahir: childDob,
        jenis_kelamin: childGender,
        updated_at: new Date().toISOString()
      })
      .eq('id', childId);

    if (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui data anak: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Identitas anak berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setChildLoading(false);
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-primary-500" size={42} />
      <p className="text-surface-500 font-medium">Memuat profil...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-surface-800 tracking-tight">
          Profil <span className="gradient-text">Saya</span>
        </h1>
        <p className="text-surface-500 mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-shake font-bold text-sm sticky top-4 z-50 shadow-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start animate-fade-in-up animate-delay-100">
        {/* Profile Card & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${role === 'admin' ? 'bg-gradient-to-br from-surface-700 to-surface-900' : 'bg-gradient-to-br from-primary-500 to-accent-500'}`}>
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-800">{fullName || 'User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${role === 'admin' ? 'bg-surface-800 text-white' : 'bg-primary-100 text-primary-700'}`}>
                    {role === 'admin' ? 'Administrator' : 'Orang Tua'}
                  </span>
                  <span className="text-xs text-surface-400 font-medium">{email}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Email (Read-only) */}
                <div className="space-y-1.5 opacity-70">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Email Akun (Tetap)</label>
                  <div className="relative group bg-surface-50 rounded-2xl">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input 
                      type="email"
                      value={email}
                      disabled
                      className="form-input !pl-12 !py-4 cursor-not-allowed bg-transparent border-none"
                      placeholder="Email Akun"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input !pl-12 !py-4"
                      placeholder="Nama Lengkap"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Nomor WhatsApp/HP</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input !pl-12 !py-4"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Alamat Domisili</label>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-4 top-4 text-surface-400 group-focus-within:text-accent-500 transition-colors" />
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input !pl-12 !py-4 min-h-[100px]"
                    placeholder="Alamat lengkap tempat tinggal saat ini..."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full sm:w-auto px-10 py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-all font-bold"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Child Profile Card - Only for users with children */}
          {childId && (
            <div id="child-data" className="glass-card p-8 sm:p-10 border-amber-100 bg-amber-50/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl">
                  <Baby size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-800">Identitas <span className="text-amber-600">Buah Hati</span></h2>
                  <p className="text-xs text-surface-500 font-medium">Informasi utama anak untuk data grafik.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateChild} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Nama Lengkap Anak</label>
                    <div className="relative group">
                      <Baby size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-amber-500 transition-colors" />
                      <input 
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="form-input !pl-12 !py-4"
                        placeholder="Nama Lengkap Anak"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Tanggal Lahir</label>
                    <div className="relative group">
                      <input 
                        type="date"
                        value={childDob}
                        onChange={(e) => setChildDob(e.target.value)}
                        className="form-input !py-4"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Jenis Kelamin</label>
                    <select 
                      value={childGender}
                      onChange={(e) => setChildGender(e.target.value)}
                      className="form-input !py-4"
                      required
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={childLoading}
                    className="btn-primary !from-amber-500 !to-orange-500 w-full sm:w-auto px-10 py-4 flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all font-bold"
                  >
                    {childLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>Update Identitas Anak</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="space-y-8">
          <div className="glass-card p-8 border-surface-200">
            <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 mb-6 uppercase tracking-wider">
              <ShieldCheck size={18} className="text-primary-500" />
              Keamanan Akun
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Password Baru</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input !pl-12 !py-3.5 text-sm"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Konfirmasi Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input !pl-12 !py-3.5 text-sm"
                    placeholder="Ulangi password baru"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={passLoading}
                className="w-full py-3.5 bg-surface-800 text-white rounded-2xl text-xs font-bold hover:bg-surface-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                {passLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                Ganti Password Sekarang
              </button>
            </form>
          </div>

          <div className="p-6 bg-surface-50 border border-surface-100 rounded-3xl">
            <div className="flex gap-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg h-fit">
                <AlertCircle size={18} />
              </div>
              <p className="text-[11px] text-surface-500 leading-relaxed font-medium">
                <strong>Tips Keamanan:</strong> Gunakan kombinasi huruf, angka, dan simbol untuk password Anda. Jangan bagikan email dan password Anda kepada siapapun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
