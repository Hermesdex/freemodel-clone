'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fm-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="lg:ml-0 min-h-[calc(100vh-4rem)] pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Mobile TG Group FAB */}
      <a
        href="https://t.me/freemodel"
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden tg-fab bottom-20 left-1/2 -translate-x-1/2"
        aria-label="Join Telegram Group"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.931 7.614l-1.342 1.277c-.287.295-.729.246-1.013-.082l-3.178-3.678c-.81-.913-3.093-.33-3.379 1.129l-.536 2.766 2.999 3.214c.207.213.183.562-.028.762l-1.492 1.437c-.316.295-.8-.038-1.029-.367l-2.492-3.605v.008c-.123 3.937 3.195 7.145 7.098 6.63.231-.031.469-.041.713-.041.53 0 1.055.043 1.567.122.375.059.745.145 1.091.293l3.603 2.039c.751.414 1.742-.004 2.038-.854l.524-1.609c.08-.267.074-.552.006-.812l-1.774-6.813c-.164-.572-.673-.94-1.233-.836z"/>
        </svg>
        <span>TG Group</span>
      </a>
    </div>
  );
}