'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, ArrowLeft, Users, Mail, Clock, Edit2, Trash2, X, AlertCircle, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { Profile } from '@/lib/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    setEditName(user.full_name || '');
    setEditRole(user.role);
    setIsEditModalOpen(true);
    setError('');
  };

  const handleDeleteClick = (user: Profile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    setError('');
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError('');
    const supabase = createClient();
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: editName,
        role: editRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.id);

    if (updateError) {
      setError(updateError.message);
      setActionLoading(false);
    } else {
      await fetchUsers();
      setIsEditModalOpen(false);
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError('');
    const supabase = createClient();
    
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', selectedUser.id);

    if (deleteError) {
      setError(deleteError.message);
      setActionLoading(false);
    } else {
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-primary-500" size={42} />
      <p className="text-surface-500 font-medium animate-pulse">Memuat data pengguna...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-surface-400 hover:text-primary-600 transition-colors mb-2">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-surface-800 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
              <Users className="text-white" size={24} />
            </div>
            Manajemen <span className="gradient-text">Pengguna</span>
          </h1>
          <p className="text-surface-500 mt-1 max-w-md">Kelola hak akses dan informasi profil orang tua secara terpusat.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 pointer-events-none" size={18} />
          <input 
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            className="form-input !pl-12 !py-3.5 shadow-sm hover:border-primary-200 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl text-surface-600 text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {users.length} Total Pengguna
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden animate-fade-in-up animate-delay-200 border-surface-200 shadow-xl shadow-surface-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-50/50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">Profil Pengguna</th>
                <th className="px-6 py-5 text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">Hak Akses</th>
                <th className="px-6 py-5 text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em] hidden md:table-cell">Bergabung</th>
                <th className="px-6 py-5 text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={48} className="text-surface-200" />
                      <p className="text-surface-500 font-medium">Data pengguna tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                          {user.full_name ? user.full_name.charAt(0) : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-surface-800 leading-tight">{user.full_name || 'Tanpa Nama'}</p>
                          <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-1.5">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {user.role === 'admin' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold shadow-sm">
                          <Shield size={12} /> Administrator
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-50 text-sage-600 border border-sage-100 rounded-full text-xs font-bold shadow-sm">
                          <User size={12} /> Orang Tua
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-surface-600 font-medium">
                        <Clock size={14} className="text-surface-300" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2.5 text-surface-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-2.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Pengguna"
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

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in border border-white/20">
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-surface-50 to-white border-b border-surface-100">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                  <Edit2 size={24} />
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-surface-400 hover:text-surface-900 p-1">
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-xl font-extrabold text-surface-800">Edit Profil Pengguna</h3>
              <p className="text-sm text-surface-500 mt-1">{selectedUser.email}</p>
            </div>

            <form onSubmit={saveEdit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3 animate-shake">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-input !py-3.5 !px-5"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest px-1">Peran Akses (Role)</label>
                <select 
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                  className="form-input !py-3.5 !px-5 appearance-none cursor-pointer"
                >
                  <option value="user">Orang Tua (User)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-3.5 bg-surface-100 text-surface-600 rounded-2xl font-bold text-sm hover:bg-surface-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3.5 btn-primary shadow-lg shadow-primary-500/20 rounded-2xl font-bold text-sm disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-surface-800 mb-2">Hapus Pengguna?</h3>
              <p className="text-surface-500 mb-8 leading-relaxed">
                Menghapus <span className="font-bold text-surface-900">{selectedUser.full_name || selectedUser.email}</span> akan menghapus seluruh data anak dan histori perkembangannya secara permanen.
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
                  className="flex-1 px-6 py-3.5 bg-surface-100 text-surface-600 rounded-2xl font-bold text-sm hover:bg-surface-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Ya, Hapus Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
