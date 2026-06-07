'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, ArrowLeft, Baby, Target, Activity, Edit2, Trash2, AlertCircle } from 'lucide-react';
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

  // Modal States
  const [selectedChild, setSelectedChild] = useState<ChildWithParent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleDeleteClick = (child: ChildWithParent) => {
    setSelectedChild(child);
    setIsDeleteModalOpen(true);
    setError('');
  };

  const confirmDelete = async () => {
    if (!selectedChild) return;
    
    setActionLoading(true);
    setError('');
    const supabase = createClient();
    
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .eq('id', selectedChild.id);

    if (deleteError) {
      setError(deleteError.message);
      setActionLoading(false);
    } else {
      await fetchChildren();
      setIsDeleteModalOpen(false);
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
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
        
        <Link 
          href="/admin/children/input"
          className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20 w-fit"
        >
          <Baby size={20} />
          Input Data Anak
        </Link>
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
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge shrink-0 ${
                        riskLevel === 'Tinggi' ? 'badge-danger' : 
                        riskLevel === 'Sedang' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {riskLevel === 'Tinggi' ? 'Risiko Tinggi' : 
                         riskLevel === 'Sedang' ? 'Risiko Sedang' : 'Normal'}
                      </span>
                      <div className="flex bg-white shadow-sm border border-surface-100 rounded-xl overflow-hidden shrink-0">
                        <Link href={`/admin/children/input?parentId=${child.user_id}`} className="p-2 text-blue-600 hover:bg-blue-50 border-r border-surface-100" title="Edit Data">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDeleteClick(child)} className="p-2 text-red-600 hover:bg-red-50" title="Hapus Data">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
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
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase text-center">Aksi</th>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/admin/children/input?parentId=${child.user_id}`}
                            className="p-2.5 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Data"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(child)}
                            className="p-2.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Hapus Data"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-surface-800 mb-2">Hapus Data Anak?</h3>
              <p className="text-surface-500 mb-8 leading-relaxed">
                Menghapus <span className="font-bold text-surface-900">{selectedChild.nama_anak}</span> akan menghapus seluruh data fisik dan histori perkembangannya secara permanen.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn-secondary flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm sm:py-3.5 sm:px-6 whitespace-nowrap transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="bg-red-600 text-white hover:bg-red-700 flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm sm:py-3.5 sm:px-6 whitespace-nowrap transition-all disabled:opacity-50 shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Ya, Hapus Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
