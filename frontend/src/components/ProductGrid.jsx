import React from 'react';
import { ChevronRight, Heart, ShoppingBag, Star } from 'lucide-react';

function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const ratingValue = Number(product.rating ?? product.averageRating ?? 0);
  const reviewCount = Number(product.reviewsCount ?? product.reviewCount ?? 0);

  return (
    <article
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
    >
      {/* Product Image Container - Full Edge to Edge */}
      <div className="relative aspect-[1/1.12] w-full overflow-hidden rounded-t-2xl bg-slate-100">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Heart Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted((prev) => !prev);
          }}
          className={`absolute right-1.5 top-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:scale-105 active:scale-95 cursor-pointer z-10 ${
            isWishlisted ? 'text-[#E8262A]' : 'hover:text-[#E8262A]'
          }`}
          title="Wishlist"
          aria-label="Wishlist"
        >
          <Heart size={14} className={isWishlisted ? 'fill-[#E8262A]' : ''} />
        </button>

        {/* Discount Badge */}
        {discountPercent ? (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-[#E8262A] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
            -{discountPercent}%
          </span>
        ) : product.badge ? (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-[#E8262A] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
            {product.badge}
          </span>
        ) : null}
      </div>

      {/* Details & Price Container */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#E8262A] block leading-tight">
            {product.category || 'Featured'}
          </span>

          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[#1E1E1E] transition group-hover:text-[#E8262A] mt-0.5">
            {product.title}
          </h3>

          {/* Rating */}
          {ratingValue > 0 && reviewCount > 0 && (
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-500">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700 text-[10px]">{ratingValue.toFixed(1)}</span>
              <span className="text-slate-400 text-[9px]">({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Pricing and Action */}
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
              else if (onSelectProduct) onSelectProduct(product);
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
}

export default function ProductGrid({ sections, selectedCategory = 'All', onSelectCategory, onSelectProduct, onAddToCart }) {
  const isFiltered = selectedCategory && selectedCategory !== 'All';

  // Gather all filtered products into a single list if a specific category is selected
  const allFilteredProducts = React.useMemo(() => {
    if (!isFiltered) return [];
    const list = [];
    const seenIds = new Set();

    sections.forEach((s) => {
      if (s.products) {
        s.products.forEach((p) => {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            list.push(p);
          }
        });
      }
    });

    return list;
  }, [sections, isFiltered]);

  const totalProducts = isFiltered
    ? allFilteredProducts.length
    : sections.reduce((sum, s) => sum + (s.products ? s.products.length : 0), 0);

  return (
    <div className="space-y-5" id="products-section">
      {/* Active Category Filter Status Banner */}
      {isFiltered ? (
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white font-black text-sm">
                ✓
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-100">Category Selected</p>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {selectedCategory} Products ({totalProducts} {totalProducts === 1 ? 'item' : 'items'})
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('All')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-red-700 shadow-xs hover:bg-red-50 transition cursor-pointer"
            >
              <span>Reset to All Mixed Products</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* IF A CATEGORY IS SELECTED: Show single unified Category Section */}
      {isFiltered ? (
        totalProducts === 0 ? (
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-4">
              <div className="text-3xl">🔍</div>
              <h3 className="text-lg font-black text-slate-800">No products found in "{selectedCategory}"</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn't find products for this specific category right now. Try selecting another category or view all products.
              </p>
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('All')}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-red-700 transition cursor-pointer"
              >
                View All Mixed Products
              </button>
            </div>
          </div>
        ) : (
          <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-red-600" />
                  <div>
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                      {selectedCategory} Collection
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Showing filtered products for {selectedCategory}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory('All')}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#E8262A] hover:text-red-700 tracking-wide transition cursor-pointer shrink-0"
                >
                  <span>Show All Categories</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 sm:gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {allFilteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      ) : (
        /* DEFAULT (ALL): Mixed Products in Sections */
        sections.map((section) => {
          if (!section.products || section.products.length === 0) return null;

          return (
            <section key={section.title} className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1.5 rounded-full bg-red-600" />
                    <div>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
                        {section.title}
                      </h2>
                      {section.description ? (
                        <p className="text-[11px] text-slate-500 font-medium">{section.description}</p>
                      ) : null}
                    </div>
                  </div>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#E8262A] hover:text-red-700 tracking-wide transition cursor-pointer shrink-0"
                  >
                    <span>See All</span>
                    <ChevronRight size={16} />
                  </a>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-1 sm:gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {section.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={onSelectProduct}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
