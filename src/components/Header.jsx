import { Heart, Menu, Search, ShoppingCart, User2, X } from 'lucide-react';

export default function Header({
  storeName,
  logoSrc,
  authUser,
  cartCount,
  onAccountClick,
  onMenuToggle,
  mobileMenuOpen,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchFocus
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="hidden border-b border-slate-100 bg-slate-900 px-4 py-2 text-[11px] text-slate-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-4 font-medium text-slate-200">
            <a href="#" className="transition hover:text-white">Download App</a>
            <a href="#" className="transition hover:text-white">Sell on {storeName}</a>
            <a href="#" className="transition hover:text-white">Help</a>
            <a href="#" className="transition hover:text-white">Track Order</a>
          </div>
          <p className="text-slate-300">Free delivery over Rs 3,999</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 lg:grid-cols-[auto_1fr_auto] lg:gap-4">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <a href="#" className="flex min-w-0 items-center">
            <img
              src={logoSrc}
              alt={storeName}
              loading="lazy"
              className="h-11 w-auto max-w-[14rem] object-contain sm:h-12"
            />
          </a>

          <form onSubmit={onSearchSubmit} className="hidden w-full lg:block">
            <label className="flex min-h-12 w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-sm shadow-slate-900/5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
              <input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                onFocus={onSearchFocus}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search products, brands and categories"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </label>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex" aria-label="Wishlist">
              <Heart size={18} />
            </button>
            <button
              type="button"
              onClick={onAccountClick}
              className="hidden min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
              aria-label="Account/Login"
            >
              <User2 size={18} />
              <span>{authUser?.name ? authUser.name : 'Account'}</span>
            </button>
            <button className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" aria-label="Cart">
              <ShoppingCart size={18} />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={onSearchSubmit} className="mt-3 lg:hidden">
          <label className="flex min-h-12 w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-sm shadow-slate-900/5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
            <button
              type="submit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onFocus={onSearchFocus}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search products, brands and categories"
              aria-label="Search products"
            />
          </label>
        </form>
      </div>
    </header>
  );
}
