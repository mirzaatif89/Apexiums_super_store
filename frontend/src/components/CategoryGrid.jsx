import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CategoryGrid({ categories = [], selectedCategory = 'All', onSelectCategory }) {
  const fallbackCategories = [{ label: 'All', displayName: 'All', image: '' }];
  const primaryCategories = categories.length
    ? [{ label: 'All', displayName: 'All', image: '' }, ...categories.map((category) => ({
      label: category.name,
      displayName: category.name,
      image: category.image_url || category.image || ''
    }))]
    : fallbackCategories;

  const handleCategoryClick = (catLabel) => {
    if (onSelectCategory) {
      onSelectCategory(catLabel);
    }
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categories-section" className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 pt-2 pb-1">
      {/* Header Section: Category Title */}
      <div className="flex items-center justify-between pb-2 mb-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Category
        </h2>
        <button
          type="button"
          onClick={() => handleCategoryClick('All')}
          className="inline-flex items-center gap-0.5 text-[#E8262A] hover:text-red-700 text-xs sm:text-sm font-bold tracking-tight cursor-pointer transition-colors active:scale-95"
        >
          <span>See All</span>
          <ChevronRight size={16} className="shrink-0" />
        </button>
      </div>

      {/* Category Circles with Photos */}
      <div className="grid grid-cols-5 gap-2 sm:gap-5 justify-items-center bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs">
        {primaryCategories.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.label.toLowerCase() || (cat.label === 'All' && selectedCategory === 'All');

          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat.label)}
              className="group flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              {/* Photo Circle Container */}
              <div
                className={`relative flex h-13 w-13 xs:h-15 xs:w-15 sm:h-18 sm:w-18 items-center justify-center rounded-full p-0.5 shadow-2xs transition-all duration-300 group-hover:scale-105 overflow-hidden border-2 ${
                  isSelected
                    ? 'border-[#E8262A] ring-4 ring-red-100/80 bg-red-50'
                    : 'border-slate-200 group-hover:border-red-300 bg-slate-100'
                }`}
              >
                {cat.image ? <img src={cat.image} alt={cat.displayName} loading="lazy" className="h-full w-full object-cover object-center rounded-full transition-transform duration-500 group-hover:scale-110" /> : <span className="text-lg font-black text-slate-400">{cat.displayName.charAt(0)}</span>}
              </div>

              {/* Label Text Below */}
              <span
                className={`mt-2 text-xs transition-colors text-center tracking-tight ${
                  isSelected ? 'font-black text-[#E8262A]' : 'font-bold text-[#1E1E1E] group-hover:text-[#E8262A]'
                }`}
              >
                {cat.displayName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
