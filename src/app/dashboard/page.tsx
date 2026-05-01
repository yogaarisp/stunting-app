'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Child, HistoriPerkembangan } from '@/lib/types';
import { analisisPertumbuhan, getStandarForAge, BADGE_CONFIG, BadgeType } from '@/lib/recommendations';
import {
  Weight,
  Ruler,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Baby,
  Calendar,
  ArrowRight,
  Brain,
  Flame,
  Download,
  Printer,
} from 'lucide-react';
import Link from 'next/link';

const badgeIcons: Record<string, typeof Flame> = {
  Flame,
  Brain,
};

export default function DashboardPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [history, setHistory] = useState<HistoriPerkembangan[]>([]);
  const [researchGroup, setResearchGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch research group
    const { data: profile } = await supabase
      .from('profiles')
      .select('research_group')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      setResearchGroup(profile.research_group);
    }

    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (childData) {
      setChild(childData);
      const { data: histData } = await supabase
        .from('histori_perkembangan')
        .select('*')
        .eq('child_id', childData.id)
        .order('created_at', { ascending: true });

      setHistory(histData || []);
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
        <div className="skeleton h-4 w-48" />
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
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
          <h2 className="text-2xl font-bold text-surface-800 mb-3">Selamat Datang!</h2>
          <p className="text-surface-500 mb-8 leading-relaxed">
            Anda belum memasukkan data anak. Mulailah dengan mengisi data fisik anak Anda
            untuk mendapatkan analisis pertumbuhan dan rekomendasi menu.
          </p>
          <Link href="/input" className="btn-primary px-8 py-3.5 text-lg">
            Input Data Anak
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  const analisis = analisisPertumbuhan(child, researchGroup);
  const standar = getStandarForAge(child.umur_bulan, child.jenis_kelamin);
  const lastUpdate = new Date(child.updated_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const riskConfig = {
    rendah: { color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-200', icon: CheckCircle2, label: 'Risiko Rendah' },
    sedang: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, label: 'Risiko Sedang' },
    tinggi: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, label: 'Risiko Tinggi' },
  };

  const risk = riskConfig[analisis.riskLevel];
  const RiskIcon = risk.icon;

  return (
    <div className="p-6 lg:p-8 space-y-8 print-area">
      {/* Print Header (hidden on screen, shown on print) */}
      <div className="print-header hidden">
        <h1 className="text-xl font-bold">Laporan Perkembangan Anak — NutriTrack</h1>
        <p className="text-sm text-surface-500">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <hr className="my-3 border-surface-200" />
      </div>

      {/* Header */}
      <div className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
            Dashboard <span className="gradient-text">{child.nama_anak}</span>
          </h1>
          <p className="text-surface-500 mt-1 flex items-center gap-2">
            <Calendar size={16} />
            Terakhir diperbarui: {lastUpdate}
          </p>
        </div>
      </div>

      {/* Risk Alert */}
      <div className={`${risk.bg} ${risk.border} border rounded-2xl p-5 flex items-start gap-4 animate-fade-in-up animate-delay-100`}>
        <RiskIcon size={24} className={risk.color} />
        <div className="flex-1">
          <p className={`font-bold ${risk.color} text-sm`}>{risk.label}</p>
          <p className="text-surface-600 text-sm mt-1">{analisis.pesan}</p>
          <p className="text-xs text-surface-400 mt-2">Standar WHO ({analisis.genderUsed})</p>
        </div>
      </div>

      {/* === BADGE SECTION === */}
      {analisis.badges.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up animate-delay-100">
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
                <div className="flex-1">
                  <p className={`font-bold text-sm ${badge.color}`}>{badge.label}</p>
                  <p className="text-surface-600 text-xs mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Berat Badan */}
        <div className="glass-card p-6 animate-fade-in-up animate-delay-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Weight size={20} className="text-white" />
            </div>
            {analisis.bbStatus === 'kurang' ? (
              <TrendingDown size={20} className="text-red-500" />
            ) : (
              <TrendingUp size={20} className="text-primary-500" />
            )}
          </div>
          <p className="text-sm text-surface-500 font-medium">Berat Badan</p>
          <p className="text-2xl font-bold text-surface-800 mt-1">{child.berat_badan} <span className="text-sm font-medium text-surface-400">kg</span></p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${analisis.bbStatus === 'normal' ? 'badge-success' : analisis.bbStatus === 'kurang' ? 'badge-danger' : 'badge-warning'}`}>
              {analisis.bbPersentase}%
            </span>
            <span className="text-xs text-surface-400">standar: {standar.bb_rata.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Tinggi Badan */}
        <div className="glass-card p-6 animate-fade-in-up animate-delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Ruler size={20} className="text-white" />
            </div>
            {analisis.tbStatus === 'kurang' ? (
              <TrendingDown size={20} className="text-red-500" />
            ) : (
              <TrendingUp size={20} className="text-primary-500" />
            )}
          </div>
          <p className="text-sm text-surface-500 font-medium">Tinggi Badan</p>
          <p className="text-2xl font-bold text-surface-800 mt-1">{child.tinggi_badan} <span className="text-sm font-medium text-surface-400">cm</span></p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${analisis.tbStatus === 'normal' ? 'badge-success' : analisis.tbStatus === 'kurang' ? 'badge-danger' : 'badge-warning'}`}>
              {analisis.tbPersentase}%
            </span>
            <span className="text-xs text-surface-400">standar: {standar.tb_rata.toFixed(1)} cm</span>
          </div>
        </div>

        {/* Lingkar Kepala (UPGRADED) */}
        <div className="glass-card p-6 animate-fade-in-up animate-delay-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain size={20} className="text-white" />
            </div>
            {analisis.lkStatus === 'kurang' ? (
              <TrendingDown size={20} className="text-red-500" />
            ) : analisis.lkStatus === 'tidak_ada_data' ? null : (
              <TrendingUp size={20} className="text-primary-500" />
            )}
          </div>
          <p className="text-sm text-surface-500 font-medium">Lingkar Kepala</p>
          <p className="text-2xl font-bold text-surface-800 mt-1">{child.lingkar_kepala || '-'} <span className="text-sm font-medium text-surface-400">cm</span></p>
          {analisis.lkPersentase !== null ? (
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${analisis.lkStatus === 'normal' ? 'badge-success' : analisis.lkStatus === 'kurang' ? 'badge-danger' : 'badge-warning'}`}>
                {analisis.lkPersentase}%
              </span>
              <span className="text-xs text-surface-400">standar: {standar.lk_rata.toFixed(1)} cm</span>
            </div>
          ) : (
            <p className="text-xs text-surface-400 mt-2">Belum ada data lingkar kepala</p>
          )}
        </div>

        {/* Umur */}
        <div className="glass-card p-6 animate-fade-in-up animate-delay-400">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Calendar size={20} className="text-white" />
            </div>
          </div>
          <p className="text-sm text-surface-500 font-medium">Umur</p>
          <p className="text-2xl font-bold text-surface-800 mt-1">{child.umur_bulan} <span className="text-sm font-medium text-surface-400">bulan</span></p>
          <p className="text-xs text-surface-400 mt-2">{Math.floor(child.umur_bulan / 12)} tahun {child.umur_bulan % 12} bulan</p>
        </div>
      </div>

      {/* Quick Actions - hidden on print */}
      <div className="grid md:grid-cols-3 gap-5 no-print">
        <Link href="/input" className="glass-card p-6 flex items-center gap-4 group hover:border-primary-300 animate-fade-in-up animate-delay-200">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <Baby size={24} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-surface-700">Update Data</p>
            <p className="text-sm text-surface-400">Perbarui data fisik anak</p>
          </div>
          <ArrowRight size={18} className="ml-auto text-surface-300 group-hover:text-primary-500 transition-colors" />
        </Link>

        <Link href="/rekomendasi" className="glass-card p-6 flex items-center gap-4 group hover:border-primary-300 animate-fade-in-up animate-delay-300">
          <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
            <Activity size={24} className="text-accent-600" />
          </div>
          <div>
            <p className="font-bold text-surface-700">Lihat Rekomendasi</p>
            <p className="text-sm text-surface-400">Menu makanan bergizi</p>
          </div>
          <ArrowRight size={18} className="ml-auto text-surface-300 group-hover:text-primary-500 transition-colors" />
        </Link>

        <Link href="/grafik" className="glass-card p-6 flex items-center gap-4 group hover:border-primary-300 animate-fade-in-up animate-delay-400">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <TrendingUp size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="font-bold text-surface-700">Lihat Grafik</p>
            <p className="text-sm text-surface-400">Tren pertumbuhan</p>
          </div>
          <ArrowRight size={18} className="ml-auto text-surface-300 group-hover:text-primary-500 transition-colors" />
        </Link>
      </div>

      {/* Riwayat Terakhir */}
      {history.length > 0 && (
        <div className="glass-card p-6 animate-fade-in-up animate-delay-300">
          <h3 className="text-lg font-bold text-surface-800 mb-4">Riwayat Pengukuran Terakhir</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-surface-500 font-semibold">Tanggal</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-semibold">Umur</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-semibold">BB (kg)</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-semibold">TB (cm)</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-5).reverse().map((h) => (
                  <tr key={h.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                    <td className="py-3 px-4 text-surface-700">
                      {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-surface-700">{h.umur_bulan} bln</td>
                    <td className="py-3 px-4 text-surface-700 font-medium">{h.berat_badan}</td>
                    <td className="py-3 px-4 text-surface-700 font-medium">{h.tinggi_badan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Footer (hidden on screen, shown on print) */}
      <div className="print-footer hidden">
        <hr className="my-4 border-surface-200" />
        <p className="text-xs text-surface-400 text-center">
          Laporan ini dihasilkan oleh NutriTrack Stunting App — Standar WHO ({analisis.genderUsed}). 
          Konsultasikan dengan tenaga kesehatan untuk evaluasi klinis lebih lanjut.
        </p>
      </div>
    </div>
  );
}
