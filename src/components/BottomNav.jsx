import { Home, Layers3, ShoppingCart, User2 } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {[
          { label: 'Home', icon: Home },
          { label: 'Categories', icon: Layers3 },
          { label: 'Cart', icon: ShoppingCart },
          { label: 'Account', icon: User2 }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl text-slate-600 transition active:scale-95"
            >
              <Icon size={18} />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
