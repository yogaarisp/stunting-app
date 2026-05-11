'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MicrobiotaReference } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Save, 
  ArrowLeft,
  Microscope,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Dna,
} from 'lucide-react';
import Link from 'next/link';

export default function ManageMicrobiota() {
  const [list, setList] = useState<MicrobiotaReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MicrobiotaReference> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('microbiota_references')
      .select('*')
      .order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aturan ini?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('microbiota_references').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    
    const ruleData = {
      nama_bakteri: editingItem?.nama_bakteri,
      makanan_disarankan: editingItem?.makanan_disarankan || null,
      makanan_dihindari: editingItem?.makanan_dihindari || null,
      penjelasan_medis: editingItem?.penjelasan_medis || null,
    };

    let error;
    if (editingItem?.id) {
      const { error: err } = await supabase
        .from('microbiota_references')
        .update(ruleData)
        .eq('id', editingItem.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('microbiota_references')
        .insert(ruleData);
      error = err;
    }

    if (error) {
      alert(error.message);
    } else {
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    }
    setSaving(false);
  };

  const filteredItems = list.filter(item =>
    item.nama_bakteri.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.makanan_disarankan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.makanan_dihindari || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            <Dna className="text-violet-600" size={28} />
            Aturan <span className="text-violet-600">Mikrobiota</span>
          </h1>
          <p className="text-sm text-surface-500 mt-1">Kelola aturan referensi hubungan bakteri usus dan nutrisi. Data ini digunakan AI untuk rekomendasi menu.</p>
        </div>
        <button 
          onClick={() => { setEditingItem({}); setIsModalOpen(true); }}
          className="btn-primary"
          id="btn-tambah-aturan"
        >
          <Plus size={20} /> Tambah Aturan
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/50 rounded-2xl p-5 flex items-start gap-4 animate-fade-in-up animate-delay-50">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
          <Microscope size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-violet-800">Pusat Data Referensi Mikrobiota</p>
          <p className="text-xs text-violet-600 mt-1 leading-relaxed">
            Setiap aturan yang Anda tambahkan di sini akan otomatis digunakan oleh AI saat men-generate rekomendasi menu makanan anak. 
            Tim riset dapat memperbarui data kapan saja tanpa perlu mengubah kode program.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up animate-delay-100 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={18} />
        <input 
          type="text"
          placeholder="Cari nama bakteri atau makanan..."
          className="form-input !pl-12 !py-4 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="input-search-mikrobiota"
        />
      </div>

      {/* Cards & Table */}
      <div className="glass-card overflow-hidden animate-fade-in-up animate-delay-200">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-surface-100">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-surface-500 font-medium">
              <Dna size={40} className="mx-auto text-surface-300 mb-3" />
              <p>Belum ada aturan mikrobiota.</p>
              <p className="text-xs text-surface-400 mt-1">Klik &quot;Tambah Aturan&quot; untuk mulai.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-5 hover:bg-surface-50 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 flex items-center justify-center p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                      <Dna size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-surface-800 leading-tight mb-1">{item.nama_bakteri}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Bakteri</span>
                    </div>
                  </div>
                  <div className="flex bg-white shadow-sm border border-surface-100 rounded-xl overflow-hidden shrink-0">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 border-r border-surface-100">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {item.makanan_disarankan && (
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/50 mb-2">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ThumbsUp size={10} /> Disarankan</p>
                    <p className="text-xs text-emerald-800 leading-relaxed">{item.makanan_disarankan}</p>
                  </div>
                )}
                {item.makanan_dihindari && (
                  <div className="bg-red-50/60 p-3 rounded-xl border border-red-100/50 mb-2">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ThumbsDown size={10} /> Dihindari</p>
                    <p className="text-xs text-red-800 leading-relaxed">{item.makanan_dihindari}</p>
                  </div>
                )}
                {item.penjelasan_medis && (
                  <div className="bg-surface-50 p-3 rounded-xl border border-surface-100/50">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FileText size={10} /> Penjelasan</p>
                    <p className="text-xs text-surface-600 leading-relaxed line-clamp-3">{item.penjelasan_medis}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Nama Bakteri</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Makanan Disarankan</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Makanan Dihindari</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Penjelasan</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-surface-500">
                    <Dna size={32} className="mx-auto text-surface-300 mb-2" />
                    Belum ada aturan mikrobiota.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                          <Dna size={16} />
                        </div>
                        <span className="font-bold text-surface-800">{item.nama_bakteri}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-emerald-700 max-w-[200px] line-clamp-2">{item.makanan_disarankan || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-red-600 max-w-[200px] line-clamp-2">{item.makanan_dihindari || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-surface-500 max-w-[250px] line-clamp-2">{item.penjelasan_medis || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up animate-delay-300">
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-black text-violet-600">{list.length}</p>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Total Aturan</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-black text-emerald-600">
            {list.filter(i => i.makanan_disarankan).length}
          </p>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Punya Rekomendasi</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-black text-red-500">
            {list.filter(i => i.makanan_dihindari).length}
          </p>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Punya Pantangan</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl h-auto max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-surface-100 flex items-center gap-4 z-10 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
                title="Kembali"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-surface-800">{editingItem?.id ? 'Edit Aturan' : 'Tambah Aturan Baru'}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="form-label">Nama Bakteri / Kondisi Mikrobiota *</label>
                  <input 
                    type="text" required className="form-input" 
                    placeholder="Contoh: Lactobacillus, Bifidobacterium Rendah"
                    value={editingItem?.nama_bakteri || ''}
                    onChange={e => setEditingItem({...editingItem, nama_bakteri: e.target.value})}
                    id="input-nama-bakteri"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Nama bakteri spesifik atau kondisi mikrobiota usus yang ingin diberikan aturan.
                  </p>
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <ThumbsUp size={14} className="text-emerald-500" /> Makanan yang Disarankan
                  </label>
                  <textarea 
                    className="form-input h-24"
                    placeholder="Contoh: Tempe, Yogurt, Pisang, Bawang Putih"
                    value={editingItem?.makanan_disarankan || ''}
                    onChange={e => setEditingItem({...editingItem, makanan_disarankan: e.target.value})}
                    id="input-makanan-disarankan"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Pisahkan dengan koma. Makanan yang mendukung pertumbuhan bakteri baik ini.
                  </p>
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <ThumbsDown size={14} className="text-red-500" /> Makanan yang Dihindari
                  </label>
                  <textarea 
                    className="form-input h-24"
                    placeholder="Contoh: Gula tinggi, Makanan olahan berlebih"
                    value={editingItem?.makanan_dihindari || ''}
                    onChange={e => setEditingItem({...editingItem, makanan_dihindari: e.target.value})}
                    id="input-makanan-dihindari"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Pisahkan dengan koma. Makanan yang menghambat atau merugikan bakteri ini.
                  </p>
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> Penjelasan Medis
                  </label>
                  <textarea 
                    className="form-input h-28"
                    placeholder="Jelaskan peran bakteri ini dalam pertumbuhan anak dan kaitannya dengan pencegahan stunting..."
                    value={editingItem?.penjelasan_medis || ''}
                    onChange={e => setEditingItem({...editingItem, penjelasan_medis: e.target.value})}
                    id="input-penjelasan-medis"
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Penjelasan ilmiah singkat yang akan membantu AI memahami konteks klinis.
                  </p>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary" id="btn-simpan-aturan">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
