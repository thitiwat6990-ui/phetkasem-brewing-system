"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, Beer } from 'lucide-react';

export default function AppShell({ 
  children, 
  user 
}: { 
  children: React.ReactNode, 
  user?: { username: string; role: string } 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark text-text-primary relative">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-bg-panel border-b border-white/5 px-4 flex items-center z-20">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-text-secondary hover:bg-white/5 hover:text-white rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-4 flex items-center gap-2">
          <Beer className="w-5 h-5 text-brand-amber" />
          <span className="font-black tracking-wide text-white text-sm">Phetkasem brewery system</span>
        </div>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive classes applied */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar user={user} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0 bg-bg-dark">
        {children}
      </main>
    </div>
  );
}
