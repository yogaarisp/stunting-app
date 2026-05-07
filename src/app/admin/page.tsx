'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Child } from '@/lib/types';
import { analisisPertumbuhan } from '@/lib/recommendations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Shield, 
  Users, 
  Utensils, 
  Baby, 
  ArrowRight, 
  Loader2, 
  Settings as SettingsIcon,
  BookOpen,
  Calendar,
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Dna,
} from 'lucide-react';
import Link from 'next/link';

interface StuntingStats {
  normal: number;
  sedang: number;
  tinggi: number;
  total: number;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, children: 0, menus: 0, edukasi: 0 });
  const [groupStats, setGroupStats] = useState({ groupA: 0, groupB: 0 });
  const [loading, setLoading] = useState(true);
  const [recentChildren, setRecentChildren] = useState<{ id: string; nama_anak: string; created_at: string; profiles: { full_name: string | null } }[]>([]);
  const [stuntingStats, setStuntingStats] = useState<StuntingStats>({ normal: 0, sedang: 0, tinggi: 0, total: 0 });

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    
    // Fetch counts
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: childrenCount } = await supabase.from('children').select('*', { count: 'exact', head: true });
    const { count: menusCount } = await supabase.from('menus').select('*', { count: 'exact', head: true });
    const { count: edukasiCount } = await supabase.from('edukasi').select('*', { count: 'exact', head: true });

    setStats({
      users: usersCount || 0,
      children: childrenCount || 0,
      menus: menusCount || 0,
      edukasi: edukasiCount || 0,
    });

    // Fetch research group distribution
    const { data: groupAData } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('research_group', 'A')
      .eq('role', 'user');
    const { data: groupBData } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('research_group', 'B')
      .eq('role', 'user');
    
    // Use count from response headers (supabase returns count separately)
    const { count: groupACount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('research_group', 'A')
      .eq('role', 'user');
    const { count: groupBCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('research_group', 'B')
      .eq('role', 'user');

    setGroupStats({
      groupA: groupACount || 0,
      groupB: groupBCount || 0,
    });

    // Fetch recent children
    const { data: latest } = await supabase
      .from('children')
      .select('id, nama_anak, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Type cast to handle the join result correctly for TS
    setRecentChildren((latest as any) || []);

    // === FETCH ALL CHILDREN FOR ANALYTICS ===
    const { data: allChildren } = await supabase
      .from('children')
      .select('*');

    if (allChildren && allChildren.length > 0) {
      let normal = 0;
      let sedang = 0;
      let tinggi = 0;

      allChildren.forEach((child: Child) => {
        const analisis = analisisPertumbuhan(child);
        if (analisis.riskLevel === 'rendah') normal++;
        else if (analisis.riskLevel === 'sedang') sedang++;
        else tinggi++;
      });

      setStuntingStats({ normal, sedang, tinggi, total: allChildren.length });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-primary-500" size={42} />
        <p className="text-surface-500 font-medium">Menyiapkan dashboard...</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Normal', value: stuntingStats.normal, color: PIE_COLORS[0] },
    { name: 'Butuh Perhatian', value: stuntingStats.sedang, color: PIE_COLORS[1] },
    { name: 'Risiko Tinggi', value: stuntingStats.tinggi, color: PIE_COLORS[2] },
  ].filter(d => d.value > 0);

  const pctNormal = stuntingStats.total > 0 ? Math.round((stuntingStats.normal / stuntingStats.total) * 100) : 0;
  const pctPerhatian = stuntingStats.total > 0 ? Math.round(((stuntingStats.sedang + stuntingStats.tinggi) / stuntingStats.total) * 100) : 0;

  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = stuntingStats.total > 0 ? Math.round((data.value / stuntingStats.total) * 100) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-surface-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span className="text-sm font-bold text-surface-800">{data.name}</span>
          </div>
          <p className="text-xs text-surface-500 mt-1">{data.value} anak ({pct}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 pb-24 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-800 tracking-tight">
            Dashboard <span className="gradient-text">Superadmin</span>
          </h1>
          <p className="text-surface-500 mt-1">Pantau perkembangan data aplikasi Pelacakan Stunting secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white border border-surface-200 rounded-2xl shadow-sm hidden sm:flex items-center gap-3">
            <Calendar size={18} className="text-primary-500" />
            <span className="text-sm font-bold text-surface-700">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animate-delay-100">
        {[
          { label: 'Total Pengguna', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Akun Terdaftar' },
          { label: 'Anak Terdaftar', value: stats.children, icon: Baby, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Pemantauan Aktif' },
          { label: 'Menu Gizi', value: stats.menus, icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Rekomendasi Makanan' },
          { label: 'Artikel Edukasi', value: stats.edukasi, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Materi Literasi' },
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.bg} ${item.color} shadow-sm`}>
                <item.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={10} />
                <span>REALTIME</span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-surface-800 tracking-tight">{item.value.toLocaleString()}</h3>
            <p className="text-xs font-bold text-surface-400 mt-1 uppercase tracking-widest">{item.label}</p>
            <p className="text-[10px] text-surface-400 mt-2 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Research Group Stats */}
      {(groupStats.groupA > 0 || groupStats.groupB > 0) && (
        <div className="glass-card p-6 animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-800">Distribusi Kelompok Penelitian</h2>
              <p className="text-xs text-surface-500">Pembagian otomatis random A/B (Double Blind)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-blue-700">{groupStats.groupA}</p>
              <p className="text-sm font-bold text-blue-600 mt-1">Kelompok A</p>
              <p className="text-[10px] text-blue-500 mt-0.5 uppercase tracking-wider font-medium">Mikrobiota</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-emerald-700">{groupStats.groupB}</p>
              <p className="text-sm font-bold text-emerald-600 mt-1">Kelompok B</p>
              <p className="text-[10px] text-emerald-500 mt-0.5 uppercase tracking-wider font-medium">Standar</p>
            </div>
          </div>
          {/* Distribution bar */}
          <div className="mt-4">
            <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-700"
                style={{ width: `${(groupStats.groupA + groupStats.groupB) > 0 ? (groupStats.groupA / (groupStats.groupA + groupStats.groupB)) * 100 : 50}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                style={{ width: `${(groupStats.groupA + groupStats.groupB) > 0 ? (groupStats.groupB / (groupStats.groupA + groupStats.groupB)) * 100 : 50}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-blue-500 font-bold">A: {(groupStats.groupA + groupStats.groupB) > 0 ? Math.round((groupStats.groupA / (groupStats.groupA + groupStats.groupB)) * 100) : 0}%</span>
              <span className="text-[10px] text-emerald-500 font-bold">B: {(groupStats.groupA + groupStats.groupB) > 0 ? Math.round((groupStats.groupB / (groupStats.groupA + groupStats.groupB)) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* === ANALYTICS SECTION (NEW) === */}
      {stuntingStats.total > 0 && (
        <div className="glass-card p-6 lg:p-8 animate-fade-in-up animate-delay-150">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-800">Ringkasan Statistik Stunting</h2>
              <p className="text-xs text-surface-500">Distribusi status pertumbuhan seluruh anak terdaftar (Standar WHO)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Pie Chart */}
            <div className="flex justify-center">
              <div className="w-64 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-surface-800">{stuntingStats.total}</span>
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Anak</span>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="space-y-4">
              {/* Normal */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-surface-800">Normal</p>
                  <p className="text-xs text-surface-500">Pertumbuhan sesuai standar WHO</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-600">{pctNormal}%</p>
                  <p className="text-[10px] text-surface-400 font-bold">{stuntingStats.normal} anak</p>
                </div>
              </div>

              {/* Butuh Perhatian (Sedang) */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-surface-800">Butuh Perhatian</p>
                  <p className="text-xs text-surface-500">BB atau TB di bawah standar</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-600">
                    {stuntingStats.total > 0 ? Math.round((stuntingStats.sedang / stuntingStats.total) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-surface-400 font-bold">{stuntingStats.sedang} anak</p>
                </div>
              </div>

              {/* Risiko Tinggi */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-50/60 border border-red-100">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <XCircle size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-surface-800">Risiko Tinggi</p>
                  <p className="text-xs text-surface-500">BB dan TB di bawah standar</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-red-600">
                    {stuntingStats.total > 0 ? Math.round((stuntingStats.tinggi / stuntingStats.total) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-surface-400 font-bold">{stuntingStats.tinggi} anak</p>
                </div>
              </div>

              {/* Summary Banner */}
              <div className={`p-4 rounded-2xl border text-sm font-medium ${
                pctNormal >= 70 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : pctNormal >= 40
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <span className="font-bold">{pctNormal}%</span> anak dalam kategori normal, <span className="font-bold">{pctPerhatian}%</span> membutuhkan perhatian khusus {pctPerhatian > 50 ? '⚠️' : '✅'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up animate-delay-200">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-surface-800 flex items-center gap-2">
            <Activity size={20} className="text-primary-500" />
            Pengelolaan Utama
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-5">
            <Link href="/admin/children" className="glass-card p-6 flex flex-col gap-4 group border-emerald-100 hover:bg-emerald-50/3 transition-all">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Baby size={24} />
                </div>
                <ArrowRight size={20} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-800">Data Anak</h4>
                <p className="text-xs text-surface-500 mt-1">Pantau dan verifikasi data perkembangan fisik seluruh anak.</p>
              </div>
            </Link>

            <Link href="/admin/menus" className="glass-card p-6 flex flex-col gap-4 group border-amber-100 hover:bg-amber-50/3 transition-all">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Utensils size={24} />
                </div>
                <ArrowRight size={20} className="text-amber-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-800">Menu Makanan</h4>
                <p className="text-xs text-surface-500 mt-1">Kelola katalog rekomendasi gizi dan resep makanan sehat.</p>
              </div>
            </Link>

            <Link href="/admin/edukasi" className="glass-card p-6 flex flex-col gap-4 group border-indigo-100 hover:bg-indigo-50/3 transition-all">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <BookOpen size={24} />
                </div>
                <ArrowRight size={20} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-800">Materi Edukasi</h4>
                <p className="text-xs text-surface-500 mt-1">Publikasikan artikel dan panduan stunting bagi orang tua.</p>
              </div>
            </Link>

            <Link href="/admin/microbiota" className="glass-card p-6 flex flex-col gap-4 group border-violet-100 hover:bg-violet-50/3 transition-all">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                  <Dna size={24} />
                </div>
                <ArrowRight size={20} className="text-violet-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-800">Aturan Mikrobiota</h4>
                <p className="text-xs text-surface-500 mt-1">Kelola aturan referensi bakteri usus untuk rekomendasi AI.</p>
              </div>
            </Link>

            <Link href="/admin/settings" className="glass-card p-6 flex flex-col gap-4 group border-blue-100 hover:bg-blue-50/3 transition-all">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <SettingsIcon size={24} />
                </div>
                <ArrowRight size={20} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-surface-800">Pengaturan</h4>
                <p className="text-xs text-surface-500 mt-1">Konfigurasi sistem, manajemen role, dan branding aplikasi.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-surface-800 flex items-center gap-2">
            <Users size={20} className="text-accent-500" />
            Anak Baru Terdaftar
          </h2>
          
          <div className="glass-card overflow-hidden divide-y divide-surface-50 shadow-sm border-surface-100">
            {recentChildren.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-surface-400 italic">Belum ada data terbaru.</p>
              </div>
            ) : (
              recentChildren.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-surface-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold ring-4 ring-white shadow-sm">
                    {item.nama_anak.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-800 truncate">{item.nama_anak}</p>
                    <p className="text-[10px] text-surface-400 font-medium">Ortu: {item.profiles?.full_name || 'Admin'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Link href="/admin/children" className="p-4 block text-center text-xs font-bold text-primary-500 hover:bg-primary-50 transition-colors">
              Lihat Semua Data Anak
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
