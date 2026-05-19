"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, BookOpen, KanbanSquare, LogOut, User, Beer, Clock, Archive, Globe, Users } from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { useLanguage } from '@/lib/i18nContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['employee', 'Master brewer', 'admin'] },
  { name: 'Inventory', href: '/inventory', icon: Database, roles: ['employee', 'Master brewer', 'admin'] },
  { name: 'Keg Stock', href: '/kegs', icon: Archive, roles: ['employee', 'Master brewer', 'admin'] },
  { name: 'Batch Tracker', href: '/batches', icon: KanbanSquare, roles: ['Master brewer', 'admin'] },
  { name: 'Recipes', href: '/recipes', icon: BookOpen, roles: ['Master brewer', 'admin'] },
  { name: 'History', href: '/history', icon: Clock, roles: ['Master brewer', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Users, roles: ['Master brewer', 'admin'] },
];

export default function Sidebar({ user, onClose }: { user?: { username: string; role: string }, onClose?: () => void }) {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };


  return (
    <aside className="w-64 h-full bg-bg-panel border-r border-white/5 flex flex-col shrink-0">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-amber/10 border border-brand-amber/20 rounded-xl flex items-center justify-center shadow-sm">
          <Beer className="w-6 h-6 text-brand-amber" />
        </div>
        <h1 className="text-sm font-black tracking-wide text-white uppercase leading-tight">{t('Phetkasem brewery system')}</h1>
      </div>

      <div className="px-6 mb-6">
        <button 
          onClick={toggleLanguage}
          className="flex items-center justify-between w-full p-2 rounded-lg bg-black/20 border border-white/5 hover:border-brand-amber/30 transition-colors group"
        >
          <div className="flex items-center gap-2 text-text-secondary group-hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{language === 'en' ? 'English' : 'ภาษาไทย'}</span>
          </div>
          <span className="text-[10px] font-black text-brand-amber px-1.5 py-0.5 rounded bg-brand-amber/10">
            {language.toUpperCase()}
          </span>
        </button>
      </div>

      <div className="h-px bg-white/5 mx-6 mb-6"></div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems
          .filter(item => {
            const userRole = user?.role || 'employee'; // fallback
            return item.roles.includes(userRole) || userRole === 'admin';
          })
          .map((item) => {
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
              <span>{t(item.name)}</span>
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
              {user?.role === 'admin' ? t('SYSTEM ADMIN') : (user?.role === 'Master brewer' ? 'MASTER BREWER' : t('BREWER'))}
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
