'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Edukasi } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Save, 
  ArrowLeft,
  BookOpen,
  PlayCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function ManageEdukasi() {
  const [edukasiList, setEdukasiList] = useState<Edukasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Edukasi> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEdukasi = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('edukasi').select('*').order('created_at', { ascending: false });
    setEdukasiList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEdukasi();
  }, [fetchEdukasi]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konten ini?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('edukasi').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchEdukasi();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    
    const eduData = {
      tipe: editingItem?.tipe,
      judul: editingItem?.judul,
      deskripsi: editingItem?.deskripsi,
      link_url: editingItem?.link_url,
      thumbnail_url: editingItem?.thumbnail_url || 'FileText',
    };

    let error;
    if (editingItem?.id) {
      const { error: err } = await supabase.from('edukasi').update(eduData).eq('id', editingItem.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('edukasi').insert(eduData);
      error = err;
    }

    if (error) {
      alert(error.message);
    } else {
      setIsModalOpen(false);
      setEditingItem(null);
      fetchEdukasi();
    }
    setSaving(false);
  };

  const filteredItems = edukasiList.filter(item => 
    item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipe.toLowerCase().includes(searchTerm.toLowerCase())
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
            <BookOpen className="text-primary-600" size={28} />
            Kelola <span className="text-primary-600">Edukasi</span>
          </h1>
        </div>
        <button 
          onClick={() => { setEditingItem({ tipe: 'artikel' }); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={20} /> Tambah Konten
        </button>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up animate-delay-100 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={18} />
        <input 
          type="text"
          placeholder="Cari judul artikel atau video..."
          className="form-input !pl-12 !py-4 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden animate-fade-in-up animate-delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Konten</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Tipe</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Link Tautan</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-surface-500">
                    Tidak ada konten yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-surface-800">{item.judul}</p>
                      <p className="text-xs text-surface-500 line-clamp-1">{item.deskripsi}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${item.tipe === 'video' ? 'badge-danger' : 'badge-success'}`}>
                        {item.tipe === 'video' ? <PlayCircle size={12} className="mr-1"/> : <FileText size={12} className="mr-1"/>}
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">
                      <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline max-w-[200px] truncate block">
                        {item.link_url}
                      </a>
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

      {/* Modal Tool */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-surface-800">{editingItem?.id ? 'Edit Konten' : 'Tambah Konten Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="form-label">Tipe Konten</label>
                  <select 
                    className="form-input"
                    value={editingItem?.tipe || ''}
                    onChange={e => setEditingItem({...editingItem, tipe: e.target.value as 'artikel'|'video'})}
                    required
                  >
                    <option value="artikel">Artikel Bacaan</option>
                    <option value="video">Video Edukasi</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Judul</label>
                  <input 
                    type="text" required className="form-input" 
                    value={editingItem?.judul || ''}
                    onChange={e => setEditingItem({...editingItem, judul: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Deskripsi Singkat</label>
                  <textarea 
                    className="form-input h-20" required
                    value={editingItem?.deskripsi || ''}
                    onChange={e => setEditingItem({...editingItem, deskripsi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Link URL (Tujuan/YouTube)</label>
                  <input 
                    type="url" required className="form-input"
                    placeholder="https://..."
                    value={editingItem?.link_url || ''}
                    onChange={e => setEditingItem({...editingItem, link_url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Thumbnail / Ikon (Opsional)</label>
                  <input 
                    type="text" className="form-input"
                    placeholder={editingItem?.tipe === 'video' ? "Contoh: 🏥 atau ⚠️" : "Contoh nama icon: Apple, Heart, Baby"}
                    value={editingItem?.thumbnail_url || ''}
                    onChange={e => setEditingItem({...editingItem, thumbnail_url: e.target.value})}
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Artikel: Ketikkan nama ikon bawaan (Apple, Heart, Baby, BookOpen, dll). <br/>
                    Video: Ketikkan emoji (🏥, 📏, 🍲, dll).
                  </p>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Konten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
