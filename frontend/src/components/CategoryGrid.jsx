import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryGrid({ categories = [], selectedCategory = 'All', onSelectCategory, onViewAll }) {
  const categoryRowRef = React.useRef(null);
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

  const slideCategories = (direction) => {
    categoryRowRef.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
  };

  const handleWheel = (event) => {
    const row = categoryRowRef.current;
    if (!row || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    row.scrollLeft += event.deltaY;
  };

  return (
    <section id="categories-section" className="mx-auto max-w-7xl px-3 pt-1 pb-1 sm:px-4 lg:px-6">
      {/* Header Section: Category Title */}
      <div className="flex items-center justify-between pb-2 mb-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Category
        </h2>
        <button
          type="button"
          onClick={() => onViewAll ? onViewAll() : handleCategoryClick('All')}
          className="inline-flex items-center gap-0.5 text-[#E8262A] hover:text-red-700 text-xs sm:text-sm font-bold tracking-tight cursor-pointer transition-colors active:scale-95"
        >
          <span>See All</span>
          <ChevronRight size={16} className="shrink-0" />
        </button>
      </div>

      {/* Category Circles with Photos */}
      <div className="relative">
        <div
          ref={categoryRowRef}
          onWheel={handleWheel}
          className="category-slider flex flex-nowrap items-start gap-4 overflow-x-auto scroll-smooth rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7 sm:p-5"
          aria-label="Product categories"
        >
        {primaryCategories.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.label.toLowerCase() || (cat.label === 'All' && selectedCategory === 'All');

          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => handleCategoryClick(cat.label)}
              className="category-slider-item group flex w-20 shrink-0 flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 sm:w-24"
            >
              {/* Photo Circle Container */}
              <div
                className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full p-0.5 shadow-2xs transition-all duration-300 group-hover:scale-105 overflow-hidden border-2 ${
                  isSelected
                  ? 'border-[#E8262A] ring-4 ring-red-100/80 bg-red-50'
                    : 'border-slate-200 group-hover:border-red-300 bg-slate-100'
                }`}
              >
                {cat.image ? <img src={cat.image} alt={cat.displayName} loading="lazy" className="h-full w-full object-cover object-center rounded-full transition-transform duration-500 group-hover:scale-110" /> : <span className="text-xl font-black text-slate-400">{cat.displayName.charAt(0)}</span>}
              </div>

              {/* Label Text Below */}
              <span
                className={`mt-2 line-clamp-2 min-h-8 text-xs transition-colors text-center tracking-tight sm:text-sm ${
                  isSelected ? 'font-black text-[#E8262A]' : 'font-bold text-[#1E1E1E] group-hover:text-[#E8262A]'
                }`}
              >
                {cat.displayName}
              </span>
            </button>
          );
        })}
        </div>
        {primaryCategories.length > 5 && <>
          <button type="button" onClick={() => slideCategories(-1)} aria-label="Previous categories" className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-1.5 text-slate-700 shadow-md hover:text-red-600 md:block"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => slideCategories(1)} aria-label="Next categories" className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-1.5 text-slate-700 shadow-md hover:text-red-600 md:block"><ChevronRight size={18} /></button>
        </>}
      </div>
    </section>
  );
}
