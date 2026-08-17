import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const Header = ({ onToggleSidebar }) => {
  const { setIsSearchOpen } = useAdmin();
  return <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"><Menu size={22} /></button>
      <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs font-semibold w-48 sm:w-72 border border-slate-200/60 cursor-pointer">
        <Search size={16} className="text-slate-400 shrink-0" /><span className="truncate">Search products, orders, sellers...</span><span className="hidden sm:inline-block ml-auto px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200">Ctrl+K</span>
      </button>
    </div>
  </header>;
};
export default Header;
