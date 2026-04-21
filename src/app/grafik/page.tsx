'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HistoriPerkembangan, Child } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { BarChart3, Baby, ArrowRight, TrendingUp, History, Trash2, Edit2, X, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ChartData {
  tanggal: string;
  berat_badan: number;
  tinggi_badan: number;
  umur_bulan: number;
}

export default function GrafikPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'both' | 'bb' | 'tb'>('both');

  // History Management State
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<any>(null);
  const [historySaving, setHistorySaving] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

      if (histData) {
        setHistory(histData);
        const formatted: ChartData[] = histData.map((h: HistoriPerkembangan) => ({
          tanggal: new Date(h.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
          }),
          berat_badan: h.berat_badan,
          tinggi_badan: h.tinggi_badan,
          umur_bulan: h.umur_bulan,
        }));
        setChartData(formatted);
      }
    }
    setLoading(false);
  }, []);

  const refreshData = async () => {
    if (!child) return;
    const supabase = createClient();
    const { data: histData } = await supabase
      .from('histori_perkembangan')
      .select('*')
      .eq('child_id', child.id)
      .order('created_at', { ascending: true });

    if (histData) {
      setHistory(histData);
      const formatted: ChartData[] = histData.map((h: HistoriPerkembangan) => ({
        tanggal: new Date(h.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
        }),
        berat_badan: h.berat_badan,
        tinggi_badan: h.tinggi_badan,
        umur_bulan: h.umur_bulan,
      }));
      setChartData(formatted);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Hapus riwayat pengukuran ini?')) return;
    
    const supabase = createClient();
    const { error } = await supabase.from('histori_perkembangan').delete().eq('id', id);
    
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      refreshData();
    }
  };

  const handleUpdateHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setHistorySaving(true);
    
    const supabase = createClient();
    const { error } = await supabase
      .from('histori_perkembangan')
      .update({
        berat_badan: editingHistory.berat_badan,
        tinggi_badan: editingHistory.tinggi_badan,
        umur_bulan: editingHistory.umur_bulan,
        lingkar_lengan: editingHistory.lingkar_lengan,
        lingkar_kepala: editingHistory.lingkar_kepala,
      })
      .eq('id', editingHistory.id);

    if (error) {
      alert('Gagal update: ' + error.message);
    } else {
      setIsHistoryModalOpen(false);
      refreshData();
    }
    setHistorySaving(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-96 rounded-2xl mt-8" />
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
            Masukkan data fisik anak terlebih dahulu untuk melihat grafik perkembangan.
          </p>
          <Link href="/input" className="btn-primary px-8 py-3.5 text-lg">
            Input Data Anak
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-100 to-primary-100 mb-6">
            <BarChart3 size={40} className="text-accent-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-800 mb-3">Data Belum Cukup</h2>
          <p className="text-surface-500 mb-8 leading-relaxed">
            Diperlukan minimal 2 data pengukuran untuk menampilkan grafik.
            Silakan update data anak secara berkala.
          </p>
          <Link href="/input" className="btn-primary px-8 py-3.5 text-lg">
            Update Data
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-surface-200 p-4">
          <p className="font-semibold text-surface-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-surface-500">{entry.name}:</span>
              <span className="font-bold text-surface-800">
                {entry.value} {entry.name === 'Berat Badan' ? 'kg' : 'cm'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">
          Grafik <span className="gradient-text">Pertumbuhan</span>
        </h1>
        <p className="text-surface-500 mt-1">
          Tren perkembangan berat badan dan tinggi badan {child.nama_anak}
        </p>
      </div>

      {/* Chart Filter */}
      <div className="flex gap-2 animate-fade-in-up animate-delay-100">
        {[
          { key: 'both', label: 'Semua' },
          { key: 'bb', label: 'Berat Badan' },
          { key: 'tb', label: 'Tinggi Badan' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key as 'both' | 'bb' | 'tb')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeChart === tab.key
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white/80 text-surface-600 hover:bg-white border border-surface-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 lg:p-8 animate-fade-in-up animate-delay-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-surface-800">Tren Pertumbuhan</h2>
        </div>

        <div className="h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tanggal"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-sm font-medium text-surface-600">{value}</span>}
              />
              {(activeChart === 'both' || activeChart === 'bb') && (
                <Area
                  type="monotone"
                  dataKey="berat_badan"
                  name="Berat Badan"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorBB)"
                  dot={{ r: 5, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#3b82f6', stroke: 'white', strokeWidth: 3 }}
                />
              )}
              {(activeChart === 'both' || activeChart === 'tb') && (
                <Area
                  type="monotone"
                  dataKey="tinggi_badan"
                  name="Tinggi Badan"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorTB)"
                  dot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: 'white', strokeWidth: 3 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      {chartData.length >= 2 && (
        <div className="grid md:grid-cols-2 gap-5 animate-fade-in-up animate-delay-300">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-surface-500 mb-3 uppercase tracking-wide">Perubahan Berat Badan</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-surface-800">
                {(chartData[chartData.length - 1].berat_badan - chartData[0].berat_badan).toFixed(1)}
              </span>
              <span className="text-surface-400 text-sm">kg</span>
            </div>
            <p className="text-sm text-surface-400 mt-1">
              Dari {chartData[0].berat_badan} → {chartData[chartData.length - 1].berat_badan} kg
            </p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-surface-500 mb-3 uppercase tracking-wide">Perubahan Tinggi Badan</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-surface-800">
                {(chartData[chartData.length - 1].tinggi_badan - chartData[0].tinggi_badan).toFixed(1)}
              </span>
              <span className="text-surface-400 text-sm">cm</span>
            </div>
            <p className="text-sm text-surface-400 mt-1">
              Dari {chartData[0].tinggi_badan} → {chartData[chartData.length - 1].tinggi_badan} cm
            </p>
          </div>
        </div>
      )}

      {/* History Management Table */}
      <div className="glass-card p-6 lg:p-8 animate-fade-in-up animate-delay-400">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-800">Riwayat Pengukuran</h2>
            <p className="text-xs text-surface-500">Detail angka perkembangan dari bulan ke bulan.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="border-b border-surface-100 italic">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold text-surface-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-4 py-3 text-[11px] font-bold text-surface-400 uppercase tracking-widest text-center">Umur</th>
                <th className="px-4 py-3 text-[11px] font-bold text-surface-400 uppercase tracking-widest text-center">Berat (kg)</th>
                <th className="px-4 py-3 text-[11px] font-bold text-surface-400 uppercase tracking-widest text-center">Tinggi (cm)</th>
                <th className="px-4 py-3 text-[11px] font-bold text-surface-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-surface-400 text-sm italic">Belum ada data riwayat.</td>
                </tr>
              ) : (
                [...history].reverse().map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-surface-800">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-surface-600">{item.umur_bulan} bln</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-surface-600">{item.berat_badan}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-surface-600">{item.tinggi_badan}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingHistory({...item}); setIsHistoryModalOpen(true); }}
                          className="p-2 text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit History Modal */}
      {isHistoryModalOpen && editingHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-950/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-8 py-6 border-b border-surface-100 flex items-center justify-between bg-primary-50/50">
              <h3 className="font-bold text-surface-800 flex items-center gap-2">
                <Edit2 size={18} className="text-primary-500" />
                Edit Catatan Pengukuran
              </h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-surface-400 hover:text-surface-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateHistory} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Berat Badan (kg)</label>
                  <input 
                    type="number" step="0.1" required
                    className="form-input"
                    value={editingHistory.berat_badan}
                    onChange={e => setEditingHistory({...editingHistory, berat_badan: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Tinggi Badan (cm)</label>
                  <input 
                    type="number" step="0.1" required
                    className="form-input"
                    value={editingHistory.tinggi_badan}
                    onChange={e => setEditingHistory({...editingHistory, tinggi_badan: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Umur (Bulan)</label>
                  <input 
                    type="number" required
                    className="form-input"
                    value={editingHistory.umur_bulan}
                    onChange={e => setEditingHistory({...editingHistory, umur_bulan: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Lingkar Lengan (cm)</label>
                  <input 
                    type="number" step="0.1"
                    className="form-input"
                    value={editingHistory.lingkar_lengan || ''}
                    onChange={e => setEditingHistory({...editingHistory, lingkar_lengan: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsHistoryModalOpen(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={historySaving} className="btn-primary flex-1">
                  {historySaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
