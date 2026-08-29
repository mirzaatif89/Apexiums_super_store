import React from 'react';
import { ChevronRight, Flame, Heart, ShoppingBag, Star, Zap } from 'lucide-react';

const pad = (value) => String(value).padStart(2, '0');

export default function FlashSale({ products = [], onProductClick, onAddToCart }) {
  const [activeTab, setActiveTab] = React.useState('All');
  const [remaining, setRemaining] = React.useState({ h: 2, m: 12, s: 56 });
  const [wishlistedIds, setWishlistedIds] = React.useState(new Set());

  const tabs = ['All', 'Newest', 'Popular'];

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        let total = current.h * 3600 + current.m * 60 + current.s - 1;
        if (total < 0) total = 2 * 3600 + 12 * 60 + 56;
        return {
          h: Math.floor(total / 3600),
          m: Math.floor((total % 3600) / 60),
          s: total % 60
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const displayedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    let list = [...products];
    if (activeTab === 'Popular') {
      list.sort((a, b) => (Number(b.reviewsCount || b.reviewCount || 0)) - (Number(a.reviewsCount || a.reviewCount || 0)));
    } else if (activeTab === 'Newest') {
      list.reverse();
    }
    return list;
  }, [products, activeTab]);

  return (
    <section id="products-section" className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 pt-1 pb-2">
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs">
        {/* Top Header Bar: Flash Sale Title on Left, Closing Timer on Right Corner */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 pb-3">
          {/* Flash Sale Title */}
          <div className="flex items-center gap-1.5 text-slate-900 font-black text-xl sm:text-2xl md:text-3xl tracking-tight shrink-0">
            <Flame className="fill-[#E8262A] text-[#E8262A] shrink-0" size={28} />
            <span>Flash Sale</span>
          </div>

          {/* Countdown timer on the right corner */}
          <div className="flex shrink-0 items-center gap-1 text-xs">
            <span className="text-[10px] font-medium text-slate-400 sm:text-xs">Closing in :</span>
            <div className="flex items-center gap-1 font-mono text-xs font-black">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-red-50 px-1.5 text-[#E8262A] sm:h-7 sm:min-w-7 sm:text-sm">
                {pad(remaining.h)}
              </span>
              <span className="text-xs font-bold text-slate-500">:</span>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-red-50 px-1.5 text-[#E8262A] sm:h-7 sm:min-w-7 sm:text-sm">
                {pad(remaining.m)}
              </span>
              <span className="text-xs font-bold text-slate-500">:</span>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-red-50 px-1.5 text-[#E8262A] sm:h-7 sm:min-w-7 sm:text-sm">
                {pad(remaining.s)}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-b border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#E8262A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="mt-4 grid grid-cols-2 gap-1 sm:gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayedProducts.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;
            const ratingValue = Number(product.rating ?? product.averageRating ?? 0);
            const reviewCount = Number(product.reviewsCount ?? product.reviewCount ?? 0);

            return (
              <article
                key={product.id}
                onClick={() => onProductClick && onProductClick(product)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-md cursor-pointer"
              >
                {/* Image container - Full Edge to Edge */}
                <div className="relative aspect-[1/1.12] w-full overflow-hidden rounded-t-2xl bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Wishlist Icon */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className={`absolute right-1.5 top-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:scale-105 active:scale-95 cursor-pointer z-10 ${
                      wishlistedIds.has(product.id) ? 'text-red-600' : 'hover:text-red-600'
                    }`}
                    title="Wishlist"
                    aria-label="Wishlist"
                  >
                    <Heart size={14} className={wishlistedIds.has(product.id) ? 'fill-red-600' : ''} />
                  </button>

                  {/* Discount Badge */}
                  {discountPercent ? (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-[#E8262A] px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs tracking-wider">
                      -{discountPercent}%
                    </span>
                  ) : product.badge ? (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-[#E8262A] px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs tracking-wider">
                      {product.badge}
                    </span>
                  ) : null}
                </div>

                {/* Info & Pricing */}
                <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#E8262A] block leading-tight">
                      {product.category || 'Deal'}
                    </span>
                    <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[#1E1E1E] transition group-hover:text-[#E8262A] mt-0.5">
                      {product.title}
                    </h3>

                    {/* Rating stars */}
                    {ratingValue > 0 && reviewCount > 0 && (
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-500">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700 text-[10px]">{ratingValue.toFixed(1)}</span>
                        <span className="text-slate-400 text-[9px]">({reviewCount})</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div>
                      <div className="text-xs sm:text-sm font-black text-[#E8262A] leading-none">
                        Rs {product.price.toLocaleString('en-PK')}
                      </div>
                      {product.originalPrice ? (
                        <div className="text-[9px] text-slate-400 line-through font-medium mt-0.5 leading-none">
                          Rs {product.originalPrice.toLocaleString('en-PK')}
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddToCart) onAddToCart(product);
                        else if (onProductClick) onProductClick(product);
                      }}
                      className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#E8262A] text-white shadow-xs transition hover:bg-red-700 active:scale-95 cursor-pointer shrink-0"
                      title="Add to Cart"
                      aria-label="Add to Cart"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
