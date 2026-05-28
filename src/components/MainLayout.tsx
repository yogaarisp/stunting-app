'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Rute yang tidak membutuhkan Sidebar dan margin
  const publicRoutes = ['/login', '/register', '/', '/info-stunting'];
  const isAuthOrLanding = publicRoutes.includes(pathname);

  return (
    <>
      {!isAuthOrLanding && <Sidebar />}
      <main className={`min-h-screen transition-all duration-700 ease-in-out ${!isAuthOrLanding ? 'md:ml-72 pb-20 md:pb-0' : 'ml-0'}`}>
        {children}
      </main>
      <WhatsAppButton />
    </>
  );
}
