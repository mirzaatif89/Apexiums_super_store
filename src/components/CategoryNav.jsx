import React from 'react';
import { Flame, Gift, Sparkles, Tag, Truck } from 'lucide-react';

export default function CategoryNav({ navItems = [], selectedCategory = 'All', onSelectCategory }) {
  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const quickDeals = [
    { label: 'Flash Sale', icon: Flame, badge: 'Hot', color: 'text-[#E8262A] bg-red-50 border-red-200' },
    { label: 'Free Shipping', icon: Truck, badge: 'Rs 0', color: 'text-slate-700 bg-slate-50 border-slate-200 hover:border-red-200 hover:text-[#E8262A]' },
    { label: 'Vouchers', icon: Tag, badge: 'Save', color: 'text-slate-700 bg-slate-50 border-slate-200 hover:border-red-200 hover:text-[#E8262A]' },
    { label: 'Everyday Low Prices', icon: Gift, badge: 'Deals', color: 'text-slate-700 bg-slate-50 border-slate-200 hover:border-red-200 hover:text-[#E8262A]' }
  ];

  return (
    <section className="border-b border-slate-100 bg-white shadow-xs">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Main Category Dropdowns */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* All Categories Pill */}
            <button
              type="button"
              onClick={() => handleCategoryClick('All')}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All' || !selectedCategory
                  ? 'bg-[#E8262A] text-white font-extrabold shadow-xs'
                  : 'font-semibold text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Categories</span>
            </button>

            {navItems.map((item) => {
              const isActive = selectedCategory?.toLowerCase() === item.label.toLowerCase();
              return (
                <div key={item.label} className="group relative shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(item.label)}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E8262A] text-white font-extrabold shadow-xs'
                        : 'font-semibold text-slate-700 hover:bg-red-50 hover:text-[#E8262A]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>

                  {/* Submenu Dropdown */}
                  <div className="invisible absolute left-0 top-full z-30 mt-1 w-[20rem] translate-y-1 rounded-2xl border border-slate-100 bg-white p-4 opacity-0 shadow-xl shadow-slate-900/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#E8262A]">
                      {item.label} Subcategories
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {item.items.map((subItem) => (
                        <button
                          key={subItem}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick(subItem);
                          }}
                          className="text-left rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-red-50 hover:text-[#E8262A] hover:font-semibold cursor-pointer"
                        >
                          {subItem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Deal Badges */}
          <div className="hidden items-center gap-2 lg:flex shrink-0">
            {quickDeals.map((deal) => {
              const Icon = deal.icon;
              return (
                <a
                  key={deal.label}
                  href="#"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all hover:opacity-90 active:scale-95 ${deal.color}`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{deal.label}</span>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold shadow-2xs">
                    {deal.badge}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
