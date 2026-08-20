import React from 'react';
import { Menu } from 'lucide-react';

export const Header = ({ onToggleSidebar }) => {
  return <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
    <div className="flex items-center gap-3">
      <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"><Menu size={22} /></button>
    </div>
  </header>;
};
export default Header;
