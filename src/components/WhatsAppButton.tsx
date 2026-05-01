'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle } from 'lucide-react';

const WA_NUMBER = '6281542148174';
const WA_MESSAGE = encodeURIComponent('Halo, saya pengguna NutriTrack. Saya ingin bertanya tentang...');

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      }
      setIsLoading(false);
    };
    checkRole();
  }, []);

  // Don't show on public pages, admin pages, or while loading
  const publicPages = ['/', '/login', '/register', '/info-stunting'];
  if (publicPages.includes(pathname) || pathname.startsWith('/admin') || isLoading || isAdmin) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 group"
      title="Hubungi Kami via WhatsApp"
    >
      <div className="relative">
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
        
        {/* Button */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-green-500/40 transition-all duration-300">
          <MessageCircle size={24} className="text-white" fill="white" />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-surface-800 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-lg">
            Hubungi Kami
          </div>
        </div>
      </div>
    </a>
  );
}
