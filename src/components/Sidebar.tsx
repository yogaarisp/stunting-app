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
  Camera,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/input', label: 'Input Data', icon: ClipboardEdit },
  { href: '/rekomendasi', label: 'Rekomendasi', icon: Utensils },
  { href: '/food-log', label: 'Log Makanan', icon: Camera },
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
          flex flex-col fixed top-0 left-0 z-40 h-full w-72
          bg-white/80 backdrop-blur-xl border-r border-white/30
          shadow-2xl shadow-primary-500/5
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-200/50 relative">
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
          <button 
            className="absolute right-4 lg:hidden p-2 text-surface-400 hover:text-surface-700 bg-surface-50 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 overflow-y-auto gap-1 px-4 py-6">

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
                    href="/admin/microbiota"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${pathname.startsWith('/admin/microbiota')
                        ? 'bg-gradient-to-r from-surface-700 to-surface-800 text-white shadow-lg shadow-surface-500/25'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }
                    `}
                  >
                    <Heart size={20} />
                    <span>Aturan Mikrobiota</span>
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
        <div className="mt-auto p-4 border-t border-surface-200/50 bg-white/50 pb-24 lg:pb-4">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-surface-100 shadow-sm">
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-3 flex-1 min-w-0 group"
            >
              <div className={`w-10 h-10 rounded-xl ${role === 'admin' ? 'bg-gradient-to-br from-surface-600 to-surface-800' : 'bg-gradient-to-br from-primary-400 to-accent-400'} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                <UserIcon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-surface-700 truncate group-hover:text-primary-600 transition-colors">{userName}</p>
                <p className="text-[10px] text-surface-400 uppercase font-bold tracking-widest">{role === 'admin' ? 'Admin' : 'Orang Tua'}</p>
              </div>
            </Link>
            
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-3 text-surface-400 hover:text-danger hover:bg-red-50 rounded-xl transition-all"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-surface-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:hidden pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {!isLoading && role !== 'admin' && [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/input', label: 'Input', icon: ClipboardEdit },
            { href: '/profile', label: 'Profil', icon: UserIcon },
          ].map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center justify-center py-1 gap-1 transition-colors ${isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'}`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50' : 'bg-transparent'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium leading-tight">{link.label}</span>
              </Link>
            );
          })}
          
          {!isLoading && role === 'admin' && [
            { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
            { href: '/admin/users', label: 'Pengguna', icon: Users },
            { href: '/profile', label: 'Profil', icon: UserIcon },
          ].map((link) => {
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center justify-center py-1 gap-1 transition-colors ${isActive ? 'text-surface-800' : 'text-surface-400 hover:text-surface-600'}`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-surface-100' : 'bg-transparent'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium leading-tight">{link.label}</span>
              </Link>
            );
          })}

          {!isLoading && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center justify-center py-1 gap-1 transition-colors text-surface-400 hover:text-surface-600"
            >
              <div className="p-1.5 rounded-xl transition-colors bg-transparent">
                <Menu size={20} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-medium leading-tight">Menu</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
