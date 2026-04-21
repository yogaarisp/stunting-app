'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  ClipboardEdit,
  Utensils,
  BarChart3,
  BookOpen,
  LogOut,
  Baby,
  X,
  Menu,
  Heart,
  Shield,
  Users,
  User as UserIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/input', label: 'Input Data', icon: ClipboardEdit },
  { href: '/rekomendasi', label: 'Rekomendasi', icon: Utensils },
  { href: '/grafik', label: 'Grafik', icon: BarChart3 },
  { href: '/edukasi', label: 'Edukasi', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<string>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [brandName, setBrandName] = useState('NutriTrack');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchData = async () => {
      // Fetch User & Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', user.id)
          .single();
        setUserName(profile?.full_name || profile?.email || 'User');
        setRole(profile?.role || 'user');
      }

      // Fetch Settings
      const { data: settings } = await supabase
        .from('settings')
        .select('brand_name, logo_url')
        .eq('id', 1)
        .single();
      
      if (settings) {
        setBrandName(settings.brand_name);
        setLogoUrl(settings.logo_url);
      }
      
      setIsLoading(false);
    };

    fetchData();

    // Listen for updates from Settings page
    const handleSettingsUpdate = () => fetchData();
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Don't show sidebar on auth and public pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/info-stunting') {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 backdrop-blur-lg shadow-lg border border-white/30 lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-72
          bg-white/80 backdrop-blur-xl
          border-r border-white/30
          shadow-2xl shadow-primary-500/5
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-200/50">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Baby size={22} className="text-white" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">{brandName}</h1>
            <p className="text-xs text-surface-500 font-medium">Stunting Tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4 py-6">

          {isLoading ? (
            <div className="space-y-3 px-2 py-4 animate-pulse">
              <div className="h-10 bg-surface-200/50 rounded-xl w-full"></div>
              <div className="h-10 bg-surface-200/50 rounded-xl w-full"></div>
              <div className="h-10 bg-surface-200/50 rounded-xl w-full"></div>
              <div className="h-10 bg-surface-200/50 rounded-xl w-full mt-8"></div>
              <div className="h-10 bg-surface-200/50 rounded-xl w-[80%]"></div>
            </div>
          ) : (
            <>
              {/* USER NAVIGATION */}
              {role !== 'admin' && navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    id={`nav-${link.href.slice(1)}`}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'text-surface-600 hover:bg-primary-50 hover:text-primary-700'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                    )}
                  </Link>
                );
              })}

              {/* SUPER ADMIN NAVIGATION */}
              {role === 'admin' && (
                <>
                  <div className="mb-2 px-4">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Admin Panel</p>
                  </div>

                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname === '/admin'
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <LayoutDashboard size={20} />
                    <span>Ringkasan Data</span>
                  </Link>

                  <Link
                    href="/admin/menus"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname.startsWith('/admin/menus')
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <Utensils size={20} />
                    <span>Kelola Menu</span>
                  </Link>

                  <Link
                    href="/admin/users"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname.startsWith('/admin/users')
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <Users size={20} />
                    <span>Data Pengguna</span>
                  </Link>

                  <Link
                    href="/admin/children"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname.startsWith('/admin/children')
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <Baby size={20} />
                    <span>Data Anak</span>
                  </Link>

                  <Link
                    href="/admin/edukasi"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname.startsWith('/admin/edukasi')
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <BookOpen size={20} />
                    <span>Kelola Edukasi</span>
                  </Link>
                  
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname.startsWith('/admin/settings')
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <SettingsIcon size={20} />
                    <span>Pengaturan</span>
                  </Link>

                  <div className="mt-4 border-t border-surface-200/50 pt-4">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-surface-500 hover:bg-surface-50 hover:text-primary-600"
                    >
                      <BookOpen size={20} />
                      <span>Lihat View User</span>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-200/50 bg-white/50">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl text-sm font-medium transition-all
              ${pathname === '/profile' 
                ? 'bg-primary-50 text-primary-700 shadow-sm' 
                : 'text-surface-600 hover:bg-surface-50 hover:text-primary-600'
              }
            `}
          >
            <UserIcon size={18} />
            <span>Profil Saya</span>
          </Link>

          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className={`w-9 h-9 rounded-full ${role === 'admin' ? 'bg-gradient-to-br from-surface-600 to-surface-800' : 'bg-gradient-to-br from-primary-400 to-accent-400'} flex items-center justify-center shadow-md`}>
              <Heart size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-700 truncate">{userName}</p>
              <p className="text-xs text-surface-400 uppercase font-bold tracking-tighter">{role === 'admin' ? 'Administrator' : 'Orang Tua'}</p>
            </div>
          </div>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-surface-500 hover:text-danger hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
