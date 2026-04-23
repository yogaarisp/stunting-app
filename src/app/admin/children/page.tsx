'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, ArrowLeft, Baby, Target, Activity } from 'lucide-react';
import Link from 'next/link';
import { Child } from '@/lib/types';
import { analisisPertumbuhan } from '@/lib/recommendations';

// Extend Child type to include profile join data (not standard in our types but returned by supabase join)
interface ChildWithParent extends Child {
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function AdminChildren() {
  const [children, setChildren] = useState<ChildWithParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchChildren = useCallback(async () => {
    const supabase = createClient();
    // Use relation join to get parent data
    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    }
    
    setChildren(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const filteredChildren = children.filter(child => 
    child.nama_anak.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (child.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <Link href="/admin" className="text-sm font-medium text-surface-500 hover:text-primary-600 flex items-center gap-1 mb-2">
            <ArrowLeft size={16} /> Kembali ke Admin
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-800 flex items-center gap-3">
            <Baby className="text-primary-500" size={28} />
            Data <span className="text-primary-500">Anak Stunting</span>
          </h1>
          <p className="text-surface-500 mt-1">Pantau perkembangan seluruh anak terdaftar di sistem.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up animate-delay-100 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={18} />
        <input 
          type="text"
          placeholder="Cari nama anak atau orang tua..."
          className="form-input !pl-12 !py-4 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table & Mobile Cards */}
      <div className="glass-card overflow-hidden animate-fade-in-up animate-delay-200">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-surface-100">
          {filteredChildren.length === 0 ? (
            <div className="p-8 text-center text-surface-500 font-medium">
              Tidak ada data anak yang ditemukan.
            </div>
          ) : (
            filteredChildren.map((child) => {
              const analisis = analisisPertumbuhan(child);
              const riskLevel = analisis.riskLevel === 'rendah' ? 'Rendah' : 
                                analisis.riskLevel === 'sedang' ? 'Sedang' : 'Tinggi';
              
              return (
                <div key={child.id} className="p-5 hover:bg-surface-50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold uppercase shrink-0">
                        {child.nama_anak.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-surface-800 leading-tight text-sm truncate">{child.nama_anak}</p>
                        <p className="text-[11px] text-surface-500 mt-0.5">{child.umur_bulan} Bulan</p>
                      </div>
                    </div>
                    <span className={`badge shrink-0 ${
                      riskLevel === 'Tinggi' ? 'badge-danger' : 
                      riskLevel === 'Sedang' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {riskLevel === 'Tinggi' ? 'Risiko Tinggi' : 
                       riskLevel === 'Sedang' ? 'Risiko Sedang' : 'Normal'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 p-3 bg-surface-50 rounded-xl border border-surface-100/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mb-1">Orang Tua</span>
                      <span className="text-xs font-bold text-surface-700 truncate max-w-[120px]">{child.profiles?.full_name || 'Tidak Diketahui'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mb-1">Fisik</span>
                      <div className="flex items-center gap-2 text-xs text-surface-600 font-medium">
                        <span className="flex items-center gap-1"><Target size={12} className="text-surface-400" /> {child.berat_badan}kg</span>
                        <span className="flex items-center gap-1"><Activity size={12} className="text-surface-400" /> {child.tinggi_badan}cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Nama Anak</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Nama Orang Tua</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Fisik Saat Ini</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Status Risiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-surface-500">
                    Tidak ada data anak yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredChildren.map((child) => {
                  const analisis = analisisPertumbuhan(child);
                  const riskLevel = analisis.riskLevel === 'rendah' ? 'Rendah' : 
                                    analisis.riskLevel === 'sedang' ? 'Sedang' : 'Tinggi';
                  
                  return (
                    <tr key={child.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold uppercase">
                            {child.nama_anak.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-surface-800">{child.nama_anak}</p>
                            <p className="text-xs text-surface-500">{child.umur_bulan} Bulan</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-700">{child.profiles?.full_name || 'Tidak Diketahui'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm text-surface-600">
                          <span className="flex items-center gap-1"><Target size={14} className="text-surface-400" /> {child.berat_badan} kg</span>
                          <span className="flex items-center gap-1"><Activity size={14} className="text-surface-400" /> {child.tinggi_badan} cm</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          riskLevel === 'Tinggi' ? 'badge-danger' : 
                          riskLevel === 'Sedang' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {riskLevel === 'Tinggi' ? 'Risiko Tinggi' : 
                           riskLevel === 'Sedang' ? 'Risiko Sedang' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
