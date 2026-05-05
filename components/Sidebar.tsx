"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, BookOpen, KanbanSquare, LogOut, User, Beer, Clock, Archive } from 'lucide-react';
import { logoutAction } from '@/actions/auth';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Database },
  { name: 'Keg Stock', href: '/kegs', icon: Archive },
  { name: 'Batch Tracker', href: '/batches', icon: KanbanSquare },
  { name: 'Recipes', href: '/recipes', icon: BookOpen },
  { name: 'History', href: '/history', icon: Clock },
];

export default function Sidebar({ user, onClose }: { user?: { username: string; role: string }, onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-bg-panel border-r border-white/5 flex flex-col shrink-0">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-amber/10 border border-brand-amber/20 rounded-xl flex items-center justify-center shadow-sm">
          <Beer className="w-6 h-6 text-brand-amber" />
        </div>
        <h1 className="text-sm font-black tracking-wide text-white uppercase leading-tight">Phetkasem<br/>brewery system</h1>
      </div>

      <div className="h-px bg-white/5 mx-6 mb-6"></div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-amber text-black shadow-[0_0_15px_rgba(255,191,0,0.3)]' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black' : 'text-text-secondary group-hover:text-white'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
        <div className="border border-white/5 rounded-2xl p-3 flex items-center gap-3 bg-bg-panel">
          <div className="w-10 h-10 rounded-full bg-brand-amber/10 text-brand-amber flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
              {user?.role === 'admin' ? 'SYSTEM ADMIN' : (user?.role || 'BREWER')}
            </div>
            <div className="text-sm font-bold text-white truncate">
              @{user?.username || 'brewer'}
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-text-muted hover:text-brand-amber p-2 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
