'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Menu } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Utensils
} from 'lucide-react';
import Link from 'next/link';

export default function ManageMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<Menu> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchMenus = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('menus').select('*').order('created_at', { ascending: false });
    setMenus(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchMenus();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    
    const menuData = {
      nama_menu: editingMenu?.nama_menu,
      deskripsi: editingMenu?.deskripsi,
      nutrisi: editingMenu?.nutrisi,
      kalori: editingMenu?.kalori,
      protein: editingMenu?.protein,
      kalsium: editingMenu?.kalsium,
      kategori: editingMenu?.kategori,
    };

    let error;
    if (editingMenu?.id) {
      const { error: err } = await supabase.from('menus').update(menuData).eq('id', editingMenu.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('menus').insert(menuData);
      error = err;
    }

    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      setEditingMenu(null);
      fetchMenus();
    }
    setSaving(false);
  };

  const filteredMenus = menus.filter(m => 
    m.nama_menu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <Link href="/admin" className="text-sm font-medium text-surface-500 hover:text-primary-600 flex items-center gap-1 mb-2">
            <ArrowLeft size={16} /> Kembali ke Admin
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-800">Kelola <span className="text-amber-600">Menu Makanan</span></h1>
        </div>
        <button 
          onClick={() => { setEditingMenu({ kategori: 'normal' }); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={20} /> Tambah Menu Baru
        </button>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up animate-delay-100 max-w-2xl mx-auto md:mx-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={18} />
        <input 
          type="text"
          placeholder="Cari nama menu atau kategori..."
          className="form-input !pl-12 !py-4 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table & Mobile Cards */}
      <div className="glass-card overflow-hidden animate-fade-in-up animate-delay-200">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-surface-100">
          {filteredMenus.length === 0 ? (
            <div className="p-8 text-center text-surface-500 font-medium">Menu tidak ditemukan</div>
          ) : (
            filteredMenus.map((menu) => (
              <div key={menu.id} className="p-5 hover:bg-surface-50 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <p className="font-bold text-surface-800 text-base">{menu.nama_menu}</p>
                    <span className="badge badge-success lowercase mt-1.5 inline-block">{menu.kategori.replace('_', ' ')}</span>
                  </div>
                  <div className="flex bg-white shadow-sm border border-surface-100 rounded-xl overflow-hidden shrink-0">
                    <button onClick={() => { setEditingMenu(menu); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 border-r border-surface-100">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(menu.id)} className="p-2 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-surface-500 mb-3 leading-relaxed">{menu.deskripsi}</p>
                <div className="bg-surface-50 p-3 rounded-xl border border-surface-100/50">
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Nutrisi Utama</p>
                  <p className="text-xs text-surface-700 font-medium">{menu.nutrisi}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Nama Menu</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase">Nutrisi</th>
                <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredMenus.map((menu) => (
                <tr key={menu.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-surface-800">{menu.nama_menu}</p>
                    <p className="text-xs text-surface-500 line-clamp-1">{menu.deskripsi}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-success lowercase">{menu.kategori.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600">
                    {menu.nutrisi}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingMenu(menu); setIsModalOpen(true); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(menu.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tool - Simplified implementation */}
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
              <h2 className="text-xl font-bold text-surface-800">{editingMenu?.id ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Nama Menu</label>
                  <input 
                    type="text" required className="form-input" 
                    value={editingMenu?.nama_menu || ''}
                    onChange={e => setEditingMenu({...editingMenu, nama_menu: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Deskripsi</label>
                  <textarea 
                    className="form-input h-20"
                    value={editingMenu?.deskripsi || ''}
                    onChange={e => setEditingMenu({...editingMenu, deskripsi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Nutrisi (Teks)</label>
                  <input 
                    type="text" required className="form-input"
                    value={editingMenu?.nutrisi || ''}
                    onChange={e => setEditingMenu({...editingMenu, nutrisi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Kategori</label>
                  <select 
                    className="form-input"
                    value={editingMenu?.kategori || ''}
                    onChange={e => setEditingMenu({...editingMenu, kategori: e.target.value as any})}
                  >
                    <option value="tinggi_kalori">Tinggi Kalori</option>
                    <option value="tinggi_protein">Tinggi Protein</option>
                    <option value="tinggi_kalsium">Tinggi Kalsium</option>
                    <option value="probiotik">Probiotik</option>
                    <option value="normal">Normal / Seimbang</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Kalori (kkal)</label>
                  <input 
                    type="number" className="form-input"
                    value={editingMenu?.kalori || ''}
                    onChange={e => setEditingMenu({...editingMenu, kalori: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="form-label">Protein (g)</label>
                  <input 
                    type="number" step="0.1" className="form-input"
                    value={editingMenu?.protein || ''}
                    onChange={e => setEditingMenu({...editingMenu, protein: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
